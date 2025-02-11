export const sortObject = (obj: Record<string, string>): Record<string, string> => {
  return Object.fromEntries(Object.entries(obj).sort(([, valueA], [, valueB]) =>
    valueA.localeCompare(valueB)
  ));
};
