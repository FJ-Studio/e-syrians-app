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

const canAnswerPoll = (poll: Poll, user?: ESUser | null): [boolean, Array<string>] => {
    if (!user) {
        return [false, ["unauthorized"]];
    }
  let allowed = true;
  const reasons: Array<string> = [];
  // country check
  if ((poll?.audience?.country ?? "")?.length > 0) {
    if (!user.country) {
      allowed = false;
      reasons.push("country");
    } else {
      if (poll.audience.country?.includes(user.country) === false) {
        allowed = false;
        reasons.push("country");
      }
    }
  }
  // age check
  if (poll?.audience?.age_range) {
    const age = getAge(user.birth_date);
    if (
      age < parseInt(poll.audience.age_range.min) ||
      age > parseInt(poll.audience.age_range.max)
    ) {
      allowed = false;
      reasons.push("age");
    }
  }
  // gender check
  if ((poll?.audience.gender ?? "")?.length > 0) {
    if (!user.gender) {
      allowed = false;
      reasons.push("gender");
    } else {
      const genders = poll.audience.gender;
      if (genders?.includes(user.gender) === false) {
        allowed = false;
        reasons.push("gender");
      }
    }
  }
  // religious_affiliation check
  if ((poll?.audience.religious_affiliation ?? "")?.length > 0) {
    if (!user.religious_affiliation) {
      allowed = false;
      reasons.push("religious_affiliation");
    } else {
      const religious_affiliations =
        poll.audience.religious_affiliation;
      if (
        religious_affiliations?.includes(user.religious_affiliation) === false
      ) {
        allowed = false;
        reasons.push("religious_affiliation");
      }
    }
  }
  // hometown check
  if ((poll?.audience.hometown ?? "")?.length > 0) {
    if (!user.hometown) {
      allowed = false;
      reasons.push("hometown");
    } else {
      if (
        poll.audience.hometown?.includes(user.hometown) === false
      ) {
        allowed = false;
        reasons.push("hometown");
      }
    }
  }
  // ethnicity check
  if ((poll?.audience.ethnicity ?? "")?.length > 0) {
    if (!user.ethnicity) {
      allowed = false;
      reasons.push("ethnicity");
    } else {
      if (
        poll.audience.ethnicity?.includes(user.ethnicity) === false
      ) {
        allowed = false;
        reasons.push("ethnicity");
      }
    }
  }
  return [allowed, reasons];
};
export default canAnswerPoll;
