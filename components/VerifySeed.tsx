import { useTranslation } from "next-i18next";
import { ChangeEvent, useState } from "react";
import { zencode_exec } from "zenroom";
import { useAuth } from "../hooks/useAuth";
import useStorage from "../hooks/useStorage";
import keypairoomClientRecreateKeys from "../zenflows-crypto/src/keypairoomClientRecreateKeys";
import BrInput from "./brickroom/BrInput";

const VerifySeed = ({ email, HMAC }: { email: string; HMAC: string }) => {
  const { login } = useAuth();
  const { t } = useTranslation("signInProps");
  const [seed, setSeed] = useState("");
  const [error, setError] = useState("");
  const { setItem } = useStorage();

  const validateSeed = (seed: string) => {
    const isValid = seed.split(" ").length === 12;
    if (isValid) {
      setSeed(seed);
      setError("");
    } else {
      setError(t("Invalid passphrase"));
    }
  };

  const completeSignIn = async () => {
    await login({ email })
      .then(() => {
        window.location.replace("/logged_in");
      })
      .catch((error: any) => setError(t("Invalid passphrase")));
  };

  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const zenData = `
            {
                "seed": "${seed}",
                "seedServerSideShard.HMAC": "${HMAC}"
            }`;

    await zencode_exec(keypairoomClientRecreateKeys, { data: zenData })
      .then(({ result }) => {
        const res = JSON.parse(result);
        setItem("eddsa_public_key", res.eddsa_public_key);
        setItem("eddsa_key", res.keyring.eddsa);
        setItem("ethereum_address", res.keyring.ethereum);
        setItem("reflow", res.keyring.reflow);
        setItem("schnorr", res.keyring.schnorr);
        setItem("eddsa", res.keyring.eddsa);
        setItem("seed", res.seed);
      })
      .catch(() => setError(t("Invalid passphrase")))
      .then(() => {
        completeSignIn();
      });
  };

  return (
    <>
      <p className="mt-4 mb-6">{t("Input the passphrase that you kept generated during the signup process")}</p>
      <form onSubmit={onSubmit}>
        <BrInput
          name="validateSeed"
          error={error}
          label={t("Passphrase")}
          placeholder={t("state stumble clever trap excuse scheme world human")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => validateSeed(e.target.value)}
        />
        <p className="text-[#8A8E96] mb-6">
          {t("Make sure to insert all the 12 words of the passphrase separated by a space")}
        </p>
        <button className="btn btn-block btn-accent" type="submit" onClick={onSubmit}>
          {t("Login")}
        </button>
      </form>
    </>
  );
};

export default VerifySeed;
