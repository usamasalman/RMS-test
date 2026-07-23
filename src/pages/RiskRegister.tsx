import { useState } from 'react';
import { useData } from '@/store/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { computeInherentRiskScore, getRiskLevel, computeResidualRiskScore, computeControlRating } from '@/lib/risk-utils';
import { Plus, Filter, MoreHorizontal, Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Tooltip from '@/components/Tooltip';
import HelpPanel from '@/components/HelpPanel';

export default function RiskRegister() {
  const { risks, riskControlMappings, controls, treatmentPlans, currentRole, updateRisk, deleteRisk } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

  const isAuditor = currentRole === "Internal Auditor";

  const getRiskLevelsCount = (riskList: { level: string }[]) => {
    return {
      'Critical': riskList.filter(r => r.level === 'Critical').length,
      'High': riskList.filter(r => r.level === 'High').length,
      'Moderate': riskList.filter(r => r.level === 'Moderate').length,
      'Low': riskList.filter(r => r.level === 'Low').length,
    };
  };

  const inherentRisks = risks.map(r => {
    const inherentScore = computeInherentRiskScore(r.likelihood, r.impact, r.cia_c || 3, r.cia_i || 3, r.cia_a || 3);
    return {
      ...r,
      level: getRiskLevel(inherentScore),
      inherentScore
    };
  });

  const residualRisks = inherentRisks.map(r => {
    const mappedControls = riskControlMappings.filter(m => m.riskId === r.id);
    
    const controlMappingsForRating = mappedControls.map(mc => {
      const control = controls.find(c => c.id === mc.controlId);
      return {
        design_eff: control ? control.designEffectiveness * 100 : 0,
        operating_eff: control ? control.operatingEffectiveness * 100 : 0,
        weight: mc.weight
      };
    });

    const cr = computeControlRating(controlMappingsForRating);
    const residualScore = computeResidualRiskScore(r.inherentScore, cr);
    
    return {
      ...r,
      level: getRiskLevel(residualScore),
      residualScore
    };
  });

  const filteredRisks = residualRisks.filter(r => {
    if (searchQuery) {
      return r.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
             r.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const sortedRisks = [...filteredRisks].sort((a, b) => {
    if (!sortConfig.direction || !sortConfig.key) return 0;
    
    let aVal: any = a[sortConfig.key as keyof typeof a];
    let bVal: any = b[sortConfig.key as keyof typeof b];

    if (sortConfig.key === 'treatmentProgress') {
        aVal = treatmentPlans.find(t => t.riskId === a.id)?.progress || 0;
        bVal = treatmentPlans.find(t => t.riskId === b.id)?.progress || 0;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
      if (sortConfig.key !== key || !sortConfig.direction) return <ArrowUpDown className="ml-1 h-3 w-3 inline" />;
      if (sortConfig.direction === 'asc') return <ArrowUp className="ml-1 h-3 w-3 inline" />;
      return <ArrowDown className="ml-1 h-3 w-3 inline" />;
  };

  const inherentCounts = getRiskLevelsCount(inherentRisks);
  const residualCounts = getRiskLevelsCount(residualRisks);

  const COLORS = {
    'Critical': '#b91c1c',
    'High': '#ea580c',
    'Moderate': '#fbbf24',
    'Low': '#16a34a',
  };

  const inherentPieData = [
    { name: 'Critical', value: inherentCounts['Critical'] },
    { name: 'High', value: inherentCounts['High'] },
    { name: 'Moderate', value: inherentCounts['Moderate'] },
    { name: 'Low', value: inherentCounts['Low'] },
  ];

  const residualPieData = [
    { name: 'Critical', value: residualCounts['Critical'] },
    { name: 'High', value: residualCounts['High'] },
    { name: 'Moderate', value: residualCounts['Moderate'] },
    { name: 'Low', value: residualCounts['Low'] },
  ];

  const avgTreatmentProgress = treatmentPlans.length > 0 
    ? Math.round(treatmentPlans.reduce((sum, p) => sum + p.progress, 0) / treatmentPlans.length)
    : 0;

  const exportRCM = async () => {
    import('exceljs').then(async (ExcelJS) => {
      import('file-saver').then(({ saveAs }) => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'GRC Platform';
        workbook.created = new Date();

        // --- SUMMARY SHEET ---
        const summarySheet = workbook.addWorksheet('Dashboard & Summary');
        
        summarySheet.columns = [
          { header: '', key: 'col1', width: 5 },
          { header: 'Metric', key: 'metric', width: 30 },
          { header: 'Value', key: 'value', width: 20 },
          { header: '', key: 'spacing', width: 5 },
          { header: 'Breakdown', key: 'breakdown', width: 25 },
          { header: 'Count', key: 'count', width: 15 },
        ];

        // Title
        summarySheet.mergeCells('B2:C2');
        const titleCell = summarySheet.getCell('B2');
        titleCell.value = 'Risk Control Matrix - Executive Summary';
        titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Overall Metrics
        summarySheet.getCell('B4').value = 'Total Risks';
        summarySheet.getCell('C4').value = sortedRisks.length;
        summarySheet.getCell('B5').value = 'Average Treatment Progress';
        summarySheet.getCell('C5').value = `${avgTreatmentProgress}%`;
        
        ['B4','C4','B5','C5'].forEach(cell => {
          summarySheet.getCell(cell).font = { bold: true };
          summarySheet.getCell(cell).border = {
            top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
          };
        });

        // Breakdown Title
        summarySheet.mergeCells('E2:F2');
        const breakdownTitle = summarySheet.getCell('E2');
        breakdownTitle.value = 'Residual Risk Breakdown';
        breakdownTitle.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        breakdownTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
        breakdownTitle.alignment = { vertical: 'middle', horizontal: 'center' };

        const colors = {
          'Critical': 'FFE11D48',
          'High': 'FFEA580C',
          'Moderate': 'FFEAB308',
          'Low': 'FF22C55E'
        };

        let rowOffset = 4;
        Object.entries(residualCounts).forEach(([level, count]) => {
          summarySheet.getCell(`E${rowOffset}`).value = level;
          const countCell = summarySheet.getCell(`F${rowOffset}`);
          countCell.value = count;
          
          const labelCell = summarySheet.getCell(`E${rowOffset}`);
          labelCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors[level as keyof typeof colors] || 'FF94A3B8' } };
          
          countCell.border = {
            top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
          };
          rowOffset++;
        });

        // --- RCM DATA SHEET ---
        const sheet = workbook.addWorksheet('Risk Control Matrix (RCM)', {
          views: [{ state: 'frozen', ySplit: 1 }]
        });

        const headers = [
          { header: "Risk Code", key: "riskCode", width: 15 },
          { header: "Risk Title", key: "riskTitle", width: 35 },
          { header: "Risk Status", key: "riskStatus", width: 15 },
          { header: "Service / Tower", key: "serviceTower", width: 20 },
          { header: "Root Cause", key: "rootCause", width: 35 },
          { header: "Treatment Strategy", key: "treatmentStrategy", width: 20 },
          { header: "Target Date", key: "targetDate", width: 15 },
          { header: "KPI Link", key: "kpiLink", width: 20 },
          { header: "Comments", key: "comments", width: 30 },
          { header: "Inherent Risk", key: "inherentRisk", width: 15 },
          { header: "Residual Risk", key: "residualRisk", width: 15 },
          { header: "Control Code", key: "controlCode", width: 15 },
          { header: "Control Title", key: "controlTitle", width: 35 },
          { header: "Control Objective", key: "controlObjective", width: 35 },
          { header: "Testing Procedure", key: "testingProcedure", width: 35 },
          { header: "Frequency", key: "frequency", width: 15 },
          { header: "Evidence", key: "evidence", width: 25 },
          { header: "Responsible Owner", key: "responsibleOwner", width: 20 }
        ];

        sheet.columns = headers;

        // Style the header row
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        const addRiskRow = (data: any) => {
          const row = sheet.addRow(data);
          row.alignment = { vertical: 'top', wrapText: true };
          
          // Color coding for Inherent Risk (Col J = 10) and Residual Risk (Col K = 11)
          const inherentCell = row.getCell(10);
          const residualCell = row.getCell(11);

          const applyColor = (cell: any, val: string) => {
            cell.font = { bold: true };
            if (val === 'Critical') { cell.font.color = { argb: 'FFE11D48' }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } }; }
            else if (val === 'High') { cell.font.color = { argb: 'FFEA580C' }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } }; }
            else if (val === 'Moderate') { cell.font.color = { argb: 'FFEAB308' }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } }; }
            else if (val === 'Low') { cell.font.color = { argb: 'FF16A34A' }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; }
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          };

          applyColor(inherentCell, data.inherentRisk);
          applyColor(residualCell, data.residualRisk);

          // Add borders to all cells in the row
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          });
        };

        sortedRisks.forEach(risk => {
          const mappedControls = riskControlMappings.filter(m => m.riskId === risk.id);
          const inherentLevel = inherentRisks.find(r => r.id === risk.id)?.level || risk.level;

          if (mappedControls.length === 0) {
            addRiskRow({
              riskCode: risk.code,
              riskTitle: risk.title,
              riskStatus: risk.status,
              serviceTower: risk.serviceTower || '',
              rootCause: risk.rootCause || '',
              treatmentStrategy: risk.treatmentStrategy || 'N/A',
              targetDate: risk.targetDate || 'N/A',
              kpiLink: risk.kpiLink || '',
              comments: risk.comments || '',
              inherentRisk: inherentLevel,
              residualRisk: risk.level,
              controlCode: 'No Control',
              controlTitle: 'N/A',
              controlObjective: 'N/A',
              testingProcedure: 'N/A',
              frequency: 'N/A',
              evidence: 'N/A',
              responsibleOwner: 'N/A'
            });
          } else {
            mappedControls.forEach(mc => {
              const control = controls.find(c => c.id === mc.controlId);
              if (control) {
                addRiskRow({
                  riskCode: risk.code,
                  riskTitle: risk.title,
                  riskStatus: risk.status,
                  serviceTower: risk.serviceTower || '',
                  rootCause: risk.rootCause || '',
                  treatmentStrategy: risk.treatmentStrategy || 'N/A',
                  targetDate: risk.targetDate || 'N/A',
                  kpiLink: risk.kpiLink || '',
                  comments: risk.comments || '',
                  inherentRisk: inherentLevel,
                  residualRisk: risk.level,
                  controlCode: control.code,
                  controlTitle: control.title,
                  controlObjective: control.objective || '',
                  testingProcedure: control.testingProcedure || '',
                  frequency: control.frequency || 'N/A',
                  evidence: control.evidence || '',
                  responsibleOwner: control.ownerId || 'N/A'
                });
              }
            });
          }
        });

        // Add auto-filters to the data sheet
        sheet.autoFilter = {
          from: 'A1',
          to: `R${sheet.rowCount}`
        };

        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, 'Risk_Control_Matrix.xlsx');
        });
      });
    });
  };

  return (
    <div className="space-y-6">
      <HelpPanel
        title="How to Use Risk Register"
        items={[
          {
            title: "Creating Risks",
            content: "Click the 'Create Risk' button to document a new risk. Fill in details including likelihood, impact, and CIA ratings to calculate inherent risk scores automatically."
          },
          {
            title: "Understanding Risk Levels",
            content: "Inherent risk is calculated before controls. Residual risk shows the level after applying controls. Lower residual risk indicates effective control implementation."
          },
          {
            title: "Linking Controls",
            content: "Use the Actions menu to link existing controls to risks. Control effectiveness automatically reduces residual risk scores based on design and operating effectiveness."
          },
          {
            title: "Exporting RCM",
            content: "Click 'Export RCM' to generate a comprehensive Risk Control Matrix in Excel format with all risk details, linked controls, and treatment plans."
          },
          {
            title: "Treatment Progress",
            content: "The progress bar shows completion percentage of treatment plan tasks. Hover over values to see specific targets and deadlines."
          }
        ]}
        tips={[
          "Use the search bar to quickly find risks by code or title",
          "Click column headers to sort by that field (inherent, residual, progress, etc.)",
          "The pie charts compare inherent vs residual risk distributions",
          "Submit risks for approval through the Actions dropdown menu"
        ]}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          Risk Register <Filter className="w-5 h-5 text-slate-400" />
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto overflow-hidden text-sm">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search risks..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={exportRCM} className="gap-2 flex-1 sm:flex-none h-9 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            <Download className="w-4 h-4" /> Export RCM
          </Button>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none h-9">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          {!isAuditor && (
            <Button className="bg-[#1e293b] flex-1 sm:flex-none h-9" onClick={() => navigate('/risks/new')}>
              <Plus className="mr-2 h-4 w-4" /> Create Risk
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overview Stats */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <div className="text-center w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <p className="text-sm font-medium text-slate-500 mb-2">Total Risk</p>
            <p className="text-5xl font-light">{risks.length}</p>
          </div>
          <div className="text-center w-full sm:w-1/2">
            <p className="text-sm font-medium text-slate-500 mb-2">Treatment Progress</p>
            <p className="text-5xl font-light">{avgTreatmentProgress}%</p>
          </div>
        </Card>

        {/* Risk by Stage Placeholder */}
        <Card className="p-4 flex flex-col justify-center min-h-[140px]">
           <p className="text-xs font-semibold text-slate-500 mb-3">Risk by Stage</p>
           <div className="space-y-2">
              <div className="flex items-center text-xs gap-2"><div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden"><div className="bg-red-500 w-1/3 h-full"></div></div><span className="w-12">Risk</span></div>
              <div className="flex items-center text-xs gap-2"><div className="flex-1 bg-slate-100 h-4 rounded overflow-hidden"><div className="bg-orange-500 w-2/3 h-full"></div></div><span className="w-12">Control</span></div>
           </div>
        </Card>

        {/* Inherent Risk Pie */}
        <Card className="flex flex-col items-center p-2 relative min-h-[140px]">
          <div className="absolute top-2 left-3 text-xs font-semibold text-slate-500">Inherent Risk</div>
          <div className="w-24 h-24 relative pt-4 mx-auto">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inherentPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value">
                    {inherentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center pointer-events-none pb-1 text-center">
                 <span className="text-[10px] text-slate-500 leading-none">Total</span>
                 <span className="text-sm font-bold leading-none">{risks.length}</span>
               </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 px-2 pb-2 text-[10px] text-slate-600 mt-2">
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-700 mr-1"></span>Critical</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span>High</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>Moderate</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>Low</span>
           </div>
        </Card>

        {/* Residual Risk Pie */}
        <Card className="flex flex-col items-center p-2 relative min-h-[140px]">
           <div className="absolute top-2 left-3 text-xs font-semibold text-slate-500">Residual Risk</div>
          <div className="w-24 h-24 relative pt-4 mx-auto">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={residualPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value">
                    {residualPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center pointer-events-none pb-1 text-center">
                 <span className="text-[10px] text-slate-500 leading-none">Total</span>
                 <span className="text-sm font-bold leading-none">{risks.length}</span>
               </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 px-2 pb-2 text-[10px] text-slate-600 mt-2">
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-700 mr-1"></span>Critical</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span>High</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>Moderate</span>
             <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>Low</span>
           </div>
        </Card>
      </div>

      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('code')}>
                <Tooltip content="Unique identifier for this risk (e.g., IT-35, FIN-12)">
                  <span>Code {getSortIcon('code')}</span>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                <Tooltip content="Brief description of the risk event or scenario">
                  <span>Title {getSortIcon('title')}</span>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip content="Business unit or service area where this risk originates">
                  <span>Service / Tower</span>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip content="Underlying cause or source of the risk">
                  <span>Root Cause</span>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip content="How the organization plans to address this risk (Accept, Mitigate, Transfer, or Avoid)">
                  <span>Treatment Strategy</span>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <Tooltip content="Current lifecycle stage of the risk (Monitoring or Control phase)">
                  <span>Stage {getSortIcon('status')}</span>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('inherentScore')}>
                <Tooltip content="Risk level before any controls are applied (based on likelihood × impact × CIA ratings)">
                  <span>Inherent {getSortIcon('inherentScore')}</span>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('residualScore')}>
                <Tooltip content="Risk level after applying controls and their effectiveness ratings">
                  <span>Residual {getSortIcon('residualScore')}</span>
                </Tooltip>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('treatmentProgress')}>
                <Tooltip content="Percentage completion of treatment plan tasks and milestones">
                  <span>Treatment Progress {getSortIcon('treatmentProgress')}</span>
                </Tooltip>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRisks.map((risk) => {
              const inherentScore = computeInherentRiskScore(risk.likelihood, risk.impact, risk.cia_c || 3, risk.cia_i || 3, risk.cia_a || 3);
              const inherentLvl = getRiskLevel(inherentScore);
              const treatment = treatmentPlans.find(t => t.riskId === risk.id);
              return (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium text-indigo-600 text-xs">{risk.code}</TableCell>
                  <TableCell className="text-xs">{risk.title}</TableCell>
                  <TableCell className="text-xs text-slate-500">{risk.serviceTower || 'N/A'}</TableCell>
                  <TableCell className="text-xs text-slate-500">{risk.rootCause || 'N/A'}</TableCell>
                  <TableCell className="text-xs text-slate-500">{risk.treatmentStrategy || 'N/A'}</TableCell>
                  <TableCell>
                     <Badge variant="secondary" className="text-[10px] bg-slate-100 text-purple-700 hover:bg-slate-100">
                        {risk.status === 'Open' ? 'Monitoring' : 'Control'}
                     </Badge>
                  </TableCell>
                  <TableCell>
                     <span className="flex items-center text-xs text-slate-700">
                        <span className={cn("w-2 h-2 rounded-full mr-2", 
                           inherentLvl === 'Low' ? 'bg-green-500' : 
                           inherentLvl === 'Moderate' ? 'bg-amber-400' : 
                           inherentLvl === 'High' ? 'bg-orange-500' : 'bg-red-700')}></span>
                        {inherentLvl}
                     </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center text-xs text-slate-700">
                        <span className={cn("w-2 h-2 rounded-full mr-2", 
                           risk.level === 'Low' ? 'bg-green-500' : 
                           risk.level === 'Moderate' ? 'bg-amber-400' : 
                           risk.level === 'High' ? 'bg-orange-500' : 'bg-red-700')}></span>
                        {risk.level}
                     </span>
                  </TableCell>
                  <TableCell>
                     <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex items-center">
                        <div className="bg-blue-500 h-1.5" style={{ width: `${treatment ? treatment.progress : 0}%` }}></div>
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost' }), "h-8 w-8 p-0")}>
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/risks/${risk.id}`)}>View Detail</DropdownMenuItem>
                        {!isAuditor && (
                          <>
                            <DropdownMenuItem onClick={() => navigate(`/risks/${risk.id}/edit`)}>Edit Risk</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                               onClick={() => updateRisk(risk.id, { status: 'Under Review' })}
                               disabled={risk.status === 'Under Review'}
                            >
                               {risk.status === 'Under Review' ? 'Under Review' : 'Submit for Approval'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/risks/${risk.id}?action=control`)}>Link Control</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/risks/${risk.id}?action=treatment`)}>Create Treatment Plan</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this risk?")) {
                                  deleteRisk(risk.id);
                                }
                              }}
                            >
                              Delete Risk
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
