/**
 * Automatic production deploy after CI on main (no repository secret).
 */
export function automaticDeployAllowed(ciConclusion, headBranch) {
  return ciConclusion === "success" && headBranch === "main";
}

export function manualDeployAllowed(manualApprovedSecret, confirmInput) {
  return manualApprovedSecret === "true" && confirmInput === "DEPLOY";
}

export function productionMigrateAllowed(migrateSecret) {
  return migrateSecret === "true";
}
