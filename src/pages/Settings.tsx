import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Eye,
  Save,
} from "lucide-react";

export default function Settings() {
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <div className="bg-indigo-100 p-3 rounded-full">
          <SettingsIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Settings
          </h1>
          <p className="text-gray-500">Configure your personal preferences</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center justify-between border border-emerald-100">
          <p className="font-medium">
            Settings updated successfully (simulated)
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive daily digest of risk updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">In-App Alerts</p>
                <p className="text-sm text-gray-500">
                  Get notified when mentioned in comments
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Eye className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Display</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Theme</p>
                <p className="text-sm text-gray-500">
                  Select your preferred color scheme
                </p>
              </div>
              <select className="border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
                <option>Light (Default)</option>
                <option>Dark</option>
                <option>System Default</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
