import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Lock,
  Sparkles,
  Send,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { ConsentRecord, ConsentAuditStatus, ConsentDocumentType } from "../../types/medflow";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export function ConsentStatusBadge({ status }: { status: ConsentAuditStatus }) {
  const styles: Record<ConsentAuditStatus, string> = {
    "Compliant": "bg-[#e0f1e8] text-[#28775b]",
    "Missing Signature": "bg-[#fee2e2] text-[#dc2626]",
    "Expired": "bg-[#fef3c7] text-[#d97706]",
    "Pending Renewal": "bg-[#d0f0fd] text-[#0284c7]",
    "Flagged for Review": "bg-[#f3e8ff] text-[#7e22ce]",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tight", styles[status] || "bg-gray-100")}>
      {status}
    </span>
  );
}

export const ComplianceWorkspace: React.FC<{
  onOpenNewConsent: () => void;
  onSelectConsent: (record: ConsentRecord) => void;
}> = ({ onOpenNewConsent, onSelectConsent }) => {
  const {
    consentRecords,
    updateConsentRecord,
    runComplianceAuditScan,
    isScanningCompliance,
    searchQuery,
    setSearchQuery,
    notify,
  } = useMedFlow();

  const [docFilter, setDocFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ConsentAuditStatus>("All");

  const docTypes: (string | ConsentDocumentType)[] = [
    "All",
    "General Treatment Consent",
    "Surgical & Invasive Procedure Consent",
    "HIPAA Privacy Notice Acknowledgement",
    "Telehealth Services Disclosure",
    "Blood Product Transfusion Consent",
  ];

  const filtered = useMemo(() => {
    return consentRecords.filter((rec) => {
      const matchSearch = `${rec.patientName} ${rec.documentType} ${rec.witnessProvider}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchDoc = docFilter === "All" || rec.documentType === docFilter;
      const matchStatus = statusFilter === "All" || rec.status === statusFilter;
      return matchSearch && matchDoc && matchStatus;
    });
  }, [consentRecords, searchQuery, docFilter, statusFilter]);

  const metrics = useMemo(() => {
    const compliantCount = consentRecords.filter((r) => r.status === "Compliant").length;
    const score =
      consentRecords.length > 0
        ? Math.round((compliantCount / consentRecords.length) * 1000) / 10
        : 98.4;
    const expiredCount = consentRecords.filter((r) => r.status === "Expired").length;
    const pendingRenewalCount = consentRecords.filter(
      (r) => r.status === "Pending Renewal" || r.status === "Missing Signature"
    ).length;

    return { score, expiredCount, pendingRenewalCount, total: consentRecords.length };
  }, [consentRecords]);

  return (
    <div className="space-y-6 medflow-rise">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#66877c]">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#dcefe7] text-[#20735b]">
              <ShieldCheck size={13} />
            </span>
            Regulatory Compliance & Consent Audits
          </div>
          <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#163d34]">
            Informed Consent & HIPAA Privacy Registry
          </h2>
          <p className="mt-1 text-[13px] text-[#78918a]">
            Continuous validation of patient disclosure acknowledgements, surgical authorizations, and legal records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => runComplianceAuditScan()}
            disabled={isScanningCompliance}
            className="flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white px-3.5 py-2.5 text-[12px] font-semibold text-[#155f4b] shadow-sm hover:bg-[#edf4f1] transition disabled:opacity-60"
          >
            <RefreshCw size={14} className={isScanningCompliance ? "animate-spin text-[#155f4b]" : ""} />
            {isScanningCompliance ? "Auditing Network..." : "Run Compliance Scan"}
          </button>

          <button
            onClick={onOpenNewConsent}
            className="flex items-center gap-2 rounded-xl bg-[#155f4b] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgba(21,95,75,0.2)] transition hover:bg-[#0e503e]"
          >
            <Plus size={15} /> Record Consent Document
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Overall Facility Compliance Score
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#258066]">{metrics.score}%</p>
          <p className="mt-1 text-[10px] text-[#839792]">Zero critical HIPAA privacy breaches logged</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Pending Digital Signatures
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#0284c7]">
            {metrics.pendingRenewalCount} Documents
          </p>
          <p className="mt-1 text-[10px] text-[#839792]">Dispatched to patient check-in kiosks</p>
        </div>

        <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78918a]">
            Expired Consents Requiring Renewal
          </span>
          <p className="mt-2 text-[22px] font-bold text-[#d97706]">{metrics.expiredCount} Records</p>
          <p className="mt-1 text-[10px] text-[#839792]">Auto-prompt scheduled on next clinic check-in</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#dce9e4] bg-[#fbfdfc] p-5 shadow-[0_8px_25px_rgba(21,76,62,0.04)]">
        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#edf4f1] pb-4">
          <div className="flex flex-wrap gap-1.5">
            {["All", "Compliant", "Expired", "Pending Renewal", "Missing Signature"].map((tab) => (
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
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="rounded-xl border border-[#dce9e4] bg-white px-2.5 py-2 text-[11px] text-[#52766b] outline-none"
            >
              {docTypes.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Document Types" : d}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#9ab0a9]" size={14} />
              <input
                type="text"
                placeholder="Search patient, witness, form..."
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
              No consent records found matching current filters.
            </div>
          ) : (
            <table className="w-full min-w-[750px] text-left">
              <thead className="border-b border-[#e3ede9] text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aaca7]">
                <tr>
                  <th className="py-2.5 font-semibold">Patient Name</th>
                  <th className="py-2.5 font-semibold">Consent Document Type</th>
                  <th className="py-2.5 font-semibold">Witness Provider / Station</th>
                  <th className="py-2.5 font-semibold">Signed Date</th>
                  <th className="py-2.5 font-semibold">Expiration Date</th>
                  <th className="py-2.5 font-semibold">Audit Status</th>
                  <th className="py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => onSelectConsent(rec)}
                    className="group cursor-pointer border-b border-[#edf3f0] last:border-0 hover:bg-[#f3f9f6] transition"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8ebe3] text-[9px] font-bold text-[#27735e]">
                          {rec.patientName.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-[#163d34] group-hover:text-[#0e634d]">
                            {rec.patientName}
                          </p>
                          <p className="text-[10px] text-[#839792]">{rec.patientId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="text-[11px] font-semibold text-[#275d4e]">
                      {rec.documentType}
                    </td>

                    <td className="text-[11px] text-[#163d34]">{rec.witnessProvider}</td>

                    <td className="text-[11px] text-[#839792]">{rec.signedDate}</td>

                    <td className="text-[11px] text-[#839792]">{rec.expiryDate}</td>

                    <td>
                      <ConsentStatusBadge status={rec.status} />
                    </td>

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {rec.status !== "Compliant" && (
                          <button
                            onClick={() => {
                              updateConsentRecord(rec.id, {
                                status: "Compliant",
                                signedDate: "2026-08-21",
                                expiryDate: "2027-08-21",
                              });
                              notify(`Renewed consent recorded for ${rec.patientName}`);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-[#e0f1e8] px-2.5 py-1 text-[10px] font-bold text-[#28775b] hover:bg-[#cfe8dc] transition shadow-sm"
                          >
                            <CheckCircle2 size={11} /> Validate & Sign
                          </button>
                        )}
                        <button
                          onClick={() => onSelectConsent(rec)}
                          className="rounded-lg border border-[#dce9e4] bg-white px-2 py-1 text-[10px] font-semibold text-[#617c74] hover:bg-[#edf4f1]"
                        >
                          View
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
