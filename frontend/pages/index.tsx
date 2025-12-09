import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:4000";

export default function HomePage() {
  const [trackRes, setTrackRes] = useState<any>(null);
  const [gps, setGps] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  async function handleTrack() {
    const res = await fetch(`${BACKEND}/api/track`);
    const json = await res.json();
    setTrackRes(json);
  }

  function handleGPS() {
    if (!navigator.geolocation) return setGps("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps(`Lat: ${pos.coords.latitude}, Lon: ${pos.coords.longitude}`);
      },
      (err) => setGps(`Denied: ${err.message}`)
    );
  }

  async function openCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
    } catch (err: any) {
      alert("Camera denied: " + err.message);
    }
  }

  async function takePhoto() {
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

    const fd = new FormData();
    fd.append("photo", blob);
    fd.append("consent", "yes");

    const res = await fetch(`${BACKEND}/api/upload-photo`, {
      method: "POST",
      body: fd
    });

    const json = await res.json();
    setUploadInfo(json);

    // Stop camera
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Consent-Based Data Capture</h1>

      {/* IP + Device */}
      <section style={{ marginBlock: 20 }}>
        <h2>1. Collect IP + Device (User Consent)</h2>
        <button onClick={handleTrack}>I Consent — Log My Info</button>
        <pre>{trackRes && JSON.stringify(trackRes, null, 2)}</pre>
      </section>

      {/* GPS */}
      <section style={{ marginBlock: 20 }}>
        <h2>2. GPS Collection (Browser Permission)</h2>
        <button onClick={handleGPS}>Share GPS</button>
        <pre>{gps}</pre>
      </section>

      {/* Photo */}
      <section style={{ marginBlock: 20 }}>
        <h2>3. Camera + Upload Photo</h2>
        <button onClick={openCamera}>Open Camera</button>
        <br /><br />
        <video ref={videoRef} style={{ width: "300px" }} />
        <br />
        <button onClick={takePhoto}>Capture & Upload</button>

        <pre>{uploadInfo && JSON.stringify(uploadInfo, null, 2)}</pre>
      </section>

      {/* QR Code */}
      <section>
        <h2>QR Code</h2>
        <QRCodeCanvas value={typeof window !== "undefined" ? window.location.href : ""} size={180} />      </section>
    </main>
  );
}
