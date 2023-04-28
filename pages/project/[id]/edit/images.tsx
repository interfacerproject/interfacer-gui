import { gql, useMutation } from "@apollo/client";
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
import { prepFilesForZenflows, uploadFiles } from "lib/fileUpload";
import { dataURLtoFile, fileToIfile } from "lib/resourceImages";
import { EditImagesMutation, EditImagesMutationVariables, File as ZenflowsFile } from "lib/types";
import { GetStaticPaths } from "next";

//

export interface EditImagesValues {
  images: ImagesStepValues;
}

const EditImages: NextPageWithLayout = () => {
  const { project } = useProject();

  /* Form setup */

  /*
    In order to display the images in the form, we need to convert them to files.
    We use the hash as the filename, so we can check if the image has been changed.
    The separator is used to split the filename and the hash.
 */
  const SEPARATOR = " @ ";

  const defaultValues: EditImagesValues = {
    images: project.images!.map(i => {
      const filename = `${i.name}${SEPARATOR}${i.hash}`;
      if (i.bin) return dataURLtoFile(i.bin, i.mimeType, filename);
      else return new File([], filename);
    }),
  };

  const schema = yup.object({
    images: imagesStepSchema,
  });

  const formMethods = useForm<EditImagesValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Images update logic */

  function getAlreadyUploadedImage(filename: string): ZenflowsFile | undefined {
    const filenameParts = filename.split(SEPARATOR);
    const hash = filenameParts[filenameParts.length - 1];
    const name = filenameParts.slice(0, filenameParts.length - 1).join(SEPARATOR);
    return project.images!.find(i => i.hash === hash && i.name === name);
  }

  function isImageAlreadyUploaded(filename: string): boolean {
    return Boolean(getAlreadyUploadedImage(filename));
  }

  function getAlreadyUploadedImages(images: File[]): ZenflowsFile[] {
    return images.map(image => getAlreadyUploadedImage(image.name)).filter(Boolean) as ZenflowsFile[];
  }

  /* Submit logic */

  const [editImagesMutation] = useMutation<EditImagesMutation, EditImagesMutationVariables>(EDIT_IMAGES);

  async function onSubmit(values: EditImagesValues) {
    const existingImages = getAlreadyUploadedImages(values.images);
    const newImages = values.images.filter(f => !isImageAlreadyUploaded(f.name));
    const mutationImages = [...existingImages.map(fileToIfile), ...(await prepFilesForZenflows(newImages))];
    await editImagesMutation({ variables: { images: mutationImages, id: project.id! } });
    await uploadFiles(newImages);
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
  mutation EditImages($id: ID!, $images: [IFile!]) {
    updateEconomicResource(resource: { id: $id, images: $images }) {
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
