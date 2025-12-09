import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:4000";

export default function HomePage() {
  const [trackRes, setTrackRes] = useState<any>(null);
  const [gps, setGps] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [autoMode, setAutoMode] = useState(false);
  const intervalRef = useRef<number | null>(null); // FIXED TYPE

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // -------------------- TRACK IP --------------------
  async function handleTrack() {
    const res = await fetch(`${BACKEND}/api/track`);
    const json = await res.json();
    setTrackRes(json);
  }

  // -------------------- GPS --------------------
  function handleGPS() {
    if (!navigator.geolocation) return setGps("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps(`Lat: ${pos.coords.latitude}, Lon: ${pos.coords.longitude}`);
      },
      (err) => setGps(`Denied: ${err.message}`)
    );
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
    } catch (err: any) {
      alert("Camera denied: " + err.message);
    }
  }

  // -------------------- TAKE PHOTO --------------------
  async function takePhoto(silent = false) {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    if (!blob) return alert("Could not capture image");

    // Get GPS
    const pos = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve(p),
        () => resolve(null)
      );
    });

    const fd = new FormData();
    fd.append("photo", blob);
    fd.append("consent", "yes");

    if (pos) {
      fd.append("latitude", String(pos.coords.latitude));
      fd.append("longitude", String(pos.coords.longitude));
    }

    const res = await fetch(`${BACKEND}/api/upload-photo`, {
      method: "POST",
      body: fd
    });

    const json = await res.json();
    setUploadInfo(json);

    // Stop only in manual mode
    if (!silent && !autoMode && stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }

  // -------------------- AUTO CAPTURE EVERY 5 SEC --------------------
  function startAutoCapture() {
    if (autoMode) return;

    setAutoMode(true);

    intervalRef.current = window.setInterval(() => {
      takePhoto(true); // silent mode → keeps camera running
    }, 5000);

    console.log("📸 Auto Capture Started");
  }

  function stopAutoCapture() {
    setAutoMode(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current); // FIXED
      intervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    console.log("🛑 Auto Capture Stopped");
  }

  // -------------------- RUN ALL --------------------
  async function runAll() {
    setLoading(true);

    await handleTrack();
    handleGPS();
    await openCamera(true); // auto = true → start auto mode

    // Take 1 initial photo immediately
    setTimeout(async () => {
      await takePhoto(true);
      setLoading(false);
    }, 1000);
  }

  // -------------------- UI --------------------
  const cardStyle = {
    padding: "20px",
    margin: "20px 0",
    borderRadius: "10px",
    background: "#ffffff",
    boxShadow: "0 0 10px rgba(0,0,0,0.08)"
  };

  const buttonStyle = {
    padding: "12px 20px",
    marginTop: "10px",
    background: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  };

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "auto", fontFamily: "Arial" }}>

      <h1 style={{ textAlign: "center", marginBottom: 30 }}>
        Consent-Based Data Capture
      </h1>

      {/* Run All Button */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <button
          onClick={runAll}
          style={{ ...buttonStyle, background: "green" }}
          disabled={loading}
        >
          {loading ? "Running..." : "Run All (Start Auto Capture)"}
        </button>
      </div>

      {/* Stop Auto Capture */}
      {autoMode && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            onClick={stopAutoCapture}
            style={{ ...buttonStyle, background: "red" }}
          >
            Stop Auto Capture
          </button>
        </div>
      )}

      {/* IP + Device */}
      <section style={cardStyle}>
        <h2>1. Collect IP + Device Info</h2>
        <button onClick={handleTrack} style={buttonStyle}>
          Log My Info
        </button>
        <pre>{trackRes && JSON.stringify(trackRes, null, 2)}</pre>
      </section>

      {/* GPS */}
      <section style={cardStyle}>
        <h2>2. Collect GPS Coordinates</h2>
        <button onClick={handleGPS} style={buttonStyle}>
          Share GPS
        </button>
        <pre>{gps}</pre>
      </section>

      {/* Camera */}
      <section style={cardStyle}>
        <h2>3. Camera + Photo Upload</h2>

        <button onClick={() => openCamera(false)} style={buttonStyle}>
          Open Camera (Manual)
        </button>

        <button
          onClick={() => openCamera(true)}
          style={{ ...buttonStyle, background: "purple", marginLeft: 10 }}
        >
          Start Auto Capture
        </button>

        <br /><br />
        <video
          ref={videoRef}
          style={{ width: "100%", maxWidth: "350px", borderRadius: "10px" }}
        />

        <br />
        <button onClick={() => takePhoto(false)} style={buttonStyle}>
          Capture & Upload
        </button>

        <pre>{uploadInfo && JSON.stringify(uploadInfo, null, 2)}</pre>
      </section>

      {/* QR Code */}
      <section style={cardStyle}>
        <h2>Shareable QR Code</h2>
        <QRCodeCanvas
          value={typeof window !== "undefined" ? window.location.href : ""}
          size={200}
        />
      </section>
    </main>
  );
}
