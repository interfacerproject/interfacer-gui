import { Modal, Text } from "@bbtgnn/polaris-interfacer";
import ProjectDisplay from "components/ProjectDisplay";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useState } from "react";
import { QrReader } from "react-qr-reader";

const DppReader = () => {
  const [id, setId] = useState<string | undefined>(undefined);
  const [activeLink, setActiveLink] = useState(false);
  const { t } = useTranslation("common");
  return (
    <div className="container mx-auto">
      <QrReader
        constraints={{
          facingMode: "environment",
        }}
        onResult={(result, error) => {
          if (!!error) {
            console.info(error);
            return;
          }
          if (!!result) {
            //@ts-ignore
            const url = result.text;
            const dppId = url.split("/").pop();
            const isTypeId = dppId.match(/^[a-zA-Z0-9]{26}$/);
            console.log(isTypeId, dppId, url);
            if (isTypeId) {
              setId(dppId);
              setActiveLink(true);
            }
          }
        }}
      />

      <Modal fullScreen open={activeLink} onClose={() => setActiveLink(false)} title={t("Project")}>
        <Modal.Section>
          <div className="flex justify-between">
            <div>
              <Link href={`/project/${id}`}>
                <a>
                  <ProjectDisplay projectId={id} />
                </a>
              </Link>
            </div>
            <Text as="p" variant="bodyMd" color="subdued">
              {t("result")}
            </Text>
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
};

export default DppReader;
