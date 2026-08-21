import React, { useState } from "react";
import {
  CalendarDays,
  FileText,
  PackageSearch,
  ClipboardCheck,
  X,
  Plus,
  Sparkles,
} from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { QuickAction, AppointmentStatus, MedicationCategory, ConsentDocumentType } from "../../types/medflow";

function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export const QuickActionModal: React.FC<{
  initialAction?: QuickAction | null;
  onClose: () => void;
}> = ({ initialAction, onClose }) => {
  const {
    addAppointment,
    addClaim,
    addMedication,
    addConsentRecord,
    settings,
  } = useMedFlow();

  const [activeWorkflow, setActiveWorkflow] = useState<QuickAction | null>(initialAction || null);

  // Appointment Form State
  const [aptName, setAptName] = useState("");
  const [aptDob, setAptDob] = useState("1988-05-14");
  const [aptPhone, setAptPhone] = useState("(555) 304-9821");
  const [aptVisit, setAptVisit] = useState("Primary consultation");
  const [aptDept, setAptDept] = useState<any>("Primary Care");
  const [aptProvider, setAptProvider] = useState("Dr. Sarah Jenkins");
  const [aptTime, setAptTime] = useState("11:30");
  const [aptDate, setAptDate] = useState("2026-08-21");
  const [aptLocation, setAptLocation] = useState("Northstar · Suite 2A");
  const [aptStatus, setAptStatus] = useState<AppointmentStatus>("Confirmed");

  // Claim Form State
  const [claimPatient, setClaimPatient] = useState("");
  const [claimPayer, setClaimPayer] = useState<any>("Northstar Health Payer");
  const [claimAmount, setClaimAmount] = useState<number>(45000);
  const [claimExpected, setClaimExpected] = useState<number>(38000);
  const [claimDiag, setClaimDiag] = useState("I10, R07.9");
  const [claimProc, setClaimProc] = useState("99214, 93000");

  // Medication Form State
  const [medName, setMedName] = useState("");
  const [medGeneric, setMedGeneric] = useState("");
  const [medDosage, setMedDosage] = useState("500mg Tablets");
  const [medCat, setMedCat] = useState<MedicationCategory>("Antibiotics");
  const [medStock, setMedStock] = useState<number>(100);
  const [medUnit, setMedUnit] = useState("bottles (100ct)");
  const [medThreshold, setMedThreshold] = useState<number>(40);
  const [medCost, setMedCost] = useState<number>(1850);
  const [medExpiry, setMedExpiry] = useState("2028-01-01");
  const [medLocation, setMedLocation] = useState("Main Pharmacy · Shelf B-02");

  // Consent Form State
  const [consentPatient, setConsentPatient] = useState("");
  const [consentDocType, setConsentDocType] = useState<ConsentDocumentType>("General Treatment Consent");
  const [consentWitness, setConsentWitness] = useState("Reception Desk · Kiosk 1");

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptName) return;
    addAppointment({
      name: aptName,
      dob: aptDob,
      phone: aptPhone,
      visit: aptVisit,
      department: aptDept,
      provider: aptProvider,
      time: aptTime,
      date: aptDate,
      status: aptStatus,
      location: aptLocation,
      insuranceVerified: true,
      consentSigned: true,
      vitalsRecorded: false,
    });
    onClose();
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimPatient) return;
    addClaim({
      patientName: claimPatient,
      patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      payer: claimPayer,
      serviceDate: "2026-08-20",
      submittedDate: "2026-08-21",
      diagnosisCodes: claimDiag.split(",").map((s) => s.trim()),
      procedureCodes: claimProc.split(",").map((s) => s.trim()),
      amount: Number(claimAmount),
      expectedReimbursement: Number(claimExpected),
      status: "Clean / Ready",
    });
    onClose();
  };

  const handleMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;
    addMedication({
      name: medName,
      genericName: medGeneric || medName,
      dosage: medDosage,
      category: medCat,
      stock: Number(medStock),
      unit: medUnit,
      reorderThreshold: Number(medThreshold),
      unitCost: Number(medCost),
      expiryDate: medExpiry,
      location: medLocation,
      status: "In Stock",
      batchNumber: `LOT-${Math.floor(1000 + Math.random() * 9000)}X`,
    });
    onClose();
  };

  const handleConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentPatient) return;
    addConsentRecord({
      patientName: consentPatient,
      patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      documentType: consentDocType,
      signedDate: "2026-08-21",
      expiryDate: "2027-08-21",
      witnessProvider: consentWitness,
      status: "Compliant",
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
        <div className="flex items-center justify-between border-b border-[#edf4f1] pb-4">
          <div>
            <h2 className="text-[17px] font-bold text-[#163d34]">
              {activeWorkflow ? activeWorkflow : "Operations Quick Action"}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#78918a]">
              Execute end-to-end hospital operational workflows with immediate real-time sync.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workflow Selection Grid */}
        {!activeWorkflow ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              {
                id: "New appointment",
                desc: "Book and queue a patient arrival",
                icon: CalendarDays,
                tone: "bg-[#e0f0e9] text-[#28775d]",
              },
              {
                id: "Review claims",
                desc: "Submit or adjudicate billing claim",
                icon: FileText,
                tone: "bg-[#f0ecfc] text-[#665b91]",
              },
              {
                id: "Log inventory",
                desc: "Receive medication stock shipment",
                icon: PackageSearch,
                tone: "bg-[#e0f1e8] text-[#28775b]",
              },
              {
                id: "Run consent audit",
                desc: "Capture signed HIPAA or treatment form",
                icon: ClipboardCheck,
                tone: "bg-[#d0f0fd] text-[#0284c7]",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveWorkflow(item.id as QuickAction)}
                  className="flex flex-col items-start gap-2.5 rounded-2xl border border-[#dce9e4] bg-white p-4 text-left transition hover:border-[#8fc1ae] hover:bg-[#f6fbf8] hover:shadow-md"
                >
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", item.tone)}>
                    <Icon size={17} />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#163d34]">{item.id}</h3>
                    <p className="mt-0.5 text-[11px] text-[#839792]">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : activeWorkflow === "New appointment" ? (
          <form onSubmit={handleAppointmentSubmit} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taylor Morgan"
                  value={aptName}
                  onChange={(e) => setAptName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none focus:border-[#529b82]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Date of Birth</label>
                <input
                  type="date"
                  value={aptDob}
                  onChange={(e) => setAptDob(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Department</label>
                <select
                  value={aptDept}
                  onChange={(e) => setAptDept(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                >
                  <option value="Primary Care">Primary Care</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Attending Provider</label>
                <input
                  type="text"
                  value={aptProvider}
                  onChange={(e) => setAptProvider(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Time Slot</label>
                <input
                  type="time"
                  value={aptTime}
                  onChange={(e) => setAptTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Initial Status</label>
                <select
                  value={aptStatus}
                  onChange={(e) => setAptStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="Arriving">Arriving</option>
                  <option value="No-show risk">No-show risk</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Clinic Room</label>
                <input
                  type="text"
                  value={aptLocation}
                  onChange={(e) => setAptLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setActiveWorkflow(null)}
                className="rounded-xl px-3.5 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
              >
                Schedule Appointment
              </button>
            </div>
          </form>
        ) : activeWorkflow === "Review claims" ? (
          <form onSubmit={handleClaimSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Vance"
                value={claimPatient}
                onChange={(e) => setClaimPatient(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none focus:border-[#529b82]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Payer Network</label>
                <select
                  value={claimPayer}
                  onChange={(e) => setClaimPayer(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                >
                  <option value="Northstar Health Payer">Northstar Health Payer</option>
                  <option value="Horizon Blue">Horizon Blue</option>
                  <option value="Aetna Medicare">Aetna Medicare</option>
                  <option value="UnitedHealthcare">UnitedHealthcare</option>
                  <option value="Medicaid Direct">Medicaid Direct</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Billed Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">ICD-10 Diagnosis Codes</label>
                <input
                  type="text"
                  value={claimDiag}
                  onChange={(e) => setClaimDiag(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">CPT Procedure Codes</label>
                <input
                  type="text"
                  value={claimProc}
                  onChange={(e) => setClaimProc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setActiveWorkflow(null)}
                className="rounded-xl px-3.5 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
              >
                File & Transmit Claim
              </button>
            </div>
          </form>
        ) : activeWorkflow === "Log inventory" ? (
          <form onSubmit={handleMedicationSubmit} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Medication Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Azithromycin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Dosage & Form</label>
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Category</label>
                <select
                  value={medCat}
                  onChange={(e) => setMedCat(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                >
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Endocrine & Diabetes">Endocrine</option>
                  <option value="Emergency & Critical">Emergency</option>
                  <option value="Pain & Analgesics">Pain</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Quantity Received</label>
                <input
                  type="number"
                  value={medStock}
                  onChange={(e) => setMedStock(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Unit Cost (₹)</label>
                <input
                  type="number"
                  step="1"
                  value={medCost}
                  onChange={(e) => setMedCost(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Storage Location</label>
                <input
                  type="text"
                  value={medLocation}
                  onChange={(e) => setMedLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Expiry Date</label>
                <input
                  type="date"
                  value={medExpiry}
                  onChange={(e) => setMedExpiry(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setActiveWorkflow(null)}
                className="rounded-xl px-3.5 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
              >
                Post Shipment to Formulary
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConsentSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Patient Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Samuel Jenkins"
                value={consentPatient}
                onChange={(e) => setConsentPatient(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none focus:border-[#529b82]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Consent Form Type</label>
              <select
                value={consentDocType}
                onChange={(e) => setConsentDocType(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
              >
                <option value="General Treatment Consent">General Treatment Consent</option>
                <option value="Surgical & Invasive Procedure Consent">Surgical & Invasive Procedure Consent</option>
                <option value="HIPAA Privacy Notice Acknowledgement">HIPAA Privacy Notice Acknowledgement</option>
                <option value="Telehealth Services Disclosure">Telehealth Services Disclosure</option>
                <option value="Blood Product Transfusion Consent">Blood Product Transfusion Consent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Witness Staff / Kiosk</label>
              <input
                type="text"
                value={consentWitness}
                onChange={(e) => setConsentWitness(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setActiveWorkflow(null)}
                className="rounded-xl px-3.5 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
              >
                Record Validated Consent
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
