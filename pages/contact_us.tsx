import { NextPage } from "next";
import BrInput from "../components/brickroom/BrInput";
import BrTextField from "../components/brickroom/BrTextField";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import BrRadio from "../components/brickroom/BrRadio";

const Contact_us: NextPage = () => {
  const { t } = useTranslation("contactUsProps");
  const ContactUsForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [typeOfContact, setTypeOfContact] = useState("");
    const mailto = `mailto:info@interfacer.org?subject=${typeOfContact} - ${email}&body=name:${name} message:${message} email:${email}`;
    return (
      <form>
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between">
              <BrInput
                name={"Name"}
                label={t("Your name") + ":*"}
                hint={t("Make sure the asset name matchs the Community Guidelines")}
                placeholder={t("Matt Deamon")}
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
              <BrInput
                name={"Email"}
                label={t("Your email address") + ":*"}
                hint={t("Make sure the asset name matchs the Community Guidelines")}
                placeholder={t("matt.deamon@example.com")}
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <BrRadio
              array={[
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
              ]}
              label={t("Which of these best describes your situation") + ":*"}
              value={typeOfContact}
              onChange={value => setTypeOfContact(value)}
            />
          </div>
          <div className="flex flex-col items-center w-full">
            <BrTextField
              label={t("Message")}
              hint={t("Your Message")}
              placeholder={t("Hello!")}
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-end justify-right w-full">
            <Link href={mailto}>
              <a className="btn btn-accent">{t("send")}</a>
            </Link>
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
