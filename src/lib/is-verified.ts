import { ESUser } from "./types/account";

export const isFirstRegistrant = (user: ESUser): boolean => {
  return user.verification_reason === "first_registrant";
};

export const hasEnoughVerifications = (user: ESUser): boolean => {
  return user.verification_reason === "verifiers";
};

const isVerified = (user: ESUser): boolean => {
  return (
    user.verified_at !== null &&
    (isFirstRegistrant(user) || hasEnoughVerifications(user))
  );
};

export default isVerified;
