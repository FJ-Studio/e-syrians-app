const strToArray = (input: string | Array<string>, del: string = ","): string[] => {
  if (Array.isArray(input)) {
    return input;
  }
  return input.split(del);
};

export default strToArray;
