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
  const { SaveDraftButton, DeleteDraftButton, EditDraftButton } = useFormSaveDraft(
    `${getValues("main.title")}`,
    typeAsProjectType as ProjectType
  );

  return (
    <div
      className="sticky bottom-0 right-0 z-30 border-t border-ifr"
      style={{
        backgroundColor: "var(--ifr-bg-surface)",
        fontFamily: "var(--ifr-font-body)",
      }}
    >
      <div className="max-w-[1280px] mx-auto flex flex-row items-center justify-end gap-3 px-6 py-3">
        <DeleteDraftButton />
        <EditDraftButton />
        <SaveDraftButton />
        <button
          id="project-create-submit"
          type="submit"
          disabled={!isValid}
          className="border-none cursor-pointer text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            height: "var(--ifr-control-height)",
            borderRadius: "var(--ifr-radius-sm)",
            backgroundColor: "var(--ifr-green)",
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
            fontWeight: "var(--ifr-fw-semibold)",
            padding: "0 24px",
          }}
        >
          {t("Save")}
        </button>
      </div>
    </div>
  );
}
