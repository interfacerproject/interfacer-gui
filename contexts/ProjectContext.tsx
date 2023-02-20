import { EconomicResource } from "lib/types";
import { createContext } from "react";

const ProjectContext = createContext<Partial<EconomicResource>>({});

export default ProjectContext;
