import licensesJSON from "./licenses.json";

// Array of all licenses names, needed for validation
export const licensesNames = licensesJSON.licenses.map(license => license.name);
