import { ProjectTypeRenderProps } from "./ProjectTypeRenderProps";
import { ProjectType } from "./types";

export default function ProjectTypeRoundIcon(props: { projectType?: ProjectType }) {
  const { projectType = ProjectType.DESIGN } = props;
  const renderProps = ProjectTypeRenderProps[projectType];

  return (
    <div className={`w-fit h-fit p-5 rounded-full ${renderProps.classes.bg} ${renderProps.classes.content}`}>
      {/* @ts-ignore */}
      {<renderProps.icon size={40} />}
    </div>
  );
}
