import { ArrowRightMinor } from "@shopify/polaris-icons";
import { ProjectType } from "components/types";
import useFormSaveDraft from "hooks/useFormSaveDraft";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useFormContext } from "react-hook-form";
import { FormActions, formPrimaryButtonClass, formPrimaryButtonStyle } from "../../FormShell";

export default function CreateProjectSubmit() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const type = router.asPath.split("/")[3].split("?")[0];
  const typeAsProjectType = type.charAt(0).toUpperCase() + type.slice(1);
  const { formState, getValues } = useFormContext();
  const { isValid } = formState;
  const isDesign = type === "design";
  const primaryLabel = isDesign ? t("Publish design") : t("Save");
  const { SaveDraftButton, DeleteDraftButton, EditDraftButton } = useFormSaveDraft(
    `${getValues("main.title")}`,
    typeAsProjectType as ProjectType
  );

  return (
    <FormActions
      secondary={
        <>
          <DeleteDraftButton />
          <EditDraftButton />
          <SaveDraftButton />
        </>
      }
    >
      <button
        id="project-create-submit"
        type="submit"
        disabled={!isValid}
        className={formPrimaryButtonClass}
        style={formPrimaryButtonStyle}
      >
        {primaryLabel}
        <ArrowRightMinor className="w-4 h-4 fill-current" />
      </button>
    </FormActions>
  );
}
