export const helpContent = {
  treatmentMonitor: {
    title: "Treatment Monitor Guide",
    items: [
      {
        title: "What are Treatment Plans?",
        content: "Treatment plans are action plans to reduce risks. They include tasks, deadlines, owners, and track progress toward risk mitigation goals."
      },
      {
        title: "Treatment Strategies",
        content: "Accept (tolerate the risk), Mitigate (reduce through controls), Transfer (share with third party like insurance), or Avoid (eliminate the activity causing risk)."
      },
      {
        title: "Tracking Progress",
        content: "Update the progress percentage as tasks are completed. Overdue plans (red) indicate SLA breaches that need escalation."
      },
      {
        title: "Creating Treatment Plans",
        content: "Go to a risk detail page and click 'Create Treatment Plan'. Define the strategy, assign an owner, set milestones, and track completion."
      }
    ],
    tips: [
      "Keep treatment plans updated weekly",
      "Red badges indicate overdue plans requiring attention",
      "Link treatment plans to specific controls when mitigating",
      "Use filters to focus on your assigned plans"
    ]
  },
  
  kris: {
    title: "Key Risk Indicators Guide",
    items: [
      {
        title: "What are KRIs?",
        content: "Key Risk Indicators are metrics that provide early warning signals about increasing risk exposure. They help you monitor risks proactively."
      },
      {
        title: "Setting Thresholds",
        content: "Define threshold levels (Low, Medium, High) that trigger alerts when breached. For example, 'Failed login attempts > 10 per hour'."
      },
      {
        title: "Linking to Risks",
        content: "Associate KRIs with specific risks so you can track leading indicators of risk materialization before incidents occur."
      },
      {
        title: "Trend Analysis",
        content: "Review KRI trends over time. Increasing trends may indicate growing risk exposure requiring additional controls or treatment."
      }
    ],
    tips: [
      "Review KRI dashboards daily or weekly",
      "Set automated alerts for threshold breaches",
      "KRIs should be measurable and objective",
      "Update KRI values regularly (automated feeds are best)"
    ]
  },
  
  documents: {
    title: "Documents Guide",
    items: [
      {
        title: "Document Repository",
        content: "Centralized storage for all GRC-related documents including policies, procedures, audit reports, evidence, and compliance artifacts."
      },
      {
        title: "Uploading Documents",
        content: "Click 'Upload Document' to add files. Tag them with risk IDs, control IDs, or compliance frameworks for easy retrieval."
      },
      {
        title: "Document Types",
        content: "Organize by type: Policies, Procedures, Evidence, Audit Reports, Risk Assessments, Compliance Certificates, etc."
      },
      {
        title: "Version Control",
        content: "The system tracks document versions automatically. Always upload the latest version and retire outdated documents."
      }
    ],
    tips: [
      "Use consistent naming conventions",
      "Tag documents with relevant risk/control codes",
      "Review and update policies annually",
      "Store evidence documents for audit trails"
    ]
  },
  
  reports: {
    title: "Reports & Analytics Guide",
    items: [
      {
        title: "Executive Reports",
        content: "Generate board-ready reports showing risk heatmaps, KPIs, compliance status, and treatment progress for leadership presentations."
      },
      {
        title: "Compliance Reports",
        content: "Track adherence to frameworks like ISO 27001, NIST CSF, NCA ECC. Shows gaps, control coverage, and remediation status."
      },
      {
        title: "Audit Reports",
        content: "Provide external/internal auditors with risk registers, control testing results, and evidence documentation."
      },
      {
        title: "Exporting Data",
        content: "Export reports to Excel, PDF, or CSV formats. Use filters to customize report scope by department, risk level, or time period."
      }
    ],
    tips: [
      "Schedule automated report generation",
      "Customize reports for different stakeholders",
      "Review compliance gaps monthly",
      "Archive historical reports for trend analysis"
    ]
  },
  
  admin: {
    title: "Admin Panel Guide",
    items: [
      {
        title: "User Management",
        content: "Create, edit, and deactivate user accounts. Assign roles (Admin, Risk Manager, Control Owner, Auditor) with appropriate permissions."
      },
      {
        title: "Role-Based Access",
        content: "Admins have full access. Risk Managers can create/edit risks. Control Owners manage controls. Auditors have read-only access."
      },
      {
        title: "Audit Trail",
        content: "View system logs showing who made changes, when, and what was modified. Essential for compliance and accountability."
      },
      {
        title: "System Configuration",
        content: "Configure risk matrices, scoring methodologies, approval workflows, and email notification settings."
      }
    ],
    tips: [
      "Review user access quarterly",
      "Remove access for departed employees immediately",
      "Monitor audit logs for suspicious activity",
      "Backup system data regularly"
    ]
  },
  
  assetRegister: {
    title: "Asset Register Guide",
    items: [
      {
        title: "Asset Inventory",
        content: "Maintain a comprehensive list of organizational assets including hardware, software, data, facilities, people, and vendors."
      },
      {
        title: "Asset Classification",
        content: "Classify assets by criticality (High/Medium/Low) and type. Critical assets require more stringent controls and risk management."
      },
      {
        title: "Linking to Risks",
        content: "Associate risks with specific assets they impact. This helps identify which assets face the most risk exposure."
      },
      {
        title: "Asset Lifecycle",
        content: "Track asset status: Active, Inactive, or Archived. Update when assets are acquired, modified, or decommissioned."
      }
    ],
    tips: [
      "Update asset register quarterly",
      "Link all risks to relevant assets",
      "Critical assets should have documented BCP/DR plans",
      "Track asset ownership and custody"
    ]
  },
  
  newRisk: {
    title: "Risk Assessment Guide",
    items: [
      {
        title: "Identifying Risks",
        content: "Describe what could go wrong (risk event), why it could happen (root cause), and what the impact would be. Be specific and actionable."
      },
      {
        title: "Likelihood & Impact",
        content: "Rate on a 1-5 scale. Likelihood: how probable. Impact: severity of consequences. The system calculates inherent risk score automatically."
      },
      {
        title: "CIA Ratings",
        content: "Confidentiality, Integrity, Availability: Rate each 1-5 based on information security impact. Used for calculating comprehensive risk scores."
      },
      {
        title: "Root Cause Analysis",
        content: "Identify underlying causes (not just symptoms). Good root cause identification leads to effective treatment strategies."
      },
      {
        title: "Treatment Strategy",
        content: "Choose how to handle the risk: Accept, Mitigate (most common), Transfer (insurance), or Avoid (stop the activity)."
      }
    ],
    tips: [
      "Be specific in risk descriptions",
      "Consult process owners for accurate assessments",
      "Review risks quarterly or when circumstances change",
      "Document assumptions behind your ratings"
    ]
  },
  
  riskDetail: {
    title: "Risk Detail Guide",
    items: [
      {
        title: "Risk Overview",
        content: "View comprehensive risk information including inherent score, residual score (after controls), treatment progress, and ownership."
      },
      {
        title: "Linking Controls",
        content: "Click 'Link Control' to associate existing controls with this risk. Control effectiveness automatically reduces residual risk score."
      },
      {
        title: "Creating Treatment Plans",
        content: "Click 'Create Treatment Plan' to define action items, assign owners, set deadlines, and track progress toward risk mitigation."
      },
      {
        title: "Risk History",
        content: "View audit trail showing how risk scores, ownership, and status have changed over time. Essential for trend analysis."
      },
      {
        title: "Commenting & Collaboration",
        content: "Add comments to document discussions, decisions, or updates. Tag users to notify them about important changes."
      }
    ],
    tips: [
      "Update risk status regularly (monthly minimum)",
      "Link multiple controls for layered defense",
      "Document why risk scores change",
      "Review linked controls periodically to verify effectiveness"
    ]
  },
  
  profile: {
    title: "Profile Settings Guide",
    items: [
      {
        title: "Personal Information",
        content: "Update your name, email, and contact details. This information appears in risk ownership, comments, and audit logs."
      },
      {
        title: "Notification Preferences",
        content: "Configure which alerts you receive: overdue tasks, risk threshold breaches, approval requests, system updates, etc."
      },
      {
        title: "Role & Permissions",
        content: "Your role determines what actions you can perform. Contact an administrator if you need additional permissions."
      }
    ],
    tips: [
      "Keep your email current for notifications",
      "Review notification settings if you're getting too many/few alerts",
      "Update your profile photo for better collaboration"
    ]
  },
  
  settings: {
    title: "Settings Guide",
    items: [
      {
        title: "System Preferences",
        content: "Configure global settings like default risk matrix, scoring methodology, and approval workflows."
      },
      {
        title: "Integration Settings",
        content: "Connect to external systems like SIEM, ticketing systems, or GRC tools for automated data exchange."
      },
      {
        title: "Branding",
        content: "Customize the platform with your organization's logo, colors, and terminology to match corporate standards."
      }
    ],
    tips: [
      "Test changes in a sandbox environment first",
      "Document configuration changes",
      "Review settings when regulations change"
    ]
  }
};

export const tourContent = {
  treatmentMonitor: [
    {
      target: '[data-tour="filter-plans"]',
      title: "Filter Treatment Plans",
      content: "Filter by status, owner, or risk level to focus on the plans that need your attention.",
      position: 'bottom' as const
    },
    {
      target: '[data-tour="progress-bar"]',
      title: "Track Progress",
      content: "Visual progress bars show completion percentage. Click to update progress as tasks are completed.",
      position: 'left' as const
    },
    {
      target: '[data-tour="overdue-indicator"]',
      title: "Overdue Alerts",
      content: "Red badges and text indicate plans past their deadline. These need immediate attention!",
      position: 'top' as const
    }
  ]
};
