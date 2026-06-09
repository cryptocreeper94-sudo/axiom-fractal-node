export default {
  server: {
    port: process.env.PORT || 3001,
  },
  cache: {
    // Cache duration in seconds (floodgate protection)
    stdTTL: 60,
    checkperiod: 120,
  },
  rateLimit: {
    // Rate limit window in minutes
    windowMs: 1 * 60 * 1000, 
    // Max requests per window per IP
    max: 100,
  },
  db: {
    // Database file path
    filename: './cpm_tracking.sqlite'
  }
};
