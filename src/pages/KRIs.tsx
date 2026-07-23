import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Filter, MoreHorizontal, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/store/DataContext';

export default function KRIs() {
  const { currentRole } = useData();
  const isReadOnly = currentRole === "Internal Auditor";
  const [kris, setKris] = useState([
    { id: 'K-45', riskCode: 'R-161', title: 'Policies renewal proc...', indicator: 'Details of stat...', formula: 'defined', red: 20, amber: 60, green: 100, actual: 39, progress: 100, stage: 'Monitoring', history: [45, 42, 40, 39] },
    { id: 'K-44', riskCode: 'R-159', title: 'Inadequate Succession...', indicator: 'N/A', formula: 'N/A', red: 5, amber: 15, green: 20, actual: 0, progress: 50, stage: 'Monitoring', history: [0, 0, 0, 0] },
    { id: 'K-43', riskCode: 'R-151', title: 'Shortage of UI/UX', indicator: 'Percentage d...', formula: '(Actual Spend - Budge...', red: 2, amber: 7, green: 11, actual: 11, progress: 40, stage: 'Monitoring', history: [4, 6, 9, 11] },
    { id: 'K-42', riskCode: 'R-146', title: 'Risk of Fire', indicator: 'Percentage d...', formula: '(Actual Spend - Budge...', red: 15, amber: 25, green: 40, actual: 55, progress: 100, stage: 'Monitoring', history: [35, 40, 48, 55] },
    { id: 'K-41', riskCode: 'R-141', title: 'Monthly Operations Bu...', indicator: 'Percentage d...', formula: '(Actual Spend - Budge...', red: 110, amber: 105, green: 99, actual: 101, progress: 20, stage: 'Monitoring', history: [108, 105, 102, 101] },
  ]);

  const [updateId, setUpdateId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (val: number, red: number, amber: number, green: number) => {
    // Assuming logic: if red is lower than green (e.g. 20, 60, 100), higher is better
    // if red is higher than green (e.g. 110, 105, 99), lower is better
    const higherIsBetter = green > red;
    
    if (higherIsBetter) {
      if (val <= red) return 'text-red-600 bg-red-100';
      if (val <= amber) return 'text-amber-600 bg-amber-100';
      return 'text-green-600 bg-green-100';
    } else {
      if (val >= red) return 'text-red-600 bg-red-100';
      if (val >= amber) return 'text-amber-600 bg-amber-100';
      return 'text-green-600 bg-green-100';
    }
  };

  const getTrendIcon = (history: number[]) => {
    if (history.length < 2) return <Minus className="w-3 h-3 text-slate-400" />;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    if (last > prev) return <ArrowUpRight className="w-3 h-3 text-red-500" />; // simplistic
    if (last < prev) return <ArrowDownRight className="w-3 h-3 text-green-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const handleUpdate = () => {
    if (isReadOnly) return;
    setKris(kris.map(k => {
       if (k.id === updateId) {
          return { ...k, actual: newValue, history: [...k.history, newValue].slice(-5) };
       }
       return k;
    }));
    setUpdateId(null);
  };

  const filteredKris = kris.filter(k => k.title.toLowerCase().includes(searchQuery.toLowerCase()) || k.id.toLowerCase().includes(searchQuery.toLowerCase()) || k.riskCode.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          Key Risk Indicators (KRIs)
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input type="text" placeholder="Search KRIs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded-md text-sm bg-white" />
            <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          {!isReadOnly && (
            <Button className="bg-[#1e293b]">
              <Plus className="mr-2 h-4 w-4" /> Create KRI
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[100px]">KRI Code</TableHead>
                <TableHead>Risk Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Indicator</TableHead>
                <TableHead>Red (Threshold)</TableHead>
                <TableHead>Amber</TableHead>
                <TableHead>Green</TableHead>
                <TableHead className="text-center">Actual Value</TableHead>
                <TableHead className="text-center">Trend</TableHead>
                <TableHead className="text-center">History</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKris.map((kri) => {
                const statusColor = getStatusColor(kri.actual, kri.red, kri.amber, kri.green);
                const sparkData = kri.history.map((val, i) => ({ val, i }));
                
                return (
                <TableRow key={kri.id}>
                  <TableCell className="font-medium text-xs">{kri.id}</TableCell>
                  <TableCell className="text-indigo-600 text-xs underline cursor-pointer hover:text-indigo-800">{kri.riskCode}</TableCell>
                  <TableCell className="text-xs truncate max-w-[150px]">{kri.title}</TableCell>
                  <TableCell className="text-xs text-slate-500">{kri.indicator}</TableCell>
                  <TableCell className="text-xs">{kri.red}</TableCell>
                  <TableCell className="text-xs">{kri.amber}</TableCell>
                  <TableCell className="text-xs">{kri.green}</TableCell>
                  <TableCell className="text-center">
                     <Badge variant="outline" className={cn("text-xs border-transparent shadow-sm px-2.5 py-0.5", statusColor)}>
                        {kri.actual}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="flex justify-center">{getTrendIcon(kri.history)}</div>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="h-6 w-16 mx-auto">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={sparkData}>
                           <Line type="monotone" dataKey="val" stroke="#64748b" strokeWidth={1.5} dot={false} />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={updateId === kri.id} onOpenChange={(open) => {
                       if(open) { setUpdateId(kri.id); setNewValue(kri.actual); }
                       else setUpdateId(null);
                    }}>
                       {!isReadOnly && (
                         <DialogTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "h-7 text-xs")}>
                            Update
                         </DialogTrigger>
                       )}
                       <DialogContent className="sm:max-w-xs">
                          <DialogHeader>
                             <DialogTitle>Update KRI Value</DialogTitle>
                             <DialogDescription>Enter the latest actual observation for {kri.id}.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-2">
                             <Label>Actual Value</Label>
                             <Input type="number" value={newValue} onChange={(e) => setNewValue(Number(e.target.value))} />
                          </div>
                          <DialogFooter>
                             <Button variant="outline" onClick={() => setUpdateId(null)}>Cancel</Button>
                             <Button onClick={handleUpdate} className="bg-indigo-600">Save</Button>
                          </DialogFooter>
                       </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
