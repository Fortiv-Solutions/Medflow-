import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  CalendarDays,
  FileText,
  PackageSearch,
  Stethoscope,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Download,
  Settings,
  X,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Module } from "../../types/medflow";
import { formatINR } from "../../lib/utils";

export const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectAppointment: (apt: any) => void;
  onSelectClaim: (claim: any) => void;
  onSelectMedication: (med: any) => void;
  onSelectNote: (note: any) => void;
  onOpenSettings: () => void;
}> = ({
  isOpen,
  onClose,
  onSelectAppointment,
  onSelectClaim,
  onSelectMedication,
  onSelectNote,
  onOpenSettings,
}) => {
  const {
    setSelectedModule,
    appointments,
    claims,
    medications,
    clinicalNotes,
    runComplianceAuditScan,
    exportAllData,
    notify,
  } = useMedFlow();

  const [query, setQuery] = useState("");

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        modules: [],
        appointments: [],
        claims: [],
        medications: [],
        clinicalNotes: [],
      };
    }
    const q = query.toLowerCase();

    const matchedModules = [
      { name: "Overview", icon: Activity, desc: "Operational pulse & telemetry" },
      { name: "Front", icon: CalendarDays, desc: "Front desk scheduling & arrivals" },
      { name: "Billing", icon: FileText, desc: "Claims adjudication & payer portal" },
      { name: "Pharmacy", icon: PackageSearch, desc: "Formulary medication stock" },
      { name: "Clinical", icon: Stethoscope, desc: "Physician SOAP notes & scribe" },
      { name: "Compliance", icon: ShieldCheck, desc: "HIPAA audits & consent registry" },
      { name: "Insight", icon: Sparkles, desc: "AI anomaly signals & automations" },
    ].filter((m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));

    const matchedApts = appointments.filter(
      (a) => a.name.toLowerCase().includes(q) || a.visit.toLowerCase().includes(q)
    );

    const matchedClaims = claims.filter(
      (c) => c.id.toLowerCase().includes(q) || c.patientName.toLowerCase().includes(q) || c.payer.toLowerCase().includes(q)
    );

    const matchedMeds = medications.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
    );

    const matchedNotes = clinicalNotes.filter(
      (n) => n.patientName.toLowerCase().includes(q) || n.type.toLowerCase().includes(q)
    );

    return {
      modules: matchedModules,
      appointments: matchedApts,
      claims: matchedClaims,
      medications: matchedMeds,
      clinicalNotes: matchedNotes,
    };
  }, [query, appointments, claims, medications, clinicalNotes]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#123b3140] p-4 pt-16 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] shadow-2xl medflow-rise overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#edf4f1] px-4 py-3.5">
          <Search size={18} className="text-[#688a80]" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, patient name, claim ID, or medication..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[14px] text-[#163d34] outline-none placeholder:text-[#9ab0a9]"
          />
          <kbd className="rounded bg-[#edf4f1] px-2 py-0.5 text-[10px] font-mono text-[#78918a]">ESC</kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
          {!query.trim() ? (
            <div className="p-2 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9aaca7]">Quick Operations</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    runComplianceAuditScan();
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#e2efe9] bg-white p-2.5 text-left text-[11px] font-semibold text-[#163d34] hover:bg-[#eef8f3]"
                >
                  <RefreshCw size={14} className="text-[#155f4b]" />
                  <span>Run Compliance Audit</span>
                </button>
                <button
                  onClick={() => {
                    exportAllData("csv");
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#e2efe9] bg-white p-2.5 text-left text-[11px] font-semibold text-[#163d34] hover:bg-[#eef8f3]"
                >
                  <Download size={14} className="text-[#155f4b]" />
                  <span>Export CSV Ledger</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings();
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#e2efe9] bg-white p-2.5 text-left text-[11px] font-semibold text-[#163d34] hover:bg-[#eef8f3]"
                >
                  <Settings size={14} className="text-[#155f4b]" />
                  <span>Facility Settings</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedModule("Insight");
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#e2efe9] bg-white p-2.5 text-left text-[11px] font-semibold text-[#163d34] hover:bg-[#eef8f3]"
                >
                  <Sparkles size={14} className="text-[#155f4b]" />
                  <span>Review AI Telemetry</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Workspaces */}
              {results.modules && results.modules.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9aaca7]">Workspaces</p>
                  <div className="mt-1 space-y-1">
                    {results.modules.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.name}
                          onClick={() => {
                            setSelectedModule(m.name as Module);
                            onClose();
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#eef8f3] transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e0f1e8] text-[#28775b]">
                              <Icon size={13} />
                            </span>
                            <div>
                              <span className="text-[12px] font-bold text-[#163d34]">{m.name}</span>
                              <span className="ml-2 text-[11px] text-[#839792]">{m.desc}</span>
                            </div>
                          </div>
                          <ArrowRight size={13} className="text-[#88a59c]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Patients / Appointments */}
              {results.appointments && results.appointments.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9aaca7]">Patients & Appointments</p>
                  <div className="mt-1 space-y-1">
                    {results.appointments.map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => {
                          onSelectAppointment(apt);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#eef8f3] transition"
                      >
                        <div>
                          <span className="text-[12px] font-bold text-[#163d34]">{apt.name}</span>
                          <span className="ml-2 text-[11px] text-[#839792]">{apt.visit} · {apt.time}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#28775b]">{apt.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Claims */}
              {results.claims && results.claims.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9aaca7]">Claims</p>
                  <div className="mt-1 space-y-1">
                    {results.claims.map((claim) => (
                      <button
                        key={claim.id}
                        onClick={() => {
                          onSelectClaim(claim);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#eef8f3] transition"
                      >
                        <div>
                          <span className="text-[12px] font-bold text-[#163d34]">{claim.id}</span>
                          <span className="ml-2 text-[11px] text-[#839792]">{claim.patientName} ({formatINR(claim.amount, { showDecimals: false })})</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#665b91]">{claim.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {results.medications && results.medications.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#9aaca7]">Medications</p>
                  <div className="mt-1 space-y-1">
                    {results.medications.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => {
                          onSelectMedication(med);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#eef8f3] transition"
                      >
                        <div>
                          <span className="text-[12px] font-bold text-[#163d34]">{med.name}</span>
                          <span className="ml-2 text-[11px] text-[#839792]">{med.dosage} ({med.stock} in stock)</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#28775b]">{med.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
