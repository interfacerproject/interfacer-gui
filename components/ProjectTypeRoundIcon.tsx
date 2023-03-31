import { ProjectTypeRenderProps } from "./ProjectTypeRenderProps";
import { ProjectType } from "./types";

export default function ProjectTypeRoundIcon(props: { projectType?: ProjectType }) {
  const { projectType } = props;
  const renderProps = ProjectTypeRenderProps[projectType || ProjectType.DESIGN];

  return (
    <div className={`w-fit h-fit p-5 rounded-full ${renderProps?.classes.bg} ${renderProps?.classes.content}`}>
      {/* @ts-ignore */}
      {renderProps && <renderProps.icon size={40} />}
    </div>
  );
}
