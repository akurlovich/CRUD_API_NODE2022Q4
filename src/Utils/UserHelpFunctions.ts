export const getID = (data: string): string => {
  return data.split('/')[3];
};

export const findMatch = (str: string, match: RegExp): boolean => {
  return str.match(match) !== null;
};

export const isArrayOfTypeString = (array: string[]): boolean => {
  return array.every((item) => typeof item !== 'string');
};

