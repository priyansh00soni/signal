"use client";

import { useEffect, useState } from "react";
import { MachineCard } from "@/components/MachineCard";
import type { Machine, MachinesResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const POLL_INTERVAL_MS = 10_000;

export default function DashboardPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // --- Heartbeat form state ---
  const [machineName, setMachineName] = useState("");
  const [sending, setSending] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  async function fetchMachines() {
    try {
      const res = await fetch(`${API_URL}/api/v1/machines`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const body: MachinesResponse = await res.json();
      if (!body.success) throw new Error("Backend reported an unsuccessful response");

      setMachines(body.data);
      setLoadState("ready");
      setLastRefreshedAt(new Date());
      setHasLoadedOnce(true);
    } catch {
      setLoadState("error");
    }
  }

  async function sendHeartbeat() {
    if (!machineName.trim()) return;

    setSending(true);
    setFormMessage("");

    try {
      const res = await fetch(`${API_URL}/api/v1/heartbeats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineName: machineName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormMessage(data.message || "Something went wrong");
        return;
      }

      // Show success, clear input, refresh the list.
      setFormMessage(res.status === 201 ? `Created "${machineName.trim()}"` : `Heartbeat sent for "${machineName.trim()}"`);
      setMachineName("");
      fetchMachines();
    } catch {
      setFormMessage("Could not reach the server");
    } finally {
      setSending(false);
    }
  }

  async function deleteMachine(id: string) {
    if (!confirm('Are you sure you want to delete this machine?')) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/machines/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchMachines();
    } catch (e) {
      console.error(e);
    }
  }

  // Fetch once on mount, then poll every 10 seconds.
  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-page px-6 py-16 sm:px-10">
      <Header lastRefreshedAt={lastRefreshedAt} isPolling={loadState !== "loading"} />

      {/* --- Send heartbeat form --- */}
      <div className="mt-10 rounded-card border border-ash bg-parchment p-8">
        <h2 className="font-serif text-2xl font-normal text-off-black">
          Send a heartbeat
        </h2>
        <p className="mt-2 text-sm text-smoke italic">
          Enter a machine name. If it doesn&apos;t exist yet, it will be created automatically.
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="e.g. web-server-1"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendHeartbeat(); }}
            className="flex-1 rounded-button border border-ash bg-white px-6 py-4 text-sm text-off-black outline-none placeholder:text-smoke focus:border-green-500 transition-colors"
          />
          <button
            onClick={sendHeartbeat}
            disabled={sending || !machineName.trim()}
            className="rounded-button border border-off-black px-8 py-4 text-xs uppercase tracking-tight text-off-black transition-colors hover:bg-off-black hover:text-parchment disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-off-black"
          >
            {sending ? "Sending..." : "Send heartbeat"}
          </button>
        </div>

        {formMessage && (
          <p className="mt-4 text-sm text-graphite">{formMessage}</p>
        )}
      </div>

      {/* --- Machine list --- */}
      <div className="mt-12">
        {loadState === "loading" && <LoadingState />}

        {loadState === "error" && !hasLoadedOnce && (
          <ErrorState onRetry={fetchMachines} />
        )}

        {loadState === "error" && hasLoadedOnce && (
          <InlineErrorBanner onRetry={fetchMachines} />
        )}

        {loadState === "ready" && machines.length === 0 && <EmptyState />}

        {(loadState === "ready" || (loadState === "error" && hasLoadedOnce)) &&
          machines.length > 0 && <MachineGrid machines={machines} onDelete={deleteMachine} />}
      </div>
    </main>
  );
}

function Header({
  lastRefreshedAt,
  isPolling,
}: {
  lastRefreshedAt: Date | null;
  isPolling: boolean;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-ash pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-5xl font-normal leading-tight text-off-black sm:text-[3.5rem] italic">
          Endpoint Health
        </h1>
        <p className="mt-3 text-base leading-relaxed text-graphite">
          Live status for every registered machine, checked every 10 seconds.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs uppercase tracking-tight text-smoke">
        <span
          className={[
            "h-2 w-2 rounded-full",
            isPolling ? "bg-green-500 animate-status-pulse" : "bg-ash",
          ].join(" ")}
          aria-hidden="true"
        />
        {lastRefreshedAt
          ? `Updated ${lastRefreshedAt.toLocaleTimeString()}`
          : "Connecting"}
      </div>
    </header>
  );
}

function MachineGrid({ machines, onDelete }: { machines: Machine[]; onDelete: (id: string) => void }) {
  return (
    <div className="grid animate-fade-in grid-cols-1 gap-6 lg:grid-cols-2">
      {machines.map((machine) => (
        <MachineCard key={machine.id} machine={machine} onDelete={onDelete} />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-card border border-ash bg-periwinkle-mist/40"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-ash px-10 py-16 text-center">
      <p className="font-serif text-2xl font-normal text-off-black">
        No machines yet
      </p>
      <p className="mt-3 text-sm text-smoke">
        Use the form above to send a heartbeat and register your first machine.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-ash px-10 py-16 text-center">
      <p className="font-serif text-2xl font-normal text-off-black">
        Couldn&apos;t reach the server
      </p>
      <p className="mt-3 text-sm text-smoke">
        We&apos;ll keep trying in the background — this page will update
        automatically once the backend responds.
      </p>
      <button
        onClick={onRetry}
        className="mt-8 rounded-button border border-off-black px-8 py-4 text-xs uppercase tracking-tight text-off-black transition-colors hover:bg-off-black hover:text-parchment"
      >
        Retry now
      </button>
    </div>
  );
}

function InlineErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-card border border-ash bg-periwinkle-mist/50 px-6 py-4 text-sm text-graphite">
      <span>Couldn&apos;t reach the server — showing the last known status.</span>
      <button
        onClick={onRetry}
        className="shrink-0 rounded-button border border-off-black px-4 py-2 text-xs uppercase tracking-tight text-off-black transition-colors hover:bg-off-black hover:text-parchment"
      >
        Retry
      </button>
    </div>
  );
}
