// LOCAL DEV / TESTING PAGE — not for production.
//
// Exercises the Interfacer × Medusa first spike from the GUI: it POSTs a
// sample EconomicResource + Digital Product Passport to the Medusa local-dev
// endpoint (`/dev/interfacer/listings`), which projects it into one DRAFT
// product + variant and returns the immutable ListingBinding. Authorization
// on that endpoint is the local fixture-controller stub (NOT a live PDP or a
// signed envelope); the endpoint only runs under INTERFACER_AUTH_MODE=
// fixture-controller-stub in non-production. Point NEXT_PUBLIC_MEDUSA_URL at
// the running Medusa (default http://localhost:9000).
import React, { useCallback, useState } from "react";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const ENDPOINT = `${MEDUSA_URL}/dev/interfacer/listings`;

const SAMPLE = {
  actingPersonId: "01J8PERSONALICE0000000001",
  resource: {
    id: "01J8RESALICE000000000001",
    name: "3D-printed prosthetic hand v2",
    note: "Open-source hardware; community fork, accepted contribution",
    primaryAccountable: { id: "01J8PERSONALICE0000000001", name: "Alice" },
    custodian: { id: "01J8PERSONALICE0000000001", name: "Alice" },
    conformsTo: { id: "01J8SPEC0000000000000000001", name: "Prosthetic hand spec" },
    accountingQuantity: { hasNumericalValue: 1, hasUnit: { label: "one" } },
    trackingIdentifier: "PH2-0001",
  },
  dpp: {
    productId: "01J8RESALICE000000000001",
    name: "3D-printed prosthetic hand v2 — Digital Product Passport",
    status: "published",
    spec: { conformsTo: "01J8SPEC0000000000000000001", version: "2.0" },
    attachments: [
      { id: "att-001", kind: "design", url: "https://losh.example/ph2/design.zip" },
      { id: "att-002", kind: "bom", url: "https://losh.example/ph2/bom.csv" },
    ],
    createdBy: "01J8PERSONALICE0000000001",
  },
};

const box: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  maxWidth: 960,
  margin: "0 auto",
  padding: 24,
  color: "#111",
};

const CommerceDevPage = () => {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE, null, 2));
  const [result, setResult] = useState<any>(null);
  const [listings, setListings] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const listOnMedusa = useCallback(async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const body = JSON.parse(payload);
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${res.status}: ${data?.message || data?.reason || res.statusText}`);
      setResult(data);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, [payload]);

  const refresh = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${res.status}: ${data?.message || res.statusText}`);
      setListings(Array.isArray(data) ? data : data?.listings || data?.bindings || []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <main style={box}>
      <h1>Interfacer × Medusa — spike tester (local dev)</h1>
      <p style={{ background: "#fff3cd", padding: 12, borderRadius: 6, border: "1px solid #ffe69c" }}>
        Local testing only. Projects a resource + passport into a Medusa <b>draft</b> product via the fixture-controller
        stub (not a live PDP / signed envelope). Endpoint: <code>{ENDPOINT}</code>
      </p>

      <h3>Resource + DPP + acting controller</h3>
      <textarea
        value={payload}
        onChange={e => setPayload(e.target.value)}
        spellCheck={false}
        style={{ width: "100%", height: 320, fontFamily: "ui-monospace, monospace", fontSize: 12 }}
      />

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <button onClick={listOnMedusa} disabled={busy} style={{ padding: "8px 16px" }}>
          List on Medusa
        </button>
        <button onClick={refresh} disabled={busy} style={{ padding: "8px 16px" }}>
          Refresh listings
        </button>
        <span style={{ alignSelf: "center" }}>
          Tip: set <code>actingPersonId</code> to a non-controller to see the fail-closed denial.
        </span>
      </div>

      {error && (
        <pre style={{ background: "#f8d7da", padding: 12, borderRadius: 6, whiteSpace: "pre-wrap" }}>
          Error — {error}
        </pre>
      )}

      {result && (
        <>
          <h3>Projection result {result.created === false ? "(idempotent: not re-created)" : "(created)"}</h3>
          <pre style={{ background: "#eef", padding: 12, borderRadius: 6, overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}

      {listings && (
        <>
          <h3>Stored listings ({listings.length})</h3>
          <pre style={{ background: "#efe", padding: 12, borderRadius: 6, overflow: "auto" }}>
            {JSON.stringify(listings, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
};

export default CommerceDevPage;
