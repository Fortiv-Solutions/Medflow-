import React, { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  FileText,
  PackageSearch,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Settings2,
  ChevronDown,
  Menu,
  Search,
  Bell,
  CheckCircle2,
  Check,
  X,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";

import { MedFlowProvider, useMedFlow } from "./context/MedFlowContext";
import type {
  Module,
  Appointment,
  Claim,
  Medication,
  ClinicalNote,
  ConsentRecord,
  QuickAction,
} from "./types/medflow";

// Workspaces
import { OverviewWorkspace } from "./components/workspaces/OverviewWorkspace";
import { FrontWorkspace } from "./components/workspaces/FrontWorkspace";
import { BillingWorkspace } from "./components/workspaces/BillingWorkspace";
import { PharmacyWorkspace } from "./components/workspaces/PharmacyWorkspace";
import { ClinicalWorkspace } from "./components/workspaces/ClinicalWorkspace";
import { ComplianceWorkspace } from "./components/workspaces/ComplianceWorkspace";
import { InsightWorkspace } from "./components/workspaces/InsightWorkspace";

// Modals
import { QuickActionModal } from "./components/modals/QuickActionModal";
import { CommandPalette } from "./components/modals/CommandPalette";
import { AppointmentDetailModal } from "./components/modals/AppointmentDetailModal";
import { ClaimDetailModal } from "./components/modals/ClaimDetailModal";
import { MedicationDetailModal } from "./components/modals/MedicationDetailModal";
import { ClinicalNoteModal } from "./components/modals/ClinicalNoteModal";
import { ConsentDetailModal } from "./components/modals/ConsentDetailModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { ProfileModal } from "./components/modals/ProfileModal";

const queryClient = new QueryClient();

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

const navItems: { label: Module; note: string; icon: LucideIcon; getBadge?: (state: any) => string | undefined }[] = [
  { label: "Overview", note: "Command telemetry", icon: Activity },
  {
    label: "Front",
    note: "Scheduling & intake",
    icon: CalendarDays,
    getBadge: (s) => {
      const active = s.appointments.filter((a: any) => a.status === "Checked-in" || a.status === "In Exam").length;
      return active > 0 ? active.toString() : undefined;
    },
  },
  {
    label: "Billing",
    note: "Claims operations",
    icon: FileText,
    getBadge: (s) => {
      const flagged = s.claims.filter((c: any) => c.status === "Flagged Mismatch").length;
      return flagged > 0 ? flagged.toString() : undefined;
    },
  },
  {
    label: "Pharmacy",
    note: "Inventory control",
    icon: PackageSearch,
    getBadge: (s) => {
      const low = s.medications.filter((m: any) => m.status === "Low Stock" || m.status === "Critical Low").length;
      return low > 0 ? low.toString() : undefined;
    },
  },
  {
    label: "Clinical",
    note: "Documentation scribe",
    icon: Stethoscope,
    getBadge: (s) => {
      const pending = s.clinicalNotes.filter((n: any) => n.status === "Pending Attending Review").length;
      return pending > 0 ? pending.toString() : undefined;
    },
  },
  {
    label: "Compliance",
    note: "Consent & HIPAA audit",
    icon: ShieldCheck,
  },
  {
    label: "Insight",
    note: "Anomaly signals",
    icon: Sparkles,
    getBadge: (s) => {
      const open = s.signals.filter((sig: any) => sig.status === "open").length;
      return open > 0 ? open.toString() : undefined;
    },
  },
];

function MainLayout() {
  const {
    selectedModule,
    setSelectedModule,
    searchQuery,
    setSearchQuery,
    notice,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    clearNotifications,
    settings,
    appointments,
    claims,
    medications,
    clinicalNotes,
    signals,
  } = useMedFlow();

  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Modals state
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState<QuickAction | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Detail inspection modals
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);

  const openQuickAction = (action?: QuickAction) => {
    setQuickActionType(action || null);
    setQuickActionOpen(true);
  };

  const navState = {
    appointments,
    claims,
    medications,
    clinicalNotes,
    signals,
  };

  return (
    <div className="min-h-[100dvh] bg-[#edf4f1] font-sans text-[#163d34]">
      <div className="flex min-h-[100dvh]">
        {/* Sidebar */}
        <aside
          className={cn(
            mobileNav ? "fixed inset-y-0 left-0 z-40 flex" : "hidden",
            "w-[260px] shrink-0 flex-col border-r border-[#d7e7e1] bg-[#f7fbf9] px-4 py-5 lg:flex shadow-xs"
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 pb-7">
            <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#0d604d] text-[#d7f2e7] shadow-sm">
              <Activity size={19} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[19px] font-bold tracking-[-0.04em] text-[#144c3d]">
                med<span className="text-[#7a9d90]">flow</span>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9ab0a9]">
                operations suite
              </div>
            </div>
          </div>

          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aaca7]">
            Workspaces
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1" aria-label="MedFlow modules">
            {navItems.map(({ label, note, icon: Icon, getBadge }) => {
              const isSelected = selectedModule === label;
              const badge = getBadge ? getBadge(navState) : undefined;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setSelectedModule(label);
                    setMobileNav(false);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    isSelected
                      ? "bg-[#dbeee7] text-[#0e634d] font-semibold shadow-xs"
                      : "text-[#617c74] hover:bg-[#eaf4f0]"
                  )}
                >
                  <Icon size={17} strokeWidth={isSelected ? 2.2 : 1.8} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px]">{label}</span>
                    <span className="block truncate text-[10px] opacity-70">{note}</span>
                  </span>
                  {badge && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        label === "Billing"
                          ? "bg-[#fee2e2] text-[#dc2626]"
                          : label === "Pharmacy"
                          ? "bg-[#fff3e0] text-[#e65100]"
                          : "bg-[#f7e4c5] text-[#98651b]"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto border-t border-[#dce9e4] pt-4 space-y-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[#708a82] hover:bg-[#eaf4f0] transition"
            >
              <Settings2 size={17} />
              <span className="text-[13px] font-semibold">Settings</span>
            </button>

            <button
              onClick={() => setProfileOpen(true)}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#e8f2ee] p-2.5 text-left hover:bg-[#deede7] transition"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c1ddd2] text-[11px] font-bold text-[#175b49]">
                {settings.operatorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#163d34]">{settings.operatorName}</p>
                <p className="truncate text-[10px] text-[#7c978e]">{settings.operatorRole}</p>
              </div>
              <ChevronDown size={14} className="text-[#82a098]" />
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileNav && (
          <div
            className="fixed inset-0 z-30 bg-[#123b3130] lg:hidden backdrop-blur-xs"
            onClick={() => setMobileNav(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[#dce9e4] bg-[#f7fbf9]/95 px-5 backdrop-blur lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl p-2 hover:bg-[#e8f2ee] lg:hidden"
                onClick={() => setMobileNav(true)}
                aria-label="Open mobile menu"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-[18px] font-bold tracking-[-0.03em] text-[#163d34]">
                  {selectedModule === "Overview" ? `Welcome back, ${settings.operatorName}` : `${selectedModule} Workspace`}
                </h1>
                <p className="text-[11px] text-[#78918a]">
                  {settings.facilityName} · Live Operations
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {/* Global search launcher */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden items-center gap-2 rounded-xl border border-[#dce9e4] bg-white px-3 py-2 text-[11px] text-[#779089] md:flex hover:border-[#9acab9] transition"
              >
                <Search size={14} />
                <span>Search everything...</span>
                <kbd className="ml-2 rounded bg-[#edf4f1] px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#52766b]">
                  ⌘ K
                </kbd>
              </button>

              {/* Notifications Toggle */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className="relative rounded-xl p-2.5 text-[#6a8880] hover:bg-[#e5f1ec] transition"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e39d4b] ring-2 ring-white animate-ping" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e39d4b]" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-[48px] z-50 w-[320px] rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-4 shadow-2xl medflow-rise">
                    <div className="flex items-center justify-between border-b border-[#edf4f1] pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-[13px] font-bold text-[#163d34]">Notifications</h2>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-[#e0f0e9] px-1.5 py-0.2 text-[9px] font-bold text-[#28775d]">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[10px] font-semibold text-[#23785f] hover:underline"
                        >
                          Mark read
                        </button>
                        <button
                          onClick={clearNotifications}
                          className="text-[10px] font-semibold text-[#879b95] hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 max-h-[300px] overflow-y-auto space-y-2.5">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-[11px] text-[#839792]">
                          <CheckCircle2 className="mx-auto mb-2 text-[#46a782]" size={22} />
                          All caught up! No unread notifications.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              "flex items-start gap-2.5 rounded-xl p-2 transition",
                              n.read ? "bg-transparent opacity-75" : "bg-[#f0f7f4]"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                n.type === "alert"
                                  ? "bg-[#e1a24b]"
                                  : n.type === "warning"
                                  ? "bg-[#cf7d75]"
                                  : "bg-[#46a782]"
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-[#163d34] leading-snug">{n.message}</p>
                              <span className="mt-1 block text-[9px] text-[#879b95]">{n.timestamp}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar Pill */}
              <button
                onClick={() => setProfileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#c6ded5] text-[11px] font-bold text-[#175b49] shadow-sm hover:ring-2 hover:ring-[#155f4b] transition"
              >
                {settings.operatorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </button>
            </div>
          </header>

          {/* Workspace Body */}
          <div className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8">
            {selectedModule === "Overview" && (
              <OverviewWorkspace
                onOpenQuickAction={() => openQuickAction()}
                onSelectAppointment={(apt) => setSelectedAppointment(apt)}
              />
            )}
            {selectedModule === "Front" && (
              <FrontWorkspace
                onOpenNewAppointment={() => openQuickAction("New appointment")}
                onSelectAppointment={(apt) => setSelectedAppointment(apt)}
              />
            )}
            {selectedModule === "Billing" && (
              <BillingWorkspace
                onOpenNewClaim={() => openQuickAction("Review claims")}
                onSelectClaim={(claim) => setSelectedClaim(claim)}
              />
            )}
            {selectedModule === "Pharmacy" && (
              <PharmacyWorkspace
                onOpenNewMedication={() => openQuickAction("Log inventory")}
                onSelectMedication={(med) => setSelectedMedication(med)}
              />
            )}
            {selectedModule === "Clinical" && (
              <ClinicalWorkspace
                onOpenNewNote={() =>
                  setSelectedNote({
                    id: "NEW",
                    patientName: "New Patient Record",
                    patientId: "PAT-NEW",
                    provider: settings.operatorName,
                    type: "SOAP Note",
                    date: new Date().toISOString().split("T")[0],
                    subjective: "",
                    objective: "",
                    assessment: "",
                    plan: "",
                    qualityScore: 95,
                    status: "Draft",
                  })
                }
                onSelectNote={(note) => setSelectedNote(note)}
              />
            )}
            {selectedModule === "Compliance" && (
              <ComplianceWorkspace
                onOpenNewConsent={() => openQuickAction("Run consent audit")}
                onSelectConsent={(rec) => setSelectedConsent(rec)}
              />
            )}
            {selectedModule === "Insight" && <InsightWorkspace />}

            {/* Footer Environment Tag */}
            <div className="mt-6 flex flex-wrap items-center justify-between rounded-xl border border-dashed border-[#c8ddd4] bg-[#f5faf7] px-4 py-3 text-[11px] text-[#79928a]">
              <span>
                <strong className="text-[#52766b]">MedFlow Operations Sentinel Active</strong> · Connected to local persistent EHR ledger with continuous synchronization.
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#4f8271]">
                <Check size={13} /> All Systems Operational
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {quickActionOpen && (
        <QuickActionModal
          initialAction={quickActionType}
          onClose={() => {
            setQuickActionOpen(false);
            setQuickActionType(null);
          }}
        />
      )}

      {commandPaletteOpen && (
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onSelectAppointment={(apt) => setSelectedAppointment(apt)}
          onSelectClaim={(claim) => setSelectedClaim(claim)}
          onSelectMedication={(med) => setSelectedMedication(med)}
          onSelectNote={(note) => setSelectedNote(note)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}

      {selectedMedication && (
        <MedicationDetailModal
          medication={selectedMedication}
          onClose={() => setSelectedMedication(null)}
        />
      )}

      {selectedNote && (
        <ClinicalNoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}

      {selectedConsent && (
        <ConsentDetailModal
          record={selectedConsent}
          onClose={() => setSelectedConsent(null)}
        />
      )}

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}

      {/* Toast Notification Alert */}
      {notice && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl bg-[#173f35] px-5 py-3.5 text-[13px] font-semibold text-white shadow-2xl medflow-rise"
          role="status"
        >
          <Check size={16} className="text-[#8ed4b8]" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#edf4f1] p-6 text-center">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#66877c]">MedFlow</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#163d34]">Workspace not found</h1>
        <p className="mt-2 text-sm text-[#78918a]">Return to the operations overview to continue.</p>
        <a href="/" className="mt-5 inline-flex rounded-xl bg-[#155f4b] px-4 py-2.5 text-xs font-semibold text-white">
          Open overview
        </a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MedFlowProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ErrorBoundary resetKey={useLocation()[0]}>
              <Router />
            </ErrorBoundary>
          </WouterRouter>
          <Toaster />
        </MedFlowProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;