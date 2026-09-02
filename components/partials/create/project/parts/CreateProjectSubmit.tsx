import { ArrowRightMinor } from "@shopify/polaris-icons";
import { ProjectType } from "components/types";
import useFormSaveDraft from "hooks/useFormSaveDraft";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useFormContext } from "react-hook-form";

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
    <div
      className="ifr-form-actions flex flex-wrap items-center justify-between gap-3 pt-4"
      style={{
        borderTop: "1px solid var(--ifr-border)",
        fontFamily: "var(--ifr-font-body)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <DeleteDraftButton />
        <EditDraftButton />
        <SaveDraftButton />
      </div>
      <button
        id="project-create-submit"
        type="submit"
        disabled={!isValid}
        className="flex items-center justify-center gap-2 border-none cursor-pointer transition-colors bg-ifr-yellow hover:bg-ifr-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          minWidth: "241px",
          height: "var(--ifr-control-height)",
          borderRadius: "var(--ifr-radius-sm)",
          color: "var(--ifr-text-primary)",
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          fontWeight: "var(--ifr-fw-medium)",
          lineHeight: "20px",
          padding: "0 24px",
        }}
      >
        {primaryLabel}
        <ArrowRightMinor className="w-4 h-4 fill-current" />
      </button>
    </div>
  );
}
