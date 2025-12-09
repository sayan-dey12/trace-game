import React from "react";

export default function FunLandingPage() {
  const openGame = () => {
    window.open("/fun/game", "_blank");
  };

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "2.6rem", fontWeight: 700, marginBottom: 20 }}>
        Ready for a Quick Fun?
      </h1>

      <p style={{ fontSize: "1.2rem", maxWidth: 320, marginBottom: 30 }}>
        Tap the falling dots and score as much as you can!  
        Fast, simple & fun 🎉
      </p>

      <button
        onClick={openGame}
        style={{
          padding: "16px 34px",
          borderRadius: "50px",
          background: "white",
          color: "#ff416c",
          fontWeight: 700,
          fontSize: "18px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
        }}
      >
        🎮 CLICK ME
      </button>
    </main>
  );
}
