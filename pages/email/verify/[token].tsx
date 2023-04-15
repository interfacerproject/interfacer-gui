import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";

//

export default function EmailVerify() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { token } = router.query;
  if (!token || typeof token !== "string") return null;

  return <div className="">{token}</div>;
}
