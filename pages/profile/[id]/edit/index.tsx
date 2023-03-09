import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";

// Form
import { useForm } from "react-hook-form";

// Components
import { yupResolver } from "@hookform/resolvers/yup";
import EditProfileLayout from "components/layout/EditProfileLayout";
import FetchUserLayout, { useUser } from "components/layout/FetchUserLayout";
import Layout from "components/layout/Layout";
import UpdateProfileForm from "components/UpdateProfileForm";
import { SpatialThing } from "lib/types";
import { GetStaticPaths } from "next";
import { useRouter } from "next/router";
import * as yup from "yup";

//
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

export const editProfileSchema = yup.object({
  name: yup.string(),
  note: yup.string(),
  primaryLocation: yup.object({
    id: yup.string(),
    name: yup.string(),
    geo: yup.object({
      type: yup.string(),
      coordinates: yup.array().of(yup.number()),
    }),
  }),
  user: yup.string(),
});

//

export interface EditProfileValues {
  id: string;
  name: string;
  note: string | null;
  primaryLocation: SpatialThing | null;
  user: string;
}

const EditProfile: NextPageWithLayout = () => {
  const { person } = useUser();

  /* Form setup */

  const defaultValues: Partial<EditProfileValues> = {
    name: person.name,
    note: person.note,
    primaryLocation: person.primaryLocation,
    user: person.user,
  };

  const schema = yup.object({
    editProfileSchema,
  });

  const formMethods = useForm<EditProfileValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  const router = useRouter();

  // const {id} = router.query;

  async function onSubmit(values: any) {}

  /* Render */

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

export default EditProfile;
