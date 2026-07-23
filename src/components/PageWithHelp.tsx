import { ReactNode } from 'react';
import HelpPanel from './HelpPanel';

interface HelpItem {
  title: string;
  content: string;
}

interface PageWithHelpProps {
  children: ReactNode;
  helpTitle: string;
  helpItems: HelpItem[];
  helpTips?: string[];
}

/**
 * Wrapper component that adds a help panel to any page
 * Usage:
 * <PageWithHelp helpTitle="Page Guide" helpItems={[...]} helpTips={[...]}>
 *   <YourPageContent />
 * </PageWithHelp>
 */
export default function PageWithHelp({ children, helpTitle, helpItems, helpTips }: PageWithHelpProps) {
  return (
    <>
      <HelpPanel title={helpTitle} items={helpItems} tips={helpTips} />
      {children}
    </>
  );
}
