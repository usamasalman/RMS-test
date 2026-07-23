import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpItem {
  title: string;
  content: string;
}

interface HelpPanelProps {
  title: string;
  items: HelpItem[];
  tips?: string[];
}

export default function HelpPanel({ title, items, tips }: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 shadow-lg bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-600 gap-2 z-40"
      >
        <HelpCircle className="w-4 h-4" />
        Help
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white border border-slate-200 rounded-lg shadow-2xl z-40 max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-indigo-50">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="overflow-y-auto flex-1 p-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-sm text-left">{item.title}</span>
              {expandedItems.has(index) ? (
                <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </button>
            {expandedItems.has(index) && (
              <div className="px-3 pb-3 pt-0 text-xs text-slate-600 border-t bg-slate-50">
                <p className="mt-2">{item.content}</p>
              </div>
            )}
          </div>
        ))}

        {tips && tips.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2 text-slate-700">💡 Quick Tips</h4>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="text-xs text-slate-600 flex gap-2">
                  <span className="text-indigo-600 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
