import {
  formPrimaryButtonClass,
  formPrimaryButtonStyle,
  formSecondaryButtonClass,
  formSecondaryButtonStyle,
} from "components/partials/create/FormShell";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";

export interface SubmitChangesProps {}

// Unlike the creation flows, where the action row closes the form, an edit can
// be abandoned mid-scroll — so this bar stays pinned once something changes.
// It wears the prototype's buttons rather than raw Polaris ones.
export default function SubmitChangesBar(props: SubmitChangesProps) {
  const { t } = useTranslation();
  const { formState, reset } = useFormContext();
  const { isValid, isDirty } = formState;

  function handleReset() {
    reset();
  }

  if (!isDirty) return null;

  return (
    <div
      className="sticky bottom-0 z-20 flex flex-wrap items-center justify-end gap-3 px-4 py-3 md:px-6 border-t border-ifr bg-ifr-surface"
      style={{
        fontFamily: "var(--ifr-font-body)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <p
        className="text-ifr-text-secondary m-0 mr-auto"
        style={{ fontSize: "var(--ifr-fs-base)", fontWeight: "var(--ifr-fw-regular)" }}
      >
        {t("You have unsaved changes")}
      </p>

      <button
        type="button"
        onClick={handleReset}
        className={formSecondaryButtonClass}
        style={{ ...formSecondaryButtonStyle, minWidth: "auto", padding: "0 20px" }}
      >
        {t("Discard changes")}
      </button>

      <button
        type="submit"
        disabled={!isValid}
        className={formPrimaryButtonClass}
        style={{ ...formPrimaryButtonStyle, minWidth: "auto" }}
      >
        {t("Update")}
      </button>
    </div>
  );
}
