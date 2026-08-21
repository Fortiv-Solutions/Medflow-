import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  CalendarDays,
  FileText,
  ShieldCheck,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Plus,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Appointment, AppointmentStatus } from "../../types/medflow";
import { formatINRLakhs } from "../../lib/utils";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  detail,
  tone,
  down = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  detail: string;
  tone: string;
  down?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4 shadow-[0_8px_25px_rgba(21,76,62,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(21,76,62,0.1)]",
        onClick && "cursor-pointer"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", tone)}>
          <Icon size={16} />
        </span>
        <button
          className="rounded-lg p-1 text-[#9aaca7] hover:bg-[#edf4f1]"
          aria-label={`Options for ${label}`}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78918a]">{label}</p>
      <div className="mt-1 flex items-end gap-2">
        <strong className="text-[26px] font-semibold tracking-[-0.04em] text-[#163d34]">{value}</strong>
        <span
          className={cn(
            "mb-1 flex items-center text-[11px] font-semibold",
            down ? "text-[#b56b4e]" : "text-[#258066]"
          )}
        >
          {down ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          {delta}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-[#839792]">{detail}</p>
    </div>
  );
}

export function StatusPill({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    "Confirmed": "bg-[#e0f1e8] text-[#28775b]",
    "Checked-in": "bg-[#d0f0fd] text-[#0284c7]",
    "In Exam": "bg-[#ede9fe] text-[#7c3aed]",
    "Arriving": "bg-[#eeeacc] text-[#887a2b]",
    "No-show risk": "bg-[#f9eadc] text-[#b96e3a]",
    "Completed": "bg-[#dce9f3] text-[#42708a]",
    "Cancelled": "bg-[#f2e3e3] text-[#aa6262]",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tight", styles[status] || styles["Confirmed"])}>
      {status}
    </span>
  );
}

export const OverviewWorkspace: React.FC<{
  onOpenQuickAction: () => void;
  onSelectAppointment: (apt: Appointment) => void;
}> = ({ onOpenQuickAction, onSelectAppointment }) => {
  const {
    timeRange,
    setTimeRange,
    setSelectedModule,
    searchQuery,
    appointments,
    signals,
    activity,
    overviewMetrics,
    resolveSignal,
    executeSignalAction,
    exportAllData,
    notify,
  } = useMedFlow();

  const [appointmentFilter, setAppointmentFilter] = React.useState<"All" | AppointmentStatus>("All");

  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((apt) => {
      const matchSearch =
        `${apt.name} ${apt.visit} ${apt.provider} ${apt.location} ${apt.status}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchStatus = appointmentFilter === "All" || apt.status === appointmentFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, searchQuery, appointmentFilter]);

  const activeSignals = React.useMemo(() => {
    return signals.filter((s) => s.status === "open");
  }, [signals]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4 medflow-rise">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]">
            <span className="h-2 w-2 rounded-full bg-[#31a77e] animate-pulse" /> Live Hospital Grid
            <span className="font-normal normal-case tracking-normal text-[#9aaca7]">
              · Continuous Telemetry Active
            </span>
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">
            Today at a glance
          </h2>
          <p className="mt-1 text-[13px] text-[#78918a]">
            A unified, calm operational pulse across all care and administrative departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range switcher */}
          <div className="flex rounded-xl border border-[#d5e5df] bg-[#f8fcfa] p-1" role="group">
            {(["Today", "7 days", "30 days"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTimeRange(item)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition",
                  timeRange === item
                    ? "bg-[#155f4b] text-white shadow-sm"
                    : "text-[#779089] hover:text-[#155f4b]"
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={() => exportAllData("csv")}
            className="flex items-center gap-1.5 rounded-xl border border-[#dce9e4] bg-white px-3 py-2 text-[11px] font-semibold text-[#52766b] hover:bg-[#edf4f1]"
            title="Export summary CSV"
          >
            <Download size={13} /> Export
          </button>

          {/* Quick action button */}
          <button
            onClick={onOpenQuickAction}
            className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]"
          >
            <Plus size={15} /> Quick Action
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 medflow-rise medflow-delay-1">
        <MetricCard
          icon={Users}
          label="Patients in network"
          value={overviewMetrics.patientsCount.toString()}
          delta="+8.4%"
          detail={`${appointments.length} scheduled today`}
          tone="bg-[#dcefe7] text-[#20735b]"
          onClick={() => setSelectedModule("Front")}
        />
        <MetricCard
          icon={CalendarDays}
          label="Intake & Schedule"
          value={`${overviewMetrics.appointmentsCount}`}
          delta="+5.1%"
          detail={`${appointments.filter((a) => a.status === "Checked-in" || a.status === "In Exam").length} active in clinic`}
          tone="bg-[#e9e8d8] text-[#8b8240]"
          onClick={() => setSelectedModule("Front")}
        />
        <MetricCard
          icon={FileText}
          label="Clean Claim Rate"
          value={`${overviewMetrics.cleanClaimRate}%`}
          delta="+12.8%"
          detail={`${formatINRLakhs(overviewMetrics.totalPendingRevenue)} pending review`}
          tone="bg-[#e5e2f0] text-[#665b91]"
          onClick={() => setSelectedModule("Billing")}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Open AI Signals"
          value={overviewMetrics.openSignalsCount.toString()}
          delta="-2 resolved"
          detail={`${overviewMetrics.lowStockCount} inventory alerts`}
          tone="bg-[#f8e7dc] text-[#ad6747]"
          down={overviewMetrics.openSignalsCount > 0}
          onClick={() => setSelectedModule("Insight")}
        />
      </div>

      {/* Throughput chart & AI Briefing */}
      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr] medflow-rise medflow-delay-2">
        {/* Operational Pulse */}
        <section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-semibold">Operational Throughput Pulse</h3>
              <p className="mt-1 text-[11px] text-[#839792]">
                Patient intake and documentation throughput velocity across active hours
              </p>
            </div>
            <button
              onClick={() => notify("Operational pulse metrics recalculated from real-time queues.")}
              className="rounded-lg p-1.5 text-[#91a7a0] hover:bg-[#edf4f1]"
              title="Refresh telemetry"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="relative h-[190px]">
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[#a0b2ad] select-none">
              <span>180</span>
              <span>120</span>
              <span>60</span>
              <span>0</span>
            </div>
            <div className="ml-8 flex h-full items-end justify-between gap-3 border-b border-l border-[#dfeae6] pb-0 pl-4">
              {overviewMetrics.throughputBars.map((height, index) => (
                <div key={index} className="group relative flex h-full min-w-0 flex-1 items-end">
                  <div
                    style={{ height: `${height}%` }}
                    className={cn(
                      "w-full rounded-t-[5px] transition-all duration-300",
                      index === 7
                        ? "bg-[#16755a] shadow-[0_0_12px_rgba(22,117,90,0.3)]"
                        : "bg-[#b9ddd0] group-hover:bg-[#62b79a]"
                    )}
                  />
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 transition group-hover:opacity-100 bg-[#163d34] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                    {Math.round(height * 1.8)} pts
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-[#a0b2ad]">
                    {["8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 text-[10px] text-[#829891]">
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#16755a]" /> Current Interval
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <i className="h-2 w-2 rounded-full bg-[#b9ddd0]" /> Baseline Comparison
            </span>
            <span className="ml-auto font-semibold text-[#23785f]">
              +14.6% throughput efficiency <ArrowUpRight className="inline" size={12} />
            </span>
          </div>
        </section>

        {/* AI Insight Briefing */}
        <section className="rounded-2xl border border-[#dce9e4] bg-[#155f4b] p-5 text-[#e5f4ee] shadow-[0_8px_25px_rgba(21,76,62,0.12)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#337d68]">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-[15px] font-semibold">AI Operational Sentinel</h3>
                <p className="mt-1 text-[11px] text-[#acd0c1]">
                  High-priority signals requiring operator decision.
                </p>
              </div>
              <span className="rounded-full bg-[#2a735f] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#bce0d2]">
                Active Bot Guard
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {activeSignals.slice(0, 2).map((signal) => (
                <div
                  key={signal.id}
                  className="rounded-xl border border-[#3a806b] bg-[#1b6a55] p-3 text-left transition hover:border-[#62b79a]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold text-white">{signal.title}</p>
                    <span className="shrink-0 rounded bg-[#2c7762] px-1.5 py-0.5 text-[9px] font-bold text-[#fed7aa]">
                      {signal.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#b8d9cd]">{signal.detail}</p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-[#297762] pt-2">
                    <span className="text-[9px] text-[#93c7b3]">{signal.category} module</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => resolveSignal(signal.id)}
                        className="rounded bg-[#2a7863] px-2 py-0.5 text-[9px] font-semibold text-[#e6f7f0] hover:bg-[#348e75]"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => executeSignalAction(signal.id)}
                        className="rounded bg-[#38a183] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm hover:bg-[#42be9b]"
                      >
                        Auto-Fix
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {activeSignals.length === 0 && (
                <div className="rounded-xl border border-[#3a806b] bg-[#1b6a55] p-5 text-center text-[11px] text-[#b8d9cd]">
                  <CheckCircle2 className="mx-auto mb-2 text-[#68d391]" size={22} />
                  All operational queues are optimal. No open signals.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setSelectedModule("Insight")}
            className="mt-4 flex items-center justify-between rounded-xl bg-[#1b6a55]/60 px-3 py-2 text-[11px] font-semibold text-[#c3e6d8] hover:bg-[#1b6a55] hover:text-white transition"
          >
            <span>Review all {signals.length} telemetry signals</span>
            <ArrowUpRight size={13} />
          </button>
        </section>
      </div>

      {/* Appointments Queue & Activity Stream */}
      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr] medflow-rise medflow-delay-3">
        {/* Appointments Queue */}
        <section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold">Front Desk & Intake Queue</h3>
              <p className="mt-1 text-[11px] text-[#839792]">
                {filteredAppointments.length} scheduled visits · Real-time status sync
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#617c74]">
                <Filter size={12} />
                <select
                  value={appointmentFilter}
                  onChange={(e) => setAppointmentFilter(e.target.value as any)}
                  className="rounded-lg border border-[#dce9e4] bg-white px-2 py-1 text-[11px] text-[#617c74] outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="In Exam">In Exam</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Arriving">Arriving</option>
                  <option value="No-show risk">No-show risk</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedModule("Front")}
                className="text-[11px] font-semibold text-[#23785f] hover:underline flex items-center gap-1"
              >
                Full queue <ArrowUpRight size={12} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredAppointments.length === 0 ? (
              <div className="py-10 text-center text-[12px] text-[#839792]">
                No appointments match the current filter.
              </div>
            ) : (
              <table className="w-full min-w-[530px] text-left">
                <thead className="border-y border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]">
                  <tr>
                    <th className="py-2.5 font-semibold">Patient</th>
                    <th className="py-2.5 font-semibold">Visit Details</th>
                    <th className="py-2.5 font-semibold">Provider / Room</th>
                    <th className="py-2.5 font-semibold">Time</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      onClick={() => onSelectAppointment(apt)}
                      className="group cursor-pointer border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6] transition"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8ebe3] text-[9px] font-bold text-[#27735e]">
                            {apt.initials}
                          </span>
                          <div>
                            <span className="text-[12px] font-semibold block text-[#163d34] group-hover:text-[#0e634d]">
                              {apt.name}
                            </span>
                            <span className="text-[10px] text-[#8a9f99]">{apt.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-[11px] text-[#718a83]">{apt.visit}</td>
                      <td className="text-[11px] text-[#55766c]">
                        <span className="font-semibold">{apt.provider}</span>
                        <span className="block text-[10px] text-[#8a9f99]">{apt.location}</span>
                      </td>
                      <td className="text-[11px] font-semibold text-[#365b50]">{apt.time}</td>
                      <td>
                        <StatusPill status={apt.status} />
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment(apt);
                          }}
                          className="rounded-lg p-1.5 text-[#9aaca7] hover:bg-[#e3eee9] hover:text-[#163d34]"
                          aria-label={`Open details for ${apt.name}`}
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Real-time Activity Feed */}
        <section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)] flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold">Live Audit & Activity Stream</h3>
                <p className="mt-1 text-[11px] text-[#839792]">Automations, bot triggers, and staff actions</p>
              </div>
              <button
                onClick={() => setSelectedModule("Compliance")}
                className="rounded-lg p-1 text-[#92a8a0] hover:text-[#155f4b]"
                title="View compliance audit log"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="space-y-0">
              {activity.slice(0, 6).map((item) => (
                <div key={item.id} className="flex gap-3 border-b border-[#edf3f0] py-3 last:border-0">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      item.tone === "amber"
                        ? "bg-[#e1a24b]"
                        : item.tone === "rose"
                        ? "bg-[#cf7d75]"
                        : item.tone === "blue"
                        ? "bg-[#78a8b2]"
                        : "bg-[#46a782]"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-[#163d34] leading-snug">{item.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-[#879b95]">
                      <span>{item.actor}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelectedModule("Compliance")}
            className="mt-4 text-center rounded-xl bg-[#f0f7f4] py-2 text-[11px] font-semibold text-[#155f4b] hover:bg-[#e2f1eb] transition"
          >
            View Complete Audit Trail
          </button>
        </section>
      </div>
    </div>
  );
};
