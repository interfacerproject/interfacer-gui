import { gql, useMutation } from "@apollo/client";
import { Banner, Button, Spinner, Text } from "@bbtgnn/polaris-interfacer";
import { VerifyEmailMutation, VerifyEmailMutationVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

//

export default function EmailVerify() {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [verifyEmail] = useMutation<VerifyEmailMutation, VerifyEmailMutationVariables>(VERIFY_EMAIL);

  useEffect(() => {
    const { token } = router.query;
    if (!token || typeof token !== "string") return;

    verifyEmail({
      variables: { token },
      onError: err => setError(err.message),
      onCompleted: () => setLoading(false),
    });
  }, [router.query]);

  /* Rendering */

  if (error)
    return (
      <div className="max-w-xl">
        <Banner title={t("Error")} status="critical">
          {t("An error occurred during email verification.")}
        </Banner>
      </div>
    );

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-5xl -rotate-6">{"✉️ ✅"}</span>
      <Text as="h1" variant="heading2xl">
        <span className="text-primary">{t("Email verified successfully!")}</span>
      </Text>
      <Link href="/">
        <Button>{t("Go to home page")}</Button>
      </Link>
    </div>
  );
}

const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    personVerifyEmailVerification(token: $token)
  }
`;
