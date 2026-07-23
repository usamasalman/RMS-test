import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string; // CSS selector or element ID
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveTourProps {
  steps: TourStep[];
  tourKey: string; // Unique key for localStorage
  onComplete?: () => void;
}

export default function InteractiveTour({ steps, tourKey, onComplete }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${tourKey}_seen`);
    if (!hasSeenTour) {
      // Delay to let page render
      setTimeout(() => setIsActive(true), 500);
    }
  }, [tourKey]);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const pos = steps[currentStep].position || 'bottom';
        
        // Highlight the target
        targetElement.classList.add('tour-highlight');
        
        // Calculate position
        let top = 0;
        let left = 0;
        
        switch (pos) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 20;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'top':
            top = rect.top + window.scrollY - 20;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - 20;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + 20;
            break;
        }
        
        setPosition({ top, left });
        
        // Scroll element into view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        return () => {
          targetElement.classList.remove('tour-highlight');
        };
      }
    }
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour_${tourKey}_seen`, 'true');
    setIsActive(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(`tour_${tourKey}_seen`, 'true');
    setIsActive(false);
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const posClass = step.position || 'bottom';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100] pointer-events-none" />
      
      {/* Tour Card */}
      <div
        className={cn(
          "fixed z-[101] w-80 bg-white rounded-lg shadow-2xl border-2 border-indigo-500 p-4",
          posClass === 'bottom' && "-translate-x-1/2",
          posClass === 'top' && "-translate-x-1/2 -translate-y-full",
          posClass === 'left' && "-translate-x-full -translate-y-1/2",
          posClass === 'right' && "-translate-y-1/2"
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm">{step.title}</h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">{step.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentStep ? "bg-indigo-600" : "bg-slate-200"
                )}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="w-3 h-3" />
                </>
              ) : (
                'Got it!'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 99;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}
