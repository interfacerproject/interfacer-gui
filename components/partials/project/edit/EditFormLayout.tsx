import { NextRouter, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

// Components
import LoadingOverlay from "components/LoadingOverlay";
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
}

//

export default function EditFormLayout<T extends FieldValues>(props: EditFormLayoutProps<T>) {
  const { children, formMethods, nav, onSubmit = () => {}, redirect } = props;
  const { t } = useTranslation("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isSubmitSuccessful } = formState;

  async function onSubmitWrapper(values: T) {
    setLoading(true);
    try {
      await onSubmit(values);
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
      else router.push(redirect);
    }

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [isSubmitSuccessful, redirect, router, preventNavigation, t]);

  /* Render */

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmitWrapper)}>
        <div className="flex justify-center items-start space-x-8 md:space-x-16 lg:space-x-24 p-6">
          <div className="sticky top-24">
            {!nav && <EditProjectNav />}
            {nav}
          </div>
          <div className="grow max-w-xl px-6 pb-24 pt-0">{children}</div>
        </div>
        <SubmitChangesBar />
      </form>
      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}
