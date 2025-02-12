import { ESUser } from "@/lib/types/account";
import { FC } from "react";

type UpdateBasicProfileDataProps = {
  user: ESUser;
};

const UpdateBasicProfileData: FC<UpdateBasicProfileDataProps> = ({ user }) => {
  return <form>{user.name}</form>;
};

export default UpdateBasicProfileData;
