import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Filter,
  ShieldAlert,
  Send,
  Download,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Claim, ClaimStatus } from "../../types/medflow";
import { formatINR } from "../../lib/utils";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const styles: Record<ClaimStatus, string> = {
    "Clean / Ready": "bg-[#e0f1e8] text-[#28775b]",
    "Under Review": "bg-[#eeeacc] text-[#887a2b]",
    "Flagged Mismatch": "bg-[#fee2e2] text-[#dc2626]",
    "Approved": "bg-[#d0f0fd] text-[#0284c7]",
    "Paid": "bg-[#dcfce7] text-[#15803d]",
    "Denied": "bg-[#f3f4f6] text-[#4b5563]",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tight", styles[status] || "bg-gray-100")}>
      {status}
    </span>
  );
}

export const BillingWorkspace: React.FC<{
  onOpenNewClaim: () => void;
  onSelectClaim: (claim: Claim) => void;
}> = ({ onOpenNewClaim, onSelectClaim }) => {
  const {
    claims,
    updateClaim,
    searchQuery,
    setSearchQuery,
    notify,
  } = useMedFlow();

  const [statusFilter, setStatusFilter] = useState<"All" | ClaimStatus>("All");
  const [payerFilter, setPayerFilter] = useState<string>("All");

  const payers = [
    "All",
    "Northstar Health Payer",
    "Horizon Blue",
    "Aetna Medicare",
    "UnitedHealthcare",
    "Medicaid Direct",
  ];

  const filtered = useMemo(() => {
    return claims.filter((claim) => {
      const matchSearch = `${claim.id} ${claim.patientName} ${claim.payer} ${claim.diagnosisCodes.join(" ")} ${claim.procedureCodes.join(" ")}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || claim.status === statusFilter;
      const matchPayer = payerFilter === "All" || claim.payer === payerFilter;
      return matchSearch && matchStatus && matchPayer;
    });
  }, [claims, searchQuery, statusFilter, payerFilter]);

  const metrics = useMemo(() => {
    const totalBilled = claims.reduce((acc, c) => acc + c.amount, 0);
    const totalPending = claims
      .filter((c) => c.status !== "Paid" && c.status !== "Denied")
      .reduce((acc, c) => acc + c.amount, 0);
    const cleanCount = claims.filter(
      (c) => c.status === "Clean / Ready" || c.status === "Approved" || c.status === "Paid"
    ).length;
    const cleanRate = claims.length > 0 ? Math.round((cleanCount / claims.length) * 100) : 96;
    const flaggedCount = claims.filter((c) => c.status === "Flagged Mismatch").length;

    return { totalBilled, totalPending, cleanRate, flaggedCount };
  }, [claims]);

  return (
    <div className="space-y-6 medflow-rise">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e5e2f0] text-[#665b91]">
              <FileText size={13} />
            </span>
            Revenue Cycle & Billing Operations
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">
            Claims Adjudication & Payer Gateway
          </h2>
          <p className="mt-1 text-[13px] text-[#78918a]">
            Continuous real-time claim inspection, fee schedule verification, and automated dispute generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewClaim}
            className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]"
          >
            <Plus size={15} /> File New Claim
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Total Billed
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#163d34]">
            {formatINR(metrics.totalBilled)}
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">{claims.length} claims in ledger</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Pending Adjudication
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#b56b4e]">
            {formatINR(metrics.totalPending)}
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">Awaiting payer ACH transfer</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Clean Submission Rate
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#258066]">{metrics.cleanRate}%</p>
          <p className="mt-1 text-[10px] text-[#839792]">+4.2% over target benchmark</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Payer Flagged Audits
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#dc2626]">{metrics.flaggedCount} Mismatches</p>
          <p className="mt-1 text-[10px] text-[#839792]">Automated appeal drafts ready</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#edf4f1] pb-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              "All",
              "Flagged Mismatch",
              "Under Review",
              "Clean / Ready",
              "Approved",
              "Paid",
            ].map((tab) => (
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

          {/* Filters & Search */}
          <div className="flex items-center gap-2.5">
            <select
              value={payerFilter}
              onChange={(e) => setPayerFilter(e.target.value)}
              className="rounded-xl border border-[#dce9e4] bg-white px-2.5 py-2 text-[11px] text-[#52766b] outline-none"
            >
              {payers.map((p) => (
                <option key={p} value={p}>
                  {p === "All" ? "All Payers" : p}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#9ab0a9]" size={14} />
              <input
                type="text"
                placeholder="Search claim, patient, CPT code..."
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
              No claims found matching filters.
            </div>
          ) : (
            <table className="w-full min-w-[750px] text-left">
              <thead className="border-b border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]">
                <tr>
                  <th className="py-2.5 font-semibold">Claim ID & Patient</th>
                  <th className="py-2.5 font-semibold">Payer Network</th>
                  <th className="py-2.5 font-semibold">ICD-10 / CPT Codes</th>
                  <th className="py-2.5 font-semibold">Billed Amount</th>
                  <th className="py-2.5 font-semibold">Service Date</th>
                  <th className="py-2.5 font-semibold">Adjudication Status</th>
                  <th className="py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => onSelectClaim(claim)}
                    className="group cursor-pointer border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6] transition"
                  >
                    <td className="py-3.5">
                      <div>
                        <span className="text-[13px] font-bold text-[#163d34] group-hover:text-[#0e634d]">
                          {claim.id}
                        </span>
                        <p className="text-[11px] font-medium text-[#52766b]">{claim.patientName}</p>
                      </div>
                    </td>

                    <td className="text-[11px]">
                      <p className="font-semibold text-[#163d34]">{claim.payer}</p>
                      <p className="text-[10px] text-[#839792]">Expected: {formatINR(claim.expectedReimbursement)}</p>
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1">
                        {claim.diagnosisCodes.map((code) => (
                          <span
                            key={code}
                            className="rounded bg-[#edf4f1] px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#275d4e]"
                          >
                            {code}
                          </span>
                        ))}
                        {claim.procedureCodes.map((code) => (
                          <span
                            key={code}
                            className="rounded bg-[#f0ecfc] px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#665b91]"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="text-[13px] font-bold text-[#163d34]">
                      {formatINR(claim.amount)}
                    </td>

                    <td className="text-[11px] text-[#839792]">{claim.serviceDate}</td>

                    <td>
                      <ClaimStatusBadge status={claim.status} />
                      {claim.flagReason && (
                        <span className="block mt-0.5 text-[9px] text-[#dc2626] truncate max-w-[150px]">
                          {claim.flagReason}
                        </span>
                      )}
                    </td>

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {claim.status === "Flagged Mismatch" && (
                          <button
                            onClick={() => {
                              updateClaim(claim.id, {
                                status: "Under Review",
                                notes: "Appealed with contract rate schedule",
                              });
                              notify(`Appeal submitted for ${claim.id}`);
                            }}
                            className="rounded-lg bg-[#fee2e2] px-2.5 py-1 text-[10px] font-bold text-[#dc2626] hover:bg-[#fecaca] transition"
                          >
                            Appeal
                          </button>
                        )}
                        {claim.status === "Clean / Ready" && (
                          <button
                            onClick={() => {
                              updateClaim(claim.id, { status: "Under Review" });
                              notify(`Claim ${claim.id} transmitted to payer gateway`);
                            }}
                            className="rounded-lg bg-[#e0f1e8] px-2.5 py-1 text-[10px] font-bold text-[#28775b] hover:bg-[#cfe8dc] transition"
                          >
                            Transmit
                          </button>
                        )}
                        {claim.status === "Approved" && (
                          <button
                            onClick={() => {
                              updateClaim(claim.id, { status: "Paid" });
                              notify(`Payment posted for claim ${claim.id}`);
                            }}
                            className="rounded-lg bg-[#dcfce7] px-2.5 py-1 text-[10px] font-bold text-[#15803d] hover:bg-[#bbf7d0] transition"
                          >
                            Post Payment
                          </button>
                        )}
                        <button
                          onClick={() => onSelectClaim(claim)}
                          className="rounded-lg border border-[#dce9e4] bg-white px-2 py-1 text-[10px] font-semibold text-[#617c74] hover:bg-[#edf4f1]"
                        >
                          Details
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
