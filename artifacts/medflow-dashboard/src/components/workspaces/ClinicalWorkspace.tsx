import React, { useState, useMemo } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  FileCheck,
  Edit3,
  CheckCircle,
  Clock,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { ClinicalNote, ClinicalNoteStatus, ClinicalNoteType } from "../../types/medflow";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export function ClinicalNoteStatusBadge({ status }: { status: ClinicalNoteStatus }) {
  const styles: Record<ClinicalNoteStatus, string> = {
    "Signed & Finalized": "bg-[#e0f1e8] text-[#28775b]",
    "Pending Attending Review": "bg-[#fff3e0] text-[#e65100]",
    "Draft": "bg-[#f3f4f6] text-[#4b5563]",
    "Audit Flagged": "bg-[#fee2e2] text-[#dc2626]",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tight", styles[status] || "bg-gray-100")}>
      {status}
    </span>
  );
}

export const ClinicalWorkspace: React.FC<{
  onOpenNewNote: () => void;
  onSelectNote: (note: ClinicalNote) => void;
}> = ({ onOpenNewNote, onSelectNote }) => {
  const {
    clinicalNotes,
    signClinicalNote,
    searchQuery,
    setSearchQuery,
    notify,
  } = useMedFlow();

  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ClinicalNoteStatus>("All");

  const noteTypes = ["All", "SOAP Note", "Discharge Summary", "Consultation Note", "Operative Summary", "Progress Note"];

  const filtered = useMemo(() => {
    return clinicalNotes.filter((note) => {
      const matchSearch = `${note.patientName} ${note.provider} ${note.type} ${note.assessment}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "All" || note.type === typeFilter;
      const matchStatus = statusFilter === "All" || note.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [clinicalNotes, searchQuery, typeFilter, statusFilter]);

  const metrics = useMemo(() => {
    const signedCount = clinicalNotes.filter((n) => n.status === "Signed & Finalized").length;
    const pendingCount = clinicalNotes.filter((n) => n.status === "Pending Attending Review").length;
    const avgQuality =
      clinicalNotes.length > 0
        ? Math.round(clinicalNotes.reduce((acc, n) => acc + n.qualityScore, 0) / clinicalNotes.length)
        : 98;
    return { signedCount, pendingCount, avgQuality };
  }, [clinicalNotes]);

  return (
    <div className="space-y-6 medflow-rise">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dcefe7] text-[#20735b]">
              <Stethoscope size={13} />
            </span>
            Clinical Documentation & Scribe Operations
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">
            Physician Documentation & Review Queue
          </h2>
          <p className="mt-1 text-[13px] text-[#78918a]">
            Review SOAP notes, operative summaries, and electronic signatures with automated AI completeness scoring.
          </p>
        </div>

        <button
          onClick={onOpenNewNote}
          className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]"
        >
          <Plus size={15} /> Author Clinical Note
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Pending Attending Sign-Off
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#e65100]">
            {metrics.pendingCount} Notes in Queue
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">Ready for final physician review & lock</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Signed & Locked Notes
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#258066]">
            {metrics.signedCount} Completed Notes
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">Directly synchronized with Hospital EHR</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            AI Documentation Quality Score
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#163d34]">
            {metrics.avgQuality}% Completeness
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">Automated ICD-10 & billing compliance match</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#edf4f1] pb-4">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Pending Attending Review", "Signed & Finalized", "Draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab as any)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-[11px] font-semibold transition",
                  statusFilter === tab
                    ? "bg-[#155f4b] text-white shadow-sm"
                    : "bg-[#edf4f1] text-[#617c74] hover:bg-[#e2ede8]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-[#dce9e4] bg-white px-2.5 py-2 text-[11px] text-[#52766b] outline-none"
            >
              {noteTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Note Types" : t}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#9ab0a9]" size={14} />
              <input
                type="text"
                placeholder="Search patient, provider, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[220px] rounded-xl border border-[#dce9e4] bg-white pl-9 pr-3 py-2 text-[11px] text-[#163d34] outline-none placeholder:text-[#9ab0a9] focus:border-[#529b82]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[12px] text-[#839792]">
              No clinical notes found matching current filters.
            </div>
          ) : (
            <table className="w-full min-w-[750px] text-left">
              <thead className="border-b border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]">
                <tr>
                  <th className="py-2.5 font-semibold">Patient Name</th>
                  <th className="py-2.5 font-semibold">Note Type</th>
                  <th className="py-2.5 font-semibold">Authoring Provider</th>
                  <th className="py-2.5 font-semibold">Encounter Date</th>
                  <th className="py-2.5 font-semibold">AI Quality Score</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((note) => (
                  <tr
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className="group cursor-pointer border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6] transition"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8ebe3] text-[9px] font-bold text-[#27735e]">
                          {note.patientName.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-[#163d34] group-hover:text-[#0e634d]">
                            {note.patientName}
                          </p>
                          <p className="text-[10px] text-[#839792]">{note.patientId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="text-[11px] font-semibold text-[#275d4e]">{note.type}</td>

                    <td className="text-[11px] text-[#163d34] font-medium">{note.provider}</td>

                    <td className="text-[11px] text-[#839792]">{note.date}</td>

                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 rounded-full bg-[#e3ede9] overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              note.qualityScore >= 95 ? "bg-[#31a77e]" : "bg-[#e1a24b]"
                            )}
                            style={{ width: `${note.qualityScore}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#163d34]">{note.qualityScore}%</span>
                      </div>
                    </td>

                    <td>
                      <ClinicalNoteStatusBadge status={note.status} />
                    </td>

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {note.status === "Pending Attending Review" && (
                          <button
                            onClick={() => signClinicalNote(note.id)}
                            className="flex items-center gap-1 rounded-lg bg-[#e0f1e8] px-2.5 py-1 text-[10px] font-bold text-[#28775b] hover:bg-[#cfe8dc] transition shadow-sm"
                          >
                            <CheckCircle size={11} /> Sign & Lock
                          </button>
                        )}
                        <button
                          onClick={() => onSelectNote(note)}
                          className="rounded-lg border border-[#dce9e4] bg-white px-2 py-1 text-[10px] font-semibold text-[#617c74] hover:bg-[#edf4f1]"
                        >
                          Review
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
