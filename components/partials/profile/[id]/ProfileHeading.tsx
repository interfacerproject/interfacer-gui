import { useMutation } from "@apollo/client";
import { Button, Card, Link, Stack, Text } from "@bbtgnn/polaris-interfacer";
import DetailMap from "components/DetailMap";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { useUser } from "components/layout/FetchUserLayout";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useAuth } from "hooks/useAuth";
import { CLAIM_DID } from "lib/QueryAndMutation";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import TrackRecord from "./TrackRecord";

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
  }, [claimPerson, id]);

  const Heading = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Stack>
      <Text as="span" variant="bodyLg" color="subdued">
        {label}
      </Text>
      {children}
    </Stack>
  );

  const ProfileHeadingSideBar = () => {
    return (
      <>
        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="w-full justify-end flex pb-3 gap-2">
            <Link url={didUrl}>
              <a target="_blank">
                <Button primary>{t("DID Explorer")}</Button>
              </a>
            </Link>
          </div>
          <Card sectioned>
            <Stack vertical spacing="extraLoose">
              <BrUserAvatar user={person} size="300px" />
              {person?.primaryLocation && (
                <Stack vertical>
                  <PTitleSubtitle title={t("Location")} titleTag="h2" />
                  <div className="w-72">
                    <DetailMap height={180} location={person?.primaryLocation} />
                  </div>
                </Stack>
              )}
              <TrackRecord />
            </Stack>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div className="p-4 flex space-x-4">
      <div className="grow">
        <Stack vertical spacing="extraLoose">
          <div className="flex flex-row">
            <Stack vertical spacing="extraLoose">
              <Stack>
                <Text as="h2" variant="headingXl">
                  {isUser ? <>{t("Hi,") + " "}</> : <> </>}
                  <span className="text-primary">{person?.user}</span>
                </Text>
                {user && user.isVerified && (
                  <div className="bg-gray-200 px-2 py-1 rounded-full">
                    <Text as="span" variant="bodySm" color="subdued">
                      {t("verified")} {"✅"}
                    </Text>
                  </div>
                )}
              </Stack>
              <Stack vertical spacing="tight">
                <Text as="span" variant="bodyMd">
                  {person?.id}
                </Text>
                <Text as="span" variant="bodyMd">
                  <span className="text-primary">{person?.name}</span>
                </Text>
                <Text as="span" variant="bodyMd">
                  <span className="text-primary">{person?.email}</span>
                </Text>
              </Stack>
              {person?.note && (
                <div className="flex flex-row space-x-2 lg:mr-2">
                  <div className="py-1 px-4 bg-white border-2 rounded-md whitespace-pre-wrap w-fit">{person?.note}</div>
                </div>
              )}
            </Stack>
          </div>
          <div className="block lg:hidden">
            <ProfileHeadingSideBar />
          </div>
        </Stack>
      </div>
      <div className="hidden lg:block w-128">
        <ProfileHeadingSideBar />
      </div>
    </div>
  );
};

export default ProfileHeading;
