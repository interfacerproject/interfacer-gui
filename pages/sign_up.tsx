import { LinkIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, ReactElement, useState } from "react";
import BrInput from "../components/brickroom/BrInput";
import KeyringGeneration from "../components/KeyringGeneration";
import NRULayout from "../components/layout/NRULayout";
import {useAuth} from "../lib/auth";
import {NextPageWithLayout} from "./_app";


export async function getStaticProps({ locale }: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, [
                "signUpProps",
                "signInProps",
            ])),
        },
    };
}

const SignUp: NextPageWithLayout = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [user, setUser] = useState("");
    const [step, setStep] = useState(0);
    const [HMAC, setHMAC] = useState("");
    const [yetRegisteredEmail, setYetRegisteredEmail] = useState("");
    const [emailValid, setEmailValid] = useState("");
    const { t } = useTranslation("signUpProps");

    const router = useRouter();

    const { signUp, askKeypairoomServer } = useAuth();

    async function onSubmit(e: { preventDefault: () => void }) {
        e.preventDefault();
        setStep(1);
    }

    async function verifyEmail({ email }: { email: string }) {
        const result = await askKeypairoomServer(email, true, name);
        if (result?.keypairoomServer) {
            setYetRegisteredEmail("");
            if (email.includes("@")) {
                setEmailValid(t("email.valid"));
            } else {
                setEmailValid("");
            }
            setEmail(email);
            setHMAC(result.keypairoomServer);
        } else {
            setEmailValid("");
            setYetRegisteredEmail(result);
        }
    }

    const isButtonEnabled = HMAC === "" ? "btn-disabled" : "";

    return (
        <div className="grid h-full grid-cols-6 mt-2 md:mt-40">
            <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
                {step === 0 && (
                    <>
                        <h2>{t("title")}</h2>
                        <p className="mt-4 mb-6">{t("presentation")}</p>
                        <form onSubmit={onSubmit}>
                            <BrInput
                                type="email"
                                error={yetRegisteredEmail}
                                hint={emailValid}
                                placeholder={t("email.placeholder")}
                                label={t("email.label")}
                                help={t("email.help")}
                                onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                                    verifyEmail({ email: e.target.value })
                                }
                            />
                            <BrInput
                                type="text"
                                label={t("name.label")}
                                help={t("name.help")}
                                placeholder={t("name.placeholder")}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setName(e.target.value)
                                }
                            />
                            <BrInput
                                type="text"
                                placeholder={t("user.placeholder")}
                                label={t("user.label")}
                                help={t("user.help")}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setUser(e.target.value)
                                }
                            />
                            <button
                                className={`my-6 btn btn-block btn-primary ${isButtonEnabled}`}
                                type="submit"
                            >
                                {t("button")}
                            </button>
                        </form>
                        <p className="flex flex-row items-center mt-6">
                            <span>{t("register.question")}</span>
                            <Link href={"/sign_in"}>
                                <a className="flex flex-row font-semibold">
                                    <LinkIcon className="w-5 h-5 mx-2" />
                                    {t("register.answer")}
                                </a>
                            </Link>
                        </p>
                    </>
                )}
                {step === 1 && (
                    <KeyringGeneration
                        email={email}
                        user={user}
                        name={name}
                        HMAC={HMAC}
                        isSignUp={true}
                    />
                )}
            </div>
        </div>
    );
};
SignUp.getLayout = function getLayout(page: ReactElement) {
    return <NRULayout>{page}</NRULayout>;
};
export default SignUp;
