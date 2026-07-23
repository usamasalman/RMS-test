import { useData } from '@/store/DataContext';
import { Shield, AlertTriangle, TrendingDown, Clock, Target, Sparkles, Bell, ExternalLink } from 'lucide-react';
import { computeInherentRiskScore, getRiskLevel, computeControlRating, computeResidualRiskScore, getRiskColor } from '@/lib/risk-utils';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Tooltip from '@/components/Tooltip';
import HelpPanel from '@/components/HelpPanel';

export default function Dashboard() {
  const { risks, treatmentPlans, riskControlMappings, controls } = useData();
  const [heatmapMode, setHeatmapMode] = useState<'inherent' | 'residual'>('inherent');

  const inherentRisks = risks.map(r => {
    const inherentScore = computeInherentRiskScore(r.likelihood, r.impact, r.cia_c || 3, r.cia_i || 3, r.cia_a || 3);
    return { ...r, level: getRiskLevel(inherentScore), inherentScore };
  });

  const residualRisks = inherentRisks.map(r => {
    const mappedControls = riskControlMappings.filter(m => m.riskId === r.id);
    const cr = computeControlRating(mappedControls.map(mc => {
      const control = controls.find(c => c.id === mc.controlId);
      return { design_eff: control ? control.designEffectiveness * 100 : 0, operating_eff: control ? control.operatingEffectiveness * 100 : 0, weight: mc.weight };
    }));
    const residualScore = computeResidualRiskScore(r.inherentScore, cr);
    const factor = Math.sqrt(1 - cr);
    const likelihood = Math.max(1, Math.round(r.likelihood * factor));
    const impact = Math.max(1, Math.round(r.impact * factor));
    return { ...r, level: getRiskLevel(residualScore), residualScore, likelihood, impact };
  });

  const getCounts = (riskList: { level: string }[]) => ({
    'Critical': riskList.filter(r => r.level === 'Critical').length,
    'High': riskList.filter(r => r.level === 'High').length,
    'Moderate': riskList.filter(r => r.level === 'Moderate').length,
    'Low': riskList.filter(r => r.level === 'Low').length,
  });

  const inherentCounts = getCounts(inherentRisks);
  const residualCounts = getCounts(residualRisks);

  const totalRisks = risks.length;
  const criticalHighCount = residualCounts['Critical'] + residualCounts['High'];
  
  const totalInherentScore = inherentRisks.reduce((sum, r) => sum + r.inherentScore, 0);
  const totalResidualScore = residualRisks.reduce((sum, r) => sum + r.residualScore, 0);
  const reductionEffectiveness = totalInherentScore > 0 ? Math.round(((totalInherentScore - totalResidualScore) / totalInherentScore) * 100) : 0;

  const today = new Date();
  const overdueActions = treatmentPlans.filter(tp => {
    if (tp.progress >= 100) return false;
    if (!tp.deadline) return false;
    return new Date(tp.deadline) < today;
  });

  const getHeatmapColor = (x: number, y: number) => {
    const score = x * y;
    if (score >= 16) return 'bg-[#FCEBEB] text-[#A32D2D]';
    if (score >= 10) return 'bg-[#FBEAF0] text-[#993556]';
    if (score >= 5) return 'bg-[#FAEEDA] text-[#854F0B]';
    return 'bg-[#EAF3DE] text-[#3B6D11]';
  };

  const getHeatmapRisks = (x: number, y: number) => {
    const list = heatmapMode === 'inherent' ? inherentRisks : residualRisks;
    return list.filter(r => r.likelihood === y && r.impact === x);
  };

  return (
    <div className="bg-slate-50 min-h-[900px] text-[13px] text-slate-800 p-4 -m-4 font-sans">
      <HelpPanel
        title="How to Use Dashboard"
        items={[
          {
            title: "Understanding KPIs",
            content: "The top row shows key performance indicators including total risks, critical/high risks, risk reduction effectiveness, overdue actions, and risk appetite utilization. Hover over any metric for more details."
          },
          {
            title: "Reading the Heatmap",
            content: "The heatmap visualizes risk distribution across likelihood (vertical) and impact (horizontal) axes. Click the toggle to switch between inherent and residual views. Hover over cells to see specific risks."
          },
          {
            title: "Risk Stage Comparison",
            content: "Compare inherent risk levels (before controls) with post-treatment levels to see the effectiveness of your risk mitigation strategies."
          },
          {
            title: "Compliance Tracking",
            content: "Monitor your organization's compliance with various frameworks like NCA ECC, ISO 27001, and NIST CSF. Red/orange bars indicate areas requiring attention."
          }
        ]}
        tips={[
          "Click on any risk in the 'Top Enterprise Risks' section to view full details",
          "Use the audit trail to track recent risk assessment changes",
          "The indigo line on charts represents your risk appetite threshold"
        ]}
      />
      {/* Section Divider */}
      <div className="flex items-center gap-2 mt-1 mb-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Executive KPIs</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        {/* Total Risks */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <Tooltip content="Total number of identified risks across all categories and service towers" icon>
              <span>Total risks</span>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-slate-800 leading-none">{totalRisks}</div>
          <div className="text-[11px] mt-1.5 flex items-center gap-1 text-red-700 font-medium">↑ +3 <span className="text-slate-400 font-normal">vs. last 30d</span></div>
          <svg className="w-full h-6 mt-2" viewBox="0 0 80 24"><polyline fill="none" stroke="#E24B4A" strokeWidth="1.5" points="0,18 10,16 20,14 30,17 40,12 50,15 60,10 70,13 80,11"/></svg>
        </div>
        {/* Critical / High */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <Tooltip content="Number of risks rated as Critical or High severity after applying controls. These require immediate attention and treatment." icon>
              <span>Critical / High</span>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-slate-800 leading-none">{criticalHighCount}</div>
          <div className="text-[11px] mt-1.5 flex items-center gap-1 text-red-700 font-medium">↑ +2 <span className="text-slate-400 font-normal">vs. last 30d</span></div>
          <svg className="w-full h-6 mt-2" viewBox="0 0 80 24"><polyline fill="none" stroke="#EF9F27" strokeWidth="1.5" points="0,16 10,14 20,18 30,12 40,15 50,10 60,13 70,8 80,10"/></svg>
        </div>
        {/* Risk reduction */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            <Tooltip content="Percentage reduction from inherent to residual risk scores. Measures the effectiveness of your control framework and treatment plans." icon>
              <span>Risk reduction</span>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-slate-800 leading-none">{reductionEffectiveness}%</div>
          <div className="text-[11px] mt-1.5 flex items-center gap-1 text-green-700 font-medium">↑ +4pp <span className="text-slate-400 font-normal">treatment effectiveness</span></div>
          <svg className="w-full h-6 mt-2" viewBox="0 0 80 24"><polyline fill="none" stroke="#16a34a" strokeWidth="1.5" points="0,20 10,18 20,15 30,16 40,12 50,10 60,9 70,7 80,6"/></svg>
        </div>
        {/* Overdue actions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[11px] text-red-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <Tooltip content="Number of treatment plan tasks that have passed their target completion date. These may indicate SLA breaches and require escalation." icon>
              <span>Overdue actions</span>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-red-800 leading-none">{overdueActions.length}</div>
          <div className="text-[11px] mt-1.5 flex items-center gap-1 text-red-700 font-medium">↑ +{overdueActions.length > 5 ? 2 : 1} <span className="text-red-400 font-normal">SLA breach</span></div>
          <svg className="w-full h-6 mt-2" viewBox="0 0 80 24"><polyline fill="none" stroke="#ef4444" strokeWidth="1.5" points="0,10 10,12 20,10 30,14 40,11 50,14 60,12 70,16 80,14"/></svg>
        </div>
        {/* Appetite utilisation */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <Tooltip content="Current risk level as a percentage of your organization's approved risk appetite threshold. Staying below 100% indicates acceptable risk exposure." icon>
              <span>Appetite utilisation</span>
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-slate-800 leading-none">74%</div>
          <div className="text-[11px] mt-1.5 flex items-center gap-1 text-slate-500 font-medium">→ <span className="text-slate-400 font-normal">of approved threshold</span></div>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="flex items-center gap-2 mt-2 mb-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Risk landscape</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* Mid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
        {/* Heatmap */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            {heatmapMode === 'inherent' ? 'Inherent' : 'Residual'} risk heatmap
            <button 
              onClick={() => setHeatmapMode(m => m === 'inherent' ? 'residual' : 'inherent')}
              className="text-[11px] font-normal text-indigo-600 hover:underline"
            >
              {heatmapMode === 'inherent' ? 'Compare residual ↗' : 'Compare inherent ↗'}
            </button>
          </div>
          <div className="flex gap-1.5 mb-3">
            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">Critical</span>
            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-[#FBEAF0] text-[#993556]">High</span>
            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-[#FAEEDA] text-[#854F0B]">Moderate</span>
            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-[#EAF3DE] text-[#3B6D11]">Low</span>
            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">│ Appetite</span>
          </div>
          <div className="flex items-end gap-1.5 flex-1 pb-4">
            <div className="text-[9px] text-slate-400 flex items-center justify-center shrink-0 uppercase tracking-widest relative w-4">
              <span className="-rotate-90 absolute whitespace-nowrap origin-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Likelihood</span>
            </div>
            <div className="flex-1 flex flex-col relative">
              <div className="grid grid-cols-[16px_repeat(5,1fr)] grid-rows-[repeat(5,1fr)_16px] gap-[2px] h-[160px]">
                {Array.from({ length: 5 }, (_, i) => 5 - i).map(y => (
                  <div key={`row-${y}`} className="contents">
                    <div className="text-[9px] text-slate-400 flex items-center justify-center">{y}</div>
                    {Array.from({ length: 5 }, (_, j) => j + 1).map(x => {
                      const risksInCell = getHeatmapRisks(x, y);
                      const count = risksInCell.length;
                      return (
                        <div key={`cell-${x}-${y}`} className={cn(
                          "rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:brightness-90 relative group",
                          getHeatmapColor(x, y),
                          count === 0 && "opacity-40"
                        )}>
                          {count > 0 ? count : ''}
                          {x === 3 && y === 5 && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600/60 rounded-full mx-0.5 mb-0.5"></div>}
                          
                          {count > 0 && (
                            <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[11px] font-normal p-2.5 rounded-lg shadow-xl w-48 left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none text-left">
                              <div className="font-semibold mb-1 pb-1 border-b border-slate-600 flex justify-between">
                                <span>{heatmapMode === 'inherent' ? 'Inherent' : 'Residual'} Risks</span>
                                <span className="text-slate-400">{count}</span>
                              </div>
                              <div className="max-h-32 overflow-y-auto pr-1 flex flex-col gap-1 mt-1.5">
                                {risksInCell.map(r => (
                                  <div key={r.id} className="truncate" title={r.title}>
                                    <span className="text-slate-400 mr-1">{r.code}</span>
                                    {r.title}
                                  </div>
                                ))}
                              </div>
                              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div className="contents">
                  <div></div>
                  {[1, 2, 3, 4, 5].map(x => <div key={`col-${x}`} className="text-[9px] text-slate-400 flex items-center justify-center">{x}</div>)}
                </div>
              </div>
              <div className="text-center text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Impact →</div>
            </div>
          </div>
        </div>

        {/* Risk stage comparison (Simplified rendering) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-800 mb-3">Risk stage comparison</div>
          <div className="flex flex-col gap-3">
            {/* Inherent */}
            <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Inherent</div>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 shrink-0">
                  <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    {totalRisks > 0 && <>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray={`${(inherentCounts['Critical']/totalRisks)*125} 125`} />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#f97316" strokeWidth="6" strokeDasharray={`${(inherentCounts['High']/totalRisks)*125} 125`} strokeDashoffset={-((inherentCounts['Critical']/totalRisks)*125)} />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#eab308" strokeWidth="6" strokeDasharray={`${(inherentCounts['Moderate']/totalRisks)*125} 125`} strokeDashoffset={-(((inherentCounts['Critical']+inherentCounts['High'])/totalRisks)*125)} />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray={`${(inherentCounts['Low']/totalRisks)*125} 125`} strokeDashoffset={-(((inherentCounts['Critical']+inherentCounts['High']+inherentCounts['Moderate'])/totalRisks)*125)} />
                    </>}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">{totalRisks}</div>
                </div>
                <div className="flex-1 text-[11px] flex flex-col gap-1 font-medium">
                  <div className="flex justify-between"><span className="text-red-600">● Critical</span><span>{inherentCounts['Critical']}</span></div>
                  <div className="flex justify-between"><span className="text-orange-500">● High</span><span>{inherentCounts['High']}</span></div>
                  <div className="flex justify-between"><span className="text-yellow-600">● Moderate</span><span>{inherentCounts['Moderate']}</span></div>
                  <div className="flex justify-between"><span className="text-green-600">● Low</span><span>{inherentCounts['Low']}</span></div>
                </div>
              </div>
            </div>
            {/* Post Treatment */}
            <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex justify-between">
                Post-treatment <span className="text-green-700">↓ {reductionEffectiveness}% reduction</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 shrink-0">
                  <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    {totalRisks > 0 && <>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray={`${(residualCounts['Critical']/totalRisks)*125} 125`} />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#f97316" strokeWidth="6" strokeDasharray={`${(residualCounts['High']/totalRisks)*125} 125`} strokeDashoffset={-((residualCounts['Critical']/totalRisks)*125)} />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#eab308" strokeWidth="6" strokeDasharray={`${(residualCounts['Moderate']/totalRisks)*125} 125`} strokeDashoffset={-(((residualCounts['Critical']+residualCounts['High'])/totalRisks)*125)} />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray={`${(residualCounts['Low']/totalRisks)*125} 125`} strokeDashoffset={-(((residualCounts['Critical']+residualCounts['High']+residualCounts['Moderate'])/totalRisks)*125)} />
                    </>}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">{totalRisks}</div>
                </div>
                <div className="flex-1 text-[11px] flex flex-col gap-1 font-medium">
                  <div className="flex justify-between">
                    <span className="text-red-600">● Critical</span>
                    <span>{residualCounts['Critical']} <span className="text-green-700 text-[9px] ml-1">{residualCounts['Critical'] < inherentCounts['Critical'] ? `-${inherentCounts['Critical'] - residualCounts['Critical']}` : ''}</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-500">● High</span>
                    <span>{residualCounts['High']} <span className="text-green-700 text-[9px] ml-1">{residualCounts['High'] < inherentCounts['High'] ? `-${inherentCounts['High'] - residualCounts['High']}` : ''}</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">● Moderate</span>
                    <span>{residualCounts['Moderate']} <span className="text-green-700 text-[9px] ml-1">{residualCounts['Moderate'] > inherentCounts['Moderate'] ? `+${residualCounts['Moderate'] - inherentCounts['Moderate']}` : ''}</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">● Low</span>
                    <span>{residualCounts['Low']} <span className="text-green-700 text-[9px] ml-1">{residualCounts['Low'] > inherentCounts['Low'] ? `+${residualCounts['Low'] - inherentCounts['Low']}` : ''}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Risks */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            Top enterprise risks <Link to="/risks" className="text-[11px] font-normal text-indigo-600 hover:underline">Full register ↗</Link>
          </div>
          <div className="flex flex-col gap-1.5">
            {residualRisks.sort((a, b) => b.residualScore - a.residualScore).slice(0, 5).map(risk => (
              <Link key={risk.id} to={`/risks/${risk.id}`} className="flex items-center gap-2 p-2 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", 
                  risk.level === 'Critical' ? 'bg-red-500' : 
                  risk.level === 'High' ? 'bg-orange-500' : 
                  risk.level === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-800 truncate">{risk.title}</div>
                  <div className="text-[9px] text-slate-500 truncate">{risk.code} · {risk.serviceTower || 'Enterprise'}</div>
                </div>
                <div className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0", 
                  risk.treatmentStrategy === 'Mitigate' ? 'bg-orange-50 text-orange-800' : 
                  risk.treatmentStrategy === 'Transfer' ? 'bg-blue-50 text-blue-800' : 
                  risk.treatmentStrategy === 'Avoid' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
                )}>
                  {risk.treatmentStrategy || 'Accept'}
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600 shrink-0">
                  {risk.ownerId ? risk.ownerId.slice(0,2).toUpperCase() : 'NA'}
                </div>
                <div className={cn("text-xs font-bold w-6 text-right",
                  risk.level === 'Critical' ? 'text-red-700' : 
                  risk.level === 'High' ? 'text-orange-600' : 'text-slate-700'
                )}>{risk.residualScore}</div>
              </Link>
            ))}
            {residualRisks.length === 0 && (
              <div className="text-[11px] text-slate-500 italic p-2 text-center border border-dashed rounded-md mt-2">No risks recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row Divider */}
      <div className="flex items-center gap-2 mt-2 mb-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Compliance · Actions · Department · Audit trail</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Compliance */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            Compliance coverage <Link to="/reports" className="text-[11px] font-normal text-indigo-600 hover:underline">Details ↗</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { name: 'NCA ECC 2018', score: 62, color: 'bg-orange-500', note: '14 controls gap · 3 critical', scoreColor: 'text-orange-700' },
              { name: 'Saudi PDPL', score: 41, color: 'bg-red-500', note: 'Art. 4, 19, 29 non-compliant', scoreColor: 'text-red-700' },
              { name: 'ISO 27001', score: 77, color: 'bg-orange-400', note: 'A.12, A.14 gaps remaining', scoreColor: 'text-orange-600' },
              { name: 'ISO 31000', score: 88, color: 'bg-green-600', note: '§6.5.3 monitoring gap', scoreColor: 'text-green-700' },
              { name: 'NIST CSF', score: 81, color: 'bg-green-600', note: 'DE.CM-4 partially met', scoreColor: 'text-green-700' }
            ].map(comp => (
              <div key={comp.name} className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                  <span>{comp.name}</span><span className={comp.scoreColor}>{comp.score}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", comp.color)} style={{ width: `${comp.score}%` }}></div>
                </div>
                <div className="text-[9px] text-slate-400">{comp.note}</div>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Next audit deadline</span>
              <span className="text-[10px] font-bold text-red-700">NCA ECC — 14 Aug 2026</span>
            </div>
          </div>
        </div>

        {/* Overdue actions list */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            Overdue actions <Link to="/treatments" className="text-[11px] font-normal text-indigo-600 hover:underline">All {overdueActions.length} ↗</Link>
          </div>
          <div className="flex flex-col gap-1.5">
            {overdueActions.slice(0, 5).map(action => (
              <div key={action.id} className="flex items-center gap-2 p-1.5 border border-red-100 bg-red-50/30 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-slate-800 truncate">{action.title || 'Mitigation Plan'}</div>
                  <div className="text-[9px] text-slate-500 truncate flex gap-1">
                    <span className="bg-white px-1 border border-slate-200 rounded">{action.ownerId || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-red-700 shrink-0">Overdue</div>
              </div>
            ))}
            {overdueActions.length === 0 && (
              <div className="text-[11px] text-slate-500 italic p-2 text-center border border-dashed rounded-md">No overdue actions.</div>
            )}
            {/* Adding some mock items to make the list look full as per design spec if we don't have enough */}
            {overdueActions.length < 5 && (
              <>
                <div className="flex items-center gap-2 p-1.5 border border-slate-100 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-800 truncate">WAF rule deployment</div>
                      <div className="text-[9px] text-slate-500 truncate flex gap-1"><span className="bg-slate-100 px-1 rounded">N. Patel</span></div>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 shrink-0">Due in 3d</div>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-100 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-800 truncate">BCP tabletop exercise</div>
                      <div className="text-[9px] text-slate-500 truncate flex gap-1"><span className="bg-slate-100 px-1 rounded">S. Hassan</span></div>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 shrink-0">Due in 7d</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Department distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            Department risk <Link to="/risks" className="text-[11px] font-normal text-indigo-600 hover:underline">Expand ↗</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { dept: 'IT Infra', crit: 28, high: 20, mod: 18, total: 14 },
              { dept: 'Finance', crit: 14, high: 24, mod: 28, total: 10 },
              { dept: 'Operations', crit: 22, high: 18, mod: 26, total: 11 },
              { dept: 'Legal / CO', crit: 6, high: 12, mod: 20, total: 5 },
            ].map(d => (
              <div key={d.dept} className="flex items-center gap-2">
                <div className="text-[10px] text-slate-500 w-14 shrink-0 truncate">{d.dept}</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full bg-red-500 rounded-l-full" style={{ width: `${d.crit}%` }}></div>
                  <div className="absolute top-0 h-full bg-orange-400" style={{ left: `${d.crit}%`, width: `${d.high}%` }}></div>
                  <div className="absolute top-0 h-full bg-green-600 rounded-r-full" style={{ left: `${d.crit+d.high}%`, width: `${d.mod}%` }}></div>
                  {/* Appetite line */}
                  <div className="absolute top-[-2px] bottom-[-2px] w-[1.5px] bg-indigo-600 rounded-full z-10" style={{ left: '55%' }}></div>
                </div>
                <div className="text-[10px] font-bold text-slate-700 w-4 text-right shrink-0">{d.total}</div>
              </div>
            ))}
            <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 text-[9px] text-slate-500 justify-center">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-sm"></span>Critical</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-orange-400 rounded-sm"></span>High</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-600 rounded-sm"></span>Mod</span>
              <span className="flex items-center gap-1"><span className="w-0.5 h-2 bg-indigo-600"></span>Appetite</span>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            Audit trail <Link to="/admin" className="text-[11px] font-normal text-indigo-600 hover:underline">Full log ↗</Link>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex gap-2 items-start mb-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-px h-8 bg-slate-200 my-1"></div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-800">A. Khalid</div>
                <div className="text-[10px] text-slate-600 leading-tight mt-0.5">Scored IT-35 Likelihood 4→5 (IRS: 75)</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Today 08:42 AST · IP 10.1.4.22</div>
              </div>
            </div>
            <div className="flex gap-2 items-start mb-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <div className="w-px h-8 bg-slate-200 my-1"></div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-800">R. Qureshi</div>
                <div className="text-[10px] text-slate-600 leading-tight mt-0.5">Treatment status: OT-54 → "In Progress"</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Today 07:18 AST · IP 10.1.2.8</div>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-800">AI Engine</div>
                <div className="text-[10px] text-slate-600 leading-tight mt-0.5">Auto-ingested threat intel — 2 risks updated</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Yesterday 23:55 AST · System</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
