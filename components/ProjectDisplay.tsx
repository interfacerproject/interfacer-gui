import { Tag, Text } from "@bbtgnn/polaris-interfacer";
import { EconomicResource } from "lib/types";
import ProjectThumb from "./ProjectThumb";

export interface Props {
  project: Partial<EconomicResource>;
}

export default function ProjectDisplay(props: Props) {
  const { project } = props;

  return (
    <div className="flex flex-row">
      <ProjectThumb project={project} />
      <div className="pl-4">
        <div className="mb-3 space-y-1">
          <Text as="p" variant="bodyMd" fontWeight="bold">
            {project.name}
          </Text>
          <Tag>{project.conformsTo?.name}</Tag>
        </div>
        <div className="font-mono">
          <Text as="p" variant="bodyMd">
            <span className="font-bold">{"ID: "}</span>
            <span>{project.id}</span>
          </Text>
          <Text as="p" variant="bodyMd">
            <span className="font-bold">{"Owner: "}</span>
            <span>{project.primaryAccountable?.name}</span>
          </Text>
        </div>
      </div>
    </div>
  );
}
