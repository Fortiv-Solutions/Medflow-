import React, { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Signal, SignalSeverity, SignalTone } from "../../types/medflow";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export const InsightWorkspace: React.FC = () => {
  const {
    signals,
    resolveSignal,
    dismissSignal,
    executeSignalAction,
    searchQuery,
    setSearchQuery,
    notify,
  } = useMedFlow();

  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "open" | "resolved" | "dismissed">("open");

  const severities: (string | SignalSeverity)[] = ["All", "Critical", "High", "Medium", "Optimization"];

  const filtered = useMemo(() => {
    return signals.filter((sig) => {
      const matchSearch = `${sig.title} ${sig.detail} ${sig.recommendedAction} ${sig.category}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchSeverity = severityFilter === "All" || sig.severity === severityFilter;
      const matchStatus = statusFilter === "All" || sig.status === statusFilter;
      return matchSearch && matchSeverity && matchStatus;
    });
  }, [signals, searchQuery, severityFilter, statusFilter]);

  const metrics = useMemo(() => {
    const openCount = signals.filter((s) => s.status === "open").length;
    const resolvedCount = signals.filter((s) => s.status === "resolved").length;
    const criticalCount = signals.filter((s) => s.status === "open" && s.severity === "Critical").length;
    return { openCount, resolvedCount, criticalCount };
  }, [signals]);

  return (
    <div className="space-y-6 medflow-rise">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dcefe7] text-[#20735b]">
              <Activity size={13} />
            </span>
            Operational Intelligence & Telemetry
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">
            AI Anomaly Signals & Bot Automations
          </h2>
          <p className="mt-1 text-[13px] text-[#78918a]">
            Proactive operational anomaly detection across patient flow, inventory exhaustion, payer contracts, and care continuity.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Active Operational Signals
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#163d34]">{metrics.openCount} Open Signals</p>
          <p className="mt-1 text-[10px] text-[#839792]">Continuous heuristic & AI agent scanning</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Critical Risk Priority
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#dc2626]">{metrics.criticalCount} Immediate Actions</p>
          <p className="mt-1 text-[10px] text-[#839792]">Referral & clinical continuity leaks</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Automated Fixes Executed
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#258066]">{metrics.resolvedCount} Resolved Today</p>
          <p className="mt-1 text-[10px] text-[#839792]">Estimated ₹1,48,000 operational recovery</p>
        </div>
      </div>

      {/* Main Signal Stream */}
      <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#edf4f1] pb-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Open Signals", val: "open" },
              { label: "Resolved", val: "resolved" },
              { label: "Dismissed", val: "dismissed" },
              { label: "All Telemetry", val: "All" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setStatusFilter(tab.val as any)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-[11px] font-semibold transition",
                  statusFilter === tab.val
                    ? "bg-[#155f4b] text-white shadow-sm"
                    : "bg-[#edf4f1] text-[#617c74] hover:bg-[#e2ede8]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-[#dce9e4] bg-white px-2.5 py-2 text-[11px] text-[#52766b] outline-none"
            >
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Severities" : s}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#9ab0a9]" size={14} />
              <input
                type="text"
                placeholder="Search signal telemetry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] rounded-xl border border-[#dce9e4] bg-white pl-9 pr-3 py-2 text-[11px] text-[#163d34] outline-none placeholder:text-[#9ab0a9] focus:border-[#529b82]"
              />
            </div>
          </div>
        </div>

        {/* Signals List */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[12px] text-[#839792]">
            No signals match the selected filters.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((sig) => (
              <div
                key={sig.id}
                className={cn(
                  "rounded-2xl border p-4 transition",
                  sig.status === "open"
                    ? "border-[#dce9e4] bg-white shadow-sm hover:shadow-md"
                    : "border-[#e6efec] bg-[#f9fcfa] opacity-75"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1 flex h-8 w-8 items-center justify-center rounded-xl font-bold",
                        sig.severity === "Critical"
                          ? "bg-[#fee2e2] text-[#dc2626]"
                          : sig.severity === "High"
                          ? "bg-[#ffedd5] text-[#ea580c]"
                          : sig.severity === "Medium"
                          ? "bg-[#fef9c3] text-[#ca8a04]"
                          : "bg-[#e0f1e8] text-[#28775b]"
                      )}
                    >
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-bold text-[#163d34]">{sig.title}</h4>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                            sig.severity === "Critical"
                              ? "bg-[#fee2e2] text-[#dc2626]"
                              : sig.severity === "High"
                              ? "bg-[#ffedd5] text-[#ea580c]"
                              : "bg-[#e0f1e8] text-[#28775b]"
                          )}
                        >
                          {sig.severity}
                        </span>
                        <span className="rounded bg-[#edf4f1] px-1.5 py-0.5 text-[9px] font-semibold text-[#52766b]">
                          {sig.category}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-[#617c74] leading-relaxed">{sig.detail}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-[#879b95]">{sig.timestamp}</span>
                </div>

                {/* Recommended Action & Impact Box */}
                <div className="mt-3.5 rounded-xl border border-[#e2efe9] bg-[#f3f9f6] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#155f4b]">
                        <Zap size={13} className="text-[#31a77e]" /> AI Recommended Fix
                      </div>
                      <p className="mt-0.5 text-[12px] font-medium text-[#163d34]">
                        {sig.recommendedAction}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#6b8b80]">{sig.impact}</p>
                    </div>

                    {sig.status === "open" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dismissSignal(sig.id)}
                          className="rounded-xl border border-[#dce9e4] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1] transition"
                        >
                          Dismiss
                        </button>

                        <button
                          onClick={() => resolveSignal(sig.id)}
                          className="rounded-xl border border-[#c1e2d4] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1e6e57] hover:bg-[#e4f4ed] transition"
                        >
                          Mark Resolved
                        </button>

                        <button
                          onClick={() => executeSignalAction(sig.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-[#155f4b] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-[#0e503e] transition"
                        >
                          <Zap size={13} /> Auto-Execute
                        </button>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#258066]">
                        <CheckCircle2 size={14} /> Resolved in this session
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
