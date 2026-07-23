import React, { useState } from "react";
import { useAuth } from "../store/AuthContext";
import { Shield, User, Mail, Save } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      await updateProfile(name);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <div className="bg-indigo-100 p-3 rounded-full">
          <User className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-500">Manage your account information</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center justify-between border border-emerald-100">
          <p className="font-medium">
            Profile updated successfully (simulated)
          </p>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed directly.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Role & Permissions
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-4">
              <Shield className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">{user?.role}</p>
                <p className="text-sm text-slate-600 mt-1">
                  Your current role dictates what you can view and edit within
                  the platform. To change your role, please refer to the Admin
                  or use the developer role switcher.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
          {error && <span className="text-red-500 text-sm mr-4">{error}</span>}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />{" "}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
