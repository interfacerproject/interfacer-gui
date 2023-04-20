import { Text } from "@bbtgnn/polaris-interfacer";
import FullWidthBanner from "components/FullWidthBanner";
import { ChildrenProp } from "components/brickroom/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Props extends ChildrenProp {
  param?: string;
}

const SuccessBanner = (props: Props) => {
  const { children, param = "success" } = props;
  const router = useRouter();

  const isSuccess = router.query[param] === "true";
  window.history.replaceState({}, document.title, window.location.pathname);

  const [viewSuccessBanner, setViewSuccessBanner] = useState(false);

  useEffect(() => {
    setViewSuccessBanner(isSuccess);
  }, [isSuccess]);

  const closeBanner = () => {
    setViewSuccessBanner(false);
  };

  return (
    <FullWidthBanner open={viewSuccessBanner} onClose={closeBanner}>
      <Text as="p" variant="bodyMd" id="success-banner-content">
        {children}
      </Text>
    </FullWidthBanner>
  );
};

export default SuccessBanner;
