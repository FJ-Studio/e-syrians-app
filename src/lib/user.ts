import { APP_URL } from "./constants/misc";
import { ESUser } from "./types/account";

const getUrl = (user: ESUser) => {
  return `${APP_URL}/census/v/${user.uuid}`;
};

export { getUrl };
