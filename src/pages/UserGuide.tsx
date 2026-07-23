import { BookOpen, CheckCircle2, CircleHelp, Layers3, Shield, Sparkles, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Start here",
    icon: Sparkles,
    items: [
      "Use the Dashboard to see live risk posture, treatment progress, and overdue actions.",
      "Use the Risk Register to create, review, and sort risks.",
      "Use Reports for board-ready and audit-ready exports.",
    ],
  },
  {
    title: "Core modules",
    icon: Layers3,
    items: [
      "Risk Register: create risks, link controls, and start treatment plans.",
      "Control Register: manage preventive, detective, and corrective controls.",
      "Asset Register: import assets from CSV/XLSX and link them to risks.",
      "Treatment Monitor: track progress and overdue mitigation work.",
    ],
  },
  {
    title: "Governance",
    icon: Shield,
    items: [
      "Reports: generate named summary and detailed reports for stakeholders.",
      "Admin: manage access, review roles, and update account profile data.",
      "Documents: store supporting policies and reference material.",
    ],
  },
];

const roleGuidance = [
  {
    role: "Administrator",
    summary: "Full platform access for setup, oversight, and record maintenance.",
  },
  {
    role: "CRO / Executive",
    summary: "Use Dashboard and Reports for portfolio oversight and escalation review.",
  },
  {
    role: "Risk Owner",
    summary: "Focus on assigned risks, controls, and treatment progress.",
  },
  {
    role: "Compliance Officer",
    summary: "Review control coverage, exceptions, and report outputs.",
  },
  {
    role: "Internal Auditor",
    summary: "Read-only review of evidence, history, and governance reporting.",
  },
  {
    role: "Read-Only / Board Viewer",
    summary: "Use summary reports and the dashboard for high-level insight.",
  },
];

const quickTasks = [
  "Create a risk: Risk Register → Create New Risk.",
  "Link a control: open a risk, choose Control, and add an existing control.",
  "Start a treatment plan: open a risk, choose Treatment, and create a plan.",
  "Import assets: Asset Register → Upload & Extract CSV/XLSX.",
  "Generate a report: Reports → choose a report type → Generate Report.",
];

export default function UserGuide() {
  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.18),_transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-white/10 text-white border-white/15">User Guide</Badge>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Understand the platform in minutes</h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-6">
                This guide explains how to move through GRC Wisdom, which module to use for each task, and how roles map to the product.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className={cn(buttonVariants({ variant: "default" }), "bg-white text-slate-950 hover:bg-slate-100")}
            >
              Open Dashboard
            </Link>
            <Link
              to="/reports"
              className={cn(buttonVariants({ variant: "outline" }), "border-white/20 text-white hover:bg-white/10 hover:text-white")}
            >
              Open Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-5 border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Workflow className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Common tasks</h2>
          </div>
          <div className="space-y-3">
            {quickTasks.map((task, index) => (
              <div key={task} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-700">{task}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CircleHelp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Role guide</h2>
          </div>
          <div className="space-y-4">
            {roleGuidance.map((item) => (
              <div key={item.role}>
                <p className="text-sm font-semibold text-slate-900">{item.role}</p>
                <p className="text-sm text-slate-600 mt-1">{item.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">How to think about the platform</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
            <p className="font-semibold text-slate-900 mb-2">Operational view</p>
            <p className="text-sm text-slate-600">
              Manage real records: risks, controls, assets, and treatment plans. Use this for day-to-day GRC work.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
            <p className="font-semibold text-slate-900 mb-2">Governance view</p>
            <p className="text-sm text-slate-600">
              Use reports, admin, and the dashboard for oversight, approvals, and board-ready summaries.
            </p>
          </div>
        </div>
        <Separator className="my-5" />
        <p className="text-sm text-slate-500">
          If you are new to the platform, start with Dashboard, then open the Risk Register, and use the User Guide as a map for every module.
        </p>
      </Card>
    </div>
  );
}