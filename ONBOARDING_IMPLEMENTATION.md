# Onboarding & Help System Implementation

## Overview
Implemented a comprehensive onboarding and help system with first-login welcome modal, inline tooltips, and contextual help panels.

## Components Created

### 1. WelcomeModal (`src/components/WelcomeModal.tsx`)
- **Purpose**: First-login onboarding experience
- **Features**:
  - 3-step guided tour introducing the platform
  - Step 1: Platform overview with feature highlights (Risk Management, Control Library, Treatment Plans, Compliance)
  - Step 2: Quick start guide with numbered steps
  - Step 3: Helpful tips about tooltips, help panels, and user guide
  - Progress indicators and navigation controls
  - Automatically shows on first login, dismissed with localStorage flag

### 2. HelpPanel (`src/components/HelpPanel.tsx`)
- **Purpose**: Page-specific contextual help
- **Features**:
  - Collapsible floating panel (bottom-right corner)
  - Expandable accordion sections for different help topics
  - Quick tips section with bullet points
  - Minimizes to a "Help" button when closed
  - Z-index: 40 for proper layering

### 3. Tooltip (`src/components/Tooltip.tsx`)
- **Purpose**: Inline contextual help for labels and metrics
- **Features**:
  - Hover-triggered tooltips with detailed explanations
  - Optional help icon indicator
  - Smart positioning (right-side of element)
  - Styled with dark background for visibility
  - Width-constrained to 264px for readability

## Page Updates

### Dashboard (`src/pages/Dashboard.tsx`)
**Added Tooltips for KPIs:**
- Total risks: "Total number of identified risks across all categories"
- Critical/High: "Number of risks rated as Critical or High severity after applying controls"
- Risk reduction: "Percentage reduction from inherent to residual risk scores"
- Overdue actions: "Treatment plan tasks past their target completion date"
- Appetite utilisation: "Current risk level as percentage of approved threshold"

**Help Panel Topics:**
1. Understanding KPIs
2. Reading the Heatmap
3. Risk Stage Comparison
4. Compliance Tracking

**Quick Tips:**
- Clicking on risks for details
- Using audit trail
- Understanding appetite threshold

### Risk Register (`src/pages/RiskRegister.tsx`)
**Added Tooltips for Table Headers:**
- Code: Unique risk identifier
- Title: Brief risk description
- Service/Tower: Business unit origin
- Root Cause: Underlying risk source
- Treatment Strategy: Risk handling approach
- Stage: Lifecycle phase
- Inherent: Pre-control risk level
- Residual: Post-control risk level
- Treatment Progress: Task completion percentage

**Help Panel Topics:**
1. Creating Risks
2. Understanding Risk Levels
3. Linking Controls
4. Exporting RCM
5. Treatment Progress

**Quick Tips:**
- Using search and sort
- Comparing pie charts
- Submitting for approval

## Auth System Updates (`src/store/AuthContext.tsx`)

### New Features:
1. **First Login Detection**:
   - Added `isFirstLogin` state
   - Added `firstLogin` property to User interface
   - Checks localStorage for `grc_welcome_seen` flag

2. **Welcome Modal Control**:
   - `dismissWelcome()` function to close modal and set flag
   - Exported in context for global access

3. **User Interface Extension**:
   ```typescript
   interface User {
     firstLogin?: boolean;  // NEW
   }
   
   interface AuthContextType {
     isFirstLogin: boolean;  // NEW
     dismissWelcome: () => void;  // NEW
   }
   ```

## App Integration (`src/App.tsx`)

1. **Import WelcomeModal component**
2. **Connect to Auth Context**:
   - Destructure `isFirstLogin` and `dismissWelcome`
   - Render WelcomeModal in DataProvider wrapper
   - Pass open state and close handler

## Usage Pattern

### For Users:
1. **First Login**: Welcome modal automatically appears
2. **Dashboard/Register**: Help button visible in bottom-right
3. **Hover Tooltips**: Hover over help icons or labeled fields
4. **Help Panel**: Click to expand, accordion sections for topics

### For Developers:
```tsx
// Add tooltip to any label
<Tooltip content="Explanation text" icon>
  <span>Label Text</span>
</Tooltip>

// Add help panel to any page
<HelpPanel
  title="How to Use [Page Name]"
  items={[
    { title: "Topic", content: "Explanation..." }
  ]}
  tips={["Tip 1", "Tip 2"]}
/>
```

## Styling Consistency

All components follow the existing design system:
- Indigo accents (#4F46E5, #6366F1)
- Slate neutral palette
- Consistent border radius and shadows
- Responsive text sizing
- Accessible hover states

## Browser Persistence

- **Welcome Modal**: Shows once per browser via localStorage
- **Help Panel State**: Resets on page load (always starts minimized)
- **Tooltip State**: Ephemeral (hover-based)

## Future Enhancements

Consider adding:
1. Tour mode with step-by-step highlights
2. Video tutorials embedded in help panels
3. Search within help content
4. User preference for disabling tooltips
5. Analytics on help usage
6. Context-sensitive help based on user role
