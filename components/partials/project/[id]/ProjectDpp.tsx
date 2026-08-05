import ProjectTraceability from "components/ProjectTraceability";

/** Legacy tab adapter. The active project detail view renders this section directly. */
const ProjectDpp = ({ id }: { id: string }) => <ProjectTraceability projectId={id} />;

export default ProjectDpp;
