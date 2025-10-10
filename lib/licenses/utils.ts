import licensesJSON from "./licenses.json";
import { License } from "./types";

//

// Array of all licenses IDs, needed for validation
export const licensesIDs = licensesJSON.licenses?.map(license => license.licenseId);

export function getLicenseById(licenseId: string): License | undefined {
  return licensesJSON.licenses.find(license => license.licenseId === licenseId);
}
