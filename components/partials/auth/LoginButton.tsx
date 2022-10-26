import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { useRouter } from "next/router";
import keypairoomClientRecreateKeys from "zenflows-crypto/src/keypairoomClientRecreateKeys";
import { zencode_exec } from "zenroom";

// Components
import { ChildrenComponent } from "../../brickroom/utils";

//

export interface LoginButtonProps {
  email: string;
  seed: string;
  HMAC: string;
}

//

export default function LoginButton(props: ChildrenComponent<LoginButtonProps>) {
  const { email, seed, HMAC, children } = props;

  const { setItem } = useStorage();
  const { login } = useAuth();
  const router = useRouter();

  async function onClick() {
    const zenData = `
    {
        "seed": "${seed}",
        "seedServerSideShard.HMAC": "${HMAC}"
    }`;

    const { result } = await zencode_exec(keypairoomClientRecreateKeys, { data: zenData });
    const res = JSON.parse(result);

    setItem("eddsa_public_key", res.eddsa_public_key);
    setItem("eddsa_key", res.keyring.eddsa);
    setItem("ethereum_address", res.keyring.ethereum);
    setItem("reflow", res.keyring.reflow);
    setItem("schnorr", res.keyring.schnorr);
    setItem("eddsa", res.keyring.eddsa);
    setItem("seed", res.seed);

    await login({ email });

    router.push("/");
  }

  return (
    <button className="btn btn-accent" onClick={onClick}>
      {children}
    </button>
  );
}
