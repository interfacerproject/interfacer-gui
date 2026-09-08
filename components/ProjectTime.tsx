import { useTranslation } from "next-i18next";

const ProjectTime = () => {
  const { t } = useTranslation("common");
  // Timestamp functionality removed - was using expensive trace GQL query.
  // To restore, use a lightweight query or metadata field instead of trace.
  return <div className="py-5" />;
};

export default ProjectTime;
