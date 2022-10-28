import { useTranslation } from "next-i18next";
import BrInput from "./brickroom/BrInput";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { KeyIcon, LinkIcon } from "@heroicons/react/solid";

const InvitationKey = ({ setStep }: { setStep: Dispatch<SetStateAction<number>> }) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [invitationKey, setInvitationKey] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation("signUpProps");

  useEffect(() => {
    if (invitationKey === process.env.NEXT_PUBLIC_INVITATION_KEY) {
      setIsDisabled(false);
      setError("");
    } else {
      setIsDisabled(true);
    }
  }, [invitationKey]);

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (invitationKey === process.env.NEXT_PUBLIC_INVITATION_KEY) {
      setError("");
    } else {
      setError(t("invitationKeyError"));
    }
  };

  const onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (invitationKey === process.env.NEXT_PUBLIC_INVITATION_KEY) {
      setStep(1);
    }
  };

  return (
    <>
      <div className="flex flex-row">
        <h2>{t("invitationTitle")}</h2>
        <KeyIcon className="w-8 h-8" />
      </div>
      <p className="mt-4 mb-6">{t("invitationPresentation")}</p>
      <p className="flex flex-row items-center">
        <span>{t("register.question")}</span>
        <Link href={"/sign_in"}>
          <a className="flex flex-row font-semibold">
            <LinkIcon className="w-5 h-5 mx-2" />
            {t("register.answer")}
          </a>
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-2">
        <BrInput
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInvitationKey(e.target.value)}
          label={t("invitationKey")}
          onBlur={handleBlur}
          error={error}
        />
        <button className="mt-4 btn btn-block btn-accent" type="submit" disabled={isDisabled}>
          {t("invitationButton")}
        </button>
      </form>
    </>
  );
};

export default InvitationKey;
