"use client";

import { useEffect, useState } from "react";
import type { Machine } from "@/lib/types";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

interface MachineCardProps {
  machine: Machine;
  onDelete: (id: string) => void;
}

export function MachineCard({ machine, onDelete }: MachineCardProps) {
  // Increment a counter every second to force re-renders,
  // so "12s ago" keeps counting up in real time.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const isOnline = !machine.isOffline;

  return (
    <div className="rounded-card border border-ash bg-parchment p-10 transition-colors group relative">
      <div className="flex items-start justify-between gap-4">
        <h3 
          className="font-serif text-2xl font-normal leading-tight text-off-black whitespace-nowrap overflow-x-auto min-w-0 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          title={machine.machineName}
        >
          {machine.machineName}
        </h3>

        <div className="flex shrink-0 items-center gap-3">
          <StatusTag isOnline={isOnline} />
          
          <button 
            onClick={() => onDelete(machine.id)} 
            className="text-smoke hover:text-red-500 transition-colors p-1"
            title="Delete machine"
            aria-label="Delete machine"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-smoke italic">
        last seen{" "}
        <span className="text-graphite font-medium">
          {formatRelativeTime(machine.lastSeenAt)}
        </span>
      </p>
    </div>
  );
}

function StatusTag({ isOnline }: { isOnline: boolean }) {
  return (
    <div
      className={[
        "flex shrink-0 items-center gap-2 rounded-pill border px-4 py-2 transition-colors duration-500",
        isOnline
          ? "border-ash bg-parchment text-off-black"
          : "border-ash bg-periwinkle-mist text-graphite",
      ].join(" ")}
    >
      <span
        className={[
          "h-2 w-2 shrink-0 rounded-full transition-colors duration-500",
          isOnline ? "bg-green-500 animate-status-pulse" : "bg-smoke",
        ].join(" ")}
        aria-hidden="true"
      />
      <span className="text-xs uppercase tracking-tight">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}
