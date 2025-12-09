import React, { useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:4000";

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);

  async function login() {
    const res = await fetch(`${BACKEND}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: u, pass: p })
    });
    const json = await res.json();
    if (json.ok) {
      setLogged(true);
      loadData();
    } else {
      alert("Wrong admin login");
    }
  }

  async function loadData() {
    const ev = await (await fetch(`${BACKEND}/admin/events`)).json();
    const up = await (await fetch(`${BACKEND}/admin/uploads`)).json();
    setEvents(ev);
    setUploads(up);
  }

  if (!logged) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Admin Login</h1>
        <input placeholder="username" value={u} onChange={(e) => setU(e.target.value)} />
        <br />
        <input type="password" placeholder="password" value={p} onChange={(e) => setP(e.target.value)} />
        <br />
        <button onClick={login}>Login</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

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
          </tr>
        </thead>
        <tbody>
          {uploads.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.cloudinary_url && (
                <img src={u.cloudinary_url} width="140" />
              )}</td>
              <td>{u.ip}</td>
              <td>{u.latitude}</td>
              <td>{u.longitude}</td>
              <td>{u.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
