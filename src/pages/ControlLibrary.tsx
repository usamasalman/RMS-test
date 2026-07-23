import { useState } from 'react';
import { useData } from '@/store/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import HelpPanel from '@/components/HelpPanel';
import InteractiveTour from '@/components/InteractiveTour';
import Tooltip from '@/components/Tooltip';

export default function ControlLibrary() {
  const { controls, riskControlMappings, addControl, updateControl, deleteControl, currentRole } = useData();
  const isReadOnly = currentRole === "Internal Auditor";
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Preventive');
  const [nature, setNature] = useState('Automated');
  const [desc, setDesc] = useState('');
  const [designEff, setDesignEff] = useState(80);
  const [opEff, setOpEff] = useState(80);
  const [objective, setObjective] = useState('');
  const [testingProcedure, setTestingProcedure] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [evidence, setEvidence] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setTitle('');
    setType('Preventive');
    setNature('Automated');
    setDesc('');
    setDesignEff(80);
    setOpEff(80);
    setObjective('');
    setTestingProcedure('');
    setFrequency('Monthly');
    setEvidence('');
    setEditingId(null);
  };

  const openEdit = (control: any) => {
    setTitle(control.title);
    setType(control.type);
    setNature(control.nature);
    setDesc(control.description || '');
    setDesignEff(control.designEffectiveness * 100);
    setOpEff(control.operatingEffectiveness * 100);
    setObjective(control.objective || '');
    setTestingProcedure(control.testingProcedure || '');
    setFrequency(control.frequency || 'Monthly');
    setEvidence(control.evidence || '');
    setEditingId(control.id);
    setIsOpen(true);
  };

  const handleSave = () => {
    const payload = {
      title,
      type: type as any,
      nature: nature as any,
      description: desc,
      designEffectiveness: designEff / 100,
      operatingEffectiveness: opEff / 100,
      objective,
      testingProcedure,
      frequency: frequency as any,
      evidence,
    };
    if (editingId) {
      updateControl(editingId, payload);
    } else {
      addControl({
        ...payload,
        ownerId: "u1"
      });
    }
    setIsOpen(false);
  };

  const filteredControls = controls.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-24">
      <HelpPanel
        title="Control Library Guide"
        items={[
          {
            title: "What are Controls?",
            content: "Controls are measures that reduce risk. They can be Preventive (stop issues before they occur), Detective (identify when issues happen), or Corrective (fix issues after they occur)."
          },
          {
            title: "Adding a New Control",
            content: "Click 'Add Control' to create a new control. Provide a title, description, and objective. Set the control type (Preventive/Detective/Corrective) and nature (Automated/Manual/Hybrid)."
          },
          {
            title: "Design vs Operating Effectiveness",
            content: "Design Effectiveness measures how well the control is designed theoretically. Operating Effectiveness measures how well it works in practice. Both should be high (80%+) for effective controls."
          },
          {
            title: "Testing Procedures",
            content: "Document how the control should be tested and how frequently. This helps auditors verify the control is working as intended."
          },
          {
            title: "Linking to Risks",
            content: "Controls are linked to risks from the Risk Detail page. The 'Linked Risks' column shows how many risks each control protects against."
          }
        ]}
        tips={[
          "Use the search bar to quickly find controls by code or title",
          "High design + operating effectiveness = better risk reduction",
          "Automated controls generally have higher operating effectiveness",
          "Review and test controls at their specified frequency",
          "Controls with 0 linked risks may be candidates for removal"
        ]}
      />
      <InteractiveTour
        tourKey="control-library"
        steps={[
          {
            target: '[data-tour="add-control"]',
            title: "Add New Controls",
            content: "Click here to create a new control. You'll specify its type, effectiveness ratings, and testing procedures.",
            position: 'bottom'
          },
          {
            target: '[data-tour="search-controls"]',
            title: "Search Controls",
            content: "Use this search box to filter controls by their code or title for quick access.",
            position: 'bottom'
          },
          {
            target: '[data-tour="effectiveness"]',
            title: "Effectiveness Ratings",
            content: "Design and Operating Effectiveness percentages show how well each control reduces risk. Higher is better!",
            position: 'left'
          },
          {
            target: '[data-tour="linked-risks"]',
            title: "Linked Risks",
            content: "This shows how many risks are protected by each control. Link controls to risks from the Risk Detail page.",
            position: 'top'
          }
        ]}
      />
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Control Library</h2>
          <p className="text-sm text-slate-500">Repository of all organizational mitigating controls.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64" data-tour="search-controls">
            <input type="text" placeholder="Search controls..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded-md text-sm bg-white" />
            <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsOpen(open);
          }}>
            {!isReadOnly && (
              <DialogTrigger className={cn(buttonVariants({ variant: 'default' }))} onClick={() => setIsOpen(true)} data-tour="add-control">
                  <Plus className="mr-2 h-4 w-4" /> Add Control
              </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Control' : 'Add New Control'}</DialogTitle>
                <DialogDescription>
                  Define the properties and effectiveness of this control.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                 <div className="space-y-2">
                   <Label>Control Title</Label>
                   <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                   <Label>Description</Label>
                   <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                   <Label>Control Objective</Label>
                   <Input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g. Ensure all cash payments are authorized." />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label>Control Type</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Preventive">Preventive</SelectItem>
                          <SelectItem value="Detective">Detective</SelectItem>
                          <SelectItem value="Corrective">Corrective</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label>Nature</Label>
                      <Select value={nature} onValueChange={setNature}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Automated">Automated</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label>Testing Frequency</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>Evidence / Documentation</Label>
                     <Input value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="e.g. Approved payment reports" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Testing Procedure</Label>
                   <Textarea value={testingProcedure} onChange={(e) => setTestingProcedure(e.target.value)} placeholder="e.g. Review sample of cash payments for proper approval signatures." />
                 </div>
                 <div className="space-y-4">
                    <Label className="flex justify-between">Design Effectiveness <span>{designEff}%</span></Label>
                    <Slider min={0} max={100} value={[designEff]} onValueChange={(val) => setDesignEff(val[0])} />
                 </div>
                 <div className="space-y-4">
                    <Label className="flex justify-between">Operating Effectiveness <span>{opEff}%</span></Label>
                    <Slider min={0} max={100} value={[opEff]} onValueChange={(val) => setOpEff(val[0])} />
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                 <Button onClick={handleSave} className="bg-indigo-600">Save Control</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Control Title</TableHead>
              <TableHead>
                <Tooltip content="Control category: Preventive (stops), Detective (finds), or Corrective (fixes) issues">
                  <span>Type</span>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip content="Implementation method: Automated (system-based), Manual (human-performed), or Hybrid (combination)">
                  <span>Nature</span>
                </Tooltip>
              </TableHead>
              <TableHead data-tour="effectiveness">
                <Tooltip content="How well the control is designed theoretically (0-100%)">
                  <span>Design Eff.</span>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip content="How well the control performs in actual practice (0-100%)">
                  <span>Operating Eff.</span>
                </Tooltip>
              </TableHead>
              <TableHead className="text-center" data-tour="linked-risks">
                <Tooltip content="Number of risks this control helps mitigate">
                  <span>Linked Risks</span>
                </Tooltip>
              </TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredControls.map((control) => {
              const linkedCount = riskControlMappings.filter(m => m.controlId === control.id).length;
              return (
                <TableRow key={control.id}>
                  <TableCell className="font-medium text-xs text-indigo-600">{control.code}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-700">{control.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">{control.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{control.nature}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${control.designEffectiveness * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500">{control.designEffectiveness * 100}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${control.operatingEffectiveness * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500">{control.operatingEffectiveness * 100}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 text-xs shadow-sm bg-slate-100 border-none">{linkedCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    {!isReadOnly && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(control)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                          if (window.confirm("Are you sure you want to delete this control?")) {
                            deleteControl(control.id);
                          }
                        }}>Delete</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
