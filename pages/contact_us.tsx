import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Button, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import BrRadioOption from "../components/brickroom/BrRadioOption";
import PFieldInfo from "../components/polaris/PFieldInfo";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { isRequired } from "../lib/isFieldRequired";

export namespace ContactUsNS {
  export interface FormValues {
    name: string;
    email: string;
    message: string;
    typeOfContact: string;
  }
}

const Contact_us: NextPage = () => {
  const { t } = useTranslation("contactUsProps");
  const ContactUsForm = () => {
    const defaultValues: ContactUsNS.FormValues = {
      name: "",
      email: "",
      message: "",
      typeOfContact: "",
    };

    const schema = yup
      .object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        message: yup.string().required(),
        typeOfContact: yup.string().required(),
      })
      .required();

    const form = useForm<ContactUsNS.FormValues>({
      mode: "all",
      resolver: yupResolver(schema),
      defaultValues,
    });

    const { formState, handleSubmit, register, control } = form;
    const { errors, isValid } = formState;

    const situationOptions = [
      { name: t("Report a bug"), value: t("Report a bug"), id: t("Report a bug"), label: t("Report a bug") },
      {
        name: t("Ask for assistance"),
        value: t("Ask for assistance"),
        id: t("Ask for assistance"),
        label: t("Ask for assistance"),
      },
      {
        name: t("Any other reason"),
        value: t("Any other reason"),
        id: t("Any other reason"),
        label: t("Any other reason"),
      },
    ];

    return (
      <form action={"mailto:info@interfacer.org?subject=contacts"} method="POST" encType="text/plain">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between">
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, name, value } }) => (
                  <TextField
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    autoComplete="off"
                    onChange={onChange}
                    onBlur={onBlur}
                    label={t("Your name")}
                    placeholder={t("Matt Deamon")}
                    helpText={t("Make sure the asset name matchs the Community Guidelines")}
                    requiredIndicator={isRequired(schema, name)}
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, name, value } }) => (
                  <TextField
                    type="email"
                    id={name}
                    name={name}
                    value={value}
                    autoComplete="off"
                    onChange={onChange}
                    onBlur={onBlur}
                    label={t("Your email address")}
                    placeholder={t("matt.deamon@example.com")}
                    helpText={t("Make sure the asset name matchs the Community Guidelines")}
                    requiredIndicator={isRequired(schema, name)}
                    error={errors.email?.message}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <Controller
              control={control}
              name="typeOfContact"
              render={({ field: { onChange, onBlur, name, value } }) => (
                <PFieldInfo label={t("Which of these best describes your situation")}>
                  <Stack vertical spacing="tight">
                    {situationOptions.map(option => (
                      <BrRadioOption
                        id={option.id}
                        value={option.value}
                        label={option.name}
                        description={option.label}
                        key={option.id}
                        testID={`type-${option.name}`}
                        {...register("typeOfContact")}
                      />
                    ))}
                  </Stack>
                </PFieldInfo>
              )}
            />
          </div>
          <div className="flex flex-col items-center w-full">
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, onBlur, name, value } }) => (
                <TextField
                  type="text"
                  id={name}
                  name={name}
                  value={value}
                  autoComplete="off"
                  onChange={onChange}
                  onBlur={onBlur}
                  label={t("Message")}
                  placeholder={t("Hello!")}
                  helpText={t("Your Message")}
                  multiline={4}
                  requiredIndicator={isRequired(schema, name)}
                />
              )}
            />
          </div>
          <div className="flex flex-col items-end justify-right w-full">
            <Button size="large" primary submit id="submit" disabled={!isValid}>
              {t("send")}
            </Button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className="md:p-8 p-2">
      <div className="mb-6 max-w-screen-md">
        <h2 className="text-primary">{t("Contact Us")} </h2>
        <p>{t("Report a problem, ask for assistance")}</p>
        <br />
        <ContactUsForm />
      </div>
    </div>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["contactUsProps"])),
    },
  };
}

export default Contact_us;
