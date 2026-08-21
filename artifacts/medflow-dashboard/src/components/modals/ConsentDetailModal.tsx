import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { ConsentRecord, ConsentAuditStatus } from "../../types/medflow";

export const ConsentDetailModal: React.FC<{
  record: ConsentRecord;
  onClose: () => void;
}> = ({ record, onClose }) => {
  const { updateConsentRecord, notify } = useMedFlow();

  const [status, setStatus] = useState<ConsentAuditStatus>(record.status);
  const [witnessProvider, setWitnessProvider] = useState(record.witnessProvider);
  const [notes, setNotes] = useState(record.notes || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConsentRecord(record.id, {
      status,
      witnessProvider,
      notes,
    });
    onClose();
  };

  const handleRenew = () => {
    updateConsentRecord(record.id, {
      status: "Compliant",
      signedDate: "2026-08-21",
      expiryDate: "2027-08-21",
      notes: "Digital renewal completed with electronic patient biometric signature.",
    });
    notify(`Consent renewed for ${record.patientName}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123b3140] p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-6 shadow-2xl medflow-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#edf4f1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f1e8] text-[#28775b]">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-[17px] font-bold text-[#163d34]">{record.patientName}</h2>
              <p className="text-[11px] text-[#78918a]">{record.documentType}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Signed Date</span>
              <p className="font-semibold text-[#163d34] mt-0.5">{record.signedDate}</p>
              <p className="text-[#65857b]">Expires: {record.expiryDate}</p>
            </div>
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Witness</span>
              <p className="font-semibold text-[#163d34] mt-0.5">{record.witnessProvider}</p>
              <p className="text-[#65857b]">Patient ID: {record.patientId}</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#52766b]">Compliance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ConsentAuditStatus)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] font-semibold text-[#163d34] outline-none"
            >
              <option value="Compliant">Compliant</option>
              <option value="Missing Signature">Missing Signature</option>
              <option value="Expired">Expired</option>
              <option value="Pending Renewal">Pending Renewal</option>
              <option value="Flagged for Review">Flagged for Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#52766b]">Auditor / Witness Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none resize-none"
            />
          </div>

          {record.status !== "Compliant" && (
            <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#c2410c]">Requires Patient Renewal</p>
                <p className="text-[10px] text-[#9a3412]">Prompt digital signature at front desk</p>
              </div>
              <button
                type="button"
                onClick={handleRenew}
                className="flex items-center gap-1 rounded-lg bg-[#ea580c] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-[#c2410c]"
              >
                <Send size={11} /> Validate & Sign
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[#edf4f1] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3.5 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
