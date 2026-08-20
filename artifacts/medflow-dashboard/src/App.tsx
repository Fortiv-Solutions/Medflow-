import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PackageSearch,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";

type Module = "Overview" | "Front" | "Billing" | "Pharmacy" | "Clinical" | "Compliance" | "Insight";
type AppointmentStatus = "Confirmed" | "Arriving" | "No-show risk" | "Completed" | "Cancelled";
type Appointment = { id: string; name: string; visit: string; time: string; status: AppointmentStatus; initials: string; location: string };
type Signal = { id: string; title: string; detail: string; tone: "amber" | "green" | "blue" | "rose"; icon: LucideIcon; status: "open" | "resolved" | "dismissed" };
type QuickAction = "New appointment" | "Review claims" | "Log inventory" | "Run consent audit";

const queryClient = new QueryClient();

const nav: { label: Module; note?: string; icon: LucideIcon; badge?: string }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Front", note: "Scheduling & intake", icon: CalendarDays },
  { label: "Billing", note: "Claims operations", icon: FileText, badge: "3" },
  { label: "Pharmacy", note: "Inventory control", icon: PackageSearch, badge: "7" },
  { label: "Clinical", note: "Documentation", icon: Stethoscope },
  { label: "Compliance", note: "Consent & audit", icon: ShieldCheck },
  { label: "Insight", note: "Anomaly signals", icon: Activity, badge: "2" },
];

const initialAppointments: Appointment[] = [
  { id: "apt-01", name: "Elena Martinez", visit: "Follow-up · Cardiology", time: "09:20", status: "Confirmed", initials: "EM", location: "Northstar · Suite 4B" },
  { id: "apt-02", name: "Marcus Chen", visit: "New patient · Primary care", time: "10:00", status: "Arriving", initials: "MC", location: "Northstar · Suite 2A" },
  { id: "apt-03", name: "Priya Nair", visit: "Medication review", time: "10:40", status: "Confirmed", initials: "PN", location: "Northstar · Suite 3C" },
  { id: "apt-04", name: "Jonas Williams", visit: "Annual physical", time: "11:20", status: "No-show risk", initials: "JW", location: "Northstar · Suite 1A" },
];

const activity = [
  ["Claim CLM-2841 flagged for review", "Billing bot · 2 min ago", "amber"],
  ["Consent form completed · Elena M.", "Front desk · 14 min ago", "green"],
  ["Reorder request generated · Amoxicillin", "Pharmacy bot · 28 min ago", "blue"],
  ["Referral has no visit after 14 days", "Insight bot · 41 min ago", "rose"],
];

const initialSignals: Signal[] = [
  { id: "sig-01", title: "4 appointments may become no-shows", detail: "Reminder automation is queued for the 11:20–13:00 window.", tone: "amber", icon: AlertCircle, status: "open" },
  { id: "sig-02", title: "Amoxicillin reorder is ready", detail: "Stock reaches threshold in approximately 3 days.", tone: "green", icon: PackageSearch, status: "open" },
  { id: "sig-03", title: "Referral has no visit after 14 days", detail: "Three cardiology referrals are waiting for a first appointment.", tone: "rose", icon: Clock3, status: "open" },
  { id: "sig-04", title: "Claim CLM-2841 needs a second look", detail: "Payer response differs from the expected contract rate.", tone: "blue", icon: FileText, status: "open" },
];

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

function Metric({ icon: Icon, label, value, delta, detail, tone, down = false }: { icon: LucideIcon; label: string; value: string; delta: string; detail: string; tone: string; down?: boolean }) {
  return (
    <div className="group rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4 shadow-[0_8px_25px_rgba(21,76,62,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(21,76,62,0.1)]">
      <div className="mb-4 flex items-center justify-between">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", tone)}><Icon size={16} /></span>
        <button className="rounded-lg p-1 text-[#9aaca7] hover:bg-[#edf4f1]" aria-label={`More options for ${label}`} data-testid={`button-more-${label.toLowerCase().replaceAll(" ", "-")}`}><MoreHorizontal size={16} /></button>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78918a]">{label}</p>
      <div className="mt-1 flex items-end gap-2"><strong className="text-[26px] font-semibold tracking-[-0.04em] text-[#163d34]">{value}</strong><span className={cn("mb-1 flex items-center text-[11px] font-semibold", down ? "text-[#b56b4e]" : "text-[#258066]")}>{down ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}{delta}</span></div>
      <p className="mt-1 text-[11px] text-[#839792]">{detail}</p>
    </div>
  );
}

function StatusPill({ status }: { status: AppointmentStatus }) {
  return <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold", status === "No-show risk" ? "bg-[#f9eadc] text-[#b96e3a]" : status === "Arriving" ? "bg-[#eeeacc] text-[#887a2b]" : status === "Completed" ? "bg-[#dce9f3] text-[#42708a]" : status === "Cancelled" ? "bg-[#f2e3e3] text-[#aa6262]" : "bg-[#e0f1e8] text-[#28775b]")}>{status}</span>;
}

function Modal({ title, description, onClose, children, labelledBy }: { title: string; description?: string; onClose: () => void; children: ReactNode; labelledBy: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#123b3140] p-4 sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="presentation">
      <div className="w-full max-w-md rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-5 shadow-2xl medflow-rise" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <div className="flex items-start justify-between gap-4">
          <div><h2 id={labelledBy} className="text-[16px] font-semibold">{title}</h2>{description && <p className="mt-1 text-[11px] text-[#829891]">{description}</p>}</div>
          <button ref={closeRef} onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]" aria-label="Close dialog" data-testid="button-close-dialog"><X size={17} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppShell() {
  const [selected, setSelected] = useState<Module>("Overview");
  const [range, setRange] = useState("Today");
  const [mobileNav, setMobileNav] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
  const [quickValue, setQuickValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(["Claim CLM-2841 was flagged for review", "Consent form completed for Elena Martinez", "Amoxicillin reorder request is ready"]);
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [appointmentFilter, setAppointmentFilter] = useState<"All" | AppointmentStatus>("All");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [signals, setSignals] = useState(initialSignals);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  };

  const openQuick = (action?: QuickAction) => { setQuickAction(action ?? null); setQuickValue(""); setQuickOpen(true); };
  const closeQuick = () => { if (!processing) { setQuickOpen(false); setQuickAction(null); } };
  const completeQuick = (event: FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setQuickOpen(false);
      setQuickAction(null);
      notify(`${quickAction ?? "Workflow"} completed in this demo`);
    }, 650);
  };
  const changeModule = (module: Module) => { setSelected(module); setMobileNav(false); setSearch(""); };
  const activeSignals = signals.filter((signal) => signal.status === "open");
  const visibleAppointments = useMemo(() => appointments.filter((appointment) => {
    const haystack = `${appointment.name} ${appointment.visit} ${appointment.time} ${appointment.status}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (appointmentFilter === "All" || appointment.status === appointmentFilter);
  }), [appointments, appointmentFilter, search]);
  const subtitle = selected === "Overview" ? "Wednesday, 18 September 2024 · Northstar Health Network" : `${selected} workspace · synthetic operating view`;
  const rangeData = range === "7 days" ? { patients: "986", appointments: "214", claims: "$579.2k", signals: "18", detail: "vs 914 last period", bars: [60, 72, 64, 81, 67, 73, 86, 72, 78, 69, 92, 80] } : range === "30 days" ? { patients: "4,182", appointments: "932", claims: "$2.41m", signals: "26", detail: "vs 3,874 last period", bars: [72, 82, 77, 89, 70, 78, 91, 84, 88, 80, 94, 86] } : { patients: "148", appointments: "32", claims: "$84.7k", signals: "12", detail: "vs 136 last Wednesday", bars: [76, 62, 83, 55, 72, 47, 68, 88, 59, 76, 91, 67] };

  return (
    <div className="min-h-[100dvh] bg-[#edf4f1] font-sans text-[#163d34]">
      <div className="flex min-h-[100dvh]">
        <aside className={cn(mobileNav ? "fixed inset-y-0 left-0 z-40 flex" : "hidden", "w-[252px] shrink-0 flex-col border-r border-[#d7e7e1] bg-[#f7fbf9] px-4 py-5 lg:flex")}>
          <div className="flex items-center gap-3 px-3 pb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#0d604d] text-[#d7f2e7]"><Activity size={19} strokeWidth={2.5} /></div>
            <div><div className="text-[19px] font-semibold tracking-[-0.04em] text-[#144c3d]">med<span className="text-[#7a9d90]">flow</span></div><div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9ab0a9]">operations suite</div></div>
          </div>
          <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aaca7]">Workspace</div>
          <nav className="space-y-1" aria-label="MedFlow modules">
            {nav.map(({ label, note, icon: Icon, badge }) => <button key={label} onClick={() => changeModule(label)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition", selected === label ? "bg-[#dbeee7] text-[#0e634d] shadow-sm" : "text-[#617c74] hover:bg-[#eaf4f0]")} aria-current={selected === label ? "page" : undefined} data-testid={`nav-${label.toLowerCase()}`}><Icon size={17} strokeWidth={selected === label ? 2.2 : 1.8} /><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{label}</span>{note && <span className="block truncate text-[10px] opacity-70">{note}</span>}</span>{badge && <span className="rounded-full bg-[#f7e4c5] px-1.5 py-0.5 text-[10px] font-bold text-[#98651b]">{badge}</span>}</button>)}
          </nav>
          <div className="mt-auto border-t border-[#dce9e4] pt-4">
            <button onClick={() => notify("Settings preview is ready for review")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#708a82] hover:bg-[#eaf4f0]" data-testid="button-settings"><Settings2 size={17} /><span className="text-[13px] font-semibold">Settings</span></button>
            <button onClick={() => notify("Avery Thomas · Operations lead")} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-[#e8f2ee] p-3 text-left" data-testid="button-profile"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c1ddd2] text-[11px] font-bold text-[#175b49]">AT</div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold">Avery Thomas</p><p className="text-[10px] text-[#7c978e]">Operations lead</p></div><ChevronDown size={14} className="text-[#82a098]" /></button>
          </div>
        </aside>
        {mobileNav && <button className="fixed inset-0 z-30 bg-[#123b3130] lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close mobile navigation" data-testid="button-close-mobile-nav" />}

        <main className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-[#dce9e4] bg-[#f7fbf9]/90 px-5 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3"><button className="rounded-xl p-2 hover:bg-[#e8f2ee] lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open navigation" data-testid="button-open-mobile-nav"><Menu size={20} /></button><div><h1 className="text-[18px] font-semibold tracking-[-0.03em]">{selected === "Overview" ? "Good morning, Avery" : selected}</h1><p className="mt-0.5 text-[11px] text-[#78918a]">{subtitle}</p></div></div>
            <div className="flex items-center gap-2">
              <label className="hidden items-center gap-2 rounded-xl border border-[#dce9e4] bg-white px-3 py-2 text-[11px] text-[#779089] md:flex"><Search size={14} /><span className="sr-only">Search visible records</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-[125px] bg-transparent outline-none placeholder:text-[#779089]" placeholder="Search records..." aria-label="Search visible records" data-testid="input-search-records" /><kbd className="ml-1 rounded bg-[#edf4f1] px-1.5 py-0.5 text-[9px]">⌘ K</kbd></label>
              <button onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-xl p-2.5 text-[#6a8880] hover:bg-[#e5f1ec]" aria-label="Open notifications" aria-expanded={notificationsOpen} data-testid="button-notifications"><Bell size={18} />{notifications.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e39d4b]" />}</button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#c6ded5] text-[11px] font-bold text-[#175b49] shadow-sm" aria-label="Signed in as Avery Thomas">AT</div>
              {notificationsOpen && <div className="absolute right-5 top-[62px] z-40 w-[300px] rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-4 shadow-xl medflow-rise lg:right-8"><div className="flex items-center justify-between"><h2 className="text-[13px] font-semibold">Notifications</h2><button onClick={() => { setNotifications([]); notify("Notifications marked as read"); }} className="text-[10px] font-semibold text-[#23785f] hover:underline" data-testid="button-mark-notifications-read">Mark all read</button></div>{notifications.length === 0 ? <div className="py-7 text-center text-[11px] text-[#839792]"><CheckCircle2 className="mx-auto mb-2 text-[#46a782]" size={22} />You are all caught up.</div> : <div className="mt-3 space-y-3">{notifications.map((item, index) => <div key={item} className="flex gap-2 border-b border-[#edf3f0] pb-3 last:border-0 last:pb-0"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#e1a24b]" /><p className="text-[11px] leading-relaxed">{item}<span className="mt-1 block text-[9px] text-[#879b95]">{index + 2} min ago</span></p></div>)}</div>}</div>}
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8">
            {selected === "Overview" ? <Overview range={range} setRange={setRange} openQuick={openQuick} rangeData={rangeData} activeSignals={activeSignals} setSelected={changeModule} appointments={appointments} visibleAppointments={visibleAppointments} appointmentFilter={appointmentFilter} setAppointmentFilter={setAppointmentFilter} search={search} setSelectedAppointment={setSelectedAppointment} notify={notify} /> : <ModuleWorkspace module={selected} search={search} setSearch={setSearch} appointments={appointments} setSelectedAppointment={setSelectedAppointment} signals={signals} setSignals={setSignals} notify={notify} openQuick={openQuick} />}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-[#c8ddd4] bg-[#f5faf7] px-4 py-3 text-[10px] text-[#79928a]"><span><strong className="text-[#52766b]">Demo environment</strong> · All records are synthetic and for interface demonstration only. Not for production clinical use.</span><span className="hidden items-center gap-1.5 font-semibold text-[#4f8271] sm:flex"><Check size={13} /> Last audit check 08:42</span></div>
          </div>
        </main>
      </div>

      {quickOpen && <Modal title={quickAction ?? "Quick action"} description={quickAction ? "Complete this workflow with synthetic data." : "Choose a workflow to start in this demo."} onClose={closeQuick} labelledBy="quick-action-title">
        {!quickAction ? <div className="mt-4 grid grid-cols-2 gap-2">{(["New appointment", "Review claims", "Log inventory", "Run consent audit"] as QuickAction[]).map((action) => { const Icon = action === "New appointment" ? CalendarDays : action === "Review claims" ? FileText : action === "Log inventory" ? FlaskConical : ClipboardCheck; return <button key={action} onClick={() => setQuickAction(action)} className="flex items-center gap-2 rounded-xl border border-[#dce9e4] p-3 text-left text-[11px] font-semibold hover:border-[#8fc1ae] hover:bg-[#eef8f3]" data-testid={`quick-action-${action.toLowerCase().replaceAll(" ", "-")}`}><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e0f0e9] text-[#28775d]"><Icon size={15} /></span>{action}</button>; })}</div> : <form onSubmit={completeQuick} className="mt-4 space-y-3">{quickAction === "New appointment" ? <><label className="block text-[11px] font-semibold text-[#52766b]" htmlFor="quick-patient">Patient name<input id="quick-patient" required value={quickValue} onChange={(event) => setQuickValue(event.target.value)} className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#6da98f]" placeholder="e.g. Taylor Morgan" data-testid="input-quick-patient" /></label><label className="block text-[11px] font-semibold text-[#52766b]" htmlFor="quick-time">Preferred time<select id="quick-time" className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white px-3 py-2.5 text-[12px]" data-testid="select-quick-time"><option>12:00</option><option>13:20</option><option>14:00</option></select></label></> : <><label className="block text-[11px] font-semibold text-[#52766b]" htmlFor="quick-note">Operator note<textarea id="quick-note" required value={quickValue} onChange={(event) => setQuickValue(event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-xl border border-[#dce9e4] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#6da98f]" placeholder="Add a short note for the team..." data-testid="input-quick-note" /></label></>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setQuickAction(null)} className="rounded-xl px-3 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]" disabled={processing} data-testid="button-back-quick-action">Back</button><button type="submit" className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e] disabled:opacity-60" disabled={processing} data-testid="button-complete-quick-action">{processing ? "Saving..." : "Complete workflow"}</button></div></form>}
      </Modal>}
      {selectedAppointment && <AppointmentModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onSave={(status) => { setAppointments((items) => items.map((item) => item.id === selectedAppointment.id ? { ...item, status } : item)); setSelectedAppointment(null); notify(`${selectedAppointment.name}'s status updated to ${status}`); }} />}
      {notice && <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#173f35] px-4 py-3 text-[12px] font-semibold text-white shadow-xl" role="status" data-testid="status-toast"><Check size={15} className="text-[#8ed4b8]" />{notice}</div>}
    </div>
  );
}

function Overview({ range, setRange, openQuick, rangeData, activeSignals, setSelected, appointments, visibleAppointments, appointmentFilter, setAppointmentFilter, search, setSelectedAppointment, notify }: { range: string; setRange: (value: string) => void; openQuick: (action?: QuickAction) => void; rangeData: { patients: string; appointments: string; claims: string; signals: string; detail: string; bars: number[] }; activeSignals: Signal[]; setSelected: (module: Module) => void; appointments: Appointment[]; visibleAppointments: Appointment[]; appointmentFilter: "All" | AppointmentStatus; setAppointmentFilter: (value: "All" | AppointmentStatus) => void; search: string; setSelectedAppointment: (appointment: Appointment) => void; notify: (message: string) => void }) {
  return <><div className="mb-6 flex flex-wrap items-end justify-between gap-4 medflow-rise"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]"><span className="h-2 w-2 rounded-full bg-[#31a77e]" /> Live workspace <span className="font-normal normal-case tracking-normal text-[#9aaca7]">· Synced 2 min ago</span></div><h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">Today at a glance</h2><p className="mt-1 text-[13px] text-[#78918a]">A clear pulse on the work that keeps care moving.</p></div><div className="flex items-center gap-2"><div className="flex rounded-xl border border-[#d5e5df] bg-[#f8fcfa] p-1" role="group" aria-label="Time range">{["Today", "7 days", "30 days"].map((item) => <button key={item} onClick={() => setRange(item)} className={cn("rounded-lg px-3 py-1.5 text-[11px] font-semibold", range === item ? "bg-[#155f4b] text-white shadow-sm" : "text-[#779089] hover:text-[#155f4b]")} aria-pressed={range === item} data-testid={`button-range-${item.replace(" ", "-")}`}>{item}</button>)}</div><button onClick={() => openQuick()} className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-3.5 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]" data-testid="button-quick-action"><Plus size={15} /> Quick action</button></div></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 medflow-rise medflow-delay-1"><Metric icon={Users} label="Patients today" value={rangeData.patients} delta="+8.4%" detail={rangeData.detail} tone="bg-[#dcefe7] text-[#20735b]" /><Metric icon={CalendarDays} label="Appointments" value={rangeData.appointments} delta="+5.1%" detail="4 slots still available" tone="bg-[#e9e8d8] text-[#8b8240]" /><Metric icon={FileText} label="Claims at a glance" value={rangeData.claims} delta="+12.8%" detail="96.2% clean submission rate" tone="bg-[#e5e2f0] text-[#665b91]" /><Metric icon={ShieldCheck} label="Open signals" value={rangeData.signals} delta="-3 today" detail={`${activeSignals.length} need attention now`} tone="bg-[#f8e7dc] text-[#ad6747]" down /></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr] medflow-rise medflow-delay-2"><section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-[15px] font-semibold">Operational pulse</h3><p className="mt-1 text-[11px] text-[#839792]">Throughput across your connected workflows</p></div><button onClick={() => notify("Pulse details exported to your downloads")} className="rounded-lg p-1.5 text-[#91a7a0] hover:bg-[#edf4f1]" aria-label="Export pulse details" data-testid="button-export-pulse"><MoreHorizontal size={18} /></button></div><div className="relative h-[190px]"><div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[#a0b2ad]"><span>180</span><span>120</span><span>60</span><span>0</span></div><div className="ml-8 flex h-full items-end justify-between gap-3 border-b border-l border-[#dfeae6] pb-0 pl-4">{rangeData.bars.map((height, index) => <div key={index} className="group relative flex h-full min-w-0 flex-1 items-end"><div style={{ height: `${height}%`, backgroundColor: index === 7 ? "#16755a" : "#b9ddd0" }} className="w-full rounded-t-[5px] transition-all duration-300 group-hover:bg-[#62b79a]" /><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-[#a0b2ad]">{["8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p"][index]}</span></div>)}</div></div><div className="mt-8 flex items-center gap-5 text-[10px] text-[#829891]"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#16755a]" /> Today</span><span className="hidden items-center gap-1.5 sm:flex"><i className="h-2 w-2 rounded-full bg-[#b9ddd0]" /> Previous Wednesday</span><span className="ml-auto font-semibold text-[#23785f]">+14.6% throughput <ArrowUpRight className="inline" size={12} /></span></div></section><InsightBriefing activeSignals={activeSignals} setSelected={setSelected} /></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr] medflow-rise medflow-delay-3"><section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-[15px] font-semibold">Next appointments</h3><p className="mt-1 text-[11px] text-[#839792]">Front desk queue · {range.toLowerCase()}{search && <span> · matches “{search}”</span>}</p></div><div className="flex items-center gap-3"><label className="sr-only" htmlFor="appointment-filter">Filter appointments</label><select id="appointment-filter" value={appointmentFilter} onChange={(event) => setAppointmentFilter(event.target.value as "All" | AppointmentStatus)} className="rounded-lg border border-[#dce9e4] bg-white px-2 py-1.5 text-[10px] text-[#617c74]" data-testid="select-appointment-filter"><option>All</option><option>Confirmed</option><option>Arriving</option><option>No-show risk</option><option>Completed</option><option>Cancelled</option></select><button onClick={() => setSelected("Front")} className="text-[11px] font-semibold text-[#23785f] hover:underline" data-testid="link-view-schedule">View schedule <ArrowUpRight className="inline" size={12} /></button></div></div><div className="overflow-x-auto">{visibleAppointments.length === 0 ? <EmptyState label="No appointments match those filters." onReset={() => { setAppointmentFilter("All"); }} /> : <table className="w-full min-w-[530px] text-left"><thead className="border-y border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]"><tr><th className="py-2 font-semibold">Patient</th><th className="py-2 font-semibold">Visit</th><th className="py-2 font-semibold">Time</th><th className="py-2 font-semibold">Status</th><th /></tr></thead><tbody>{visibleAppointments.map((appointment) => <tr key={appointment.id} className="border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6]" data-testid={`row-appointment-${appointment.id}`}><td className="py-3"><div className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8ebe3] text-[9px] font-bold text-[#27735e]">{appointment.initials}</span><span className="text-[12px] font-semibold">{appointment.name}</span></div></td><td className="text-[11px] text-[#718a83]">{appointment.visit}</td><td className="text-[11px] font-semibold text-[#365b50]">{appointment.time}</td><td><StatusPill status={appointment.status} /></td><td><button onClick={() => setSelectedAppointment(appointment)} className="rounded-lg p-1 text-[#9aaca7] hover:bg-[#e3eee9]" aria-label={`Open details for ${appointment.name}`} data-testid={`button-appointment-details-${appointment.id}`}><MoreHorizontal size={15} /></button></td></tr>)}</tbody></table>}</div></section><section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-[15px] font-semibold">Workflow activity</h3><p className="mt-1 text-[11px] text-[#839792]">Automations and team actions</p></div><button onClick={() => setSelected("Compliance")} className="rounded-lg p-1 text-[#92a8a0] hover:text-[#155f4b]" aria-label="Open compliance activity" data-testid="button-workflow-activity"><MoreHorizontal size={18} /></button></div><div className="space-y-0">{activity.map(([title, by, color]) => <div key={title} className="flex gap-3 border-b border-[#edf3f0] py-3 last:border-0"><span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", color === "amber" ? "bg-[#e1a24b]" : color === "rose" ? "bg-[#cf7d75]" : color === "blue" ? "bg-[#78a8b2]" : "bg-[#46a782]")} /><div className="min-w-0"><p className="truncate text-[11px] font-semibold">{title}</p><p className="mt-1 text-[10px] text-[#879b95]">{by}</p></div></div>)}</div></section></div></>;
}

function InsightBriefing({ activeSignals, setSelected }: { activeSignals: Signal[]; setSelected: (module: Module) => void }) {
  return <section className="rounded-2xl border border-[#dce9e4] bg-[#155f4b] p-5 text-[#e5f4ee] shadow-[0_8px_25px_rgba(21,76,62,0.12)]"><div className="flex items-start justify-between"><div><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#337d68]"><Sparkles size={16} /></div><h3 className="text-[15px] font-semibold">Insight briefing</h3><p className="mt-1 text-[11px] text-[#acd0c1]">The signals worth your attention.</p></div><span className="rounded-full bg-[#2a735f] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#bce0d2]">AI assisted</span></div><div className="mt-5 space-y-3">{activeSignals.slice(0, 2).map((signal) => { const Icon = signal.icon; return <div key={signal.id} className="rounded-xl border border-[#3a806b] bg-[#1b6a55] p-3"><div className="flex gap-3"><Icon size={16} className="mt-0.5 shrink-0 text-[#f0c878]" /><div><p className="text-[12px] font-semibold">{signal.title}</p><p className="mt-1 text-[10px] leading-relaxed text-[#b8d9cd]">{signal.detail}</p></div></div></div>; })}{activeSignals.length === 0 && <div className="rounded-xl border border-[#3a806b] bg-[#1b6a55] p-4 text-[11px] text-[#b8d9cd]">No open signals. Your operating picture is clear.</div>}</div><button onClick={() => setSelected("Insight")} className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#c3e6d8] hover:text-white" data-testid="button-review-signals">Review all signals <ArrowUpRight size={13} /></button></section>;
}

function EmptyState({ label, onReset }: { label: string; onReset: () => void }) {
  return <div className="flex min-h-[170px] flex-col items-center justify-center text-center"><Search size={22} className="mb-2 text-[#9ab0a9]" /><p className="text-[12px] font-semibold text-[#52766b]">{label}</p><button onClick={onReset} className="mt-2 text-[11px] font-semibold text-[#23785f] hover:underline" data-testid="button-reset-filter">Reset filters</button></div>;
}

function ModuleWorkspace({ module, search, setSearch, appointments, setSelectedAppointment, signals, setSignals, notify, openQuick }: { module: Module; search: string; setSearch: (value: string) => void; appointments: Appointment[]; setSelectedAppointment: (appointment: Appointment) => void; signals: Signal[]; setSignals: Dispatch<SetStateAction<Signal[]>>; notify: (message: string) => void; openQuick: (action?: QuickAction) => void }) {
  const moduleInfo: Record<Exclude<Module, "Overview">, { title: string; description: string; icon: LucideIcon; accent: string; action: QuickAction }> = {
    Front: { title: "Front desk queue", description: "Scheduling, arrivals, and intake in one view.", icon: CalendarDays, accent: "Appointments moving through today", action: "New appointment" },
    Billing: { title: "Claims operations", description: "A clean handoff from documentation to payer.", icon: FileText, accent: "Claims requiring an operator check", action: "Review claims" },
    Pharmacy: { title: "Inventory control", description: "Stock levels and reorder timing across the network.", icon: PackageSearch, accent: "Items near their reorder threshold", action: "Log inventory" },
    Clinical: { title: "Clinical documentation", description: "Documentation completeness without slowing care.", icon: Stethoscope, accent: "Notes ready for final review", action: "Run consent audit" },
    Compliance: { title: "Consent & audit", description: "A calm record of what has been checked and what needs attention.", icon: ShieldCheck, accent: "Open checks in your audit queue", action: "Run consent audit" },
    Insight: { title: "Anomaly signals", description: "Signals prioritized for the operations team, not buried in a report.", icon: Activity, accent: "Open signals needing attention", action: "Review claims" },
  };
  const info = moduleInfo[module as Exclude<Module, "Overview">];
  const Icon = info.icon;
  const activeSignals = signals.filter((signal) => signal.status === "open");
  const records = module === "Insight" ? activeSignals.map((signal) => ({ id: signal.id, title: signal.title, detail: signal.detail, meta: signal.tone })) : module === "Front" ? appointments.map((appointment) => ({ id: appointment.id, title: appointment.name, detail: appointment.visit, meta: appointment.status })) : [
    { id: "row-1", title: module === "Billing" ? "CLM-2841 · Northstar payer" : module === "Pharmacy" ? "Amoxicillin 500mg" : module === "Clinical" ? "Discharge summaries · 8" : "Consent review · Elena Martinez", detail: info.description, meta: "Needs review" },
    { id: "row-2", title: module === "Billing" ? "CLM-2818 · Horizon payer" : module === "Pharmacy" ? "Metformin 850mg" : module === "Clinical" ? "Progress notes · 24" : "Quarterly access audit", detail: "Updated by workflow automation", meta: "In progress" },
    { id: "row-3", title: module === "Billing" ? "CLM-2794 · Northstar payer" : module === "Pharmacy" ? "Ceftriaxone 1g" : module === "Clinical" ? "Referral summaries · 12" : "Role permissions check", detail: "Last reviewed 41 minutes ago", meta: "Complete" },
  ];
  const visible = records.filter((record) => `${record.title} ${record.detail} ${record.meta}`.toLowerCase().includes(search.toLowerCase()));
  const resolveSignal = (id: string, status: "resolved" | "dismissed") => { setSignals((items) => items.map((item) => item.id === id ? { ...item, status } : item)); notify(status === "resolved" ? "Signal resolved and added to audit history" : "Signal dismissed from the active queue"); };
  return <div className="medflow-rise"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dcefe7] text-[#20735b]"><Icon size={14} /></span> Workspace</div><h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">{info.title}</h2><p className="mt-1 text-[13px] text-[#78918a]">{info.description}</p></div><button onClick={() => openQuick(info.action)} className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-3.5 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] hover:bg-[#0e503e]" data-testid={`button-module-action-${module.toLowerCase()}`}><Plus size={15} /> {info.action}</button></div><div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]"><section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-[15px] font-semibold">{info.accent}</h3><p className="mt-1 text-[11px] text-[#839792]">{visible.length} visible records · synthetic view</p></div><label className="flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white px-3 py-2 text-[11px] text-[#779089]"><Search size={14} /><span className="sr-only">Filter {module} records</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-[145px] bg-transparent outline-none placeholder:text-[#779089]" placeholder={`Filter ${module.toLowerCase()}...`} aria-label={`Filter ${module} records`} data-testid={`input-filter-${module.toLowerCase()}`} /></label></div>{visible.length === 0 ? <EmptyState label="No records match this search." onReset={() => setSearch("")} /> : <div className="space-y-1">{visible.map((record) => <div key={record.id} className="flex flex-wrap items-center gap-3 rounded-xl border-b border-[#edf3f0] px-2 py-3 last:border-0 hover:bg-[#f3f9f6]" data-testid={`row-${module.toLowerCase()}-${record.id}`}>{module === "Front" ? <button onClick={() => setSelectedAppointment(appointments.find((item) => item.id === record.id) ?? appointments[0])} className="flex min-w-0 flex-1 items-center gap-3 text-left" data-testid={`button-open-${record.id}`}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8ebe3] text-[9px] font-bold text-[#27735e]">{appointments.find((item) => item.id === record.id)?.initials}</span><span className="min-w-0"><strong className="block truncate text-[12px]">{record.title}</strong><span className="block truncate text-[10px] text-[#839792]">{record.detail}</span></span></button> : <div className="min-w-0 flex-1"><strong className="block truncate text-[12px]">{record.title}</strong><span className="block truncate text-[10px] text-[#839792]">{record.detail}</span></div>}{module === "Insight" ? <div className="flex items-center gap-2"><span className="rounded-full bg-[#f9eadc] px-2 py-1 text-[9px] font-bold text-[#b96e3a]">Open</span><button onClick={() => resolveSignal(record.id, "dismissed")} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-[#708a82] hover:bg-[#edf4f1]" data-testid={`button-dismiss-signal-${record.id}`}>Dismiss</button><button onClick={() => resolveSignal(record.id, "resolved")} className="rounded-lg bg-[#e0f1e8] px-2 py-1 text-[10px] font-semibold text-[#28775b] hover:bg-[#cfe8dc]" data-testid={`button-resolve-signal-${record.id}`}>Resolve</button></div> : module === "Front" ? <StatusPill status={record.meta as AppointmentStatus} /> : <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold", record.meta === "Complete" ? "bg-[#e0f1e8] text-[#28775b]" : "bg-[#eeeacc] text-[#887a2b]")}>{record.meta}</span>}</div>)}</div>}</section><section className="rounded-2xl border border-[#dce9e4] bg-[#155f4b] p-5 text-[#e5f4ee] shadow-[0_8px_25px_rgba(21,76,62,0.12)]"><div className="flex items-start gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#337d68]"><Sparkles size={16} /></div><div><h3 className="text-[15px] font-semibold">Operator note</h3><p className="mt-1 text-[11px] leading-relaxed text-[#acd0c1]">This workspace is connected to the same synthetic operating picture as Overview.</p></div></div><div className="mt-5 rounded-xl border border-[#3a806b] bg-[#1b6a55] p-4"><p className="text-[11px] font-semibold text-[#d7f2e7]">Keep the day moving</p><p className="mt-1 text-[10px] leading-relaxed text-[#b8d9cd]">Use the action above to create a realistic workflow event. Every change remains local to this demonstration.</p></div><div className="mt-5 flex items-center gap-2 text-[10px] text-[#c3e6d8]"><CheckCircle2 size={14} /> Data synced 2 min ago</div></section></div></div>;
}

function AppointmentModal({ appointment, onClose, onSave }: { appointment: Appointment; onClose: () => void; onSave: (status: AppointmentStatus) => void }) {
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  return <Modal title={appointment.name} description={`${appointment.visit} · ${appointment.time}`} onClose={onClose} labelledBy="appointment-details-title"><div className="mt-4 rounded-xl bg-[#eef7f3] p-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d0e7dd] text-[10px] font-bold text-[#27735e]">{appointment.initials}</span><div><p className="text-[12px] font-semibold">{appointment.location}</p><p className="mt-1 text-[10px] text-[#718a83]">Synthetic patient record · no clinical data</p></div></div></div><label className="mt-4 block text-[11px] font-semibold text-[#52766b]" htmlFor="appointment-status">Appointment status<select id="appointment-status" value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatus)} className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white px-3 py-2.5 text-[12px]" data-testid="select-appointment-status"><option>Confirmed</option><option>Arriving</option><option>No-show risk</option><option>Completed</option><option>Cancelled</option></select></label><div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl px-3 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]" data-testid="button-cancel-appointment">Cancel</button><button onClick={() => onSave(status)} className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]" data-testid="button-save-appointment">Save status</button></div></Modal>;
}

function NotFound() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#edf4f1] p-6 text-center"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#66877c]">MedFlow</p><h1 className="mt-2 text-3xl font-semibold text-[#163d34]">Workspace not found</h1><p className="mt-2 text-sm text-[#78918a]">Return to the operations overview to continue.</p><a href="/" className="mt-5 inline-flex rounded-xl bg-[#155f4b] px-4 py-2.5 text-xs font-semibold text-white">Open overview</a></div></div>;
}

function Router() {
  return <Switch><Route path="/" component={AppShell} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><ErrorBoundary resetKey={useLocation()[0]}><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;