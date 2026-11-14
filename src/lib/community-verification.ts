export type CommunityVerificationStatus = {
  community_verified_at?: string | null;
  verified_at?: string | null; // Older API and cached sessions.
};

export function communityVerifiedAt(user?: CommunityVerificationStatus | null): string | null {
  return (user?.community_verified_at === undefined ? user?.verified_at : user.community_verified_at) || null;
}

export function isCommunityVerified(user?: CommunityVerificationStatus | null): boolean {
  return communityVerifiedAt(user) !== null;
}
