export function manualDeployAllowed(manualApprovedSecret, confirmInput) {
  return manualApprovedSecret === "true" && confirmInput === "DEPLOY";
}

export function productionMigrateAllowed(migrateSecret) {
  return migrateSecret === "true";
}
