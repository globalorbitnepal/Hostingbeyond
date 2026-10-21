/**
 * Mirrors the bash gate in deploy-gate.patch (workflow_run path only).
 * GitHub Actions: unset secrets expand to empty string in env (not null).
 */
export function automaticDeployAllowed(deployApprovedSecret) {
  return deployApprovedSecret === "true";
}

export function manualDeployAllowed(manualApprovedSecret, confirmInput) {
  return manualApprovedSecret === "true" && confirmInput === "DEPLOY";
}

export function productionMigrateAllowed(migrateSecret) {
  return migrateSecret === "true";
}
