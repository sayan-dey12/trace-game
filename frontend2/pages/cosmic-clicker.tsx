import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// Game configuration
const GAME_DURATION = 30; // seconds
const SPAWN_RATE_MS = 800; // Orb move speed

const CosmicClicker: React.FC = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [gameOver, setGameOver] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moveRef = useRef<NodeJS.Timeout | null>(null);

  // -- Game Logic --
  const moveOrb = () => {
    // Random position between 10% and 90%
    const top = Math.floor(Math.random() * 80) + 10; 
    const left = Math.floor(Math.random() * 80) + 10;
    setPosition({ top: `${top}%`, left: `${left}%` });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setGameOver(false);
    moveOrb();
  };

  const handleOrbClick = () => {
    if (!isPlaying) return;
    setScore((prev) => prev + 1);
    moveOrb(); // Move immediately on click
    
    // Reset auto-move timer
    if (moveRef.current) clearInterval(moveRef.current);
    moveRef.current = setInterval(moveOrb, SPAWN_RATE_MS);
  };

  // Timer Countdown
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setGameOver(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (moveRef.current) clearInterval(moveRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, timeLeft]);

  // Orb Auto-Movement
  useEffect(() => {
    if (isPlaying) {
      moveRef.current = setInterval(moveOrb, SPAWN_RATE_MS);
    }
    return () => { if (moveRef.current) clearInterval(moveRef.current); };
  }, [isPlaying]);

  // -- STYLES --
  // We use inline styles here to ensure it works even if Tailwind is missing
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#000000',
    color: '#ffffff',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: 'monospace',
    userSelect: 'none',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 20,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '15px 40px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#9333ea', // Purple
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
  };

  const orbStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#06b6d4', // Cyan
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    boxShadow: '0 0 25px #06b6d4',
    zIndex: 10,
    border: '4px solid white',
  };

  return (
    <div style={containerStyle}>
      <Head>
        <title>Cosmic Clicker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /> 
      </Head>

      {/* HUD (Score & Time) */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 5, position: 'relative' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>SCORE</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22d3ee' }}>{score}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>TIME</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: timeLeft < 10 ? '#ef4444' : 'white' }}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
        </div>
      </div>

      {/* 1. START SCREEN */}
      {!isPlaying && !gameOver && (
        <div style={overlayStyle}>
          <h1 style={{ fontSize: '40px', marginBottom: '10px', textAlign: 'center' }}>COSMIC REFLEX</h1>
          <p style={{ color: '#ccc', textAlign: 'center' }}>Tap the blue orb before it moves.</p>
          <button onClick={startGame} style={buttonStyle}>START MISSION</button>
        </div>
      )}

      {/* 2. GAME OVER SCREEN */}
      {gameOver && (
        <div style={overlayStyle}>
          <h1 style={{ fontSize: '40px', color: '#22d3ee', marginBottom: '10px' }}>MISSION END</h1>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>{score} PTS</div>
          <button onClick={startGame} style={{ ...buttonStyle, backgroundColor: 'white', color: 'black' }}>
            RETRY
          </button>
        </div>
      )}

      {/* 3. THE ORB TARGET */}
      {isPlaying && (
        <div 
          onClick={handleOrbClick}
          style={orbStyle}
        />
      )}
    </div>
  );
};

export default CosmicClicker;