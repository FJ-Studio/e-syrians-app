"use client";
import { ESUser } from "@/lib/types/account";
import { Avatar } from "@heroui/react";

const UserAvatar = ({ user }: { user: ESUser }) => {
  return <Avatar src={user.avatar} name={user.name} size="lg" isBordered />;
};

export default UserAvatar;
