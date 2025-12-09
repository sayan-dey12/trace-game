// pages/fun/game.tsx
import React, { useEffect, useRef, useState } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  speed: number;
  angle: number;
  hue: number;
  id: number;
};

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(true);
  const [started, setStarted] = useState(false);

  const starsRef = useRef<Star[]>([]);
  const nextStarId = useRef(1);
  const difficultyRef = useRef(1);

  const spawnIntervalRef = useRef<number | null>(null);
  const rampIntervalRef = useRef<number | null>(null);

  // Sounds
  const collectSound = useRef<HTMLAudioElement | null>(null);
  const missSound = useRef<HTMLAudioElement | null>(null);
  const bgMusic = useRef<HTMLAudioElement | null>(null);

  function resizeCanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width * dpr;
    const height = rect.height * dpr;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }
  }

  function spawnStar(canvasWidth: number) {
    const r = 18 + Math.random() * 14;
    const x = Math.random() * (canvasWidth - r * 2) + r;
    const speed = 1.4 * difficultyRef.current + Math.random() * 2;
    const angle = (Math.random() - 0.5) * 0.4;
    const hue = Math.floor(Math.random() * 360);
    const id = nextStarId.current++;

    starsRef.current.push({ x, y: -r * 2, r, speed, angle, hue, id });
  }

  function rampDifficulty() {
    difficultyRef.current += 0.08;
    setLevel(Math.floor(difficultyRef.current));
  }

  // -------- INIT EFFECT ----------
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    // Load sounds
    collectSound.current = new Audio("/sounds/collect.mp3");
    missSound.current = new Audio("/sounds/miss.mp3");
    bgMusic.current = new Audio("/sounds/bg.mp3");
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.15;

    // Canvas setup
    canvas.style.width = "100%";
    canvas.style.height = "100vh";
    canvas.style.touchAction = "none";

    resizeCanvas(canvas);

    const onResizeReal = () => resizeCanvas(canvas);
    window.addEventListener("resize", onResizeReal);

    // Spawn stars at interval
    function startSpawnLoop() {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);

      const ms = Math.max(300, 900 - difficultyRef.current * 30);
      spawnIntervalRef.current = window.setInterval(
        () => spawnStar(canvas.getBoundingClientRect().width),
        ms
      ) as unknown as number;
    }
    startSpawnLoop();

    rampIntervalRef.current = window.setInterval(rampDifficulty, 6000);

    // Resize observer for container size
    resizeObserverRef.current = new ResizeObserver(() => resizeCanvas(canvas));
    resizeObserverRef.current.observe(canvas);

    const ctx = canvas.getContext("2d")!;
    let last = performance.now();

    function loop(now: number) {
      const dt = now - last;
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      // Background
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#020024");
      g.addColorStop(1, "#090979");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const stars = starsRef.current;

      if (running) {
        // Update
        for (const s of stars) {
          s.y += s.speed * (dt / 16);
          s.x += s.angle * (dt / 16);
        }
      }

      // Draw
      for (const s of stars) {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${s.hue},90%,60%)`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Remove missed stars
      if (running) {
        let missed = 0;
        for (let i = stars.length - 1; i >= 0; i--) {
          if (stars[i].y > h + stars[i].r) {
            stars.splice(i, 1);
            missed++;
          }
        }
        if (missed > 0) {
          missSound.current?.play();
          setLives((l) => Math.max(0, l - missed));
        }
      }

      if (lives <= 0) {
        setRunning(false);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    // Interaction handler (touch/mouse/pointer unified)
    function handleInput(ev: PointerEvent | MouseEvent | TouchEvent) {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();

      let x = 0,
        y = 0;

      if (ev instanceof PointerEvent || ev instanceof MouseEvent) {
        x = ev.clientX - rect.left;
        y = ev.clientY - rect.top;
      } else if (ev instanceof TouchEvent) {
        x = ev.touches[0].clientX - rect.left;
        y = ev.touches[0].clientY - rect.top;
      }

      const stars = starsRef.current;
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        if (Math.hypot(s.x - x, s.y - y) <= s.r) {
          stars.splice(i, 1);
          collectSound.current?.play();
          setScore((sc) => sc + 1);
          break;
        }
      }
    }

    canvas.addEventListener("pointerdown", handleInput);
    canvas.addEventListener("touchstart", handleInput);

    return () => {
      window.removeEventListener("resize", onResizeReal);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (rampIntervalRef.current) clearInterval(rampIntervalRef.current);
      resizeObserverRef.current?.disconnect();
    };
  }, [running, lives]);

  function startGame() {
    starsRef.current = [];
    setScore(0);
    setLives(3);
    difficultyRef.current = 1;
    setLevel(1);
    setRunning(true);
    setStarted(true);
    bgMusic.current?.play().catch(() => {});
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <canvas ref={canvasRef} />

      {/* Score UI */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          padding: "8px 12px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.4)",
          color: "white",
          zIndex: 10,
        }}
      >
        Score: {score} | Lives: {lives} | Level: {level}
      </div>

      {/* Controls */}
      {!started ? (
        <button
          onClick={startGame}
          style={btn}
        >
          Start Game
        </button>
      ) : lives <= 0 ? (
        <div style={gameOverBox}>
          <h2>Game Over</h2>
          <p>Score: {score}</p>
          <button style={btn} onClick={startGame}>
            Restart
          </button>
        </div>
      ) : null}
    </div>
  );
}

const btn: React.CSSProperties = {
  position: "fixed",
  right: 20,
  top: 20,
  padding: "10px 18px",
  background: "#2ec4b6",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: 16,
  cursor: "pointer",
  zIndex: 10,
};

const gameOverBox: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 22,
  zIndex: 20,
};
