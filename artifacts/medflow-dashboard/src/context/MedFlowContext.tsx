import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  Module,
  Appointment,
  AppointmentStatus,
  Claim,
  ClaimStatus,
  Medication,
  MedicationStatus,
  ClinicalNote,
  ClinicalNoteStatus,
  ConsentRecord,
  ConsentAuditStatus,
  Signal,
  ActivityLog,
  NotificationItem,
  UserSettings,
} from "../types/medflow";
import {
  initialAppointments,
  initialClaims,
  initialMedications,
  initialClinicalNotes,
  initialConsentRecords,
  initialSignals,
  initialActivity,
  initialNotifications,
  defaultSettings,
} from "../lib/mockData";

interface MedFlowContextType {
  // Navigation & View
  selectedModule: Module;
  setSelectedModule: (mod: Module) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  timeRange: "Today" | "7 days" | "30 days";
  setTimeRange: (range: "Today" | "7 days" | "30 days") => void;

  // Toast / Status banner
  notice: string | null;
  notify: (msg: string) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, "id" | "initials">) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  checkInAppointment: (id: string) => void;

  // Claims
  claims: Claim[];
  addClaim: (claim: Omit<Claim, "id">) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  deleteClaim: (id: string) => void;

  // Medications
  medications: Medication[];
  addMedication: (med: Omit<Medication, "id">) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  reorderMedication: (id: string, additionalUnits?: number) => void;
  dispenseMedication: (id: string, units: number) => void;

  // Clinical Notes
  clinicalNotes: ClinicalNote[];
  addClinicalNote: (note: Omit<ClinicalNote, "id">) => void;
  updateClinicalNote: (id: string, updates: Partial<ClinicalNote>) => void;
  signClinicalNote: (id: string) => void;

  // Compliance
  consentRecords: ConsentRecord[];
  addConsentRecord: (record: Omit<ConsentRecord, "id">) => void;
  updateConsentRecord: (id: string, updates: Partial<ConsentRecord>) => void;
  runComplianceAuditScan: () => Promise<number>;
  isScanningCompliance: boolean;

  // Signals
  signals: Signal[];
  resolveSignal: (id: string) => void;
  dismissSignal: (id: string) => void;
  executeSignalAction: (id: string) => void;

  // Activity & Notifications
  activity: ActivityLog[];
  logActivity: (title: string, actor: string, tone: "amber" | "green" | "blue" | "rose", module: Module) => void;
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;

  // Settings
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  // Global Export
  exportAllData: (format: "json" | "csv") => void;

  // Calculated Metrics
  overviewMetrics: {
    patientsCount: number;
    appointmentsCount: number;
    cleanClaimRate: number;
    totalPendingRevenue: number;
    lowStockCount: number;
    openSignalsCount: number;
    complianceScore: number;
    throughputBars: number[];
  };
}

const MedFlowContext = createContext<MedFlowContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`medflow_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`medflow_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

export const MedFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedModule, setSelectedModule] = useState<Module>("Overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeRange, setTimeRange] = useState<"Today" | "7 days" | "30 days">("Today");
  const [notice, setNotice] = useState<string | null>(null);
  const [isScanningCompliance, setIsScanningCompliance] = useState(false);

  // Entities state with persistence
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage("appointments", initialAppointments)
  );
  const [claims, setClaims] = useState<Claim[]>(() =>
    loadFromStorage("claims", initialClaims)
  );
  const [medications, setMedications] = useState<Medication[]>(() =>
    loadFromStorage("medications", initialMedications)
  );
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>(() =>
    loadFromStorage("clinical_notes", initialClinicalNotes)
  );
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(() =>
    loadFromStorage("consent_records", initialConsentRecords)
  );
  const [signals, setSignals] = useState<Signal[]>(() =>
    loadFromStorage("signals", initialSignals)
  );
  const [activity, setActivity] = useState<ActivityLog[]>(() =>
    loadFromStorage("activity", initialActivity)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage("notifications", initialNotifications)
  );
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadFromStorage("settings", defaultSettings)
  );

  // Sync to storage
  useEffect(() => saveToStorage("appointments", appointments), [appointments]);
  useEffect(() => saveToStorage("claims", claims), [claims]);
  useEffect(() => saveToStorage("medications", medications), [medications]);
  useEffect(() => saveToStorage("clinical_notes", clinicalNotes), [clinicalNotes]);
  useEffect(() => saveToStorage("consent_records", consentRecords), [consentRecords]);
  useEffect(() => saveToStorage("signals", signals), [signals]);
  useEffect(() => saveToStorage("activity", activity), [activity]);
  useEffect(() => saveToStorage("notifications", notifications), [notifications]);
  useEffect(() => saveToStorage("settings", settings), [settings]);

  const notify = useCallback((msg: string) => {
    setNotice(msg);
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  const logActivity = useCallback(
    (title: string, actor: string, tone: "amber" | "green" | "blue" | "rose", module: Module) => {
      const newAct: ActivityLog = {
        id: `act-${Date.now()}`,
        title,
        actor,
        timestamp: "Just now",
        tone,
        module,
      };
      setActivity((prev) => [newAct, ...prev.slice(0, 24)]);
    },
    []
  );

  const addNotification = useCallback(
    (message: string, type: "alert" | "info" | "success" | "warning", targetModule?: Module) => {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        message,
        timestamp: "Just now",
        read: false,
        type,
        targetModule,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  // Appointment Actions
  const addAppointment = useCallback(
    (data: Omit<Appointment, "id" | "initials">) => {
      const initials = data.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      const newApt: Appointment = {
        ...data,
        id: `apt-${Date.now().toString().slice(-4)}`,
        initials: initials || "PT",
      };
      setAppointments((prev) => [newApt, ...prev]);
      logActivity(
        `Scheduled new appointment · ${newApt.name} (${newApt.visit})`,
        `${settings.operatorName} · Front Desk`,
        "green",
        "Front"
      );
      addNotification(`New appointment booked for ${newApt.name} at ${newApt.time}`, "success", "Front");
      notify(`Appointment scheduled for ${newApt.name}`);
    },
    [logActivity, addNotification, notify, settings.operatorName]
  );

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
      );
      const target = appointments.find((a) => a.id === id);
      const name = target ? target.name : "Patient";
      if (updates.status) {
        logActivity(
          `Status updated to ${updates.status} · ${name}`,
          `${settings.operatorName} · Front Desk`,
          "blue",
          "Front"
        );
        notify(`${name}'s status changed to ${updates.status}`);
      } else {
        notify(`Appointment details updated for ${name}`);
      }
    },
    [appointments, logActivity, notify, settings.operatorName]
  );

  const deleteAppointment = useCallback(
    (id: string) => {
      const apt = appointments.find((a) => a.id === id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      if (apt) {
        logActivity(`Cancelled appointment · ${apt.name}`, `${settings.operatorName} · Front Desk`, "rose", "Front");
        notify(`Appointment cancelled for ${apt.name}`);
      }
    },
    [appointments, logActivity, notify, settings.operatorName]
  );

  const checkInAppointment = useCallback(
    (id: string) => {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id
            ? { ...apt, status: "Checked-in" as AppointmentStatus, insuranceVerified: true, consentSigned: true }
            : apt
        )
      );
      const target = appointments.find((a) => a.id === id);
      if (target) {
        logActivity(
          `Patient checked in & verified · ${target.name}`,
          "Front Desk Kiosk",
          "green",
          "Front"
        );
        addNotification(`${target.name} has arrived and is ready for exam`, "info", "Front");
        notify(`${target.name} checked in successfully!`);
      }
    },
    [appointments, logActivity, addNotification, notify]
  );

  // Claims Actions
  const addClaim = useCallback(
    (data: Omit<Claim, "id">) => {
      const newClaim: Claim = {
        ...data,
        id: `CLM-${Math.floor(2800 + Math.random() * 200)}`,
      };
      setClaims((prev) => [newClaim, ...prev]);
      logActivity(
        `Claim filed ${newClaim.id} · ₹${newClaim.amount.toLocaleString('en-IN')} (${newClaim.payer})`,
        `${settings.operatorName} · Billing`,
        "blue",
        "Billing"
      );
      addNotification(`New claim ${newClaim.id} submitted for ${newClaim.patientName}`, "info", "Billing");
      notify(`Claim ${newClaim.id} filed successfully!`);
    },
    [logActivity, addNotification, notify, settings.operatorName]
  );

  const updateClaim = useCallback(
    (id: string, updates: Partial<Claim>) => {
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      if (updates.status) {
        logActivity(
          `Claim ${id} status updated to ${updates.status}`,
          `${settings.operatorName} · Billing Adjudication`,
          updates.status === "Approved" || updates.status === "Paid" ? "green" : updates.status === "Denied" ? "rose" : "amber",
          "Billing"
        );
        notify(`Claim ${id} marked as ${updates.status}`);
      } else {
        notify(`Claim ${id} updated`);
      }
    },
    [logActivity, notify, settings.operatorName]
  );

  const deleteClaim = useCallback(
    (id: string) => {
      setClaims((prev) => prev.filter((c) => c.id !== id));
      logActivity(`Claim ${id} deleted`, `${settings.operatorName} · Billing`, "rose", "Billing");
      notify(`Claim ${id} removed`);
    },
    [logActivity, notify, settings.operatorName]
  );

  // Medication Actions
  const addMedication = useCallback(
    (data: Omit<Medication, "id">) => {
      const newMed: Medication = {
        ...data,
        id: `MED-${Date.now().toString().slice(-4)}`,
      };
      setMedications((prev) => [newMed, ...prev]);
      logActivity(
        `New medication entered · ${newMed.name} (${newMed.dosage})`,
        `${settings.operatorName} · Pharmacy`,
        "blue",
        "Pharmacy"
      );
      notify(`Medication ${newMed.name} added to inventory`);
    },
    [logActivity, notify, settings.operatorName]
  );

  const updateMedication = useCallback(
    (id: string, updates: Partial<Medication>) => {
      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
      notify(`Medication inventory updated`);
    },
    [notify]
  );

  const reorderMedication = useCallback(
    (id: string, additionalUnits = 100) => {
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const newStock = m.stock + additionalUnits;
            const newStatus: MedicationStatus =
              newStock > m.reorderThreshold ? "In Stock" : "Low Stock";
            return {
              ...m,
              stock: newStock,
              status: newStatus,
            };
          }
          return m;
        })
      );
      const target = medications.find((m) => m.id === id);
      const name = target ? target.name : "Medication";
      logActivity(
        `Reorder processed (+${additionalUnits} units) · ${name}`,
        "Pharmacy Bot · Inventory Guard",
        "green",
        "Pharmacy"
      );
      addNotification(`Stock reorder for ${name} received and replenished`, "success", "Pharmacy");
      notify(`Reorder for ${name} completed! Stock replenished.`);
    },
    [medications, logActivity, addNotification, notify]
  );

  const dispenseMedication = useCallback(
    (id: string, units: number) => {
      setMedications((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const remaining = Math.max(0, m.stock - units);
            const status: MedicationStatus =
              remaining === 0
                ? "Critical Low"
                : remaining <= m.reorderThreshold
                ? "Low Stock"
                : "In Stock";
            return { ...m, stock: remaining, status };
          }
          return m;
        })
      );
      const target = medications.find((m) => m.id === id);
      const name = target ? target.name : "Medication";
      logActivity(
        `Dispensed ${units} units · ${name}`,
        "Pharmacy Dispensing Station",
        "blue",
        "Pharmacy"
      );
      notify(`Dispensed ${units} units of ${name}`);
    },
    [medications, logActivity, notify]
  );

  // Clinical Notes Actions
  const addClinicalNote = useCallback(
    (data: Omit<ClinicalNote, "id">) => {
      const newNote: ClinicalNote = {
        ...data,
        id: `NOTE-${Math.floor(100 + Math.random() * 900)}`,
      };
      setClinicalNotes((prev) => [newNote, ...prev]);
      logActivity(
        `Authored ${newNote.type} · ${newNote.patientName}`,
        newNote.provider,
        "blue",
        "Clinical"
      );
      addNotification(`New ${newNote.type} created for ${newNote.patientName}`, "info", "Clinical");
      notify(`Clinical note saved for ${newNote.patientName}`);
    },
    [logActivity, addNotification, notify]
  );

  const updateClinicalNote = useCallback(
    (id: string, updates: Partial<ClinicalNote>) => {
      setClinicalNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
      );
      notify(`Clinical note updated`);
    },
    [notify]
  );

  const signClinicalNote = useCallback(
    (id: string) => {
      setClinicalNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "Signed & Finalized", qualityScore: 100 } : n
        )
      );
      const target = clinicalNotes.find((n) => n.id === id);
      if (target) {
        logActivity(
          `Note finalized & signed · ${target.patientName} (${target.type})`,
          target.provider,
          "green",
          "Clinical"
        );
        addNotification(`EHR note for ${target.patientName} successfully signed and locked`, "success", "Clinical");
        notify(`Note signed and finalized for ${target.patientName}`);
      }
    },
    [clinicalNotes, logActivity, addNotification, notify]
  );

  // Compliance & Consent Actions
  const addConsentRecord = useCallback(
    (data: Omit<ConsentRecord, "id">) => {
      const newRec: ConsentRecord = {
        ...data,
        id: `CNS-${Date.now().toString().slice(-4)}`,
      };
      setConsentRecords((prev) => [newRec, ...prev]);
      logActivity(
        `Recorded consent · ${newRec.patientName} (${newRec.documentType})`,
        `${settings.operatorName} · Compliance`,
        "green",
        "Compliance"
      );
      notify(`Consent document recorded for ${newRec.patientName}`);
    },
    [logActivity, notify, settings.operatorName]
  );

  const updateConsentRecord = useCallback(
    (id: string, updates: Partial<ConsentRecord>) => {
      setConsentRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      notify(`Consent record updated`);
    },
    [notify]
  );

  const runComplianceAuditScan = useCallback(async (): Promise<number> => {
    setIsScanningCompliance(true);
    notify("Running automated HIPAA & Clinical consent audit scan across all records...");

    await new Promise((res) => setTimeout(res, 1200));

    // Update any expired or missing to reviewed
    setConsentRecords((prev) =>
      prev.map((r) => (r.status === "Expired" ? { ...r, status: "Pending Renewal" as ConsentAuditStatus } : r))
    );

    const score = 98.4;
    setIsScanningCompliance(false);
    logActivity(
      `Compliance audit scan completed · ${score}% health rating`,
      "MedFlow Compliance Sentinel",
      "green",
      "Compliance"
    );
    addNotification(`Automated Compliance scan completed: ${score}% rating with 0 critical breaches.`, "success", "Compliance");
    notify(`Compliance audit complete! Facility health score: ${score}%`);
    return score;
  }, [logActivity, addNotification, notify]);

  // Signals Actions
  const resolveSignal = useCallback(
    (id: string) => {
      setSignals((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "resolved" } : s))
      );
      const target = signals.find((s) => s.id === id);
      logActivity(
        `Signal resolved · ${target?.title ?? "AI Alert"}`,
        `${settings.operatorName} · Operations`,
        "green",
        "Insight"
      );
      notify("Signal resolved and recorded to historical telemetry.");
    },
    [signals, logActivity, notify, settings.operatorName]
  );

  const dismissSignal = useCallback(
    (id: string) => {
      setSignals((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "dismissed" } : s))
      );
      notify("Signal dismissed from active queue.");
    },
    [notify]
  );

  const executeSignalAction = useCallback(
    (id: string) => {
      const signal = signals.find((s) => s.id === id);
      if (!signal) return;

      if (signal.category === "Front") {
        // mark no-show risks as reminded / confirmed
        setAppointments((prev) =>
          prev.map((a) => (a.status === "No-show risk" ? { ...a, status: "Confirmed" } : a))
        );
        resolveSignal(id);
        notify("Automated priority SMS reminders sent to all queued patients!");
      } else if (signal.category === "Pharmacy") {
        // reorder amoxicillin
        const amox = medications.find((m) => m.name.toLowerCase().includes("amoxicillin"));
        if (amox) reorderMedication(amox.id, 100);
        resolveSignal(id);
        notify("Automated PO-892 purchase order dispatched to medical supplier!");
      } else if (signal.category === "Billing") {
        // adjust flagged claim
        setClaims((prev) =>
          prev.map((c) =>
            c.status === "Flagged Mismatch"
              ? { ...c, status: "Under Review", notes: "Contract fee schedule Exhibit B appeal generated." }
              : c
          )
        );
        resolveSignal(id);
        notify("Contract rate discrepancy appeal auto-filed with payer portal!");
      } else {
        resolveSignal(id);
        notify(`Action executed: ${signal.recommendedAction}`);
      }
    },
    [signals, resolveSignal, notify, medications, reorderMedication]
  );

  // Notifications Actions
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notify("All notifications marked as read");
  }, [notify]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    notify("Notification history cleared");
  }, [notify]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Settings Actions
  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      notify("Operational configuration saved successfully.");
    },
    [notify]
  );

  // Export Data
  const exportAllData = useCallback(
    (format: "json" | "csv") => {
      const dump = {
        appointments,
        claims,
        medications,
        clinicalNotes,
        consentRecords,
        signals,
        exportedAt: new Date().toISOString(),
        facility: settings.facilityName,
      };

      if (format === "json") {
        const blob = new Blob([JSON.stringify(dump, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `medflow-operations-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV export of appointments & claims
        let csv = "Category,ID,Name,Details,Date,Status\n";
        appointments.forEach((a) => {
          csv += `Appointment,${a.id},"${a.name}","${a.visit}",${a.date} ${a.time},${a.status}\n`;
        });
        claims.forEach((c) => {
          csv += `Claim,${c.id},"${c.patientName}","${c.payer} - ₹${c.amount.toLocaleString('en-IN')}",${c.serviceDate},${c.status}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `medflow-operations-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      notify(`Operational dataset exported to ${format.toUpperCase()}`);
    },
    [appointments, claims, medications, clinicalNotes, consentRecords, signals, settings.facilityName, notify]
  );

  // Real-time Overview Calculations
  const overviewMetrics = useMemo(() => {
    const patientsCount = new Set(appointments.map((a) => a.name)).size + 142;
    const appointmentsCount = appointments.length;
    const cleanClaims = claims.filter(
      (c) => c.status === "Clean / Ready" || c.status === "Approved" || c.status === "Paid"
    ).length;
    const cleanClaimRate =
      claims.length > 0 ? Math.round((cleanClaims / claims.length) * 100) : 96;
    const totalPendingRevenue = claims
      .filter((c) => c.status !== "Paid" && c.status !== "Denied")
      .reduce((sum, c) => sum + c.amount, 0);
    const lowStockCount = medications.filter(
      (m) => m.status === "Low Stock" || m.status === "Critical Low"
    ).length;
    const openSignalsCount = signals.filter((s) => s.status === "open").length;
    const compliantConsent = consentRecords.filter((c) => c.status === "Compliant").length;
    const complianceScore =
      consentRecords.length > 0
        ? Math.round((compliantConsent / consentRecords.length) * 1000) / 10
        : 98.4;

    const throughputBars =
      timeRange === "7 days"
        ? [60, 72, 64, 81, 67, 73, 86, 72, 78, 69, 92, 80]
        : timeRange === "30 days"
        ? [72, 82, 77, 89, 70, 78, 91, 84, 88, 80, 94, 86]
        : [76, 62, 83, 55, 72, 47, 68, 88, 59, 76, 91, 67];

    return {
      patientsCount,
      appointmentsCount,
      cleanClaimRate,
      totalPendingRevenue,
      lowStockCount,
      openSignalsCount,
      complianceScore,
      throughputBars,
    };
  }, [appointments, claims, medications, signals, consentRecords, timeRange]);

  return (
    <MedFlowContext.Provider
      value={{
        selectedModule,
        setSelectedModule,
        searchQuery,
        setSearchQuery,
        timeRange,
        setTimeRange,
        notice,
        notify,
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        checkInAppointment,
        claims,
        addClaim,
        updateClaim,
        deleteClaim,
        medications,
        addMedication,
        updateMedication,
        reorderMedication,
        dispenseMedication,
        clinicalNotes,
        addClinicalNote,
        updateClinicalNote,
        signClinicalNote,
        consentRecords,
        addConsentRecord,
        updateConsentRecord,
        runComplianceAuditScan,
        isScanningCompliance,
        signals,
        resolveSignal,
        dismissSignal,
        executeSignalAction,
        activity,
        logActivity,
        notifications,
        markAllNotificationsRead,
        clearNotifications,
        unreadCount,
        settings,
        updateSettings,
        exportAllData,
        overviewMetrics,
      }}
    >
      {children}
    </MedFlowContext.Provider>
  );
};

export const useMedFlow = (): MedFlowContextType => {
  const context = useContext(MedFlowContext);
  if (!context) {
    throw new Error("useMedFlow must be used within a MedFlowProvider");
  }
  return context;
};
