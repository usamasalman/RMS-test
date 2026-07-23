import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Shield, Target, TrendingDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to GRC Wisdom',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Your comprehensive platform for managing governance, risk, and compliance across your organization.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Risk Management</h4>
              <p className="text-xs text-slate-600">Identify, assess, and mitigate risks</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Control Library</h4>
              <p className="text-xs text-slate-600">Build and test control frameworks</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-orange-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Treatment Plans</h4>
              <p className="text-xs text-slate-600">Track remediation activities</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Compliance</h4>
              <p className="text-xs text-slate-600">Monitor regulatory requirements</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Quick Start Guide',
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Create Your First Risk</h4>
                <p className="text-xs text-slate-600">Navigate to Risk Register and click "Create Risk" to identify and document risks</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Link Controls</h4>
                <p className="text-xs text-slate-600">Associate existing controls from the Control Library to reduce risk exposure</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Monitor Dashboard</h4>
                <p className="text-xs text-slate-600">View real-time KPIs, heatmaps, and track your risk reduction effectiveness</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Helpful Tips',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">?</span>
              Look for tooltips
            </h4>
            <p className="text-xs text-slate-600">Hover over labels and icons throughout the platform for contextual help</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">!</span>
              Help panels on each page
            </h4>
            <p className="text-xs text-slate-600">Each module has a "How to use" panel with page-specific guidance</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">📖</span>
              User Guide
            </h4>
            <p className="text-xs text-slate-600">Access the complete User Guide from the navigation menu anytime</p>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon className="w-6 h-6 text-indigo-600" />
            {currentStep.title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {currentStep.content}
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === step ? "bg-indigo-600" : "bg-slate-200"
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {step < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
