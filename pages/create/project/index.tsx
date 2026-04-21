import { useAuth } from "hooks/useAuth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect } from "react";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["createProjectProps", "common"])),
    },
  };
}

const CreateProject = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.ulid) {
      router.replace(`/profile/${user.ulid}`);
    } else {
      router.replace("/");
    }
  }, [user, router]);

  return null;
};

export default CreateProject;
