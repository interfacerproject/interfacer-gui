import { NextRouter, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

// Components
import LoadingOverlay from "components/LoadingOverlay";
import { FormColumns } from "components/partials/create/FormShell";
import { ProjectTypeContext } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import EditProjectNav from "./EditProjectNav";
import SubmitChangesBar from "./SubmitChangesBar";

//

export interface EditFormLayoutProps<T extends FieldValues> {
  children: React.ReactNode;
  formMethods: UseFormReturn<T, any>;
  nav?: React.ReactNode;
  onSubmit: (values: T) => Promise<void>;
  redirect?: string | NextRouter;
  projectType?: ProjectType;
}

//

export default function EditFormLayout<T extends FieldValues>(props: EditFormLayoutProps<T>) {
  const { children, formMethods, nav, onSubmit = () => {}, redirect, projectType } = props;
  const { t } = useTranslation("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isSubmitSuccessful } = formState;

  async function onSubmitWrapper(values: T) {
    setLoading(true);
    try {
      await onSubmit(values);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  /* Prevent navigation if unsaved changes */

  const preventNavigation = isDirty && !isSubmitSuccessful;

  useEffect(() => {
    const handleWindowClose = (e: Event) => {
      if (!preventNavigation) return;
      return e.preventDefault();
    };

    const handleBrowseAway = () => {
      if (!preventNavigation) return;
      if (window.confirm(t("There are unsaved changes. Discard them?"))) return;
      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };

    if (preventNavigation) {
      window.addEventListener("beforeunload", handleWindowClose);
      router.events.on("routeChangeStart", handleBrowseAway);
    }
    //
    else if (isSubmitSuccessful) {
      if (!redirect) router.reload();
      else if (typeof redirect === "string" && router.asPath === redirect) {
        // Already on the redirect URL — reset form state to break the infinite loop
        // caused by react-hook-form preserving isSubmitSuccessful across same-page navigations
        formMethods.reset();
        setLoading(false);
      } else router.push(redirect);
    }

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [isSubmitSuccessful, redirect, router, preventNavigation, t]);

  /* Render */

  const content = (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmitWrapper)}>
        {/* Same page as the creation flows: one tinted 1200px column with the
            section rail beside the fields from `lg` up, lying down into a jump
            strip on phones. */}
        <div className="min-h-screen bg-ifr-profile" style={{ fontFamily: "var(--ifr-font-body)" }}>
          <div className="max-w-[1200px] mx-auto w-full px-4 md:px-6 py-6 md:py-[42px]">
            <FormColumns nav={nav || <EditProjectNav />}>{children}</FormColumns>
          </div>
        </div>
        <SubmitChangesBar />
      </form>
      {loading && <LoadingOverlay />}
    </FormProvider>
  );

  if (projectType) {
    return <ProjectTypeContext.Provider value={projectType}>{content}</ProjectTypeContext.Provider>;
  }

  return content;
}
