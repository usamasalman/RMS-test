import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditEntry } from "@/types";
import { format } from "date-fns";
import { Activity, User, Shield, Key, FileText, Server, LogIn, Lock, Unlock, ShieldAlert } from "lucide-react";
import { usePermissions } from "@/store/DataContext";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/apiClient";

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { can } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!can("audit:read")) {
      navigate("/");
      return;
    }

    const fetchLogs = async () => {
      try {
        const res = await apiClient.get("/audit-log");
        if (res.status === 200) {
          setLogs(res.data.auditLog);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [can, navigate]);

  const getEntityIcon = (type: string) => {
    switch(type) {
      case 'risk': return <Shield className="h-4 w-4 text-red-500" />;
      case 'control': return <Key className="h-4 w-4 text-blue-500" />;
      case 'treatment': return <Activity className="h-4 w-4 text-orange-500" />;
      case 'user': return <User className="h-4 w-4 text-purple-500" />;
      case 'system': return <Server className="h-4 w-4 text-slate-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch(action) {
      case 'create': return <Badge className="bg-emerald-100 text-emerald-800">Created</Badge>;
      case 'update': return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
      case 'delete': return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      case 'approve': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'login': return <Badge className="bg-slate-100 text-slate-800">Login</Badge>;
      case 'access_denied': return <Badge className="bg-orange-100 text-orange-800">Access Denied</Badge>;
      default: return <Badge variant="outline" className="capitalize">{action.replace('_', ' ')}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading audit trail...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive field-level log of all changes in GRC Wisdom.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No activity recorded yet.</p>
            ) : (
              <div className="relative border-l border-slate-200 ml-3">
                {logs.map((log, idx) => (
                  <div key={log.id} className="mb-8 ml-6 group">
                    <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 ring-8 ring-white">
                      {getEntityIcon(log.entityType)}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getActionBadge(log.action)}
                        <span className="font-medium text-sm text-slate-900 capitalize">
                          {log.entityType} {log.entityCode ? `(${log.entityCode})` : ''}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 rounded-md p-3 border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-slate-700">
                          {log.userName} <span className="text-slate-400 font-normal">({log.userRole})</span>
                        </div>
                        <div className="text-xs font-mono text-slate-400">{log.ipAddress}</div>
                      </div>
                      
                      {log.fieldChanges && log.fieldChanges.length > 0 && (
                        <div className="mt-3 text-xs">
                          <p className="font-medium text-slate-500 mb-1">Changes:</p>
                          <ul className="space-y-1">
                            {log.fieldChanges.map((change, cIdx) => (
                              <li key={cIdx} className="flex gap-2">
                                <span className="font-mono text-slate-700 bg-slate-200 px-1 rounded">{change.field}</span>
                                <span className="text-red-500 line-through truncate max-w-[150px]" title={JSON.stringify(change.oldValue)}>
                                  {JSON.stringify(change.oldValue) || 'none'}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span className="text-emerald-600 truncate max-w-[200px]" title={JSON.stringify(change.newValue)}>
                                  {JSON.stringify(change.newValue) || 'none'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {log.note && (
                        <div className="mt-2 text-xs italic text-slate-500 border-l-2 border-slate-300 pl-2">
                          "{log.note}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
