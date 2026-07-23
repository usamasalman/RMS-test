import React, { useState } from "react";
import { useAuth } from "../store/AuthContext";
import { Shield, Lock, Mail, User } from "lucide-react";
import { cn } from "../lib/utils";
import apiClient from "../lib/apiClient";
import type { Role } from "../types";
import { ALL_ROLES } from "../types/roles";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("admin@grc.com");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Risk Owner");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin
        ? { email, password }
        : { email, password, name, role };

      const res = await apiClient.post(endpoint, body);
      const data = res.data;

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
            GRC Wisdom
          </h2>
          <p className="text-sm text-center text-slate-500 mb-8">
            {isLogin
              ? "Sign in to access your platform"
              : "Create your account"}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="admin@grc.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role Request
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                >
                  {ALL_ROLES.map((availableRole) => (
                    <option key={availableRole} value={availableRole}>
                      {availableRole}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors",
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              )}
            >
              {isLoading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-500 text-center mb-2 font-semibold">
                Demo Credentials
              </p>
              <div className="flex flex-col gap-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg font-mono">
                <div className="flex justify-between">
                  <span>admin@grc.com</span>
                  <span>password</span>
                </div>
                <div className="flex justify-between">
                  <span>owner@grc.com</span>
                  <span>password</span>
                </div>
                <div className="flex justify-between">
                  <span>auditor@grc.com</span>
                  <span>password</span>
                </div>
                <div className="flex justify-between">
                  <span>cro@grc.com</span>
                  <span>password</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
