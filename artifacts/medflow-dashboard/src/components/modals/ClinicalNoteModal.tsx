import React, { useState } from "react";
import { X, Stethoscope, CheckCircle, Sparkles, FileText, Lock } from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { ClinicalNote, ClinicalNoteStatus } from "../../types/medflow";

export const ClinicalNoteModal: React.FC<{
  note: ClinicalNote;
  onClose: () => void;
}> = ({ note, onClose }) => {
  const { updateClinicalNote, signClinicalNote } = useMedFlow();

  const [subjective, setSubjective] = useState(note.subjective);
  const [objective, setObjective] = useState(note.objective);
  const [assessment, setAssessment] = useState(note.assessment);
  const [plan, setPlan] = useState(note.plan);
  const [status, setStatus] = useState<ClinicalNoteStatus>(note.status);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicalNote(note.id, {
      subjective,
      objective,
      assessment,
      plan,
      status,
    });
    onClose();
  };

  const handleSign = () => {
    signClinicalNote(note.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123b3140] p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-6 shadow-2xl medflow-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#edf4f1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f1e8] text-[#28775b]">
              <Stethoscope size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-[#163d34]">{note.type}</h2>
                <span className="rounded bg-[#d8ebe3] px-2 py-0.5 text-[10px] font-bold text-[#27735e]">
                  {note.patientName}
                </span>
              </div>
              <p className="text-[11px] text-[#78918a]">Author: {note.provider} · Encounter: {note.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]">
            <X size={18} />
          </button>
        </div>

        {/* AI Completeness Banner */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#bce0d2] bg-[#f0f9f5] p-3">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#155f4b]">
            <Sparkles size={15} className="text-[#31a77e]" />
            <span>AI Clinical Documentation Completeness:</span>
            <span className="font-bold">{note.qualityScore}% Match</span>
          </div>
          <span className="text-[10px] text-[#6b8b80]">ICD-10 & billing criteria satisfied</span>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52766b]">
              Subjective (Chief Complaint & History)
            </label>
            <textarea
              rows={2}
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52766b]">
              Objective (Physical Exam & Diagnostics)
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52766b]">
              Assessment (Clinical Impression & Diagnoses)
            </label>
            <textarea
              rows={2}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#52766b]">
              Plan (Treatment, Medications & Follow-up)
            </label>
            <textarea
              rows={3}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#edf4f1] pt-3">
            {note.status !== "Signed & Finalized" ? (
              <button
                type="button"
                onClick={handleSign}
                className="flex items-center gap-1.5 rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-[#0e503e] transition"
              >
                <CheckCircle size={13} /> Sign & Finalize Note
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#258066]">
                <Lock size={13} /> Note Finalized & Signed
              </span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
              >
                Close
              </button>
              <button
                type="submit"
                className="rounded-xl border border-[#dce9e4] bg-white px-4 py-2 text-[11px] font-semibold text-[#163d34] hover:bg-[#f6fbf8]"
              >
                Save Draft
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
