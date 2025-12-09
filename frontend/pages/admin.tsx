import React, { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:4000";

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setLogged(true);
      loadData();
    }
  }, []);

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

  async function deleteUpload(id: number, publicId: string) {
    if (!confirm("Delete this upload?")) return;

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
    if (json.ok) loadData();
  }

  async function deleteAllUploads() {
    if (!confirm("Delete ALL uploads permanently?")) return;

    const token = localStorage.getItem("admin_token");

    const res = await fetch(`${BACKEND}/admin/delete-all`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (json.ok) {
      alert("All uploads deleted");
      loadData();
    }
  }

  function downloadImage(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo.jpg";
    a.click();
  }

  if (!logged) {
    return (
      <main style={styles.container}>
        <h1>Admin Login</h1>
        <input style={styles.input} placeholder="Username" onChange={(e) => setU(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password" onChange={(e) => setP(e.target.value)} />
        <button style={styles.button} onClick={login}>Login</button>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.topBar}>
        <h1>Admin Panel</h1>
        <button
          style={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem("admin_token");
            setLogged(false);
          }}
        >
          Logout
        </button>
      </div>

      <h2>Uploads</h2>

      <button onClick={deleteAllUploads} style={styles.deleteAllButton}>
        Delete ALL Uploads
      </button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Preview</th>
            <th>IP</th>
            <th>Lat</th>
            <th>Lon</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {uploads.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td><img src={u.cloudinary_url} style={styles.thumbnail} /></td>
              <td>{u.ip}</td>
              <td>{u.latitude}</td>
              <td>{u.longitude}</td>
              <td>{u.created_at}</td>
              <td>
                <button style={styles.smallButton} onClick={() => downloadImage(u.cloudinary_url)}>Download</button>
                <button style={styles.deleteButton} onClick={() => deleteUpload(u.id, u.cloudinary_public_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Events</h2>

      <table style={styles.table}>
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
    </main>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial",
  },
  input: {
    padding: "10px",
    margin: "8px 0",
    width: "240px",
    fontSize: "16px",
  },
  button: {
    padding: "12px 20px",
    background: "green",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginTop: 10,
  },
  logoutButton: {
    padding: "10px 16px",
    background: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
    height: 40,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: 20,
  },
  thumbnail: {
    width: 100,
    borderRadius: 6,
  },
  smallButton: {
    padding: "6px 10px",
    background: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginRight: 8,
  },
  deleteButton: {
    padding: "6px 10px",
    background: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  deleteAllButton: {
    padding: "10px 20px",
    background: "darkred",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: 15,
  },
};
