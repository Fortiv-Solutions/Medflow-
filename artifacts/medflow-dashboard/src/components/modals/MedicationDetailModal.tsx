import React, { useState } from "react";
import { X, PackageSearch, RefreshCw, MinusCircle, PlusCircle, Thermometer, ShieldAlert } from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Medication, MedicationStatus } from "../../types/medflow";
import { formatINR } from "../../lib/utils";

export const MedicationDetailModal: React.FC<{
  medication: Medication;
  onClose: () => void;
}> = ({ medication, onClose }) => {
  const { updateMedication, reorderMedication, dispenseMedication } = useMedFlow();

  const [stock, setStock] = useState<number>(medication.stock);
  const [reorderThreshold, setReorderThreshold] = useState<number>(medication.reorderThreshold);
  const [location, setLocation] = useState(medication.location);
  const [expiryDate, setExpiryDate] = useState(medication.expiryDate);
  const [status, setStatus] = useState<MedicationStatus>(medication.status);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedication(medication.id, {
      stock: Number(stock),
      reorderThreshold: Number(reorderThreshold),
      location,
      expiryDate,
      status,
    });
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
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7f3] text-[#28775b]">
              <Thermometer size={18} />
            </span>
            <div>
              <h2 className="text-[17px] font-bold text-[#163d34]">{medication.name}</h2>
              <p className="text-[11px] text-[#78918a]">{medication.genericName} · {medication.dosage}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Category</span>
              <p className="font-semibold text-[#163d34] mt-0.5">{medication.category}</p>
            </div>
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Unit Cost</span>
              <p className="font-semibold text-[#163d34] mt-0.5">{formatINR(medication.unitCost)}</p>
            </div>
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">LOT Batch</span>
              <p className="font-mono text-[#163d34] mt-0.5 font-bold">{medication.batchNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Current Stock Units</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] font-bold text-[#163d34] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Reorder Trigger Threshold</label>
              <input
                type="number"
                value={reorderThreshold}
                onChange={(e) => setReorderThreshold(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Vault / Shelf Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
              />
            </div>
          </div>

          {/* Instant Operations */}
          <div className="rounded-xl border border-[#e2efe9] bg-[#f8fcfa] p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#163d34]">One-Click Stock Actions</p>
              <p className="text-[10px] text-[#708a82]">Instant vendor shipment order</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  reorderMedication(medication.id, 100);
                  setStock((s) => s + 100);
                }}
                className="flex items-center gap-1 rounded-lg bg-[#e0f1e8] px-3 py-1.5 text-[10px] font-bold text-[#28775b] hover:bg-[#cfe8dc]"
              >
                <RefreshCw size={12} /> Reorder +100 Units
              </button>
            </div>
          </div>

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
              Update Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
