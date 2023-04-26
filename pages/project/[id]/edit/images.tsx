import { gql } from "@apollo/client";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import ImagesStep, { imagesStepSchema, ImagesStepValues } from "components/partials/create/project/steps/ImagesStep";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { GetStaticPaths } from "next";

//

export interface EditImagesValues {
  images: ImagesStepValues;
}

const EditImages: NextPageWithLayout = () => {
  const { project } = useProject();

  /* Form setup */

  const defaultValues: EditImagesValues = {
    images: [],
  };

  const schema = yup.object({
    images: imagesStepSchema,
  });

  const formMethods = useForm<EditImagesValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  //   const [editImagesMutation] = useMutation<EditImagesMutation, EditImagesMutationVariables>(EDIT_MAIN);

  //   function valuesToVariables(values: EditImagesValues): EditImagesMutationVariables {
  //     const classifiedAs = values.main.tags.length ? values.main.tags : undefined;
  //     return {
  //       id: project.id!,
  //       name: values.main.title,
  //       note: values.main.description,
  //       repo: values.main.link,
  //       classifiedAs,
  //     };
  //   }

  async function onSubmit(values: EditImagesValues) {
    // await editImagesMutation({ variables: valuesToVariables(values) });
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <ImagesStep />
    </EditFormLayout>
  );
};

//

export const EDIT_IMAGES = gql`
  mutation EditImages($id: ID!, $classifiedAs: [URI!], $note: String, $name: String, $repo: String) {
    updateEconomicResource(resource: { id: $id, classifiedAs: $classifiedAs, name: $name, note: $note, repo: $repo }) {
      economicResource {
        id
      }
    }
  }
`;

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

EditImages.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditImages;
