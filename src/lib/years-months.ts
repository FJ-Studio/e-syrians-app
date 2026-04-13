export type YearsMonths = {
  [year: string]: Array<{
    index: string;
    name: string;
  }>;
};

const getYearsMonths = (year: number, month: number, monthsNames: Array<string>): YearsMonths => {
  const result: YearsMonths = {};
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
    if (result[year] === undefined) {
      result[year] = [];
    }
    result[year].push({
      index: months[month - 1],
      name: monthsNames[month - 1],
    });
    if (month === 12) {
      year++;
      month = 1;
    } else {
      month++;
    }
  }
  return result;
};

export default getYearsMonths;
