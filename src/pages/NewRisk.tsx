import React, { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Likelihood, Impact, Risk } from "@/types";
import { ChevronLeft, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeInherentRiskScore,
  getRiskLevel,
  getRiskColor,
  getRiskTextColor,
} from "@/lib/risk-utils";
import HelpPanel from "@/components/HelpPanel";
import { helpContent } from "@/config/helpContent";

export default function NewRisk() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addRisk, updateRisk, risks, assets, users, currentRole } = useData();
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get("assetId") || "";

  const isEditMode = !!id;
  const existingRisk = isEditMode ? risks.find(r => r.id === id) : null;

  if (currentRole === "Internal Auditor") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <h2 className="text-xl font-semibold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 max-w-md mt-2">
          Internal Auditors cannot create or edit risks.
        </p>
      </div>
    );
  }

  const [step, setStep] = useState(1);

  // Step 1
  const [title, setTitle] = useState(existingRisk?.title || "");
  const [description, setDescription] = useState(existingRisk?.description || "");
  const [division, setDivision] = useState("");
  const [department, setDepartment] = useState("");
  const [owner, setOwner] = useState(existingRisk?.ownerId || "");
  const [process, setProcess] = useState(existingRisk?.processId || "");
  const [objective, setObjective] = useState("");
  const [category, setCategory] = useState(existingRisk?.categoryId || "");
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [relatedAssetId, setRelatedAssetId] = useState(existingRisk?.relatedAssetId || initialAssetId);

  const [serviceTower, setServiceTower] = useState(existingRisk?.serviceTower || "");
  const [rootCause, setRootCause] = useState(existingRisk?.rootCause || "");
  const [treatmentStrategy, setTreatmentStrategy] = useState<any>(existingRisk?.treatmentStrategy || "");
  const [targetDate, setTargetDate] = useState(existingRisk?.targetDate || "");
  const [kpiLink, setKpiLink] = useState(existingRisk?.kpiLink || "");
  const [comments, setComments] = useState(existingRisk?.comments || "");

  // Step 2
  const [ciaC, setCiaC] = useState(existingRisk?.cia_c || 3);
  const [ciaI, setCiaI] = useState(existingRisk?.cia_i || 3);
  const [ciaA, setCiaA] = useState(existingRisk?.cia_a || 3);
  const [strategy, setStrategy] = useState("");

  // Step 3
  const [likelihood, setLikelihood] = useState(existingRisk?.likelihood || 3);
  const [impact, setImpact] = useState(existingRisk?.impact || 3);

  const inherentScore = computeInherentRiskScore(
    likelihood,
    impact,
    ciaC,
    ciaI,
    ciaA,
  );
  const inherentLevel = getRiskLevel(inherentScore);

  const handleSubmit = (e?: React.FormEvent, isDraft = false) => {
    if (e) e.preventDefault();
    if (!title || !description) return;

    const riskPayload = {
      title,
      description,
      categoryId: category || "c1",
      rootCauseId: "rc1",
      rootCause,
      serviceTower,
      treatmentStrategy: treatmentStrategy || undefined,
      targetDate,
      kpiLink,
      comments,
      processId: process || "p1",
      ownerId: owner || "u1",
      relatedAssetId:
        relatedAssetId && relatedAssetId !== "none"
          ? relatedAssetId
          : undefined,
      likelihood: likelihood,
      impact: impact,
      cia_c: ciaC,
      cia_i: ciaI,
      cia_a: ciaA,
      status: (isDraft ? "Under Review" : "Open") as Risk["status"],
    };

    if (isEditMode && id) {
      updateRisk(id, {
        ...riskPayload,
        status: isDraft ? "Under Review" : existingRisk?.status || "Open",
      });
    } else {
      addRisk(riskPayload);
    }

    navigate("/risks");
  };

  const currentStepClasses =
    "w-2.5 h-2.5 rounded-full bg-indigo-600 outline outline-4 outline-indigo-50";
  const incompleteStepClasses =
    "w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white";
  const completeStepClasses =
    "w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center text-white";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <HelpPanel
        title={helpContent.newRisk.title}
        items={helpContent.newRisk.items}
        tips={helpContent.newRisk.tips}
      />
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent text-slate-500"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#1e293b]">
          {isEditMode ? "Edit Risk" : "Create New Risk"}
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-56 shrink-0 md:border-r border-slate-200">
          <nav className="space-y-6 relative md:before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-slate-200">
            <button
              onClick={() => setStep(1)}
              className={cn(
                "flex flex-col text-left px-3 py-1 relative z-10 w-full rounded-md transition-colors",
                step === 1 ? "bg-indigo-50" : "hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-3 w-full text-sm font-medium">
                <div
                  className={
                    step === 1
                      ? currentStepClasses
                      : step > 1
                        ? completeStepClasses
                        : incompleteStepClasses
                  }
                >
                  {step > 1 && <Check className="w-2 h-2" />}
                </div>
                <span
                  className={step === 1 ? "text-indigo-600" : "text-slate-500"}
                >
                  1. Identification
                </span>
              </div>
            </button>
            <button
              onClick={() => setStep(2)}
              className={cn(
                "flex flex-col text-left px-3 py-1 relative z-10 w-full rounded-md transition-colors",
                step === 2 ? "bg-indigo-50" : "hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-3 w-full text-sm font-medium">
                <div
                  className={
                    step === 2
                      ? currentStepClasses
                      : step > 2
                        ? completeStepClasses
                        : incompleteStepClasses
                  }
                >
                  {step > 2 && <Check className="w-2 h-2" />}
                </div>
                <span
                  className={step === 2 ? "text-indigo-600" : "text-slate-500"}
                >
                  2. Analysis
                </span>
              </div>
            </button>
            <button
              onClick={() => setStep(3)}
              className={cn(
                "flex flex-col text-left px-3 py-1 relative z-10 w-full rounded-md transition-colors",
                step === 3 ? "bg-indigo-50" : "hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-3 w-full text-sm font-medium">
                <div
                  className={
                    step === 3
                      ? currentStepClasses
                      : step > 3
                        ? completeStepClasses
                        : incompleteStepClasses
                  }
                >
                  {step > 3 && <Check className="w-2 h-2" />}
                </div>
                <span
                  className={step === 3 ? "text-indigo-600" : "text-slate-500"}
                >
                  3. Assessment
                </span>
              </div>
            </button>
            <button
              onClick={() => setStep(4)}
              className={cn(
                "flex flex-col text-left px-3 py-1 relative z-10 w-full rounded-md transition-colors",
                step === 4 ? "bg-indigo-50" : "hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-3 w-full text-sm font-medium">
                <div
                  className={
                    step === 4
                      ? currentStepClasses
                      : step > 4
                        ? completeStepClasses
                        : incompleteStepClasses
                  }
                >
                  {step > 4 && <Check className="w-2 h-2" />}
                </div>
                <span
                  className={step === 4 ? "text-indigo-600" : "text-slate-500"}
                >
                  4. Review
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          <form className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">
                    Risk Identification
                  </h3>
                  <p className="text-sm text-slate-500">
                    Provide fundamental details about the risk.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Risk Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Vendor Service Outage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Risk Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Detailed description of the risk..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Select value={division} onValueChange={setDivision}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="d1">Technology</SelectItem>
                          <SelectItem value="d2">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dep1">Infrastructure</SelectItem>
                          <SelectItem value="dep2">Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Process</Label>
                      <Select value={process} onValueChange={setProcess}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Process" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="p1">Vendor Management</SelectItem>
                          <SelectItem value="p2">Cloud Deployment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Risk Owner</Label>
                      <Select value={owner} onValueChange={setOwner}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Service / Tower</Label>
                      <Input
                        value={serviceTower}
                        onChange={(e) => setServiceTower(e.target.value)}
                        placeholder="e.g. App Oracle, INT / Non-Oracle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Root Cause</Label>
                      <Input
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value)}
                        placeholder="e.g. Technology, Capacity planning"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Objective</Label>
                      <Input
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="Affected objective..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strategic">Strategic</SelectItem>
                          <SelectItem value="Operational">
                            Operational
                          </SelectItem>
                          <SelectItem value="Financial">Financial</SelectItem>
                          <SelectItem value="Compliance">Compliance</SelectItem>
                          <SelectItem value="Reputational">
                            Reputational
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Treatment Strategy</Label>
                      <Select value={treatmentStrategy} onValueChange={setTreatmentStrategy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accept">Accept</SelectItem>
                          <SelectItem value="Mitigate">Mitigate</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                          <SelectItem value="Avoid">Avoid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reporting KPI Link</Label>
                      <Input
                        value={kpiLink}
                        onChange={(e) => setKpiLink(e.target.value)}
                        placeholder="e.g. Availability SLA / Service Continuity"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label>Related Asset (Optional)</Label>
                      <Select
                        value={relatedAssetId}
                        onValueChange={setRelatedAssetId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Asset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {assets.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} ({a.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label>Comments</Label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Additional comments or context..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">
                    Risk Analysis (CIA & Strategy)
                  </h3>
                  <p className="text-sm text-slate-500">
                    Rate the CIA Triad and select a treatment strategy.
                  </p>
                </div>
                <div className="space-y-8 bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                  <div className="space-y-4">
                    <Label className="flex justify-between items-center text-slate-700">
                      Confidentiality{" "}
                      <span className="text-indigo-600 font-medium">
                        {ciaC}/5
                      </span>
                    </Label>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[ciaC]}
                      onValueChange={(val) => setCiaC(val[0])}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Negligible</span>
                      <span>Severe</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="flex justify-between items-center text-slate-700">
                      Integrity{" "}
                      <span className="text-indigo-600 font-medium">
                        {ciaI}/5
                      </span>
                    </Label>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[ciaI]}
                      onValueChange={(val) => setCiaI(val[0])}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Negligible</span>
                      <span>Severe</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="flex justify-between items-center text-slate-700">
                      Availability{" "}
                      <span className="text-indigo-600 font-medium">
                        {ciaA}/5
                      </span>
                    </Label>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[ciaA]}
                      onValueChange={(val) => setCiaA(val[0])}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Negligible</span>
                      <span>Severe</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-slate-700">Treatment Strategy</Label>
                  <Select value={strategy} onValueChange={setStrategy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Avoid">Avoid</SelectItem>
                      <SelectItem value="Mitigate">Mitigate</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Accept">Accept</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">
                    Risk Assessment
                  </h3>
                  <p className="text-sm text-slate-500">
                    Determine the Likelihood and Impact.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-8 bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                    <div className="space-y-4">
                      <Label className="flex justify-between items-center text-slate-700">
                        Likelihood{" "}
                        <span className="text-indigo-600 font-medium">
                          {likelihood}/5
                        </span>
                      </Label>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[likelihood]}
                        onValueChange={(val) => setLikelihood(val[0])}
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Rare</span>
                        <span>Almost Certain</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="flex justify-between items-center text-slate-700">
                        Impact{" "}
                        <span className="text-indigo-600 font-medium">
                          {impact}/5
                        </span>
                      </Label>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[impact]}
                        onValueChange={(val) => setImpact(val[0])}
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Insignificant</span>
                        <span>Catastrophic</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-sm bg-white">
                    <Label className="text-slate-500 mb-6 font-medium text-center">
                      Inherent Risk Rating
                    </Label>
                    <div className="relative w-32 h-16 flex justify-center mb-2 overflow-hidden">
                      <div className="absolute w-32 h-32 rounded-full border-[16px] border-slate-100 border-b-transparent border-r-transparent rotate-45 transform"></div>
                      <div
                        className={cn(
                          "absolute w-32 h-32 rounded-full border-[16px] border-b-transparent border-r-transparent rotate-45 transform transition-all duration-500",
                          getRiskColor(inherentLevel).replace("bg-", "border-"),
                        )}
                        style={{
                          transform: `rotate(${Math.min(225, 45 + (inherentScore / 125) * 180)}deg)`,
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-col items-center mt-4">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide",
                          getRiskTextColor(inherentLevel),
                        )}
                      >
                        {inherentLevel}
                      </span>
                      <span className="text-3xl font-light text-slate-800 mt-2">
                        {inherentScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">
                    Review & Submit
                  </h3>
                  <p className="text-sm text-slate-500">
                    Review the details before saving.
                  </p>
                </div>
                <div className="border rounded-md p-6 bg-slate-50/50 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <strong className="block text-slate-500 text-xs">
                        Title
                      </strong>
                      <span className="text-slate-800">{title || "-"}</span>
                    </div>
                    <div>
                      <strong className="block text-slate-500 text-xs">
                        Category
                      </strong>
                      <span className="text-slate-800">{category || "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <strong className="block text-slate-500 text-xs">
                        Description
                      </strong>
                      <span className="text-slate-800">
                        {description || "-"}
                      </span>
                    </div>
                    <div>
                      <strong className="block text-slate-500 text-xs">
                        Strategy
                      </strong>
                      <span className="text-slate-800">{strategy || "-"}</span>
                    </div>
                    <div>
                      <strong className="block text-slate-500 text-xs">
                        Inherent Risk
                      </strong>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs",
                          getRiskTextColor(inherentLevel),
                        )}
                      >
                        {inherentLevel} ({inherentScore})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t mt-8">
              <Button
                variant="ghost"
                type="button"
                onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
              >
                {step === 1 ? "Cancel" : "Previous"}
              </Button>
              <div className="space-x-3">
                {step === 4 && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    Save as Draft
                  </Button>
                )}
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, false)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit for Approval
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
