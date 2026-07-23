import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '@/store/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { computeInherentRiskScore, getRiskLevel, computeControlRating, computeResidualRiskScore } from '@/lib/risk-utils';
import { ChevronLeft, Bot, Send, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export default function RiskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { risks, controls, riskControlMappings, treatmentPlans, addTreatmentPlan, linkControlToRisk, removeControlMapping, updateRisk, currentRole } = useData();
  const isReadOnly = currentRole === "Internal Auditor";
  const [activeTab, setActiveTab] = useState('risk');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false);
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState('');
  const [controlWeight, setControlWeight] = useState(1);

  useEffect(() => {
    if (isReadOnly) return;
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'treatment') {
      setActiveTab('treatment');
      setTreatmentDialogOpen(true);
    } else if (params.get('action') === 'control') {
      setActiveTab('control');
      setControlDialogOpen(true);
    }
  }, [location.search, isReadOnly]);

  const [newTreatment, setNewTreatment] = useState<{ title: string, description: string, deadline: string, owner: string, strategy: 'Avoid' | 'Mitigate' | 'Transfer' | 'Accept', progress: number }>({
    title: '',
    description: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    owner: 'u1',
    strategy: 'Mitigate',
    progress: 0
  });
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Hi there! I am your AI GRC Assistant. How can I help you scope mitigation plans or design controls for this risk?' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    // Simulate AI response based on context
    setTimeout(() => {
      setChatMessages([...newMessages, { role: 'ai', content: `Considering the inherent risk score and division, I suggest implementing an automated detective control to monitor this continuously.` }]);
    }, 800);
  };

  const risk = risks.find(r => r.id === id);

  if (!risk) {
    return <div>Risk not found</div>;
  }

  const handleSaveTreatment = () => {
    if (isReadOnly) return;
    addTreatmentPlan({
      title: newTreatment.title,
      description: newTreatment.description,
      riskId: risk.id,
      strategy: newTreatment.strategy,
      ownerId: newTreatment.owner, // Or current user if available
      progress: newTreatment.progress,
      deadline: new Date(newTreatment.deadline).toISOString(),
    });
    setTreatmentDialogOpen(false);
    setNewTreatment({ title: '', description: '', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], owner: 'u1', strategy: 'Mitigate', progress: 0 });
  };

  const inherentScore = computeInherentRiskScore(risk.likelihood, risk.impact, risk.cia_c || 3, risk.cia_i || 3, risk.cia_a || 3);
  const level = getRiskLevel(inherentScore);

  const mappedControls = riskControlMappings
    .filter(m => m.riskId === risk.id)
    .map(m => ({
      mapping: m,
      control: controls.find(c => c.id === m.controlId)!
    }));

  const cr = computeControlRating(mappedControls.map(m => ({
    design_eff: (m.control?.designEffectiveness || 0) * 100,
    operating_eff: (m.control?.operatingEffectiveness || 0) * 100,
    weight: m.mapping.weight
  })));
  
  const residualScore = computeResidualRiskScore(inherentScore, cr);
   const residualLevel = getRiskLevel(residualScore);
   const mappedTreatments = treatmentPlans.filter(t => t.riskId === risk.id);
   
   // @ts-ignore: Assuming useData provides assets (from DataContext)
   const relatedAsset = useData().assets.find(a => a.id === risk.relatedAssetId);

   return (
     <div className="space-y-6 max-w-5xl mx-auto pb-24">
       <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-slate-500" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="flex justify-between items-center bg-white rounded-t-md border-b pb-4 px-6 pt-6">
        <div>
           <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">{risk.title}</h2>
           </div>
           <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{risk.code}</Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Control</Badge>
           </div>
        </div>
        <div className="flex gap-2">
           {!isReadOnly && (
             <>
               <Button variant="outline" size="sm" onClick={() => navigate(`/risks/${risk.id}/edit`)}>Edit</Button>
               <Button size="sm" className="bg-[#1e293b]" onClick={() => { setActiveTab('treatment'); setTreatmentDialogOpen(true); }}>Create Task</Button>
             </>
           )}
        </div>
      </div>

      <Card className="rounded-none border-x-0 border-y shadow-none bg-slate-50/50">
         <CardContent className="py-6 flex justify-between items-center relative before:absolute before:top-1/2 before:left-12 before:right-12 before:-z-10 before:h-0.5 before:bg-slate-200">
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 cursor-pointer" onClick={() => setActiveTab('risk')}>
               <div className={cn("w-4 h-4 rounded-full", activeTab === 'risk' ? "bg-indigo-600 outline outline-4 outline-indigo-100" : "bg-slate-300")}></div>
               <span className={cn("text-xs font-semibold", activeTab === 'risk' ? "text-indigo-700" : "text-slate-500")}>Risk</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 cursor-pointer" onClick={() => setActiveTab('control')}>
               <div className={cn("w-4 h-4 rounded-full", activeTab === 'control' ? "bg-indigo-600 outline outline-4 outline-indigo-100" : "bg-slate-300")}></div>
               <span className={cn("text-xs font-semibold", activeTab === 'control' ? "text-indigo-700" : "text-slate-500")}>Control</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 cursor-pointer" onClick={() => setActiveTab('treatment')}>
               <div className={cn("w-4 h-4 rounded-full", activeTab === 'treatment' ? "bg-indigo-600 outline outline-4 outline-indigo-100" : "bg-slate-300")}></div>
               <span className={cn("text-xs font-semibold", activeTab === 'treatment' ? "text-indigo-700" : "text-slate-500")}>Treatment</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 cursor-pointer" onClick={() => navigate('/treatments')}>
               <div className="w-4 h-4 rounded-full bg-slate-300"></div>
               <span className="text-xs font-semibold text-slate-500">Monitoring</span>
            </div>
         </CardContent>
      </Card>

      <div className="flex items-center gap-2 bg-slate-100 p-1 w-max rounded-md mx-6">
         <button onClick={() => setActiveTab('risk')} className={cn("px-4 py-1.5 text-sm font-medium rounded-sm transition-colors", activeTab === 'risk' ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900")}>Risk</button>
         <button onClick={() => setActiveTab('control')} className={cn("px-4 py-1.5 text-sm font-medium rounded-sm transition-colors", activeTab === 'control' ? "bg-[#1e293b] text-white shadow" : "text-slate-600 hover:text-slate-900")}>Control</button>
         <button onClick={() => setActiveTab('treatment')} className={cn("px-4 py-1.5 text-sm font-medium rounded-sm transition-colors", activeTab === 'treatment' ? "bg-[#1e293b] text-white shadow" : "text-slate-600 hover:text-slate-900")}>Treatment</button>
      </div>

      <div className="px-6">
         {activeTab === 'risk' && (
            <div className="space-y-6">
               <div className="border rounded-md divide-y bg-white">
                  <div className="px-4 py-2 bg-slate-50">
                     <h4 className="text-xs font-semibold uppercase text-slate-500">Risk Identification</h4>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-4">
                     <div>
                        <p className="text-xs text-slate-500 border-b pb-1 mb-2">Division</p>
                        <p className="text-sm font-medium">ABC Limited</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 border-b pb-1 mb-2">Department</p>
                        <p className="text-sm font-medium">Financial Planning & Analysis</p>
                     </div>
                     <div className="col-span-2">
                        <p className="text-xs text-slate-500 border-b pb-1 mb-2">Risk Owner</p>
                        <div className="flex gap-2">
                           <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 border border-slate-200">Muhammad Ali Zameli</Badge>
                           <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 border border-slate-200">Junaid Ahmed</Badge>
                        </div>
                     </div>
                     {relatedAsset && (
                        <div className="col-span-2">
                           <p className="text-xs text-slate-500 border-b pb-1 mb-2">Related Asset</p>
                           <p className="text-sm font-medium text-emerald-700">{relatedAsset.name} ({relatedAsset.type})</p>
                        </div>
                     )}
                     <div className="col-span-2">
                        <p className="text-xs text-slate-500 border-b pb-1 mb-2">Risk Description</p>
                        <p className="text-sm">{risk.description}</p>
                     </div>
                  </div>
               </div>

               <div className="border rounded-md divide-y bg-white">
                  <div className="bg-rose-50/30 p-6 flex flex-col items-center justify-center border-b">
                     <h4 className="text-sm font-medium text-slate-500 mb-4">Inherent Risk Rating</h4>
                     <div className="w-24 h-12 overflow-hidden relative">
                         <div className="w-24 h-24 rounded-full border-[12px] border-slate-100 border-b-transparent border-r-transparent rotate-45"></div>
                         <div className="w-24 h-24 rounded-full border-[12px] border-yellow-400 border-b-transparent border-r-transparent rotate-45 absolute top-0 left-0" style={{ transform: `rotate(${risk.likelihood*risk.impact * 3}deg)`}}></div>
                     </div>
                     <span className="mt-2 font-semibold text-yellow-600">{level} ({inherentScore})</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-xs text-slate-500 mb-1 border-b pb-1">Likelihood</p>
                        <p className="text-sm">{risk.likelihood}/5</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 mb-1 border-b pb-1">Impact</p>
                        <p className="text-sm">{risk.impact}/5</p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'control' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Existing Controls</h3>
                  <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">View Context</Button>
               </div>

               <div className="bg-white p-6 rounded-md border flex items-center justify-between">
                  <div className="space-y-6 w-2/3">
                     <div className="space-y-2 relative">
                        <p className="text-sm font-medium text-slate-600 text-center mb-4">Design Effectiveness</p>
                        <div className="w-full h-1 bg-slate-200 rounded-lg relative">
                           <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-2 h-2 rounded-full bg-slate-400"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-2">
                           <span>Absent</span>
                           <span>Inadequate</span>
                           <span>Adequate</span>
                        </div>
                     </div>
                     <div className="space-y-2 relative">
                        <p className="text-sm font-medium text-slate-600 text-center mb-4">Operating Effectiveness</p>
                        <div className="w-full h-1 bg-slate-200 rounded-lg relative">
                           <div className="absolute top-1/2 -translate-y-1/2 left-3/4 w-2 h-2 rounded-full bg-slate-400"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-2">
                           <span>Not Implemented</span>
                           <span>Ineffective</span>
                           <span>Partially Effective</span>
                           <span>Effective</span>
                        </div>
                     </div>
                  </div>
                  <div className="w-1/3 flex flex-col items-center justify-center border-l ml-8 pl-8">
                     <p className="text-sm text-slate-500 mb-2">Combined Control Rating</p>
                     <span className="text-3xl font-light text-slate-800">
                        {mappedControls.length > 0 ? (cr * 100).toFixed(0) + '%' : 'NA'}
                     </span>
                  </div>
               </div>

               <div className="border rounded-md bg-white">
                  <div className="px-4 py-3 flex justify-between items-center bg-slate-50 border-b">
                     <h4 className="text-sm font-medium text-slate-700">Individual Control Details</h4>
                     <div className="flex gap-3 text-xs text-indigo-600 font-medium">
                        <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
                          {!isReadOnly && (
                            <DialogTrigger className="cursor-pointer hover:underline text-indigo-600 bg-transparent border-none p-0 inline">
                              Add Control
                            </DialogTrigger>
                          )}
                          <DialogContent className="sm:max-w-[425px]">
                             <DialogHeader>
                               <DialogTitle>Link Control</DialogTitle>
                               <DialogDescription>
                                 Select an existing control from the library to link to this risk.
                               </DialogDescription>
                             </DialogHeader>
                             <div className="grid gap-4 py-4">
                               <div className="grid gap-2">
                                 <Label htmlFor="control">Select Control</Label>
                                 <Select value={selectedControlId} onValueChange={setSelectedControlId}>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Select a control..." />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {controls.filter(c => !mappedControls.find(mc => mc.control.id === c.id)).map(c => (
                                       <SelectItem key={c.id} value={c.id}>
                                         {c.code} - {c.title}
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               </div>
                               <div className="grid gap-2">
                                 <Label htmlFor="weight">Weightage (Multiplier)</Label>
                                 <Input 
                                   id="weight" 
                                   type="number" 
                                   value={controlWeight} 
                                   onChange={(e) => setControlWeight(Number(e.target.value))} 
                                   min={0.1} 
                                   max={1} 
                                   step={0.1} 
                                 />
                               </div>
                             </div>
                             <DialogFooter>
                               <Button type="button" onClick={() => {
                                 if (isReadOnly) return;
                                 if (selectedControlId) {
                                   linkControlToRisk(risk.id, selectedControlId, controlWeight);
                                   setControlDialogOpen(false);
                                   setSelectedControlId('');
                                   setControlWeight(1);
                                 }
                               }}>Link Control</Button>
                             </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <span className="cursor-pointer hover:underline" onClick={() => navigate('/controls')}>Control Register</span>
                        <span className="cursor-pointer hover:underline" onClick={() => navigate('/controls')}>Control Library</span>
                     </div>
                  </div>
                  {mappedControls.length === 0 ? (
                     <div className="p-8 text-center text-slate-400 text-sm">
                        No Data
                     </div>
                  ) : (
                     <div className="p-0">
                        <table className="w-full">
                           <thead className="bg-[#1e293b] text-white text-xs">
                              <tr>
                                 <th className="py-2 px-4 text-left font-medium">Control ID</th>
                                 <th className="py-2 px-4 text-left font-medium">Control</th>
                                 <th className="py-2 px-4 text-left font-medium">Type</th>
                                 <th className="py-2 px-4 text-left font-medium">Weightage</th>
                                 <th className="py-2 px-4 text-left font-medium">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="text-sm divide-y">
                              {mappedControls.map(({ mapping, control }, i) => (
                                 <tr key={`${mapping.riskId}-${mapping.controlId}-${i}`} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-2 px-4 text-indigo-600 cursor-pointer">{control.code}</td>
                                    <td className="py-2 px-4">{control.title}</td>
                                    <td className="py-2 px-4">{control.type}</td>
                                    <td className="py-2 px-4">{(mapping.weight * 100).toFixed(0)}%</td>
                                    <td className="py-2 px-4">
                                       {!isReadOnly && (
                                         <Button variant="ghost" size="sm" className="h-6 text-red-500 hover:text-red-700 p-0 px-2" onClick={() => {
                                            if (window.confirm("Are you sure you want to unlink this control?")) {
                                               removeControlMapping(mapping.riskId, mapping.controlId);
                                            }
                                         }}>
                                            Unlink
                                         </Button>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>

               <div className="border rounded-md divide-y bg-white">
                  <div className="bg-rose-50/20 p-6 flex items-center justify-between border-b px-12 gap-12">
                     <div className="w-2/3">
                        <h4 className="text-sm font-medium text-slate-500 mb-6">Residual Risk Rating</h4>
                        <div className="space-y-8">
                           <div className="space-y-2 relative">
                              <p className="text-sm font-medium text-slate-600 mb-2">Overall Likelihood</p>
                              <div className="w-full h-2 bg-slate-200 rounded-lg relative">
                                 <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1/3 h-2 bg-indigo-900 rounded-lg"></div>
                                 <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-4 h-4 rounded-full bg-indigo-900 border-2 border-white shadow-sm -ml-2"></div>
                              </div>
                           </div>
                           <div className="space-y-2 relative">
                              <p className="text-sm font-medium text-slate-600 mb-2">Overall Impact</p>
                              <div className="w-full h-2 bg-slate-200 rounded-lg relative">
                                 <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1/4 h-2 bg-indigo-900 rounded-lg"></div>
                                 <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-4 h-4 rounded-full bg-indigo-900 border-2 border-white shadow-sm -ml-2"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="w-1/3 flex flex-col items-center justify-center border-l pl-12 h-full">
                        <p className="text-sm text-slate-500 mb-4">Residual Rating</p>
                        <span className="text-lg font-semibold text-slate-800">{residualLevel} ({residualScore})</span>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'treatment' && (
            <div className="space-y-6">
               <div className="border rounded-md bg-white">
                  <div className="px-4 py-3 flex justify-between items-center bg-slate-50 border-b">
                     <h4 className="text-sm font-medium text-slate-700">Treatment Plan Details</h4>
                     <div className="flex gap-3 text-xs text-indigo-600 font-medium">
                        <Dialog open={treatmentDialogOpen} onOpenChange={setTreatmentDialogOpen}>
                          {!isReadOnly && (
                            <DialogTrigger className="cursor-pointer hover:underline text-indigo-600 bg-transparent border-none p-0 inline">
                              Add Treatment
                            </DialogTrigger>
                          )}
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Add Treatment Plan</DialogTitle>
                              <DialogDescription>
                                Create a new treatment plan for this risk.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-md border border-indigo-100">
                                 <div className="text-xs text-indigo-700">Need help planning?</div>
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   className="h-7 text-xs bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                   onClick={() => {
                                     setNewTreatment({
                                       ...newTreatment,
                                       title: "Automated Endpoint Monitoring",
                                       description: "Deploy EDR solution across all endpoints. Configure automated isolation policies and integrate alerts with SIEM.",
                                       strategy: "Mitigate",
                                     });
                                   }}
                                 >
                                   <Sparkles className="w-3 h-3 mr-1" />
                                   Generate AI Plan
                                 </Button>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                  id="title"
                                  value={newTreatment.title}
                                  onChange={(e) => setNewTreatment({ ...newTreatment, title: e.target.value })}
                                  placeholder="E.g. Endpoint Upgrade"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="description">Mitigation Plan Description</Label>
                                <textarea
                                  id="description"
                                  className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                  value={newTreatment.description}
                                  onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                                  placeholder="Describe the action steps..."
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="strategy">Strategy</Label>
                                  <Select value={newTreatment.strategy} onValueChange={(val) => setNewTreatment({ ...newTreatment, strategy: val as any })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Strategy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Mitigate">Mitigate</SelectItem>
                                      <SelectItem value="Avoid">Avoid</SelectItem>
                                      <SelectItem value="Transfer">Transfer</SelectItem>
                                      <SelectItem value="Accept">Accept</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="deadline">Target Date</Label>
                                  <Input
                                    id="deadline"
                                    type="date"
                                    value={newTreatment.deadline}
                                    onChange={(e) => setNewTreatment({ ...newTreatment, deadline: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="progress">Initial Progress (%)</Label>
                                <div className="pt-4 pb-2 px-2">
                                  <Slider
                                    id="progress"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={[newTreatment.progress]}
                                    onValueChange={(val) => setNewTreatment({ ...newTreatment, progress: val[0] })}
                                  />
                                  <div className="text-right text-xs text-slate-500 mt-2">{newTreatment.progress}%</div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleSaveTreatment}>Save changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                     </div>
                  </div>
                  {mappedTreatments.length === 0 ? (
                     <div className="p-8 text-center text-slate-400 text-sm">
                        No Data
                     </div>
                  ) : (
                     <div className="p-0">
                        <table className="w-full">
                           <thead className="bg-[#1e293b] text-white text-xs">
                              <tr>
                                 <th className="py-2 px-4 text-left font-medium">Treatment ID</th>
                                 <th className="py-2 px-4 text-left font-medium">Title</th>
                                 <th className="py-2 px-4 text-left font-medium">Strategy</th>
                                 <th className="py-2 px-4 text-left font-medium">Deadline</th>
                                 <th className="py-2 px-4 text-left font-medium">Progress</th>
                              </tr>
                           </thead>
                           <tbody className="text-sm divide-y">
                              {mappedTreatments.map(t => (
                                 <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-2 px-4 text-indigo-600">{t.id}</td>
                                    <td className="py-2 px-4">
                                      <div className="font-medium text-slate-800">{t.title}</div>
                                      {t.description && <div className="text-xs text-slate-500 mt-1">{t.description}</div>}
                                    </td>
                                    <td className="py-2 px-4">{t.strategy}</td>
                                    <td className="py-2 px-4 text-slate-500">{t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
                                    <td className="py-2 px-4">
                                       <div className="flex items-center gap-2">
                                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                             <div className="bg-blue-500 h-1.5" style={{ width: `${t.progress}%` }}></div>
                                          </div>
                                          <span className="text-xs text-slate-500">{t.progress}%</span>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>

      {/* AI Mitigation Chat */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {chatOpen && (
          <Card className="w-80 sm:w-96 shadow-xl border-indigo-100 flex flex-col overflow-hidden h-96">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold text-sm">AI Mitigation Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 text-sm", 
                    msg.role === 'user' ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border text-slate-700 rounded-bl-none shadow-sm")}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white border-t shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about this risk..."
                  className="pr-10 text-sm h-10"
                />
                <Button type="submit" size="icon" className="absolute right-1 top-1 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        )}
        {!chatOpen && (
          <Button 
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl transition-all"
          >
            <Bot className="w-6 h-6 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
}
