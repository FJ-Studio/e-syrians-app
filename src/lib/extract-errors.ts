type ErrorResponse = Array<string> | Record<string, Array<string>>;
const extractErrors = (error: ErrorResponse): Array<string> => {
  if (Array.isArray(error)) {
    return error;
  }
  return Object.values(error).flat();
};

export default extractErrors;
