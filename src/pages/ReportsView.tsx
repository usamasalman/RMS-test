import React, { useEffect, useState } from "react";
import {
  FileText,
  Printer,
  Layers,
  Database,
  Activity,
  CheckSquare,
} from "lucide-react";
import { useData } from "../store/DataContext";
import { useAuth } from "../store/AuthContext";
import { cn } from "../lib/utils";
import {
  computeInherentRiskScore,
  getRiskLevel,
  getRiskColor,
  getRiskTextColor,
} from "../lib/risk-utils";

export default function ReportsView() {
  const { risks, controls, assets, treatmentPlans, currentRole } = useData();
  const { apiFetch } = useAuth();

  const [selectedReport, setSelectedReport] = useState<string>("enterprise-risk-summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportTypes, setReportTypes] = useState<any[]>([
    { id: "all-risks", name: "All Risks", icon: Layers, desc: "High-priority risks and exposure summary." },
    { id: "appetite-breached", name: "Appetite Breached", icon: Activity, desc: "Risks exceeding appetite or tolerance boundaries." },
    { id: "risk-control-matrix", name: "Risk Control Matrix (RCM)", icon: Database, desc: "Risk-to-control mapping extract." },
    { id: "control-register", name: "Control Register", icon: CheckSquare, desc: "Control library and effectiveness baseline." },
    { id: "comprehensive-risk-report", name: "Comprehensive Risk Report", icon: Layers, desc: "Combined risk, control, and treatment view." },
    { id: "enterprise-risk-summary", name: "Enterprise Risk Summary", icon: Activity, desc: "Executive-level portfolio summary." },
    { id: "departmental-risk-summary", name: "Departmental Risk Summary", icon: Activity, desc: "Risk summary grouped by department." },
    { id: "division-risk-summary", name: "Division Risk Summary", icon: Activity, desc: "Risk summary grouped by division." },
    { id: "quarterly-report", name: "Quarterly Report", icon: Activity, desc: "Quarterly portfolio movement and status." },
    { id: "root-cause-report", name: "Root Cause Report", icon: Activity, desc: "Root-cause themes and recurring issues." },
    { id: "risk-consequences-report", name: "Risk Consequences Report", icon: Activity, desc: "Business impact and consequence mapping." },
    { id: "kri-breached-report", name: "KRI Breached Report", icon: Activity, desc: "Breached indicators and thresholds." },
    { id: "departmental-risk-detail", name: "Departmental Risk Detail", icon: Activity, desc: "Detailed risk extract by department." },
    { id: "division-risk-detail", name: "Division Risk Detail", icon: Activity, desc: "Detailed risk extract by division." },
  ]);

  useEffect(() => {
    const loadMetadata = async () => {
      const response = await apiFetch("/api/v1/reports/metadata");
      if (!response.ok) return;

      const data = await response.json();
      if (Array.isArray(data.reportTypes) && data.reportTypes.length > 0) {
        setReportTypes(data.reportTypes.map((report: any) => ({
          ...report,
          icon: report.id === "risk-control-matrix" || report.id === "control-register" ? Database : report.id === "comprehensive-risk-report" ? Layers : Activity,
        })));
      }
    };

    void loadMetadata();
  }, [apiFetch]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setReportData(null);

    try {
      const response = await apiFetch("/api/v1/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: selectedReport }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setReportData({ restricted: true, message: error.error || "You are not authorized to generate this report." });
        return;
      }

      const generated = await response.json();
      setReportData(generated);
    } catch (error) {
      console.error("Failed to generate report data", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    const response = await apiFetch(`/api/v1/reports/${selectedReport}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: selectedReport }),
    });

    if (response.ok) {
      window.print();
    }
  };

  const shouldShow = (section: string) => {
    const sectionMap: Record<string, string[]> = {
      "all-risks": ["risk-table"],
      "key-risk-report": ["risk-table"],
      "appetite-breached": ["risk-table"],
      "risk-control-matrix": ["risk-table", "control-cards"],
      "control-register": ["control-cards"],
      "comprehensive-risk-report": ["risk-table", "asset-table", "control-cards", "summary-cards"],
      "enterprise-risk-summary": ["summary-cards", "risk-table"],
      "departmental-risk-summary": ["summary-cards", "risk-table"],
      "division-risk-summary": ["summary-cards", "risk-table"],
      "quarterly-report": ["summary-cards", "risk-table"],
      "root-cause-report": ["risk-table"],
      "risk-consequences-report": ["risk-table"],
      "kri-breached-report": ["risk-table"],
      "departmental-risk-detail": ["risk-table", "asset-table"],
      "division-risk-detail": ["risk-table", "asset-table"],
    };

    return (sectionMap[selectedReport] || []).includes(section);
  };

  const reportTitle = reportTypes.find((type) => type.id === selectedReport)?.name || "Report";

  return (
    <div className="space-y-6">
      {/* Header - Hidden in Print */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports Generation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate standardized, print-ready reports across individual modules
            or the entire platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">
              Report Type
            </h3>
            {reportTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedReport === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedReport(type.id);
                    setReportData(null);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    isSelected
                      ? "bg-indigo-50 border border-indigo-200"
                      : "hover:bg-slate-50 border border-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 mt-0.5",
                      isSelected ? "text-indigo-600" : "text-slate-400",
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-indigo-900" : "text-slate-700",
                      )}
                    >
                      {type.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {/* Report Preview Area */}
        <div className="lg:col-span-3">
          {!reportData ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-medium text-slate-600">No report generated</p>
              <p className="text-sm mt-1">
                Select a report type and click generate to preview.
              </p>
            </div>
          ) : reportData.restricted ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-amber-800 p-8 text-center">
              <FileText className="w-12 h-12 mb-4 text-amber-500" />
              <p className="font-semibold">Restricted Report</p>
              <p className="text-sm mt-2">{reportData.message}</p>
            </div>
          ) : (
            <div className="bg-slate-100 p-4 sm:p-8 rounded-xl border border-slate-200 overflow-x-auto">
              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm text-slate-700"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print / PDF
                </button>
              </div>

              {/* Actual Report Document Container (Printable target) */}
              <div
                className="bg-white mx-auto shadow-xl border border-slate-200 max-w-4xl p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none text-slate-800"
                style={{ minHeight: "11in" }}
              >
                {/* Standardized Header */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight uppercase">
                      {reportTitle}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                      NEXT-GEN GRC PLATFORM • CONFIDENTIAL
                    </p>
                  </div>
                  <div className="text-right mt-4 sm:mt-0 text-sm font-mono text-slate-600">
                    <p>Date: {new Date().toLocaleDateString()}</p>
                    <p>Prepared By: {currentRole}</p>
                    <p>Doc Ref: GRC-RPT-{Math.floor(Math.random() * 10000)}</p>
                  </div>
                </div>

                {/* Report Content Sections */}
                <div className="space-y-12">
                  {shouldShow("summary-cards") && (
                    <section>
                      <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center text-slate-800">
                        <Layers className="w-5 h-5 mr-2" /> Executive Summary
                      </h2>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="border border-slate-200 rounded p-3 bg-slate-50">
                          <p className="text-slate-500">Total Risks</p>
                          <p className="text-lg font-semibold">{reportData.risks.length}</p>
                        </div>
                        <div className="border border-slate-200 rounded p-3 bg-slate-50">
                          <p className="text-slate-500">Total Controls</p>
                          <p className="text-lg font-semibold">{reportData.controls.length}</p>
                        </div>
                        <div className="border border-slate-200 rounded p-3 bg-slate-50">
                          <p className="text-slate-500">Total Assets</p>
                          <p className="text-lg font-semibold">{reportData.assets.length}</p>
                        </div>
                        <div className="border border-slate-200 rounded p-3 bg-slate-50">
                          <p className="text-slate-500">Open Treatments</p>
                          <p className="text-lg font-semibold">
                            {reportData.treatments.filter((plan: any) => plan.progress < 100).length}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Risks Section */}
                  {shouldShow("risk-table") && (
                    <section>
                      <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center text-slate-800">
                        <Activity className="w-5 h-5 mr-2" /> Risk Register Summary
                      </h2>
                      {reportData.risks.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">
                          No risks registered.
                        </p>
                      ) : (
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-y border-slate-300">
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Code
                              </th>
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Title
                              </th>
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Inherent Score
                              </th>
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {reportData.risks.map((risk: any) => {
                              const score = risk.inherentScore ?? computeInherentRiskScore(
                                risk.likelihood,
                                risk.impact,
                                risk.cia_c || 3,
                                risk.cia_i || 3,
                                risk.cia_a || 3
                              );
                              const lvl = risk.riskLevel || getRiskLevel(score);
                              return (
                                <tr
                                  key={risk.id}
                                  className="print:break-inside-avoid"
                                >
                                  <td className="py-3 px-3 font-mono text-xs">
                                    {risk.code}
                                  </td>
                                  <td className="py-3 px-3 font-medium">
                                    {risk.title}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span
                                      className={cn(
                                        "px-2 py-0.5 rounded text-xs font-bold",
                                        getRiskColor(lvl),
                                        getRiskTextColor(lvl),
                                      )}
                                    >
                                      {score.toFixed(1)} ({lvl})
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">{risk.status}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </section>
                  )}

                  {/* Assets Section */}
                  {shouldShow("asset-table") && (
                    <section>
                      <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center text-slate-800">
                        <Database className="w-5 h-5 mr-2" /> Asset Inventory Reference
                      </h2>
                      {reportData.assets.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">
                          No assets registered.
                        </p>
                      ) : (
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-y border-slate-300">
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Code
                              </th>
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Asset Name
                              </th>
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Type
                              </th>
                              <th className="py-2 px-3 font-semibold text-slate-700">
                                Criticality
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {reportData.assets.map((asset: any) => (
                              <tr
                                key={asset.id}
                                className="print:break-inside-avoid"
                              >
                                <td className="py-3 px-3 font-mono text-xs">
                                  {asset.code}
                                </td>
                                <td className="py-3 px-3 font-medium">
                                  {asset.name}
                                </td>
                                <td className="py-3 px-3 text-slate-600">
                                  {asset.type}
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={cn(
                                      "px-2 py-0.5 rounded text-xs font-bold border",
                                      asset.criticality === "High"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : asset.criticality === "Medium"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-200",
                                    )}
                                  >
                                    {asset.criticality}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </section>
                  )}

                  {/* Controls Section */}
                  {shouldShow("control-cards") && (
                    <section>
                      <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 flex items-center text-slate-800">
                        <CheckSquare className="w-5 h-5 mr-2" /> Control Register Baseline
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {reportData.controls.map((ctrl: any) => (
                          <div
                            key={ctrl.id}
                            className="border border-slate-200 p-4 rounded-md print:break-inside-avoid"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-mono text-xs text-slate-500 mr-2">
                                  {ctrl.code}
                                </span>
                                <span className="font-bold text-slate-800">
                                  {ctrl.title}
                                </span>
                              </div>
                              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium border border-indigo-100">
                                {ctrl.type}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium mb-3">
                              {ctrl.description}
                            </p>
                            <div className="flex gap-4 text-xs">
                              <div className="bg-slate-50 p-2 rounded w-full">
                                <p className="text-slate-500 mb-1">
                                  Design Eff.
                                </p>
                                <p className="font-semibold">
                                  {(ctrl.designEffectiveness * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div className="bg-slate-50 p-2 rounded w-full">
                                <p className="text-slate-500 mb-1">
                                  Operating Eff.
                                </p>
                                <p className="font-semibold">
                                  {(ctrl.operatingEffectiveness * 100).toFixed(
                                    0,
                                  )}
                                  %
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Footer */}
                  <div className="pt-12 text-center text-xs text-slate-400 font-mono">
                    <p>END OF REPORT</p>
                    <p className="mt-1">
                      Generated by GRC Wisdom production report engine
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
