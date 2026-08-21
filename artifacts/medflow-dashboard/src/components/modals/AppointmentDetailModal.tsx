import React, { useState } from "react";
import { X, CalendarDays, Phone, User, Clock, Building, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";
import type { Appointment, AppointmentStatus } from "../../types/medflow";

export const AppointmentDetailModal: React.FC<{
  appointment: Appointment;
  onClose: () => void;
}> = ({ appointment, onClose }) => {
  const { updateAppointment, deleteAppointment, checkInAppointment } = useMedFlow();

  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [provider, setProvider] = useState(appointment.provider);
  const [location, setLocation] = useState(appointment.location);
  const [notes, setNotes] = useState(appointment.notes || "");
  const [insuranceVerified, setInsuranceVerified] = useState(appointment.insuranceVerified);
  const [consentSigned, setConsentSigned] = useState(appointment.consentSigned);
  const [vitalsRecorded, setVitalsRecorded] = useState(appointment.vitalsRecorded);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppointment(appointment.id, {
      status,
      provider,
      location,
      notes,
      insuranceVerified,
      consentSigned,
      vitalsRecorded,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to cancel and remove ${appointment.name}'s appointment?`)) {
      deleteAppointment(appointment.id);
      onClose();
    }
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
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8ebe3] text-[13px] font-bold text-[#27735e]">
              {appointment.initials}
            </span>
            <div>
              <h2 className="text-[17px] font-bold text-[#163d34]">{appointment.name}</h2>
              <p className="text-[11px] text-[#78918a]">{appointment.visit} · {appointment.time}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Contact & DOB</span>
              <p className="font-semibold text-[#163d34] mt-0.5">{appointment.phone}</p>
              <p className="text-[#65857b]">DOB: {appointment.dob}</p>
            </div>
            <div className="rounded-xl border border-[#e3ede9] bg-white p-3">
              <span className="text-[#879b95] block font-semibold uppercase">Department</span>
              <p className="font-semibold text-[#163d34] mt-0.5">{appointment.department}</p>
              <p className="text-[#65857b]">{appointment.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Appointment Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] font-semibold text-[#163d34] outline-none"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-in">Checked-in</option>
                <option value="In Exam">In Exam</option>
                <option value="Arriving">Arriving</option>
                <option value="No-show risk">No-show risk</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Attending Provider</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#52766b]">Clinic Room Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
            />
          </div>

          {/* Checklist Toggles */}
          <div>
            <span className="block text-[11px] font-semibold text-[#52766b] mb-2">Intake Readiness Flags</span>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={insuranceVerified}
                  onChange={(e) => setInsuranceVerified(e.target.checked)}
                  className="rounded text-[#155f4b]"
                />
                <span className="text-[11px] font-semibold text-[#163d34]">Insurance</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSigned}
                  onChange={(e) => setConsentSigned(e.target.checked)}
                  className="rounded text-[#155f4b]"
                />
                <span className="text-[11px] font-semibold text-[#163d34]">Consent</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vitalsRecorded}
                  onChange={(e) => setVitalsRecorded(e.target.checked)}
                  className="rounded text-[#155f4b]"
                />
                <span className="text-[11px] font-semibold text-[#163d34]">Vitals</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#52766b]">Clinical / Intake Notes</label>
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
              onClick={handleDelete}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#dc2626] hover:underline"
            >
              <Trash2 size={13} /> Cancel Appointment
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
