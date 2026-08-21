import React, { useState } from "react";
import { X, Settings, Shield, Bell, Sliders, Database, Check } from "lucide-react";
import { useMedFlow } from "../../context/MedFlowContext";

export const SettingsModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { settings, updateSettings, notify } = useMedFlow();

  const [facilityName, setFacilityName] = useState(settings.facilityName);
  const [operatorName, setOperatorName] = useState(settings.operatorName);
  const [operatorRole, setOperatorRole] = useState(settings.operatorRole);
  const [theme, setTheme] = useState(settings.theme);
  const [autoAuditIntervalHours, setAutoAuditIntervalHours] = useState(settings.autoAuditIntervalHours);
  const [enableAiAnomalyDetection, setEnableAiAnomalyDetection] = useState(settings.enableAiAnomalyDetection);
  const [lowStockThresholdPercent, setLowStockThresholdPercent] = useState(settings.lowStockThresholdPercent);
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
  const [soundAlerts, setSoundAlerts] = useState(settings.soundAlerts);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      facilityName,
      operatorName,
      operatorRole,
      theme,
      autoAuditIntervalHours,
      enableAiAnomalyDetection,
      lowStockThresholdPercent,
      emailNotifications,
      soundAlerts,
    });
    onClose();
  };

  const handleResetData = () => {
    if (confirm("Reset all local operational data back to the default seed state?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123b3140] p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#d6e7df] bg-[#fbfdfc] p-6 shadow-2xl medflow-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#edf4f1] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f1e8] text-[#28775b]">
              <Settings size={18} />
            </span>
            <div>
              <h2 className="text-[17px] font-bold text-[#163d34]">Operations Configuration</h2>
              <p className="text-[11px] text-[#78918a]">Facility parameters, AI bots, and operational alerts.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#839792] hover:bg-[#e9f3ef]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Facility & Operator Profile */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#52766b]">Facility Telemetry</h3>
            <div>
              <label className="block text-[11px] font-semibold text-[#52766b]">Facility / Hospital Network Name</label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none font-semibold text-[#163d34]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Lead Operator Name</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none font-semibold text-[#163d34]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Operational Role</label>
                <input
                  type="text"
                  value={operatorRole}
                  onChange={(e) => setOperatorRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none text-[#163d34]"
                />
              </div>
            </div>
          </div>

          {/* AI Bots & Guard Rules */}
          <div className="space-y-3 border-t border-[#edf4f1] pt-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#52766b]">AI Autonomous Bots</h3>
            
            <label className="flex items-center justify-between rounded-xl border border-[#dce9e4] bg-white p-3 cursor-pointer">
              <div>
                <p className="text-[12px] font-bold text-[#163d34]">Proactive Anomaly Detection</p>
                <p className="text-[10px] text-[#708a82]">Continuously monitor no-shows, claim variances & stock velocity</p>
              </div>
              <input
                type="checkbox"
                checked={enableAiAnomalyDetection}
                onChange={(e) => setEnableAiAnomalyDetection(e.target.checked)}
                className="h-4 w-4 rounded text-[#155f4b]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Auto Compliance Scan (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={autoAuditIntervalHours}
                  onChange={(e) => setAutoAuditIntervalHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52766b]">Low Stock Threshold (%)</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={lowStockThresholdPercent}
                  onChange={(e) => setLowStockThresholdPercent(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#dce9e4] bg-white p-2.5 text-[12px] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3 border-t border-[#edf4f1] pt-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#52766b]">Alert Preferences</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded text-[#155f4b]"
                />
                <span className="text-[11px] font-semibold text-[#163d34]">Email Alerts</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white p-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="rounded text-[#155f4b]"
                />
                <span className="text-[11px] font-semibold text-[#163d34]">Audio Cues</span>
              </label>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="border-t border-[#edf4f1] pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetData}
              className="text-[11px] font-semibold text-[#dc2626] hover:underline"
            >
              Reset All Demo Data
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-[11px] font-semibold text-[#708a82] hover:bg-[#edf4f1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#155f4b] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0e503e]"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
