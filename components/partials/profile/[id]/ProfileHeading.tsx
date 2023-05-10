import { useMutation } from "@apollo/client";
import { Button, Link, Stack, Text } from "@bbtgnn/polaris-interfacer";
import DetailMap from "components/DetailMap";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { useUser } from "components/layout/FetchUserLayout";
import { useAuth } from "hooks/useAuth";
import { CLAIM_DID } from "lib/QueryAndMutation";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

const ProfileHeading = () => {
  const { user } = useAuth();
  const { person, id } = useUser();
  const { t } = useTranslation();
  const [didUrl, setDidUrl] = useState<string>(process.env.NEXT_PUBLIC_DID_EXPLORER!);
  const isUser = user?.ulid === id;

  const [claimPerson] = useMutation(CLAIM_DID);

  useEffect(() => {
    claimPerson({ variables: { id: id } }).then(data => {
      setDidUrl(`${process.env.NEXT_PUBLIC_DID_EXPLORER!}details/${data.data.claimPerson.did.didDocument?.id}`);
    });
  }, []);

  const Heading = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Stack>
      <Text as="span" variant="bodyLg" color="subdued">
        {label}
      </Text>
      {children}
    </Stack>
  );

  return (
    <Stack vertical spacing="extraLoose">
      <div className="flex items-center space-x-2">
        <Text as="h2" variant="headingXl">
          {isUser ? <>{t("Hi,") + " "}</> : <> </>}
          <span className="text-primary">{person?.name}</span>
        </Text>
        <BrUserAvatar user={person} size="48px" />
        {user && user.isVerified && (
          <div className="bg-gray-200 px-2 py-1 rounded-full">
            <Text as="span" variant="bodySm" color="subdued">
              {t("verified")} {"✅"}
            </Text>
          </div>
        )}
      </div>
      <Heading label={t("Username:")}>
        <Text as="span" variant="bodyLg">
          <span className="text-primary">{person?.user}</span>
        </Text>
      </Heading>
      {isUser && (
        <Heading label={t("Email:")}>
          <Text as="span" variant="bodyLg">
            <span className="text-primary">{person?.email}</span>
          </Text>
        </Heading>
      )}
      <Heading label={"DID:"}>
        <Text as="span" variant="bodyLg">
          <Link url={didUrl}>
            <a>
              <Button primary>{t("DID Explorer")}</Button>
            </a>
          </Link>
        </Text>
      </Heading>
      <Heading label={t("ID:")}>
        <Text as="span" variant="bodyLg">
          {person?.id}
        </Text>
      </Heading>
      {person?.primaryLocation && (
        <Heading label={t("Location:")}>
          <div className="w-72">
            <DetailMap height={180} location={person?.primaryLocation} />
          </div>
        </Heading>
      )}
      {person?.note && (
        <div className="flex flex-row space-x-2 lg:mr-2">
          <Text as="span" variant="bodyLg" color="subdued">
            {t("Bio:")}
          </Text>
          <pre className="py-1 px-4 bg-white border-2 rounded-md">{person?.note}</pre>
        </div>
      )}
    </Stack>
  );
};

export default ProfileHeading;
