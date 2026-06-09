import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pg from 'pg';
import crypto from 'crypto';
import config from './config.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

// PostgreSQL Database Setup
const pool = new Pool({
  connectionString: 'postgresql://lume_cortex_user:lxKEqdUQcLDOr1VIiLiSxIFb2sqPDtsE@dpg-d7p4u7pkh4rs73btif0g-a.ohio-postgres.render.com/lume_cortex',
  ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS local_intel (
      id SERIAL PRIMARY KEY,
      zip_code TEXT,
      content TEXT,
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      fractal_block_hash TEXT,
      tll_anchor_hash TEXT,
      tll_signature TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    // Ensure columns exist for migration if table already existed
    await pool.query(`ALTER TABLE local_intel ADD COLUMN IF NOT EXISTS fractal_block_hash TEXT`);
    await pool.query(`ALTER TABLE local_intel ADD COLUMN IF NOT EXISTS tll_anchor_hash TEXT`);
    await pool.query(`ALTER TABLE local_intel ADD COLUMN IF NOT EXISTS tll_signature TEXT`);

    await pool.query(`CREATE TABLE IF NOT EXISTS fractal_blocks (
      id SERIAL PRIMARY KEY,
      merkle_root TEXT,
      tll_anchor_hash TEXT,
      tll_signature TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS notary_records (
      id SERIAL PRIMARY KEY,
      client_hash TEXT,
      fractal_block_hash TEXT,
      tll_anchor_hash TEXT,
      tll_signature TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log("[Fractal Engine] Connected to PostgreSQL Database.");
  } catch (err) {
    console.error("[Fractal Engine] Database Initialization Error:", err);
  }
};
initDB();

let mockDynamicNews = [
  { id: 'dyn-1', title: 'Global Tech Conference Highlights AI Advancements', summary: 'Major players in the tech industry gathered today to showcase the next generation of artificial intelligence models, promising unprecedented capabilities.', zipCode: null, isLocal: false, timeAgo: '4h ago', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', tags: 'tech,ai' },
  { id: 'dyn-2', title: 'Market Rally Continues as Inflation Cools', summary: 'Stocks hit record highs on Wednesday as new consumer data indicates inflation is cooling faster than analysts predicted.', zipCode: null, isLocal: false, timeAgo: '6h ago', imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800', tags: 'finance,markets' }
];

// ═══════════════════════════════════════════
// FRACTAL ENGINE (Mempool & Daemon)
// ═══════════════════════════════════════════
let mempool = [];

const mineFractalBlock = async () => {
  if (mempool.length === 0) return;
  console.log(`[Fractal Engine] Mining block with ${mempool.length} transactions...`);
  
  // 1. Calculate Merkle Root
  const hash = crypto.createHash('sha256');
  mempool.forEach(tx => hash.update(JSON.stringify(tx)));
  const merkleRoot = hash.digest('hex');

  // 2. Anchor to Layer 1 (TLL)
  try {
    const payload = {
      facilityId: "AXIOM-L2-NODE",
      ruleId: "FRACTAL-ANCHOR",
      ruleName: "Layer 2 State Commit",
      action: "Anchor Merkle Root",
      outcome: "PASS",
      details: { rootHash: merkleRoot, txCount: mempool.length }
    };
    
    const response = await fetch('http://localhost:5200/api/submit/governance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    
    if (data.success && data.certificate) {
      console.log(`[Fractal Engine] Anchored to TLL. Payload Hash: ${data.certificate.payloadHash}`);
      
      // 3. Save block & update transactions
      const tllHash = data.certificate.payloadHash;
      const tllSig = data.certificate.signature;
      
      await pool.query(`INSERT INTO fractal_blocks (merkle_root, tll_anchor_hash, tll_signature) VALUES ($1, $2, $3)`, 
        [merkleRoot, tllHash, tllSig]);

      // Update all intel rows in mempool
      const intelIds = [...new Set(mempool.filter(tx => tx.intelId).map(tx => tx.intelId))];
      if (intelIds.length > 0) {
        await pool.query(`UPDATE local_intel SET fractal_block_hash = $1, tll_anchor_hash = $2, tll_signature = $3 WHERE id = ANY($4::int[])`,
          [merkleRoot, tllHash, tllSig, intelIds]);
      }
      
      // Update all notary rows in mempool
      const notaryIds = [...new Set(mempool.filter(tx => tx.notaryId).map(tx => tx.notaryId))];
      if (notaryIds.length > 0) {
        await pool.query(`UPDATE notary_records SET fractal_block_hash = $1, tll_anchor_hash = $2, tll_signature = $3 WHERE id = ANY($4::int[])`,
          [merkleRoot, tllHash, tllSig, notaryIds]);
      }
    }
  } catch (e) {
    console.error("[Fractal Engine] TLL Anchor Failed:", e.message);
  }
  
  // Clear mempool
  mempool = [];
};

// Run daemon every 15 seconds for prototype demonstration
setInterval(mineFractalBlock, 15000);

// POST Submit Local Intel
app.post('/api/intel', async (req, res) => {
  const { zipCode, content } = req.body;
  if (!zipCode || !content) return res.status(400).json({ error: 'Missing data' });

  try {
    const result = await pool.query(`INSERT INTO local_intel (zip_code, content) VALUES ($1, $2) RETURNING id`, [zipCode, content]);
    const intelId = result.rows[0].id;
    mempool.push({ type: 'SUBMIT', intelId, zipCode, content });
    res.json({ success: true, id: intelId });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST Vote on Intel
app.post('/api/intel/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; 
  const intelId = parseInt(id.replace('intel-', ''), 10);
  const column = type === 'upvote' ? 'upvotes' : 'downvotes';
  
  try {
    if(column !== 'upvotes' && column !== 'downvotes') throw new Error('Invalid vote type');
    await pool.query(`UPDATE local_intel SET ${column} = ${column} + 1 WHERE id = $1`, [intelId]);
    mempool.push({ type: 'VOTE', action: type, intelId });
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST Submit Notary Document Hash
app.post('/api/notary', async (req, res) => {
  const { clientHash } = req.body;
  if (!clientHash) return res.status(400).json({ error: 'Missing hash' });
  
  try {
    const result = await pool.query(`INSERT INTO notary_records (client_hash) VALUES ($1) RETURNING id`, [clientHash]);
    const notaryId = result.rows[0].id;
    mempool.push({ type: 'NOTARY', notaryId, clientHash });
    res.json({ success: true, id: notaryId });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET Notary Status
app.get('/api/notary/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM notary_records WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET News Endpoint
app.get('/api/news', async (req, res) => {
  const zip = req.query.zip || 'default';
  
  try {
    const result = await pool.query(`SELECT * FROM local_intel WHERE zip_code = $1 ORDER BY upvotes DESC, timestamp DESC`, [zip]);
    
    const communityIntel = result.rows.map(row => ({
      id: `intel-${row.id}`,
      title: 'Local Intelligence Tip',
      summary: row.content,
      zipCode: row.zip_code,
      isLocal: true,
      isIntel: true,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      timeAgo: 'Just now',
      imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=800',
      fractalBlockHash: row.fractal_block_hash,
      tllAnchorHash: row.tll_anchor_hash,
      tllSignature: row.tll_signature
    }));

    const combinedFeed = [...communityIntel, ...mockDynamicNews];
    res.json({ zipCode: zip, timestamp: new Date().toISOString(), stories: combinedFeed });
  } catch(err) {
    console.error(err);
    res.json({ zipCode: zip, timestamp: new Date().toISOString(), stories: mockDynamicNews });
  }
});

app.listen(config.server.port, () => {
  console.log(`[Fractal Engine] Node listening on http://localhost:${config.server.port}`);
});
