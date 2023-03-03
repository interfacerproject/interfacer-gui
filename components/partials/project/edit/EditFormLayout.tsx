import { useRouter } from "next/router";
import { useState } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

// Components
import LoadingOverlay from "components/LoadingOverlay";
import EditProjectNav from "./EditProjectNav";
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
        <div className="flex justify-center items-start space-x-8 md:space-x-16 lg:space-x-24 p-6">
          <div className="sticky top-24">
            <EditProjectNav />
          </div>
          <div className="grow max-w-xl px-6 pb-24 pt-0">{children}</div>
        </div>
        <SubmitChangesBar />
      </form>
      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}
