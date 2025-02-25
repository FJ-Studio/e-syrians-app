import { MAX_AUDIENCE_AGE } from "./constants/census";
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
  if (poll.id !== '1') {
    return [true, ['']];
  }

  

  const reasons: Array<string> = [];
  // country check
  if ((poll?.audience?.country ?? [])?.length > 0) {
    if (!user.country) {
      reasons.push("country");
    } else {
      if (poll.audience.country?.includes(user.country) === false) {
        reasons.push("country");
      }
    }
  }
  // age check
  if (poll?.audience?.age_range) {
    const age = getAge(user.birth_date);
    const maxAllowed = parseInt(poll.audience.age_range.max);
    if (
      age < parseInt(poll.audience.age_range.min) ||
      (age > maxAllowed && maxAllowed !== MAX_AUDIENCE_AGE)
    ) {
      reasons.push("age");
    }
  }
  // gender check
  if ((poll?.audience.gender ?? [])?.length > 0) {
    if (!user.gender) {
      reasons.push("gender");
    } else {
      if (poll.audience.gender?.includes(user.gender) === false) {
        reasons.push("gender");
      }
    }
  }
  // religious_affiliation check
  if ((poll?.audience.religious_affiliation ?? [])?.length > 0) {
    if (!user.religious_affiliation) {
      reasons.push("religious_affiliation");
    } else {
      if (
        poll.audience.religious_affiliation?.includes(
          user.religious_affiliation
        ) === false
      ) {
        reasons.push("religious_affiliation");
      }
    }
  }
  // hometown check
  if ((poll?.audience.hometown ?? [])?.length > 0) {
    if (!user.hometown) {
      reasons.push("hometown");
    } else {
      if (poll.audience.hometown?.includes(user.hometown) === false) {
        reasons.push("hometown");
      }
    }
  }
  // ethnicity check
  if ((poll?.audience.ethnicity ?? [])?.length > 0) {
    if (!user.ethnicity) {
      reasons.push("ethnicity");
    } else {
      if (poll.audience.ethnicity?.includes(user.ethnicity) === false) {
        reasons.push("ethnicity");
      }
    }
  }
  return [reasons.length === 0, reasons];
};
export default isInAudience;
