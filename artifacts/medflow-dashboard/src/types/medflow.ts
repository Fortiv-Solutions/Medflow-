export type Module =
  | "Overview"
  | "Front"
  | "Billing"
  | "Pharmacy"
  | "Clinical"
  | "Compliance"
  | "Insight";

export type AppointmentStatus =
  | "Confirmed"
  | "Arriving"
  | "Checked-in"
  | "In Exam"
  | "No-show risk"
  | "Completed"
  | "Cancelled";

export type Appointment = {
  id: string;
  name: string;
  dob: string;
  phone: string;
  visit: string;
  department: "Cardiology" | "Primary Care" | "Pediatrics" | "Orthopedics" | "Neurology" | "Oncology";
  provider: string;
  time: string;
  date: string;
  status: AppointmentStatus;
  initials: string;
  location: string;
  insuranceVerified: boolean;
  consentSigned: boolean;
  vitalsRecorded: boolean;
  notes?: string;
};

export type ClaimStatus =
  | "Clean / Ready"
  | "Under Review"
  | "Flagged Mismatch"
  | "Approved"
  | "Denied"
  | "Paid";

export type Claim = {
  id: string;
  patientName: string;
  patientId: string;
  payer: "Northstar Health Payer" | "Horizon Blue" | "Aetna Medicare" | "UnitedHealthcare" | "Medicaid Direct";
  serviceDate: string;
  submittedDate: string;
  diagnosisCodes: string[];
  procedureCodes: string[];
  amount: number;
  expectedReimbursement: number;
  status: ClaimStatus;
  flagReason?: string;
  notes?: string;
};

export type MedicationCategory =
  | "Antibiotics"
  | "Cardiology"
  | "Endocrine & Diabetes"
  | "Pain & Analgesics"
  | "Emergency & Critical"
  | "Respiratory";

export type MedicationStatus =
  | "In Stock"
  | "Low Stock"
  | "Critical Low"
  | "Expired"
  | "Reordered";

export type Medication = {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  category: MedicationCategory;
  stock: number;
  unit: string;
  reorderThreshold: number;
  unitCost: number;
  expiryDate: string;
  location: string;
  status: MedicationStatus;
  batchNumber: string;
};

export type ClinicalNoteType =
  | "SOAP Note"
  | "Discharge Summary"
  | "Consultation Note"
  | "Operative Summary"
  | "Progress Note";

export type ClinicalNoteStatus =
  | "Draft"
  | "Pending Attending Review"
  | "Signed & Finalized"
  | "Audit Flagged";

export type ClinicalNote = {
  id: string;
  patientName: string;
  patientId: string;
  provider: string;
  type: ClinicalNoteType;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  qualityScore: number;
  status: ClinicalNoteStatus;
};

export type ConsentDocumentType =
  | "General Treatment Consent"
  | "Surgical & Invasive Procedure Consent"
  | "HIPAA Privacy Notice Acknowledgement"
  | "Telehealth Services Disclosure"
  | "Blood Product Transfusion Consent";

export type ConsentAuditStatus =
  | "Compliant"
  | "Missing Signature"
  | "Expired"
  | "Pending Renewal"
  | "Flagged for Review";

export type ConsentRecord = {
  id: string;
  patientName: string;
  patientId: string;
  documentType: ConsentDocumentType;
  signedDate: string;
  expiryDate: string;
  witnessProvider: string;
  status: ConsentAuditStatus;
  notes?: string;
};

export type SignalTone = "amber" | "green" | "blue" | "rose";
export type SignalSeverity = "Critical" | "High" | "Medium" | "Optimization";

export type Signal = {
  id: string;
  title: string;
  detail: string;
  category: "Front" | "Billing" | "Pharmacy" | "Clinical" | "Compliance";
  tone: SignalTone;
  severity: SignalSeverity;
  status: "open" | "resolved" | "dismissed";
  timestamp: string;
  recommendedAction: string;
  impact: string;
};

export type ActivityLog = {
  id: string;
  title: string;
  actor: string;
  timestamp: string;
  tone: "amber" | "green" | "blue" | "rose";
  module: Module;
};

export type NotificationItem = {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "alert" | "info" | "success" | "warning";
  targetModule?: Module;
};

export type QuickAction =
  | "New appointment"
  | "Review claims"
  | "Log inventory"
  | "Run consent audit";

export type UserSettings = {
  facilityName: string;
  operatorName: string;
  operatorRole: string;
  theme: "light" | "dark" | "system";
  autoAuditIntervalHours: number;
  enableAiAnomalyDetection: boolean;
  lowStockThresholdPercent: number;
  noShowWarningThresholdHours: number;
  emailNotifications: boolean;
  soundAlerts: boolean;
};
