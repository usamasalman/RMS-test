# GRC Wisdom - User Help Guide

## 🆘 Getting Help in the Platform

### 1. First Time Login?
When you log in for the first time, a **Welcome Modal** will automatically appear:
- 📖 Step 1: Learn about platform features
- 🎯 Step 2: Quick start guide with numbered steps
- 💡 Step 3: Helpful tips for success

**Note**: This only shows once. You can access the full User Guide from the navigation menu anytime.

---

### 2. Help Panel (Every Page!) 🎯

Look for the **Help button** in the bottom-right corner of every page:

```
┌─────────────────────────┐
│                         │
│   Your Page Content     │
│                         │
│                         │
│                         │
│                 [? Help]│ ← Click this!
└─────────────────────────┘
```

**What you get:**
- ✅ Page-specific instructions
- ✅ How-to guides for that page
- ✅ Quick tips and shortcuts
- ✅ Expandable topics (click to read more)

**Example**: On the Dashboard, you'll learn:
- How to read the risk heatmap
- What each KPI means
- How to interpret compliance scores
- Tips for finding specific risks quickly

---

### 3. Interactive Tours (First Visit) 🎪

The first time you visit certain pages, an **Interactive Tour** starts automatically:
- A spotlight highlights specific features
- Step-by-step explanations appear
- Navigate with "Next" / "Back" buttons
- Skip anytime if you're already familiar

**Pages with tours:**
- Control Library
- Risk Register
- Dashboard
- Treatment Monitor

**Note**: Tours only show once per page. Completed tours are remembered.

---

### 4. Hover Tooltips (Instant Help) 💬

See a **question mark icon** (?) next to a label? Hover your mouse over it!

**Example tooltips:**
- **Total Risks**: "Total number of identified risks across all categories"
- **Design Effectiveness**: "How well the control is designed theoretically (0-100%)"
- **Inherent Risk**: "Risk level before any controls are applied"

**Where to find them:**
- Dashboard KPI cards
- Risk Register table headers
- Control Library columns
- Form fields in risk assessment

---

## 📚 Help Content by Page

### Dashboard
**What you'll learn:**
- Understanding Executive KPIs (Total Risks, Critical/High, Risk Reduction, etc.)
- Reading the risk heatmap (Inherent vs Residual view)
- Risk stage comparison (Before/After controls)
- Compliance coverage tracking
- Department risk distribution

**Quick Tips:**
- Click any risk in "Top Enterprise Risks" to see full details
- The indigo line on charts = your risk appetite threshold
- Use the audit trail to see recent changes

---

### Risk Register
**What you'll learn:**
- How to create a new risk
- Understanding Inherent vs Residual risk levels
- Linking controls to reduce risk scores
- Exporting the Risk Control Matrix (RCM)
- Treatment progress tracking

**Quick Tips:**
- Search by risk code or title
- Click column headers to sort
- Compare Inherent vs Residual pie charts
- Submit risks for approval via Actions menu

---

### Control Library
**What you'll learn:**
- What controls are (Preventive, Detective, Corrective)
- Adding new controls to your library
- Design vs Operating Effectiveness explained
- How to document testing procedures
- Linking controls to risks

**Quick Tips:**
- High effectiveness = better risk reduction
- Automated controls often more effective
- Review controls at their specified frequency
- Controls with 0 linked risks may be unnecessary

---

### Treatment Monitor
**What you'll learn:**
- What treatment plans are
- The 4 treatment strategies (Accept, Mitigate, Transfer, Avoid)
- How to track progress and milestones
- Identifying overdue plans

**Quick Tips:**
- Update progress weekly
- Red badges = overdue (needs attention!)
- Link plans to controls when mitigating
- Use filters to see only your assignments

---

### New Risk / Edit Risk
**What you'll learn:**
- How to identify and describe risks
- Likelihood and Impact rating scales (1-5)
- CIA ratings (Confidentiality, Integrity, Availability)
- Root cause analysis techniques
- Choosing treatment strategies

**Quick Tips:**
- Be specific in risk descriptions
- Consult process owners for accurate ratings
- Review risks quarterly or when things change
- Document your assumptions

---

### KRIs (Key Risk Indicators)
**What you'll learn:**
- What KRIs are and why they matter
- Setting threshold levels (Low, Medium, High)
- Linking KRIs to specific risks
- Analyzing trends over time

**Quick Tips:**
- Check KRI dashboards daily or weekly
- Set up automated alerts for breaches
- KRIs should be measurable and objective
- Automate data feeds when possible

---

### Documents
**What you'll learn:**
- Using the document repository
- How to upload and tag documents
- Document types and organization
- Version control best practices

**Quick Tips:**
- Use consistent naming conventions
- Tag documents with risk/control codes
- Review policies annually
- Store evidence for audits

---

### Reports & Analytics
**What you'll learn:**
- Generating executive reports
- Compliance reporting
- Providing audit reports
- Exporting data (Excel, PDF, CSV)

**Quick Tips:**
- Schedule automated report generation
- Customize reports for different stakeholders
- Review compliance gaps monthly
- Archive historical reports

---

### Admin Panel
**What you'll learn:**
- User account management
- Role-based access control
- Viewing audit trails
- System configuration options

**Quick Tips:**
- Review user access quarterly
- Remove departed employee access immediately
- Monitor audit logs for suspicious activity
- Backup data regularly

---

### Asset Register
**What you'll learn:**
- Maintaining asset inventory
- Asset classification (criticality and type)
- Linking assets to risks
- Asset lifecycle management

**Quick Tips:**
- Update quarterly
- Link all risks to relevant assets
- Critical assets need BCP/DR plans
- Track asset ownership

---

## 🎓 Common Questions

### Q: I accidentally dismissed the Welcome Modal. Can I see it again?
**A:** The full content is available in the User Guide (navigation menu). You can also clear your browser's localStorage to reset it.

### Q: I completed a tour but want to see it again. How?
**A:** Clear your browser's localStorage for this site, or contact your administrator to reset tour completion flags.

### Q: The Help Panel is covering content I need to see. Can I move it?
**A:** Click the X button to minimize it to just the "Help" button. Click again to expand when needed.

### Q: Are there keyboard shortcuts?
**A:** Not currently, but this is planned for a future release. For now, use Tab to navigate and Enter to activate buttons.

### Q: Can I print these help guides?
**A:** Yes! Use your browser's print function on any help content. A printable user guide is also available from the User Guide page.

### Q: I found an error in the help content. Who do I tell?
**A:** Contact your system administrator or submit feedback through the Settings page.

### Q: Can I turn off the tooltips or tours?
**A:** Tours automatically stop showing after completion. Tooltips only appear on hover and can't be disabled (they're important for proper risk assessment!).

---

## 💡 Pro Tips

### For New Users:
1. ✅ Complete the Welcome Modal
2. ✅ Take all Interactive Tours
3. ✅ Read the Help Panel on each page you visit
4. ✅ Hover over any (?) icon to learn more
5. ✅ Visit the User Guide for comprehensive documentation

### For Experienced Users:
- Use the Help Panel for quick reference on unfamiliar features
- Tooltips refresh your memory on specific fields
- Help content is updated regularly - check back if something changed

### For Administrators:
- Help content is in `src/config/helpContent.ts` for easy updates
- Monitor which help topics users access most
- Consider creating role-specific help content
- Train new users with the built-in help system

---

## 🆘 Still Need Help?

If you can't find what you need:

1. **Check the User Guide** - Comprehensive documentation (navigation menu)
2. **Ask Your Administrator** - They can provide organization-specific guidance
3. **Contact Support** - Submit a support ticket via Settings
4. **Training Sessions** - Ask about scheduled training for your role

---

## 📱 Help on Mobile

The help system works on mobile devices too:
- Help button appears in bottom-right
- Tap to expand help panel
- Swipe to scroll through help topics
- Tooltips appear on long-press
- Tours adapt to mobile screen size

---

*Remember: The best way to learn is by doing! Use the help system as a safety net while you explore the platform.*

**Happy Risk Managing! 🎯**
