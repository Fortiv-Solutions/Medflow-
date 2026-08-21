import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  UserCheck,
  AlertCircle,
  FileCheck,
  Stethoscope,
  ChevronRight,
  Filter,
  Phone,
  Building,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Appointment, AppointmentStatus } from "../../types/medflow";
import { StatusPill } from "./OverviewWorkspace";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export const FrontWorkspace: React.FC<{
  onOpenNewAppointment: () => void;
  onSelectAppointment: (apt: Appointment) => void;
}> = ({ onOpenNewAppointment, onSelectAppointment }) => {
  const {
    appointments,
    checkInAppointment,
    updateAppointment,
    deleteAppointment,
    searchQuery,
    setSearchQuery,
    notify,
  } = useMedFlow();

  const [activeTab, setActiveTab] = useState<"All" | AppointmentStatus>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");

  const departments = ["All", "Cardiology", "Primary Care", "Pediatrics", "Orthopedics", "Neurology", "Oncology"];

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const matchSearch = `${apt.name} ${apt.visit} ${apt.provider} ${apt.phone} ${apt.location}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchTab = activeTab === "All" || apt.status === activeTab;
      const matchDept = selectedDept === "All" || apt.department === selectedDept;
      return matchSearch && matchTab && matchDept;
    });
  }, [appointments, searchQuery, activeTab, selectedDept]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      checkedIn: appointments.filter((a) => a.status === "Checked-in").length,
      inExam: appointments.filter((a) => a.status === "In Exam").length,
      confirmed: appointments.filter((a) => a.status === "Confirmed").length,
      arriving: appointments.filter((a) => a.status === "Arriving").length,
      noShowRisk: appointments.filter((a) => a.status === "No-show risk").length,
      completed: appointments.filter((a) => a.status === "Completed").length,
    };
  }, [appointments]);

  return (
    <div className="space-y-6 medflow-rise">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dcefe7] text-[#20735b]">
              <CalendarDays size={13} />
            </span>
            Front Desk Operations
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">
            Patient Scheduling & Intake Queue
          </h2>
          <p className="mt-1 text-[13px] text-[#78918a]">
            Manage patient arrivals, real-time check-ins, insurance verification, and room allocations.
          </p>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]"
        >
          <Plus size={15} /> Book Appointment
        </button>
      </div>

      {/* Intake Readiness summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
              Active in Clinic
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d0f0fd] text-[#0284c7]">
              <UserCheck size={15} />
            </span>
          </div>
          <p className="mt-2 text-[24px] font-bold text-[#163d34]">
            {counts.checkedIn + counts.inExam} Patients
          </p>
          <p className="mt-1 text-[11px] text-[#839792]">
            {counts.checkedIn} in waiting room · {counts.inExam} currently with doctor
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
              Upcoming Arrivals
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e0f1e8] text-[#28775b]">
              <Clock3 size={15} />
            </span>
          </div>
          <p className="mt-2 text-[24px] font-bold text-[#163d34]">
            {counts.confirmed + counts.arriving} Scheduled
          </p>
          <p className="mt-1 text-[11px] text-[#839792]">
            All digital intake forms dispatched
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
              No-Show Risk Flag
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f9eadc] text-[#b96e3a]">
              <AlertCircle size={15} />
            </span>
          </div>
          <p className="mt-2 text-[24px] font-bold text-[#b96e3a]">
            {counts.noShowRisk} Slots at risk
          </p>
          <p className="mt-1 text-[11px] text-[#839792]">
            Automated SMS follow-up queued
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#edf4f1] pb-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "All", count: counts.all },
              { label: "Checked-in", count: counts.checkedIn },
              { label: "In Exam", count: counts.inExam },
              { label: "Confirmed", count: counts.confirmed },
              { label: "Arriving", count: counts.arriving },
              { label: "No-show risk", count: counts.noShowRisk },
              { label: "Completed", count: counts.completed },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label as any)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition",
                  activeTab === tab.label
                    ? "bg-[#155f4b] text-white shadow-sm"
                    : "bg-[#edf4f1] text-[#617c74] hover:bg-[#e2ede8]"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[9px] font-bold",
                    activeTab === tab.label ? "bg-white/20 text-white" : "bg-[#d8e7e1] text-[#2c6555]"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Dept Filter */}
          <div className="flex items-center gap-2.5">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-[#dce9e4] bg-white px-2.5 py-2 text-[11px] text-[#52766b] outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Departments" : d}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#9ab0a9]" size={14} />
              <input
                type="text"
                placeholder="Search patient, phone, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] rounded-xl border border-[#dce9e4] bg-white pl-9 pr-3 py-2 text-[11px] text-[#163d34] outline-none placeholder:text-[#9ab0a9] focus:border-[#529b82]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[12px] text-[#839792]">
              No patients found matching the criteria.
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]">
                <tr>
                  <th className="py-2.5 font-semibold">Patient Name</th>
                  <th className="py-2.5 font-semibold">Visit Reason & Dept</th>
                  <th className="py-2.5 font-semibold">Provider & Room</th>
                  <th className="py-2.5 font-semibold">Time</th>
                  <th className="py-2.5 font-semibold">Intake Checklist</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 text-right font-semibold">Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => (
                  <tr
                    key={apt.id}
                    onClick={() => onSelectAppointment(apt)}
                    className="group cursor-pointer border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6] transition"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8ebe3] text-[10px] font-bold text-[#27735e]">
                          {apt.initials}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-[#163d34] group-hover:text-[#0e634d]">
                            {apt.name}
                          </p>
                          <p className="text-[10px] text-[#879b95]">DOB: {apt.dob}</p>
                        </div>
                      </div>
                    </td>

                    <td className="text-[11px]">
                      <p className="font-semibold text-[#163d34]">{apt.visit}</p>
                      <p className="text-[10px] text-[#839792]">{apt.department}</p>
                    </td>

                    <td className="text-[11px]">
                      <p className="font-semibold text-[#275d4e]">{apt.provider}</p>
                      <p className="text-[10px] text-[#839792]">{apt.location}</p>
                    </td>

                    <td className="text-[12px] font-bold text-[#163d34]">{apt.time}</td>

                    <td>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span
                          title={apt.insuranceVerified ? "Insurance Verified" : "Insurance Unverified"}
                          className={cn(
                            "rounded px-1.5 py-0.5 font-semibold",
                            apt.insuranceVerified ? "bg-[#e0f1e8] text-[#28775b]" : "bg-[#fbe9e7] text-[#c62828]"
                          )}
                        >
                          INS
                        </span>
                        <span
                          title={apt.consentSigned ? "Consent Signed" : "Consent Missing"}
                          className={cn(
                            "rounded px-1.5 py-0.5 font-semibold",
                            apt.consentSigned ? "bg-[#e0f1e8] text-[#28775b]" : "bg-[#fff3e0] text-[#e65100]"
                          )}
                        >
                          CONSENT
                        </span>
                        <span
                          title={apt.vitalsRecorded ? "Vitals Captured" : "Vitals Pending"}
                          className={cn(
                            "rounded px-1.5 py-0.5 font-semibold",
                            apt.vitalsRecorded ? "bg-[#e0f1e8] text-[#28775b]" : "bg-[#ede7f6] text-[#5e35b1]"
                          )}
                        >
                          VITALS
                        </span>
                      </div>
                    </td>

                    <td>
                      <StatusPill status={apt.status} />
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {apt.status !== "Checked-in" && apt.status !== "In Exam" && apt.status !== "Completed" && (
                          <button
                            onClick={() => checkInAppointment(apt.id)}
                            className="rounded-lg bg-[#e0f1e8] px-2.5 py-1 text-[10px] font-bold text-[#28775b] hover:bg-[#cfe8dc] transition shadow-sm"
                          >
                            Check In
                          </button>
                        )}
                        {apt.status === "Checked-in" && (
                          <button
                            onClick={() => updateAppointment(apt.id, { status: "In Exam" })}
                            className="rounded-lg bg-[#ede9fe] px-2.5 py-1 text-[10px] font-bold text-[#7c3aed] hover:bg-[#ddd6fe] transition"
                          >
                            Send to Exam
                          </button>
                        )}
                        {apt.status === "In Exam" && (
                          <button
                            onClick={() => updateAppointment(apt.id, { status: "Completed" })}
                            className="rounded-lg bg-[#dce9f3] px-2.5 py-1 text-[10px] font-bold text-[#42708a] hover:bg-[#cbe0ee] transition"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => onSelectAppointment(apt)}
                          className="rounded-lg border border-[#dce9e4] bg-white px-2 py-1 text-[10px] font-semibold text-[#617c74] hover:bg-[#edf4f1]"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
