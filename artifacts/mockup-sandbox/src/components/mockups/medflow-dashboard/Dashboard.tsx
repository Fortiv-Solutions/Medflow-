import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
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

type Module = "Overview" | "Front" | "Billing" | "Pharmacy" | "Clinical" | "Compliance" | "Insight";

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Front", note: "Scheduling & intake", icon: CalendarDays },
  { label: "Billing", note: "Claims operations", icon: FileText, badge: "3" },
  { label: "Pharmacy", note: "Inventory control", icon: PackageSearch, badge: "7" },
  { label: "Clinical", note: "Documentation", icon: Stethoscope },
  { label: "Compliance", note: "Consent & audit", icon: ShieldCheck },
  { label: "Insight", note: "Anomaly signals", icon: Activity, badge: "2" },
];

const appointments = [
  ["Elena Martinez", "Follow-up · Cardiology", "09:20", "Confirmed", "EM"],
  ["Marcus Chen", "New patient · Primary care", "10:00", "Arriving", "MC"],
  ["Priya Nair", "Medication review", "10:40", "Confirmed", "PN"],
  ["Jonas Williams", "Annual physical", "11:20", "No-show risk", "JW"],
];

const activity = [
  ["Claim CLM-2841 flagged for review", "Billing bot · 2 min ago", "amber"],
  ["Consent form completed · Elena M.", "Front desk · 14 min ago", "green"],
  ["Reorder request generated · Amoxicillin", "Pharmacy bot · 28 min ago", "blue"],
  ["Referral has no visit after 14 days", "Insight bot · 41 min ago", "rose"],
];

function Metric({ icon: Icon, label, value, delta, detail, tone }: { icon: typeof Activity; label: string; value: string; delta: string; detail: string; tone: string }) {
  return (
    <div className="group rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4 shadow-[0_8px_25px_rgba(21,76,62,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(21,76,62,0.1)]">
      <div className="mb-4 flex items-center justify-between">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}><Icon size={16} /></span>
        <MoreHorizontal size={16} className="text-[#9aaca7]" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78918a]">{label}</p>
      <div className="mt-1 flex items-end gap-2"><strong className="text-[26px] font-semibold tracking-[-0.04em] text-[#163d34]">{value}</strong><span className="mb-1 flex items-center text-[11px] font-semibold text-[#258066]"><ArrowUpRight size={12} />{delta}</span></div>
      <p className="mt-1 text-[11px] text-[#839792]">{detail}</p>
    </div>
  );
}

export function Dashboard() {
  const [selected, setSelected] = useState<Module>("Overview");
  const [range, setRange] = useState("Today");
  const [quickOpen, setQuickOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  const subtitle = useMemo(() => selected === "Overview" ? "Wednesday, 18 September 2024 · Northstar Health Network" : `${selected} workspace · synthetic operating view`, [selected]);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2600); };

  return (
    <div className="min-h-[100dvh] bg-[#edf4f1] font-sans text-[#163d34]">
      <div className="flex min-h-[100dvh]">
        <aside className={`${mobileNav ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} w-[252px] shrink-0 flex-col border-r border-[#d7e7e1] bg-[#f7fbf9] px-4 py-5 lg:flex`}>
          <div className="flex items-center gap-3 px-3 pb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#0d604d] text-[#d7f2e7]"><Activity size={19} strokeWidth={2.5} /></div>
            <div><div className="text-[19px] font-semibold tracking-[-0.04em] text-[#144c3d]">med<span className="text-[#7a9d90]">flow</span></div><div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9ab0a9]">operations suite</div></div>
          </div>
          <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aaca7]">Workspace</div>
          <nav className="space-y-1">
            {nav.map(({ label, note, icon: Icon, badge }) => <button key={label} onClick={() => { setSelected(label as Module); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selected === label ? "bg-[#dbeee7] text-[#0e634d] shadow-sm" : "text-[#617c74] hover:bg-[#eaf4f0]"}`}><Icon size={17} strokeWidth={selected === label ? 2.2 : 1.8} /><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{label}</span>{note && <span className="block truncate text-[10px] opacity-70">{note}</span>}</span>{badge && <span className="rounded-full bg-[#f7e4c5] px-1.5 py-0.5 text-[10px] font-bold text-[#98651b]">{badge}</span>}</button>)}
          </nav>
          <div className="mt-auto border-t border-[#dce9e4] pt-4">
            <button onClick={() => notify("Settings preview is ready for review")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#708a82] hover:bg-[#eaf4f0]"><Settings2 size={17} /><span className="text-[13px] font-semibold">Settings</span></button>
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#e8f2ee] p-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c1ddd2] text-[11px] font-bold text-[#175b49]">AT</div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold">Avery Thomas</p><p className="text-[10px] text-[#7c978e]">Operations lead</p></div><ChevronDown size={14} className="text-[#82a098]" /></div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-[#dce9e4] bg-[#f7fbf9]/90 px-5 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3"><button className="rounded-xl p-2 hover:bg-[#e8f2ee] lg:hidden" onClick={() => setMobileNav(true)}><Menu size={20} /></button><div><h1 className="text-[18px] font-semibold tracking-[-0.03em]">{selected === "Overview" ? "Good morning, Avery" : selected}</h1><p className="mt-0.5 text-[11px] text-[#78918a]">{subtitle}</p></div></div>
            <div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-xl border border-[#dce9e4] bg-white px-3 py-2 text-[11px] text-[#779089] md:flex"><Search size={14} /><span>Search records, claims...</span><kbd className="ml-4 rounded bg-[#edf4f1] px-1.5 py-0.5 text-[9px]">⌘ K</kbd></div><button onClick={() => notify("No new alerts. Your workspace is up to date.")} className="relative rounded-xl p-2.5 text-[#6a8880] hover:bg-[#e5f1ec]"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e39d4b]" /></button><div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#c6ded5] text-[11px] font-bold text-[#175b49] shadow-sm">AT</div></div>
          </header>
          <div className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]"><span className="h-2 w-2 rounded-full bg-[#31a77e]" /> Live workspace <span className="font-normal normal-case tracking-normal text-[#9aaca7]">· Synced 2 min ago</span></div><h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">Today at a glance</h2><p className="mt-1 text-[13px] text-[#78918a]">A clear pulse on the work that keeps care moving.</p></div><div className="flex items-center gap-2"><div className="flex rounded-xl border border-[#d5e5df] bg-[#f8fcfa] p-1">{["Today", "7 days", "30 days"].map(x => <button key={x} onClick={() => setRange(x)} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${range === x ? "bg-[#155f4b] text-white shadow-sm" : "text-[#779089] hover:text-[#155f4b]"}`}>{x}</button>)}</div><button onClick={() => setQuickOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-3.5 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]"><Plus size={15} /> Quick action</button></div></div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Users} label="Patients today" value="148" delta="+8.4%" detail="vs 136 last Wednesday" tone="bg-[#dcefe7] text-[#20735b]" /><Metric icon={CalendarDays} label="Appointments" value="32" delta="+5.1%" detail="4 slots still available" tone="bg-[#e9e8d8] text-[#8b8240]" /><Metric icon={FileText} label="Claims at a glance" value="$84.7k" delta="+12.8%" detail="96.2% clean submission rate" tone="bg-[#e5e2f0] text-[#665b91]" /><Metric icon={ShieldCheck} label="Open signals" value="12" delta="-3 today" detail="2 need attention now" tone="bg-[#f8e7dc] text-[#ad6747]" /></div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-[15px] font-semibold">Operational pulse</h3><p className="mt-1 text-[11px] text-[#839792]">Throughput across your connected workflows</p></div><button onClick={() => notify("Pulse details exported to your downloads")} className="rounded-lg p-1.5 text-[#91a7a0] hover:bg-[#edf4f1]"><MoreHorizontal size={18} /></button></div><div className="relative h-[190px]"><div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[#a0b2ad]"><span>180</span><span>120</span><span>60</span><span>0</span></div><div className="ml-8 flex h-full items-end justify-between gap-3 border-b border-l border-[#dfeae6] pb-0 pl-4">{[76,62,83,55,72,47,68,88,59,76,91,67].map((h, i) => <div key={i} className="group relative flex h-full flex-1 items-end"><div style={{ height: `${h}%` }} className={`w-full rounded-t-[5px] transition-all duration-300 group-hover:bg-[#62b79a] ${i === 7 ? "bg-[#16755a]" : "bg-[#b9ddd0]"}`} /><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-[#a0b2ad]">{["8a","9a","10a","11a","12p","1p","2p","3p","4p","5p","6p","7p"][i]}</span></div>)}</div></div><div className="mt-8 flex items-center gap-5 text-[10px] text-[#829891]"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#16755a]" /> Today</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#b9ddd0]" /> Previous Wednesday</span><span className="ml-auto font-semibold text-[#23785f]">+14.6% throughput <ArrowUpRight className="inline" size={12} /></span></div></section>
              <section className="rounded-2xl border border-[#dce9e4] bg-[#155f4b] p-5 text-[#e5f4ee] shadow-[0_8px_25px_rgba(21,76,62,0.12)]"><div className="flex items-start justify-between"><div><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#337d68]"><Sparkles size={16} /></div><h3 className="text-[15px] font-semibold">Insight briefing</h3><p className="mt-1 text-[11px] text-[#acd0c1]">The signals worth your attention.</p></div><span className="rounded-full bg-[#2a735f] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#bce0d2]">AI assisted</span></div><div className="mt-5 space-y-3"><div className="rounded-xl border border-[#3a806b] bg-[#1b6a55] p-3"><div className="flex gap-3"><AlertCircle size={16} className="mt-0.5 shrink-0 text-[#f0c878]" /><div><p className="text-[12px] font-semibold">4 appointments may become no-shows</p><p className="mt-1 text-[10px] leading-relaxed text-[#b8d9cd]">Reminder automation is queued for the 11:20–13:00 window.</p></div></div></div><div className="rounded-xl border border-[#3a806b] bg-[#1b6a55] p-3"><div className="flex gap-3"><PackageSearch size={16} className="mt-0.5 shrink-0 text-[#a9d8c7]" /><div><p className="text-[12px] font-semibold">Amoxicillin reorder is ready</p><p className="mt-1 text-[10px] leading-relaxed text-[#b8d9cd]">Stock reaches threshold in approximately 3 days.</p></div></div></div></div><button onClick={() => setSelected("Insight")} className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#c3e6d8] hover:text-white">Review all signals <ArrowUpRight size={13} /></button></section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]"><section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-[15px] font-semibold">Next appointments</h3><p className="mt-1 text-[11px] text-[#839792]">Front desk queue · {range.toLowerCase()}</p></div><button onClick={() => setSelected("Front")} className="text-[11px] font-semibold text-[#23785f] hover:underline">View schedule <ArrowUpRight className="inline" size={12} /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[530px] text-left"><thead className="border-y border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]"><tr><th className="py-2 font-semibold">Patient</th><th className="py-2 font-semibold">Visit</th><th className="py-2 font-semibold">Time</th><th className="py-2 font-semibold">Status</th><th /></tr></thead><tbody>{appointments.map(([name, visit, time, status, initials]) => <tr key={name} className="border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6]"><td className="py-3"><div className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8ebe3] text-[9px] font-bold text-[#27735e]">{initials}</span><span className="text-[12px] font-semibold">{name}</span></div></td><td className="text-[11px] text-[#718a83]">{visit}</td><td className="text-[11px] font-semibold text-[#365b50]">{time}</td><td><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${status === "No-show risk" ? "bg-[#f9eadc] text-[#b96e3a]" : status === "Arriving" ? "bg-[#eeeacc] text-[#887a2b]" : "bg-[#e0f1e8] text-[#28775b]"}`}>{status}</span></td><td><button onClick={() => notify(`${name}'s appointment details opened`)} className="rounded-lg p-1 text-[#9aaca7] hover:bg-[#e3eee9]"><MoreHorizontal size={15} /></button></td></tr>)}</tbody></table></div></section><section className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-[15px] font-semibold">Workflow activity</h3><p className="mt-1 text-[11px] text-[#839792]">Automations and team actions</p></div><button onClick={() => setSelected("Compliance")} className="text-[#92a8a0] hover:text-[#155f4b]"><MoreHorizontal size={18} /></button></div><div className="space-y-0">{activity.map(([title, by, color]) => <div key={title} className="flex gap-3 border-b border-[#edf3f0] py-3 last:border-0"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${color === "amber" ? "bg-[#e1a24b]" : color === "rose" ? "bg-[#cf7d75]" : color === "blue" ? "bg-[#78a8b2]" : "bg-[#46a782]"}`} /><div className="min-w-0"><p className="truncate text-[11px] font-semibold">{title}</p><p className="mt-1 text-[10px] text-[#879b95]">{by}</p></div></div>)}</div></section></div>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-[#c8ddd4] bg-[#f5faf7] px-4 py-3 text-[10px] text-[#79928a]"><span><strong className="text-[#52766b]">Demo environment</strong> · All records are synthetic and for interface demonstration only. Not for production clinical use.</span><span className="hidden items-center gap-1.5 font-semibold text-[#4f8271] sm:flex"><Check size={13} /> Last audit check 08:42</span></div>
          </div>
        </main>
      </div>
      {quickOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#123b3140] p-4 sm:items-center" onClick={() => setQuickOpen(false)}><div className="w-full max-w-md rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-5 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between"><div><h3 className="text-[16px] font-semibold">Quick action</h3><p className="mt-1 text-[11px] text-[#829891]">Choose a workflow to start in this demo.</p></div><button onClick={() => setQuickOpen(false)} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]"><X size={17} /></button></div><div className="mt-4 grid grid-cols-2 gap-2">{[["New appointment", CalendarDays], ["Review claims", FileText], ["Log inventory", FlaskConical], ["Run consent audit", ClipboardCheck]].map(([label, Icon]) => <button key={label as string} onClick={() => { setQuickOpen(false); notify(`${label} opened`); }} className="flex items-center gap-2 rounded-xl border border-[#dce9e4] p-3 text-left text-[11px] font-semibold hover:border-[#8fc1ae] hover:bg-[#eef8f3]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e0f0e9] text-[#28775d]"><Icon size={15} /></span>{label as string}</button>)}</div></div></div>}
      {notice && <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#173f35] px-4 py-3 text-[12px] font-semibold text-white shadow-xl"><Check size={15} className="text-[#8ed4b8]" />{notice}</div>}
    </div>
  );
}