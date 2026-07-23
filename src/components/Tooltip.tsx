import { ReactNode, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  className?: string;
}

export default function Tooltip({ content, children, icon = false, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center group">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-help inline-flex items-center gap-1"
      >
        {children}
        {icon && <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />}
      </div>
      {visible && (
        <div className={cn(
          "absolute z-50 px-3 py-2 text-xs font-normal text-white bg-slate-800 rounded-lg shadow-xl",
          "w-64 -top-2 left-full ml-2 pointer-events-none",
          className
        )}>
          {content}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
        </div>
      )}
    </div>
  );
}
