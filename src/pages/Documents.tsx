import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Search, FileText, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useData } from '@/store/DataContext';

export default function Documents() {
  const { currentRole } = useData();
  const isReadOnly = currentRole === "Internal Auditor";
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const [documents] = useState([
    { id: 1, title: 'COSO Framework', description: 'COSO Framework Documentation', category: 'Framework', iconColor: 'purple' },
    { id: 2, title: 'Risk Appetite Statement 2025', description: 'Annual risk appetite and limits for the enterprise.', category: 'Risk Appetite', iconColor: 'blue' },
    { id: 3, title: 'ISO 27001 Security Standard', description: 'Information Security Management System documentation.', category: 'Framework', iconColor: 'emerald' },
    { id: 4, title: 'Vendor Risk Policy', description: 'Policy regarding third-party service provider risks.', category: 'Policy', iconColor: 'amber' },
  ]);

  const handleUpload = () => {
    if (isReadOnly) return;
    setIsUploading(true);
    setTimeout(() => {
       setIsUploading(false);
       setIsOpen(false);
    }, 1500);
  };

  const filteredDocs = documents.filter(doc => {
     const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.description.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesTab = activeTab === 'All' || doc.category === activeTab;
     return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          Governance Documents
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {!isReadOnly && (
              <DialogTrigger className={cn(buttonVariants(), "bg-[#1e293b]")}>
                   <Upload className="mr-2 h-4 w-4" /> Upload Document
              </DialogTrigger>
            )}
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>Upload policies, SOC reports, or frameworks. AI will automatically extract entities.</DialogDescription>
               </DialogHeader>
               <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 text-slate-400 mb-4" />
                  <p className="text-sm font-medium text-slate-600">Click or drag file to this area to upload</p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT</p>
                  <Input type="file" className="hidden" ref={fileInputRef} onChange={() => handleUpload()} />
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button disabled={isUploading} className="bg-indigo-600 w-24">
                     {isUploading ? 'Extracting...' : 'Save'}
                  </Button>
               </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between border-b pb-4 mb-6 relative">
         <div className="flex items-center gap-6 text-sm font-medium overflow-x-auto w-full mr-4 hide-scrollbar">
            {['All', 'Framework', 'Risk Appetite', 'Policy'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn("whitespace-nowrap pb-4 -mb-4 border-b-2 transition-colors", activeTab === tab ? "text-indigo-600 border-indigo-600" : "text-slate-500 hover:text-slate-800 border-transparent")}
              >
                {tab}
              </button>
            ))}
         </div>
         <div className="relative shrink-0 hidden sm:block">
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-8 pr-4 py-1.5 border rounded-md text-sm bg-white border-slate-200" />
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
         </div>
      </div>
      <div className="sm:hidden mb-6 relative">
          <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-4 py-1.5 border rounded-md text-sm bg-white border-slate-200" />
          <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filteredDocs.map((doc) => (
             <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-start gap-4">
                 <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", 
                    doc.iconColor === 'purple' && 'bg-purple-100',
                    doc.iconColor === 'blue' && 'bg-blue-100',
                    doc.iconColor === 'emerald' && 'bg-emerald-100',
                    doc.iconColor === 'amber' && 'bg-amber-100'
                 )}>
                    <FileText className={cn("w-5 h-5", 
                       doc.iconColor === 'purple' && 'text-purple-600',
                       doc.iconColor === 'blue' && 'text-blue-600',
                       doc.iconColor === 'emerald' && 'text-emerald-600',
                       doc.iconColor === 'amber' && 'text-amber-600'
                    )} />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 flex justify-between group-hover:text-indigo-600 transition-colors">
                       {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{doc.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                       <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                          doc.iconColor === 'purple' && 'bg-purple-100 text-purple-700',
                          doc.iconColor === 'blue' && 'bg-blue-100 text-blue-700',
                          doc.iconColor === 'emerald' && 'bg-emerald-100 text-emerald-700',
                          doc.iconColor === 'amber' && 'bg-amber-100 text-amber-700'
                       )}>{doc.category}</span>
                       <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors"></span>
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
