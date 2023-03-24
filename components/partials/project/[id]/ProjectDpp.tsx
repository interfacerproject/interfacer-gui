import { gql, useQuery } from "@apollo/client";
import { Button, Frame, Icon, Modal, Spinner, Text, Toast } from "@bbtgnn/polaris-interfacer";
import { DuplicateMinor, MaximizeMinor } from "@shopify/polaris-icons";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import Tree from "react-d3-tree";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

export const QUERY_DPP = gql`
  query getDpp($id: ID!) {
    economicResource(id: $id) {
      traceDpp
    }
  }
`;

const ProjectDpp = ({ id }: { id: string }) => {
  const [activeTree, setActiveTree] = useState(false);
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const { loading, data } = useQuery(QUERY_DPP, {
    variables: { id: id },
  });
  const { t } = useTranslation("common");
  const dppToTreeData = (dpp: any) => {
    return dpp?.children?.map((child: any) => {
      return {
        name: child.type,
        children: dppToTreeData(child),
        attributes: { name: child.node.name || child.node.action_id },
      };
    });
  };
  const ref = useRef(null);
  const treeData = dppToTreeData(data?.economicResource.traceDpp);

  function copyDPP() {
    navigator.clipboard.writeText(JSON.stringify(data?.economicResource.traceDpp, null, 2));
    setActive(true);
  }
  if (loading) return <Spinner />;

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text as="h1" variant="headingXl">
              {t("Tree view")}
            </Text>
            <div className="space-x-2">
              <Button onClick={copyDPP} icon={<Icon source={DuplicateMinor} />}>
                {t("Copy DPP")}
              </Button>
            </div>
          </div>
          <div className="border-1 border-border-subdued bg-white rounded-md h-64 relative">
            <div className="absolute bottom-4 right-4">
              <Button onClick={() => setActiveTree(true)} icon={<Icon source={MaximizeMinor} />}>
                {t("Full screen")}
              </Button>
            </div>
            <Tree
              data={treeData}
              orientation="vertical"
              nodeSize={{ x: 300, y: 100 }}
              translate={{ x: 150, y: 20 }}
              zoom={0.5}
              hasInteractiveNodes={false}
              zoomable={false}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Text as="h1" variant="headingXl">
              {t("JSON view")}
            </Text>
            <Button onClick={copyDPP} icon={<Icon source={DuplicateMinor} />}>
              {t("Copy DPP")}
            </Button>
          </div>
          <DynamicReactJson
            src={data?.economicResource.traceDpp}
            collapsed={3}
            enableClipboard={true}
            displayDataTypes={false}
            sortKeys={true}
          />
        </div>
      </div>
      <Modal
        fullScreen
        large
        open={activeTree}
        onClose={() => setActiveTree(false)}
        title={t("Digital Product Passport Tree")}
      >
        <Modal.Section>
          <div className="flex justify-end">
            <Text as="p" variant="bodyMd" color="subdued">
              {t("Pan to move, pinch to zoom")}
            </Text>
          </div>
          <div className="h-[100vh]" ref={ref}>
            <Tree
              data={treeData}
              zoom={1}
              translate={{ x: 200, y: 50 }}
              orientation="vertical"
              nodeSize={{ x: 300, y: 100 }}
            />
          </div>
        </Modal.Section>
      </Modal>
      <Frame>{active ? <Toast content={t("DPP copied!")} onDismiss={toggleActive} duration={2000} /> : null}</Frame>
    </>
  );
};

export default ProjectDpp;
