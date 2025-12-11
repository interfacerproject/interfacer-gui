import * as licensesData from "./licenses.json";
import { License } from "./types";

//

// Extract licenses array with multiple fallback patterns
let licensesArray: Array<License> = [];

if ((licensesData as any).default) {
  const defaultData = (licensesData as any).default;

  // If it's a string, parse it
  if (typeof defaultData === "string") {
    const parsed = JSON.parse(defaultData);
    licensesArray = parsed.licenses || [];
  } else if (defaultData.licenses) {
    licensesArray = defaultData.licenses;
  } else if (Array.isArray(defaultData)) {
    licensesArray = defaultData;
  }
} else if ((licensesData as any).licenses) {
  licensesArray = (licensesData as any).licenses;
}

// Array of all licenses IDs, needed for validation
export const licensesIDs = licensesArray.map(license => license.licenseId);

export function getLicenseById(licenseId: string): License | undefined {
  return licensesArray.find(license => license.licenseId === licenseId);
}
