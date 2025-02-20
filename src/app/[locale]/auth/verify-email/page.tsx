import EmailVerification from "@/components/account/auth/email-verification";
import { verifyEmail } from "@/lib/api/requests";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function EmailVerificationPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const expires = searchParams.expires;
  const hash = searchParams.hash;
  const signature = searchParams.signature;
  const id = searchParams.id;

  const success = await verifyEmail(
    id as string,
    expires as string,
    hash as string,
    signature as string
  );

  return <EmailVerification success={success} />;
}
