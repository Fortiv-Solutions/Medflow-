import React, { useState } from "react";
import { X, FileText, DollarSign, AlertCircle, CheckCircle2, Send, Trash2 } from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Claim, ClaimStatus } from "../../types/medflow";
import { formatINR } from "../../lib/utils";

export const ClaimDetailModal: React.FC<{
  claim: Claim;
  onClose: () => void;
}> = ({ claim, onClose }) => {
  const { updateClaim, deleteClaim, notify } = useMedFlow();

  const [status, setStatus] = useState<ClaimStatus>(claim.status);
  const [notes, setNotes] = useState(claim.notes || "");
  const [flagReason, setFlagReason] = useState(claim.flagReason || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateClaim(claim.id, {
      status,
      notes,
      flagReason,
    });
    onClose();
  };

  const handleAppeal = () => {
    updateClaim(claim.id, {
      status: "Under Review",
      notes: "Contract rate appeal auto-dispatched with fee schedule Exhibit B.",
      flagReason: undefined,
    });
    notify(`Payer appeal filed for claim ${claim.id}`);
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
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-[#163d34]">{claim.id}</h2>
              <span className="rounded bg-[#f0ecfc] px-2 py-0.5 text-[10px] font-bold text-[#665b91]">
                {claim.payer}
              </span>
            </div>
            <p className="text-[11px] text-[#78918a]">Patient: {claim.patientName} ({claim.patientId})</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Total Billed</span>
              <p className="text-[18px] font-bold text-[#163d34] mt-0.5">{formatINR(claim.amount)}</p>
              <p className="text-[#65857b]">Expected: {formatINR(claim.expectedReimbursement)}</p>
            </div>
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Service Dates</span>
              <p className="font-semibold text-[#163d34] mt-0.5">Service: {claim.serviceDate}</p>
              <p className="text-[#65857b]">Submitted: {claim.submittedDate}</p>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-[#52766b] mb-1.5">Submitted Medical Codes</span>
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#879b95] uppercase">ICD-10 Diagnoses:</span>
                <div className="flex gap-1">
                  {claim.diagnosisCodes.map((c) => (
                    <span key={c} className="rounded bg-[#edf4f1] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#275d4e]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#879b95] uppercase">CPT Procedures:</span>
                <div className="flex gap-1">
                  {claim.procedureCodes.map((c) => (
                    <span key={c} className="rounded bg-[#f0ecfc] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#665b91]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#52766b]">Adjudication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClaimStatus)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] font-semibold text-[#163d34] outline-none"
            >
              <option value="Clean / Ready">Clean / Ready</option>
              <option value="Under Review">Under Review</option>
              <option value="Flagged Mismatch">Flagged Mismatch</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Denied">Denied</option>
            </select>
          </div>

          {claim.status === "Flagged Mismatch" && (
            <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#c2410c]">
                <AlertCircle size={14} /> Payer Discrepancy Detected
              </div>
              <p className="mt-1 text-[11px] text-[#9a3412]">
                {claim.flagReason || "Adjudicated fee is lower than contractual minimum."}
              </p>
              <button
                type="button"
                onClick={handleAppeal}
                className="mt-2 flex items-center gap-1 rounded-lg bg-[#ea580c] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-[#c2410c] transition"
              >
                <Send size={11} /> Auto-Generate Contractual Dispute
              </button>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#52766b]">Auditor / Payer Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#edf4f1] pt-3">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete claim ${claim.id}?`)) {
                  deleteClaim(claim.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#dc2626] hover:underline"
            >
              <Trash2 size={13} /> Delete Claim
            </button>

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
                className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
