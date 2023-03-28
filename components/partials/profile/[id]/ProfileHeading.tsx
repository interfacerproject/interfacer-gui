import { useMutation } from "@apollo/client";
import { Button, Link, Stack, Text } from "@bbtgnn/polaris-interfacer";
import Avatar from "boring-avatars";
import { useUser } from "components/layout/FetchUserLayout";
import { useAuth } from "hooks/useAuth";
import useFilters from "hooks/useFilters";
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

  return (
    <Stack vertical spacing="extraLoose">
      <Stack spacing="tight" alignment="leading">
        <Text as="h2" variant="headingXl">
          {isUser ? <>{t("Hi,") + " "}</> : <> </>}
          <span className="text-primary">{person?.name}</span>
        </Text>
        <div className="w-10 rounded-full">
          <Avatar
            size={"full"}
            name={person?.name}
            variant="beam"
            colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
          />
        </div>
      </Stack>
      <Stack>
        <Text as="span" variant="bodyLg" color="subdued">
          {t("Username:")}
        </Text>
        <Text as="span" variant="bodyLg">
          <span className="text-primary">@{person?.user}</span>
        </Text>
      </Stack>
      {isUser && (
        <Stack>
          <Text as="span" variant="bodyLg" color="subdued">
            {t("Email:")}
          </Text>
          <Text as="span" variant="bodyLg">
            <span className="text-primary">{person?.email}</span>
          </Text>
        </Stack>
      )}
      <Stack alignment="center">
        <Text as="span" variant="bodyLg" color="subdued">
          {t("DID:")}
        </Text>
        <Text as="span" variant="bodyLg">
          <Link url={didUrl}>
            <a>
              <Button primary>{t("DID Explorer")}</Button>
            </a>
          </Link>
        </Text>
      </Stack>
      <Stack>
        <Text as="span" variant="bodyLg" color="subdued">
          {t("ID:")}
        </Text>
        <Text as="span" variant="bodyLg" color="subdued">
          {person?.id}
        </Text>
      </Stack>
      {person?.note && (
        <div className="flex flex-row space-x-2 lg:mr-2">
          <Text as="span" variant="bodyLg" color="subdued">
            {t("Bio:")}
          </Text>
          <pre className="whitespace-normal py-1 px-4 bg-white border-2 rounded-md">{person?.note}</pre>
        </div>
      )}
    </Stack>
  );
};

export default ProfileHeading;
