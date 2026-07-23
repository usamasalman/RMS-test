const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For POST risks
code = code.replace(
  '    DB.risks.push(newRisk);\n    recalculateRiskScores(newRisk.id);\n    res.json(newRisk);',
  '    DB.risks.push(newRisk);\n    createAuditEntry("risk", newRisk.id, newRisk.code, "create", req.user, null, newRisk, req);\n    recalculateRiskScores(newRisk.id);\n    res.json(newRisk);'
);

// For PUT risks
code = code.replace(
  '    DB.risks[riskIndex] = {\n      ...DB.risks[riskIndex],\n      ...req.body,\n      updated_at: new Date().toISOString(),\n    };',
  '    const oldRisk = { ...DB.risks[riskIndex] };\n    DB.risks[riskIndex] = {\n      ...DB.risks[riskIndex],\n      ...req.body,\n      updated_at: new Date().toISOString(),\n    };\n    createAuditEntry("risk", oldRisk.id, oldRisk.code, "update", req.user, oldRisk, DB.risks[riskIndex], req);'
);

// For DELETE risks
code = code.replace(
  '    DB.risks.splice(riskIndex, 1);\n    res.status(204).send();',
  '    const oldRisk = DB.risks[riskIndex];\n    DB.risks.splice(riskIndex, 1);\n    createAuditEntry("risk", oldRisk.id, oldRisk.code, "delete", req.user, oldRisk, null, req);\n    res.status(204).send();'
);

// For POST controls
code = code.replace(
  '    DB.controls.push(newControl);\n    res.json(newControl);',
  '    DB.controls.push(newControl);\n    createAuditEntry("control", newControl.id, newControl.code, "create", req.user, null, newControl, req);\n    res.json(newControl);'
);

// For PUT controls
code = code.replace(
  '    DB.controls[controlIndex] = {\n      ...DB.controls[controlIndex],\n      ...req.body,\n    };',
  '    const oldControl = { ...DB.controls[controlIndex] };\n    DB.controls[controlIndex] = {\n      ...DB.controls[controlIndex],\n      ...req.body,\n    };\n    createAuditEntry("control", oldControl.id, oldControl.code, "update", req.user, oldControl, DB.controls[controlIndex], req);'
);

// For DELETE controls
code = code.replace(
  '    DB.controls.splice(controlIndex, 1);\n    DB.riskControlMappings = DB.riskControlMappings.filter(\n      (mapping) => mapping.controlId !== req.params.id,\n    );\n    recalculateRiskScores();\n    res.status(204).send();',
  '    const oldControl = DB.controls[controlIndex];\n    DB.controls.splice(controlIndex, 1);\n    DB.riskControlMappings = DB.riskControlMappings.filter(\n      (mapping) => mapping.controlId !== req.params.id,\n    );\n    createAuditEntry("control", oldControl.id, oldControl.code, "delete", req.user, oldControl, null, req);\n    recalculateRiskScores();\n    res.status(204).send();'
);

// For POST treatments
code = code.replace(
  '    DB.treatmentPlans.push(newTreatment);\n    recalculateRiskScores(newTreatment.riskId);\n    res.json(newTreatment);',
  '    DB.treatmentPlans.push(newTreatment);\n    createAuditEntry("treatment", newTreatment.id, undefined, "create", req.user, null, newTreatment, req);\n    recalculateRiskScores(newTreatment.riskId);\n    res.json(newTreatment);'
);

// For PUT treatments
code = code.replace(
  '    DB.treatmentPlans[treatmentIndex] = {\n      ...DB.treatmentPlans[treatmentIndex],\n      ...req.body,\n    };',
  '    const oldPlan = { ...DB.treatmentPlans[treatmentIndex] };\n    DB.treatmentPlans[treatmentIndex] = {\n      ...DB.treatmentPlans[treatmentIndex],\n      ...req.body,\n    };\n    createAuditEntry("treatment", oldPlan.id, undefined, "update", req.user, oldPlan, DB.treatmentPlans[treatmentIndex], req);'
);

// For DELETE treatments
code = code.replace(
  '    const owningRiskId = DB.treatmentPlans[treatmentIndex].riskId;\n    DB.treatmentPlans.splice(treatmentIndex, 1);\n    recalculateRiskScores(owningRiskId);\n    res.status(204).send();',
  '    const oldPlan = DB.treatmentPlans[treatmentIndex];\n    const owningRiskId = DB.treatmentPlans[treatmentIndex].riskId;\n    DB.treatmentPlans.splice(treatmentIndex, 1);\n    createAuditEntry("treatment", oldPlan.id, undefined, "delete", req.user, oldPlan, null, req);\n    recalculateRiskScores(owningRiskId);\n    res.status(204).send();'
);

// For POST assets
code = code.replace(
  '    DB.assets.push(newAsset);\n    res.json(newAsset);',
  '    DB.assets.push(newAsset);\n    createAuditEntry("asset", newAsset.id, newAsset.code, "create", req.user, null, newAsset, req);\n    res.json(newAsset);'
);

// For PUT assets
code = code.replace(
  '    DB.assets[assetIndex] = {\n      ...DB.assets[assetIndex],\n      ...req.body,\n    };',
  '    const oldAsset = { ...DB.assets[assetIndex] };\n    DB.assets[assetIndex] = {\n      ...DB.assets[assetIndex],\n      ...req.body,\n    };\n    createAuditEntry("asset", oldAsset.id, oldAsset.code, "update", req.user, oldAsset, DB.assets[assetIndex], req);'
);

// For DELETE assets
code = code.replace(
  '    DB.assets.splice(assetIndex, 1);\n    res.status(204).send();',
  '    const oldAsset = DB.assets[assetIndex];\n    DB.assets.splice(assetIndex, 1);\n    createAuditEntry("asset", oldAsset.id, oldAsset.code, "delete", req.user, oldAsset, null, req);\n    res.status(204).send();'
);

// For POST risk-control-mappings
code = code.replace(
  '    const mapping = { riskId, controlId, weight };\n    if (existingIndex >= 0) {\n      DB.riskControlMappings[existingIndex] = mapping;\n    } else {\n      DB.riskControlMappings.push(mapping);\n    }\n\n    recalculateRiskScores(riskId);\n    res.json(mapping);',
  '    const mapping = { riskId, controlId, weight };\n    let action: "create" | "update" = "create";\n    let oldMapping = null;\n    if (existingIndex >= 0) {\n      action = "update";\n      oldMapping = { ...DB.riskControlMappings[existingIndex] };\n      DB.riskControlMappings[existingIndex] = mapping;\n    } else {\n      DB.riskControlMappings.push(mapping);\n    }\n    createAuditEntry("mapping", `${riskId}-${controlId}`, undefined, action as any, req.user, oldMapping, mapping, req);\n\n    recalculateRiskScores(riskId);\n    res.json(mapping);'
);

// For DELETE risk-control-mappings
code = code.replace(
  '    DB.riskControlMappings = DB.riskControlMappings.filter(\n      (mapping) => !(mapping.riskId === riskId && mapping.controlId === controlId),\n    );\n\n    recalculateRiskScores(riskId);\n    res.status(204).send();',
  '    const oldMapping = DB.riskControlMappings.find((m) => m.riskId === riskId && m.controlId === controlId);\n    DB.riskControlMappings = DB.riskControlMappings.filter(\n      (mapping) => !(mapping.riskId === riskId && mapping.controlId === controlId),\n    );\n    if (oldMapping) createAuditEntry("mapping", `${riskId}-${controlId}`, undefined, "delete", req.user, oldMapping, null, req);\n\n    recalculateRiskScores(riskId);\n    res.status(204).send();'
);

fs.writeFileSync('server.ts', code, 'utf8');
console.log('Successfully added audit trails to server.ts');
