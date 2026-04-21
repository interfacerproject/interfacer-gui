import EntityTypeIcon from "./EntityTypeIcon";
import { ProjectTypeRenderProps } from "./ProjectTypeRenderProps";
import { ProjectType } from "./types";

export default function ProjectTypeRoundIcon(props: { projectType?: ProjectType }) {
  const { projectType } = props;
  const type = projectType || ProjectType.DESIGN;
  const renderProps = ProjectTypeRenderProps[type];

  return (
    <div className={`w-fit h-fit p-5 rounded-full ${renderProps?.classes.bg} ${renderProps?.classes.content}`}>
      <EntityTypeIcon type={type} size="default" fill="currentColor" className="w-10 h-10" />
    </div>
  );
}
