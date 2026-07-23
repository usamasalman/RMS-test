import { useState } from 'react';
import { useData } from '@/store/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import HelpPanel from '@/components/HelpPanel';
import { helpContent } from '@/config/helpContent';

export default function TreatmentMonitor() {
  const { treatmentPlans, risks, updateTreatmentPlan, deleteTreatmentPlan, controls, currentRole } = useData();
  const isReadOnly = currentRole === "Internal Auditor";
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for updating full plan details
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStrategy, setEditStrategy] = useState<any>('Mitigate');
  const [editMappedControl, setEditMappedControl] = useState<string>('none');
  const [editDeadline, setEditDeadline] = useState('');
  const [newProgress, setNewProgress] = useState(0);

  const TABS = ['All', 'On Track', 'At Risk', 'Overdue', 'Completed'];

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatus = (plan: any) => {
    if (plan.progress === 100) return 'Completed';
    const days = getDaysRemaining(plan.deadline);
    if (days < 0) return 'Overdue';
    if (days < 30) return 'At Risk';
    return 'On Track';
  };

  const filteredPlans = treatmentPlans.filter(plan => {
    const risk = risks.find(r => r.id === plan.riskId);
    let matchSearch = true;
    if (searchQuery && risk) {
       matchSearch = risk.code.toLowerCase().includes(searchQuery.toLowerCase()) || risk.title.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchQuery && !risk) {
       matchSearch = false;
    }

    if (activeTab === 'All') return matchSearch;
    return matchSearch && getStatus(plan) === activeTab;
  });

  const handleUpdateProgress = () => {
    if (!editingId) return;
    updateTreatmentPlan(editingId, {
      title: editTitle,
      description: editDescription,
      strategy: editStrategy,
      deadline: editDeadline,
      progress: newProgress,
      mappedControlId: editMappedControl === 'none' ? undefined : editMappedControl
    });
    setEditingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge className="bg-green-500 hover:bg-green-600 border-none font-normal">Completed</Badge>;
      case 'Overdue': return <Badge variant="destructive" className="font-normal border-none">Overdue</Badge>;
      case 'At Risk': return <Badge className="bg-amber-500 hover:bg-amber-600 border-none font-normal">At Risk</Badge>;
      default: return <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-normal hover:bg-blue-100">On Track</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <HelpPanel
        title={helpContent.treatmentMonitor.title}
        items={helpContent.treatmentMonitor.items}
        tips={helpContent.treatmentMonitor.tips}
      />
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Treatment Monitor</h2>
          <p className="text-sm text-slate-500">Track progress of risk mitigation and action plans.</p>
        </div>
        <div className="flex gap-2 text-sm w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
              <input type="text" placeholder="Search by risk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded-md text-sm bg-white" />
              <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           <Button variant="outline" size="sm" className="h-9">Change Owner</Button>
           <Button variant="outline" size="sm" className="h-9">Update Status</Button>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center",
              activeTab === tab 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 block"
            )}
          >
            {tab}
            {tab === 'Overdue' && (
              <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">
                {treatmentPlans.filter(p => getStatus(p) === 'Overdue').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Associated Risk</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target Deadline</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlans.map((plan) => {
              const risk = risks.find(r => r.id === plan.riskId);
              const days = getDaysRemaining(plan.deadline);
              const status = getStatus(plan);
              
              return (
                <TableRow key={plan.id}>
                  <TableCell>
                    {risk ? (
                      <div>
                        <div className="font-medium text-xs text-indigo-600">{risk.code}</div>
                        <div className="text-xs text-slate-700">{risk.title}</div>
                      </div>
                    ) : 'Unknown Risk'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.strategy === 'Mitigate' ? 'default' : 'secondary'} className="text-[10px] font-normal">
                      {plan.strategy}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     {getStatusBadge(status)}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">
                    <div>{new Date(plan.deadline).toLocaleDateString()}</div>
                    {status !== 'Completed' && (
                       <div className={cn("text-[10px] mt-1 font-medium", days < 0 ? "text-red-500" : days < 30 ? "text-amber-500" : "text-slate-400")}>
                         {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`}
                       </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 w-32">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{plan.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 transition-all" style={{ width: `${plan.progress}%` }}></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={editingId === plan.id} onOpenChange={(open) => {
                       if(open) { 
                          setEditingId(plan.id); 
                          setEditTitle(plan.title || '');
                          setEditDescription(plan.description || '');
                          setEditStrategy(plan.strategy || 'Mitigate');
                          setEditMappedControl(plan.mappedControlId || 'none');
                          setEditDeadline(plan.deadline.split('T')[0]);
                          setNewProgress(plan.progress); 
                       }
                       else setEditingId(null);
                    }}>
                       {!isReadOnly && (
                         <DialogTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-indigo-600 hover:bg-slate-100 h-8")}>
                            Update
                         </DialogTrigger>
                       )}
                       <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                             <DialogTitle>Update Treatment Plan</DialogTitle>
                             <DialogDescription>Modify the treatment details, mapped controls, and tracking progress.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                             <div className="grid gap-2">
                               <Label htmlFor="title">Title</Label>
                               <Input
                                 id="title"
                                 value={editTitle}
                                 onChange={(e) => setEditTitle(e.target.value)}
                                 placeholder="E.g. Endpoint Upgrade"
                               />
                             </div>
                             <div className="grid gap-2">
                               <Label htmlFor="description">Mitigation Plan Description</Label>
                               <Textarea
                                 id="description"
                                 className="flex h-20 w-full"
                                 value={editDescription}
                                 onChange={(e) => setEditDescription(e.target.value)}
                                 placeholder="Describe the action steps..."
                               />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="grid gap-2">
                                 <Label htmlFor="strategy">Strategy</Label>
                                 <Select value={editStrategy} onValueChange={(val) => setEditStrategy(val as any)}>
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
                                   value={editDeadline}
                                   onChange={(e) => setEditDeadline(e.target.value)}
                                 />
                               </div>
                             </div>
                             <div className="grid gap-2">
                                <Label htmlFor="control">Map to Existing Control</Label>
                                <Select value={editMappedControl} onValueChange={setEditMappedControl}>
                                   <SelectTrigger>
                                     <SelectValue placeholder="Select Control" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="none">No specific control</SelectItem>
                                     {controls.map(c => (
                                       <SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>
                                     ))}
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="pt-2">
                                <Label className="flex justify-between text-sm font-medium mb-4">Progress <span>{newProgress}%</span></Label>
                                <Slider min={0} max={100} step={5} value={[newProgress]} onValueChange={(v) => setNewProgress(v[0])} />
                             </div>
                          </div>
                          <DialogFooter>
                             <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                             <Button onClick={handleUpdateProgress} className="bg-indigo-600">Save Changes</Button>
                          </DialogFooter>
                       </DialogContent>
                    </Dialog>

                    <Link to={`/risks/${plan.riskId}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-slate-500 h-8")}>
                      View Risk
                    </Link>
                    {!isReadOnly && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8" onClick={() => {
                        if (window.confirm("Are you sure you want to delete this treatment plan?")) {
                          deleteTreatmentPlan(plan.id);
                        }
                      }}>
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {filteredPlans.length === 0 && (
               <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                     No treatment plans match this view.
                  </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
