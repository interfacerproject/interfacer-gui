import { useRouter } from "next/router";
import { useState } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

// Components
import LoadingOverlay from "components/LoadingOverlay";
import SubmitChangesBar from "./SubmitChangesBar";

//

export interface EditFormLayoutProps<T extends FieldValues> {
  children: React.ReactNode;
  formMethods: UseFormReturn<T, any>;
  onSubmit: (values: T) => Promise<void>;
}

//

export default function EditFormLayout<T extends FieldValues>(props: EditFormLayoutProps<T>) {
  const { children, formMethods, onSubmit = () => {} } = props;
  const router = useRouter();
  const { handleSubmit } = formMethods;
  const [loading, setLoading] = useState(false);

  async function onSubmitWrapper(values: T) {
    setLoading(true);
    await onSubmit(values);
    router.reload();
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmitWrapper)}>
        <SubmitChangesBar />
        <div className="mx-auto max-w-xl p-6 pb-24">{children}</div>
      </form>

      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}
