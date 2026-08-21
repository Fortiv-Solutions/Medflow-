import React from "react";
import { X, User, Shield, CheckCircle2, Clock, Building, Key, LogOut } from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";

export const ProfileModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { settings, updateSettings, notify } = useMedFlow();

  const roles = [
    { role: "Operations Lead", desc: "Full administrative, claims, inventory & scheduling control" },
    { role: "Chief Nursing Officer", desc: "Intake oversight, vitals verification, patient throughput" },
    { role: "Billing Director", desc: "Claims adjudication, fee appeals, ledger reconciliation" },
    { role: "Clinical Director", desc: "EHR documentation sign-off, provider caseload balance" },
  ];

  const handleRoleSwitch = (newRole: string) => {
    updateSettings({ operatorRole: newRole });
    notify(`Switched active operational role to ${newRole}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123b3140] p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-6 shadow-2xl medflow-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#edf4f1] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c1ddd2] text-[16px] font-bold text-[#175b49]">
              {settings.operatorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#163d34]">{settings.operatorName}</h2>
              <p className="text-[11px] text-[#78918a]">{settings.operatorRole} · {settings.facilityName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-[#e3ede9] bg-white p-3.5 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-[#617c74]">
              <span className="flex items-center gap-1.5"><Shield size={13} /> Security Access:</span>
              <span className="font-bold text-[#155f4b]">Level 4 (Full Workspace Access)</span>
            </div>
            <div className="flex items-center justify-between text-[#617c74]">
              <span className="flex items-center gap-1.5"><Building size={13} /> Network Node:</span>
              <span className="font-bold text-[#163d34]">Northstar Hospital Complex · Hub 1</span>
            </div>
            <div className="flex items-center justify-between text-[#617c74]">
              <span className="flex items-center gap-1.5"><Clock size={13} /> Active Session:</span>
              <span className="font-semibold text-[#163d34]">Started today 07:30 EST</span>
            </div>
          </div>

          {/* Switch Active Role */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#52766b] mb-2">
              Switch Role View
            </h3>
            <div className="space-y-1.5">
              {roles.map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSwitch(item.role)}
                  className={`w-full rounded-xl border p-2.5 text-left transition ${
                    settings.operatorRole === item.role
                      ? "border-[#155f4b] bg-[#eef8f3] text-[#155f4b]"
                      : "border-[#dce9e4] bg-white hover:bg-[#f6fbf8] text-[#163d34]"
                  }`}
                >
                  <p className="text-[12px] font-bold">{item.role}</p>
                  <p className="text-[10px] text-[#78918a]">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t border-[#edf4f1] pt-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
