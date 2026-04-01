import { useEffect, useState } from "react";
import { api, Weights } from "../api";

type Row = {
  student_id: number;
  email: string | null;
  display_name: string | null;
  last_final: Weights | null;
  trend_ratio: number | null;
  reiterate: boolean;
};

export function TutorDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void api
      .tutorBatch()
      .then(setRows)
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="card">
      <h1>Batch overview</h1>
      <p className="muted">Per-student fused weights and post-evaluation reiteration signal.</p>
      {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
      {!rows.length && !err && <p>No students yet.</p>}
      {!!rows.length && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: "0.85rem" }}>
              <th style={{ padding: "8px 4px" }}>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Video</th>
              <th>Audio</th>
              <th>Text</th>
              <th>Trend</th>
              <th>Re-run?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student_id} style={{ borderTop: "1px solid var(--surface2)" }}>
                <td style={{ padding: "8px 4px" }}>{r.student_id}</td>
                <td style={{ wordBreak: "break-all", maxWidth: 200 }}>{r.email ?? "—"}</td>
                <td>{r.display_name ?? "—"}</td>
                <td>{pct(r.last_final?.video)}</td>
                <td>{pct(r.last_final?.audio)}</td>
                <td>{pct(r.last_final?.text)}</td>
                <td>{r.trend_ratio != null ? r.trend_ratio.toFixed(2) : "—"}</td>
                <td style={{ color: r.reiterate ? "var(--warn)" : "var(--muted)" }}>
                  {r.reiterate ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function pct(v: number | undefined | null) {
  if (v == null) return "—";
  return `${(v * 100).toFixed(0)}%`;
}
