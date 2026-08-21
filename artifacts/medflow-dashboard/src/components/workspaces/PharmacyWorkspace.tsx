import React, { useState, useMemo } from "react";
import {
  PackageSearch,
  Plus,
  Search,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  MinusCircle,
  Clock,
  Sparkles,
  Layers,
  Thermometer,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Medication, MedicationCategory, MedicationStatus } from "../../types/medflow";
import { formatINR } from "../../lib/utils";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export function MedicationStatusBadge({ status }: { status: MedicationStatus }) {
  const styles: Record<MedicationStatus, string> = {
    "In Stock": "bg-[#e0f1e8] text-[#28775b]",
    "Low Stock": "bg-[#fff3e0] text-[#e65100]",
    "Critical Low": "bg-[#fee2e2] text-[#dc2626]",
    "Expired": "bg-[#f3f4f6] text-[#6b7280]",
    "Reordered": "bg-[#d0f0fd] text-[#0284c7]",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tight", styles[status] || "bg-gray-100")}>
      {status}
    </span>
  );
}

export const PharmacyWorkspace: React.FC<{
  onOpenNewMedication: () => void;
  onSelectMedication: (med: Medication) => void;
}> = ({ onOpenNewMedication, onSelectMedication }) => {
  const {
    medications,
    reorderMedication,
    dispenseMedication,
    searchQuery,
    setSearchQuery,
    notify,
  } = useMedFlow();

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [urgencyFilter, setUrgencyFilter] = useState<"All" | MedicationStatus>("All");
  const [dispenseModalMed, setDispenseModalMed] = useState<Medication | null>(null);
  const [dispenseAmount, setDispenseAmount] = useState<number>(5);

  const categories: (string | MedicationCategory)[] = [
    "All",
    "Antibiotics",
    "Cardiology",
    "Endocrine & Diabetes",
    "Pain & Analgesics",
    "Emergency & Critical",
    "Respiratory",
  ];

  const filtered = useMemo(() => {
    return medications.filter((med) => {
      const matchSearch = `${med.name} ${med.genericName} ${med.dosage} ${med.batchNumber} ${med.location}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "All" || med.category === categoryFilter;
      const matchUrgency = urgencyFilter === "All" || med.status === urgencyFilter;
      return matchSearch && matchCategory && matchUrgency;
    });
  }, [medications, searchQuery, categoryFilter, urgencyFilter]);

  const metrics = useMemo(() => {
    const totalItems = medications.reduce((acc, m) => acc + m.stock, 0);
    const valuation = medications.reduce((acc, m) => acc + m.stock * m.unitCost, 0);
    const lowStockCount = medications.filter(
      (m) => m.status === "Low Stock" || m.status === "Critical Low"
    ).length;
    return { totalItems, valuation, lowStockCount };
  }, [medications]);

  const handleDispenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dispenseModalMed) {
      dispenseMedication(dispenseModalMed.id, dispenseAmount);
      setDispenseModalMed(null);
      setDispenseAmount(5);
    }
  };

  return (
    <div className="space-y-6 medflow-rise">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e0f1e8] text-[#28775b]">
              <PackageSearch size={13} />
            </span>
            Pharmacy & Formulary Inventory
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">
            Medication Stock & Dispensing Guard
          </h2>
          <p className="mt-1 text-[13px] text-[#78918a]">
            Track inventory velocity, automate supplier reorders, and enforce lot expiry controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewMedication}
            className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]"
          >
            <Plus size={15} /> Log Stock Shipment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Total Formulary Valuation
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#163d34]">
            {formatINR(metrics.valuation)}
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">{medications.length} registered pharmaceutical SKUs</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Low Stock Alerts
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#e65100]">
            {metrics.lowStockCount} SKUs below threshold
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">Automated vendor purchase order drafts available</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Active Total Stock Units
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#258066]">
            {metrics.totalItems.toLocaleString()} Units
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">100% compliant lot tracking</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#edf4f1] pb-4">
          {/* Urgency Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {["All", "Low Stock", "Critical Low", "In Stock"].map((tab) => (
              <button
                key={tab}
                onClick={() => setUrgencyFilter(tab as any)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-[11px] font-semibold transition",
                  urgencyFilter === tab
                    ? "bg-[#155f4b] text-white shadow-sm"
                    : "bg-[#edf4f1] text-[#617c74] hover:bg-[#e2ede8]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Category & Search */}
          <div className="flex items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-[#dce9e4] bg-white px-2.5 py-2 text-[11px] text-[#52766b] outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#9ab0a9]" size={14} />
              <input
                type="text"
                placeholder="Search medication, LOT #, shelf..."
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
              No medications found matching current filters.
            </div>
          ) : (
            <table className="w-full min-w-[750px] text-left">
              <thead className="border-b border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]">
                <tr>
                  <th className="py-2.5 font-semibold">Medication & Dosage</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Stock Level & Unit</th>
                  <th className="py-2.5 font-semibold">Reorder Min</th>
                  <th className="py-2.5 font-semibold">Location / LOT</th>
                  <th className="py-2.5 font-semibold">Expiry Date</th>
                  <th className="py-2.5 font-semibold">Stock Status</th>
                  <th className="py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((med) => (
                  <tr
                    key={med.id}
                    onClick={() => onSelectMedication(med)}
                    className="group cursor-pointer border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6] transition"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef7f3] text-[#28775b]">
                          <Thermometer size={14} />
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-[#163d34] group-hover:text-[#0e634d]">
                            {med.name}
                          </p>
                          <p className="text-[10px] text-[#839792]">{med.dosage}</p>
                        </div>
                      </div>
                    </td>

                    <td className="text-[11px] font-medium text-[#52766b]">{med.category}</td>

                    <td className="text-[12px]">
                      <span className="font-bold text-[#163d34]">{med.stock}</span>{" "}
                      <span className="text-[10px] text-[#839792]">{med.unit}</span>
                    </td>

                    <td className="text-[11px] text-[#718a83]">{med.reorderThreshold} units</td>

                    <td className="text-[11px]">
                      <p className="font-semibold text-[#163d34]">{med.location}</p>
                      <p className="text-[9px] font-mono text-[#839792]">{med.batchNumber}</p>
                    </td>

                    <td className="text-[11px] text-[#839792]">{med.expiryDate}</td>

                    <td>
                      <MedicationStatusBadge status={med.status} />
                    </td>

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => reorderMedication(med.id, 100)}
                          className="flex items-center gap-1 rounded-lg bg-[#e0f1e8] px-2.5 py-1 text-[10px] font-bold text-[#28775b] hover:bg-[#cfe8dc] transition shadow-sm"
                          title="Instant 100-unit vendor reorder"
                        >
                          <RefreshCw size={11} /> Reorder +100
                        </button>

                        <button
                          onClick={() => {
                            setDispenseModalMed(med);
                            setDispenseAmount(1);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-[#f0f4f8] px-2.5 py-1 text-[10px] font-semibold text-[#3b82f6] hover:bg-[#e1ebf5] transition"
                        >
                          <MinusCircle size={11} /> Dispense
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

      {/* Dispense Modal */}
      {dispenseModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl medflow-rise">
            <h3 className="text-[16px] font-bold text-[#163d34]">
              Dispense Medication
            </h3>
            <p className="mt-1 text-[12px] text-[#78918a]">
              {dispenseModalMed.name} ({dispenseModalMed.dosage}) · Current Stock: {dispenseModalMed.stock}
            </p>

            <form onSubmit={handleDispenseSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">
                  Units to Dispense
                </label>
                <input
                  type="number"
                  min={1}
                  max={dispenseModalMed.stock}
                  value={dispenseAmount}
                  onChange={(e) => setDispenseAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] p-2.5 text-[13px] font-bold text-[#163d34] outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispenseModalMed(null)}
                  className="rounded-xl px-3 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
                >
                  Confirm Dispensing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
