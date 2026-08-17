import { NextRouter, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

// Components
import LoadingOverlay from "components/LoadingOverlay";
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
        {/* Section nav rides above the fields on phones and becomes a sticky
            rail beside them from `lg` up, where the two fit side by side. */}
        <div className="flex flex-col lg:flex-row lg:justify-center items-stretch lg:items-start gap-6 lg:gap-0 lg:space-x-16 xl:space-x-24 p-4 md:p-6">
          <div className="lg:sticky lg:top-24 lg:shrink-0">
            {!nav && <EditProjectNav />}
            {nav}
          </div>
          <div className="grow min-w-0 w-full max-w-xl mx-auto lg:mx-0 px-0 md:px-6 pb-24 pt-0">{children}</div>
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
