import { Likelihood, Impact, Risk } from '../types';

export function computeInherentRiskScore(
 likelihood: number, impact: number,
 cia_c: number, cia_i: number, cia_a: number
): number {
 const l = likelihood || 0;
 const i = impact || 0;
 const c = cia_c || 0;
 const ci = cia_i || 0;
 const a = cia_a || 0;
 const ciaScore = (c + ci + a) / 3;
 return parseFloat((l * i * ciaScore).toFixed(2)) || 0;
}

export interface ControlMapping {
  design_eff: number;
  operating_eff: number;
  weight: number;
}

export function computeControlRating(controls: ControlMapping[]): number {
 if (!controls?.length) return 0;
 const totalWeight = controls.reduce((s, c) => s + (c.weight || 0), 0);
 if (totalWeight === 0) return 0;
 const weightedScore = controls.reduce((s, c) => {
 const cs = ((c.design_eff || 0) * 0.4 + (c.operating_eff || 0) * 0.6) / 100;
 return s + cs * (c.weight || 0);
 }, 0);
 return parseFloat((weightedScore / totalWeight).toFixed(4)) || 0;
}

export function computeResidualRiskScore(irs: number, cr: number): number {
  return parseFloat(((irs || 0) * (1 - (cr || 0))).toFixed(2)) || 0;
}

export function computePostTreatmentRRS(rrs: number, progressPct: number): number {
  return parseFloat((rrs * (1 - progressPct / 100)).toFixed(2));
}

export function getRiskLevel(score: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
  if (score <= 20) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 80) return 'High';
  return 'Critical';
}

export function getRiskColor(level: 'Low' | 'Moderate' | 'High' | 'Critical'): string {
  switch (level) {
    case 'Low': return 'bg-green-500';
    case 'Moderate': return 'bg-amber-400';
    case 'High': return 'bg-orange-500';
    case 'Critical': return 'bg-red-700';
    default: return 'bg-slate-500';
  }
}

export function getRiskTextColor(level: 'Low' | 'Moderate' | 'High' | 'Critical'): string {
  switch (level) {
    case 'Low': return 'text-green-700 bg-green-50 border border-green-200';
    case 'Moderate': return 'text-amber-800 bg-amber-50 border border-amber-200';
    case 'High': return 'text-orange-800 bg-orange-50 border border-orange-200';
    case 'Critical': return 'text-red-800 bg-red-50 border border-red-200';
    default: return 'text-slate-700 bg-slate-50';
  }
}
