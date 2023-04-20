import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";

// Components
import UpdateProfileForm from "components/UpdateProfileForm";
import EditProfileLayout from "components/layout/EditProfileLayout";
import FetchUserLayout, { useUser } from "components/layout/FetchUserLayout";
import Layout from "components/layout/Layout";
import { GetStaticPaths } from "next";

//

const EditProfile: NextPageWithLayout = () => {
  const { person } = useUser();
  return <UpdateProfileForm user={person} />;
};

//

EditProfile.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchUserLayout>
      <EditProfileLayout>{page}</EditProfileLayout>
    </FetchUserLayout>
  </Layout>
);

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "createProjectProps"])),
    },
  };
}

export default EditProfile;
