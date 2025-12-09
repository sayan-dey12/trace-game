import React, { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:4000";

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);

  // -----------------------------
  // AUTO LOGIN IF TOKEN EXISTS
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setLogged(true);
      loadData();
    }
  }, []);

  // -----------------------------
  // LOGIN FUNCTION
  // -----------------------------
  async function login() {
    const res = await fetch(`${BACKEND}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: u, pass: p }),
    });

    const json = await res.json();

    if (json.ok) {
      localStorage.setItem("admin_token", json.token);
      setLogged(true);
      loadData();
    } else {
      alert("Wrong admin login");
    }
  }

  // -----------------------------
  // FETCH DATA (requires token)
  // -----------------------------
  async function loadData() {
    const token = localStorage.getItem("admin_token");

    const ev = await fetch(`${BACKEND}/admin/events`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    const up = await fetch(`${BACKEND}/admin/uploads`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());

    setEvents(ev);
    setUploads(up);
  }

  // -----------------------------
  // DELETE UPLOAD
  // -----------------------------
  async function deleteUpload(id: number, publicId: string) {
    const ok = confirm("Delete this upload permanently?");
    if (!ok) return;

    const token = localStorage.getItem("admin_token");

    const res = await fetch(`${BACKEND}/admin/delete-upload/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ public_id: publicId }),
    });

    const json = await res.json();
    if (json.ok) {
      alert("Deleted successfully");
      loadData();
    } else {
      alert("Delete failed");
    }
  }

  // -----------------------------
  // DOWNLOAD IMAGE
  // -----------------------------
  function downloadImage(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo.jpg";
    a.click();
  }

  // -----------------------------
  // LOGIN SCREEN
  // -----------------------------
  if (!logged) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Admin Login</h1>
        <input
          placeholder="username"
          value={u}
          onChange={(e) => setU(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="password"
          value={p}
          onChange={(e) => setP(e.target.value)}
        />
        <br />
        <button onClick={login}>Login</button>
      </main>
    );
  }

  // -----------------------------
  // ADMIN PANEL
  // -----------------------------
  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <button
        onClick={() => {
          localStorage.removeItem("admin_token");
          setLogged(false);
        }}
        style={{ marginBottom: 20 }}
      >
        Logout
      </button>

      <h2>Events</h2>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th>
            <th>IP</th>
            <th>User Agent</th>
            <th>City</th>
            <th>Region</th>
            <th>Country</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.ip}</td>
              <td>{e.user_agent}</td>
              <td>{e.city}</td>
              <td>{e.region}</td>
              <td>{e.country}</td>
              <td>{e.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Uploads</h2>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>IP</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                <img src={u.cloudinary_url} width="140" />
              </td>
              <td>{u.ip}</td>
              <td>{u.latitude}</td>
              <td>{u.longitude}</td>
              <td>{u.created_at}</td>
              <td>
                <button onClick={() => downloadImage(u.cloudinary_url)}>
                  Download
                </button>
                <button
                  onClick={() => deleteUpload(u.id, u.cloudinary_public_id)}
                  style={{ background: "red", color: "white", marginLeft: 10 }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
