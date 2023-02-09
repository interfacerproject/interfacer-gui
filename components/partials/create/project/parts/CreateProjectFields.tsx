import { useTranslation } from "next-i18next";
import React from "react";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues, ProjectType } from "../CreateProjectForm";

// Steps
import ContributorsStep from "../steps/ContributorsStep";
import DeclarationsStep from "../steps/DeclarationsStep";
import ImagesStep from "../steps/ImagesStep";
import ImportDesignStep from "../steps/ImportDesignStep";
import LicenseStep from "../steps/LicenseStep";
import LinkDesignStep from "../steps/LinkDesignStep";
import LocationStep from "../steps/LocationStep";
import MainStep from "../steps/MainStep";
import RelationsStep from "../steps/RelationsStep";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PDivider from "components/polaris/PDivider";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

//

export interface Props {
  projectType: ProjectType;
  onSubmit?: (values: CreateProjectValues) => void;
}

//

export type FormSectionsIDs = keyof CreateProjectValues | "importDesign";

export type FormSection = {
  navLabel: string;
  id: FormSectionsIDs;
  component: React.ReactNode;
  for?: Array<ProjectType>;
  required?: Array<ProjectType>;
};

export const formSections: Array<FormSection> = [
  {
    navLabel: "Import design",
    id: "importDesign",
    component: <ImportDesignStep />,
    for: ["design"],
  },
  {
    navLabel: "General info",
    id: "main",
    component: <MainStep />,
    required: ["product", "service", "design"],
  },
  {
    navLabel: "Design source",
    id: "linkedDesign",
    component: <LinkDesignStep />,
    for: ["product"],
  },
  {
    navLabel: "Images",
    id: "images",
    component: <ImagesStep />,
  },
  {
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType="product" />,
    for: ["product"],
    required: ["product"],
  },
  {
    navLabel: "Location",
    id: "location",
    component: <LocationStep projectType="service" />,
    for: ["service"],
  },
  {
    navLabel: "Certifications",
    id: "declarations",
    component: <DeclarationsStep />,
    for: ["product"],
    required: ["product"],
  },
  {
    navLabel: "Licenses",
    id: "licenses",
    component: <LicenseStep />,
    for: ["design"],
  },
  {
    navLabel: "Contributors",
    id: "contributors",
    component: <ContributorsStep />,
  },
  {
    navLabel: "Relations",
    id: "relations",
    component: <RelationsStep />,
  },
];

export function getSectionByProjectType(projectType: ProjectType): Array<FormSection> {
  return formSections.filter(section => !section.for || section.for.includes(projectType));
}

//

export default function CreateProjectFields(props: Props) {
  const { t } = useTranslation();
  const { projectType, onSubmit = () => {} } = props;
  const { handleSubmit } = useFormContext<CreateProjectValues>();

  const titles: Record<ProjectType, string> = {
    service: t("Create a new service"),
    product: t("Create a new product"),
    design: t("Create a new design"),
  };

  //

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack vertical spacing="extraLoose">
        <PTitleSubtitle title={titles[projectType]} subtitle={t("Make sure you read the Community Guidelines.")} />

        {formSections.map((section, index) => {
          if (!section.for || section.for.includes(projectType)) {
            return (
              <Stack vertical key={index} spacing="extraLoose">
                <PDivider id={section.id} />
                {section.component}
              </Stack>
            );
          }
        })}
      </Stack>
    </form>
  );
}
