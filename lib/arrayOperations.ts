export function getMissingElements<T>(baseArray: Array<T>, contrastArray: Array<T>): Array<T> {
  return baseArray.filter(el => !contrastArray?.includes(el));
}

export function getNewElements<T>(baseArray: Array<T>, contrastArray: Array<T>): Array<T> {
  return getMissingElements(contrastArray, baseArray);
}

export function getCommonElements<T>(baseArray: Array<T>, contrastArray: Array<T>): Array<T> {
  return baseArray.filter(el => contrastArray.includes(el));
}

export function arrayEquals<T>(a: Array<T>, b: Array<T>): boolean {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}
