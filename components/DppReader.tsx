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
    <>
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
            const id = result.text;
            const isTypeId = id.match(/^[a-zA-Z0-9]{26}$/);
            if (isTypeId) {
              setId(id);
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
    </>
  );
};

export default DppReader;
