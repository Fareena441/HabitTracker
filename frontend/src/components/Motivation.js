import React, { useState, useEffect } from 'react';
import './Motivation.css';

const quotes = [
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Your net worth to the world is usually determined by what remains after your bad habits are subtracted from your good ones.", author: "Benjamin Franklin" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Successful people are simply those with successful habits.", author: "Brian Tracy" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
  { text: "Good habits are as addictive as bad habits, and a lot more rewarding.", author: "Harvey Mackay" },
  { text: "Habit is the intersection of knowledge, skill, and desire.", author: "Stephen Covey" },
  { text: "Small habits make a big difference.", author: "James Clear" },
  { text: "Initial resistance to self-discipline is actually resistance to the unknown.", author: "Unknown" }
];

const Motivation = () => {
  const [quote, setQuote] = useState(null);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Select a random quote on mount
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    
    // Rotate quote every 10 seconds
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        const nextIndex = Math.floor(Math.random() * quotes.length);
        setQuote(quotes[nextIndex]);
        setFade(true);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!quote) return null;

  return (
    <div className={`motivation-container ${fade ? 'fade-in' : 'fade-out'}`}>
      <div className="quote-icon">❝</div>
      <div className="quote-content">
        <p className="quote-text">{quote.text}</p>
        <p className="quote-author">— {quote.author}</p>
      </div>
    </div>
  );
};

export default Motivation;
