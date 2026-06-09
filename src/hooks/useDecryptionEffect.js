import { useState, useEffect } from 'react';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';

export function useDecryptionEffect(finalText, trigger = true, speed = 30) {
  const [displayText, setDisplayText] = useState(finalText);
  
  useEffect(() => {
    if (!trigger || !finalText) return;

    let iterations = 0;
    const maxIterations = finalText.length;
    
    const interval = setInterval(() => {
      setDisplayText((prev) => 
        finalText
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return finalText[index]; // Resolved character
            }
            if (char === ' ') return ' '; // Preserve spaces
            return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          })
          .join('')
      );
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
      }
      
      iterations += 1/3; // Speed control: higher denominator = slower reveal
    }, speed);

    return () => clearInterval(interval);
  }, [finalText, trigger, speed]);

  return displayText;
}
