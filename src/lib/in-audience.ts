import { MAX_AUDIENCE_AGE, MIN_AUDIENCE_AGE } from "./constants/census";
import { ESUser } from "./types/account";
import { Poll } from "./types/polls";

function getAge(birthdate?: string | null): number {
  let age = 0;
  if (!birthdate) {
    return age;
  }
  const birthDate = new Date(birthdate);
  const today = new Date();

  age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Adjust age if the birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}

const isInAudience = (
  poll: Poll,
  user?: ESUser | null
): [boolean, Array<string>] => {
  if (!user) {
    return [false, ["unauthorized"]];
  }

  // temporarily accept all users for testing
  // if (poll.id !== '0') {
  //   return [true, ['']];
  // }

  const reasons: Array<string> = [];
  // age check
  if (poll?.audience?.age_range) {
    const pollMinAge = parseInt(poll.audience.age_range.min);
    const pollMaxAge = parseInt(poll.audience.age_range.max);
    if (pollMinAge !== MIN_AUDIENCE_AGE || pollMaxAge !== MAX_AUDIENCE_AGE) {
      // this means that the poll author is targeting a specific age range. Do a check
      if (!user.birth_date) {
        // if the user doesn't have a birth date, they are not in the audience
        reasons.push("age");
      } else {
        // if the user has a birth date, calculate their age and check if they are in the audience
        const age = getAge(user.birth_date);
        if (age < pollMinAge || age > pollMaxAge) {
          reasons.push("age");
        }
      }
    }
  }

  type AudienceCriteria =
    | "country"
    | "gender"
    | "religious_affiliation"
    | "hometown"
    | "ethnicity";
  (
    [
      "country",
      "gender",
      "religious_affiliation",
      "hometown",
      "ethnicity",
    ] as AudienceCriteria[]
  ).forEach((criteria) => {
    // if this criteria is in the audience and has specific values
    if (poll?.audience[criteria] && poll?.audience[criteria].length > 0) {
      if (
        // if the user doesn't have this criteria or the user's value is not in the allowed values
        !user[criteria] ||
        poll.audience[criteria].includes(user[criteria]) === false
      ) {
        reasons.push(criteria);
      }
    }
  });

  return [reasons.length === 0, reasons];
};
export default isInAudience;
