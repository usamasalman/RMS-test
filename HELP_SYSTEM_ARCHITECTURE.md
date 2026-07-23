# Help System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GRC WISDOM PLATFORM                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              HELP SYSTEM LAYER                      │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │    │
│  │  │WelcomeModal  │  │ GlobalHelp   │  │HelpPanel│ │    │
│  │  │(First Login) │  │  (F1 key)    │  │(All Pgs)│ │    │
│  │  └──────────────┘  └──────────────┘  └─────────┘ │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │InteractiveTour│  │  Tooltip    │               │    │
│  │  │  (Spotlight) │  │  (Hover)    │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │           APPLICATION PAGES                         │    │
│  │                                                     │    │
│  │  Dashboard  RiskRegister  ControlLibrary  ...      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         HELP CONTENT CONFIGURATION                  │    │
│  │                                                     │    │
│  │           src/config/helpContent.ts                 │    │
│  │  (Centralized text for all help components)        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Interaction Flow

```
                    ┌─────────────────┐
                    │   USER LOGS IN  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ First Login?    │
                    └───┬─────────┬───┘
                        │YES      │NO
                        │         │
                ┌───────▼───┐     │
                │ Welcome   │     │
                │  Modal    │     │
                │ (3 steps) │     │
                └─────┬─────┘     │
                      │           │
                      └─────┬─────┘
                            │
                    ┌───────▼────────┐
                    │ Navigate Pages │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │ First Visit to │
                    │    This Page?  │
                    └───┬─────────┬──┘
                        │YES      │NO
                        │         │
                ┌───────▼───┐     │
                │Interactive│     │
                │   Tour    │     │
                │(4+ steps) │     │
                └─────┬─────┘     │
                      │           │
                      └─────┬─────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼──────┐ ┌─────▼────┐ ┌───────▼──────┐
    │ Click Help   │ │Press F1  │ │ Hover (?)    │
    │   Button     │ │for Global│ │for Tooltip   │
    │ (Page Help)  │ │   Help   │ │ (Instant)    │
    └──────────────┘ └──────────┘ └──────────────┘
```

---

## 🧩 Component Architecture

### 1. WelcomeModal
```
┌────────────────────────────────────────┐
│         WELCOME MODAL                   │
│  ┌──────────────────────────────────┐  │
│  │ Step 1: Platform Features        │  │
│  │  • Risk Management               │  │
│  │  • Control Library               │  │
│  │  • Treatment Plans               │  │
│  │  • Compliance                    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  [Progress: ● ○ ○]   [Back] [Next]    │
└────────────────────────────────────────┘

Trigger: First login (localStorage check)
Dismissal: Manual close or completion
Persistence: Never shows again
```

### 2. HelpPanel
```
┌────────────────────────────────────────┐
│ Page Content                           │
│                                        │
│                                        │
│                               ┌──────┐ │
│                               │[?]   │ │ ← Minimized
│                               │Help  │ │
│                               └──────┘ │
└────────────────────────────────────────┘

          ↓ (Click to expand)

┌────────────────────────────────────────┐
│ Page Content                           │
│                           ┌──────────┐ │
│                           │[How to   │ │
│                           │Use Page] │ │
│                           │          │ │
│                           │▼ Topic 1 │ │
│                           │  Content │ │
│                           │▶ Topic 2 │ │
│                           │▶ Topic 3 │ │
│                           │          │ │
│                           │💡 Tips   │ │
│                           │ • Tip 1  │ │
│                           │ • Tip 2  │ │
│                           │    [X]   │ │
│                           └──────────┘ │
└────────────────────────────────────────┘

Position: Fixed bottom-right
Z-index: 40
State: Persisted per session (not saved)
```

### 3. Tooltip
```
┌─────────────────────────────────────────┐
│ Form Field                              │
│                                         │
│ Label [?] ◄───── Hover here             │
│    │                                    │
│    └─────────────────┐                 │
│                      ↓                  │
│          ┌──────────────────────┐      │
│          │ Detailed explanation │      │
│          │ of this field...     │      │
│          └──────────────────────┘      │
│                                         │
│ [Input Field]                           │
└─────────────────────────────────────────┘

Trigger: Hover over label or (?) icon
Display: Instant
Position: Right of element (auto-adjust)
Dismissal: Mouse leave
```

### 4. InteractiveTour
```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ Dark overlay
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓  ┌─────────────┐  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓  │ HIGHLIGHTED │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Spotlight
│ ▓▓▓▓  │  ELEMENT    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓  └─────────────┘  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓         │          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓         ↓          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓  ┌────────────────────────┐▓▓▓▓▓ │
│ ▓▓▓▓  │ Step 1: Title          │▓▓▓▓▓ │ ← Tour card
│ ▓▓▓▓  │ Explanation text...    │▓▓▓▓▓ │
│ ▓▓▓▓  │ [● ○ ○] [Back] [Next] │▓▓▓▓▓ │
│ ▓▓▓▓  └────────────────────────┘▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────────┘

Trigger: First visit to page
Navigation: Step-by-step (Back/Next/Skip)
Highlight: Box shadow + z-index elevation
Persistence: Completed = never shows again
```

### 5. GlobalHelp
```
┌────────────────────────────────────────┐
│ [Logo] [Nav] ... [GlobalHelp Button]  │ ← Header
└────────────────────────────────────────┘
                    │
         ┌──────────▼───────────┐
         │ Press F1 or Click    │
         └──────────┬───────────┘
                    │
         ┌──────────▼──────────────────────┐
         │  GRC Platform Help Center       │
         │  ┌────────────────────────────┐ │
         │  │ 🔍 Search all help...      │ │
         │  └────────────────────────────┘ │
         │                                 │
         │  📖 User Guide    🎥 Videos    │
         │  💬 Support      🔗 KB         │
         │                                 │
         │  Popular Topics:                │
         │  • How to create a risk         │
         │  • Understanding risk scores    │
         │  • Linking controls             │
         │                                 │
         │  Keyboard Shortcuts:            │
         │  F1 - Open Help                 │
         │  Ctrl+K - Search                │
         └─────────────────────────────────┘

Trigger: F1 key or click button
Features: Search, quick links, popular topics
Scope: All pages (global)
```

---

## 📦 Data Flow

```
┌──────────────────────────────────────────────┐
│        src/config/helpContent.ts              │
│  (Single source of truth for all help text)  │
└──────────────────┬───────────────────────────┘
                   │
         ┌─────────┼──────────┐
         │         │          │
    ┌────▼───┐ ┌──▼────┐ ┌──▼────────┐
    │Help    │ │Global │ │Interactive│
    │Panel   │ │Help   │ │Tour       │
    └────┬───┘ └──┬────┘ └──┬────────┘
         │        │         │
         └────────┼─────────┘
                  │
          ┌───────▼────────┐
          │  USER SEES:    │
          │ • Topics       │
          │ • Tips         │
          │ • Explanations │
          └────────────────┘
```

**Benefits:**
1. ✅ Single place to update help text
2. ✅ Consistent messaging across components
3. ✅ Easy to translate (future i18n)
4. ✅ Version control for help content
5. ✅ Can be loaded from API (future)

---

## 🎨 Visual Hierarchy

```
Z-Index Layers (bottom to top):

Layer 0 (z-1):     Page content
Layer 1 (z-10):    Form inputs, tables
Layer 2 (z-20):    Modals, dialogs
Layer 3 (z-40):    Help panels (floating)
Layer 4 (z-50):    Tooltips, welcome modal
Layer 5 (z-99):    Tour spotlight highlights
Layer 6 (z-100):   Tour overlay (dark background)
Layer 7 (z-101):   Tour card (explanations)
```

---

## 🔐 State Management

### localStorage Keys:
```javascript
{
  "grc_welcome_seen": "true",              // Welcome modal
  "tour_control-library_seen": "true",     // Control Library tour
  "tour_risk-register_seen": "true",       // Risk Register tour
  "tour_dashboard_seen": "true",           // Dashboard tour
  "tour_treatment-monitor_seen": "true",   // Treatment Monitor tour
  ...
}
```

### Component State:
```typescript
// HelpPanel
- isOpen: boolean (minimized/expanded)
- expandedItems: Set<number> (which accordions open)

// InteractiveTour
- currentStep: number (which step user is on)
- isActive: boolean (tour running or not)

// Tooltip
- visible: boolean (showing or not)

// GlobalHelp
- isOpen: boolean (dialog open)
- searchQuery: string (search input)
```

---

## 🔄 Integration Points

```
┌──────────────────────────────────────────┐
│          Application Layer                │
│                                           │
│  ┌─────────────┐      ┌──────────────┐  │
│  │ AuthContext │──────▶│ WelcomeModal │  │
│  │(first login)│      └──────────────┘  │
│  └─────────────┘                         │
│                                           │
│  ┌─────────────┐      ┌──────────────┐  │
│  │   Any Page  │◀─────│  HelpPanel   │  │
│  │  Component  │      │(always shown)│  │
│  └─────────────┘      └──────────────┘  │
│         │                                 │
│         ▼                                 │
│  ┌─────────────┐                         │
│  │ Form Fields │──────▶┌──────────────┐ │
│  │(labels, etc)│       │   Tooltip    │ │
│  └─────────────┘       └──────────────┘ │
│                                           │
│  ┌─────────────┐      ┌──────────────┐  │
│  │ Page Layout │◀─────│InteractiveTour│ │
│  │(data-tour)  │      │(first visit) │  │
│  └─────────────┘      └──────────────┘  │
│                                           │
│  ┌─────────────┐      ┌──────────────┐  │
│  │  Header/Nav │◀─────│ GlobalHelp   │  │
│  │             │      │  (F1 key)    │  │
│  └─────────────┘      └──────────────┘  │
└──────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (>1024px):
```
┌─────────────────────────────────────────┐
│ Content (full width)                    │
│                                         │
│                           [Help Button] │
└─────────────────────────────────────────┘
```

### Tablet (768-1024px):
```
┌───────────────────────────────┐
│ Content (adjusted)            │
│                               │
│                   [Help Icon] │
└───────────────────────────────┘
```

### Mobile (<768px):
```
┌──────────────────────┐
│ Content (stacked)    │
│                      │
│                      │
│             [? ]     │
└──────────────────────┘
         ↑
    Compact help
```

---

## 🎯 Success Metrics Architecture

```
┌────────────────────────────────────────┐
│          Analytics Events               │
│                                         │
│  • help_panel_opened                   │
│  • help_topic_expanded                 │
│  • tooltip_viewed                      │
│  • tour_started                        │
│  • tour_completed                      │
│  • tour_skipped                        │
│  • welcome_modal_completed             │
│  • global_help_searched                │
│                                         │
│  Properties:                            │
│  - page_name                            │
│  - topic_name                           │
│  - user_role                            │
│  - session_time                         │
└────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│       Analytics Dashboard               │
│  • Most viewed help topics             │
│  • Tour completion rates               │
│  • Pages with most help requests       │
│  • Search queries (identify gaps)      │
└────────────────────────────────────────┘
```

---

## 🔧 Extension Points

### Adding Help to New Pages:

```typescript
// 1. Add content
export const helpContent = {
  newPage: {
    title: "New Page Guide",
    items: [...],
    tips: [...]
  }
};

// 2. Use in component
import HelpPanel from '@/components/HelpPanel';
import { helpContent } from '@/config/helpContent';

export default function NewPage() {
  return (
    <>
      <HelpPanel {...helpContent.newPage} />
      {/* page content */}
    </>
  );
}
```

### Adding Interactive Tour:

```typescript
// 1. Add data attributes to targets
<button data-tour="my-button">Click</button>

// 2. Define tour steps
<InteractiveTour
  tourKey="new-page"
  steps={[{
    target: '[data-tour="my-button"]',
    title: "Action Button",
    content: "Click to perform action",
    position: 'bottom'
  }]}
/>
```

---

## 🎓 Summary

This architecture provides:
- ✅ **Layered approach**: Multiple help levels
- ✅ **Centralized content**: Easy maintenance
- ✅ **Persistent state**: User progress saved
- ✅ **Flexible integration**: Works with any page
- ✅ **Responsive design**: All devices supported
- ✅ **Extensible**: Easy to add new features
- ✅ **Analytics ready**: Track user behavior
- ✅ **Production ready**: Fully implemented and tested

---

*Every component, every interaction, every user journey has been designed for optimal learning and usability.* 🚀
