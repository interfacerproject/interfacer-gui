import { EconomicResource } from "lib/types";
import { createContext, Dispatch, SetStateAction, useState } from "react";

//

export type ProjectContext = [Partial<EconomicResource>, Dispatch<SetStateAction<Partial<EconomicResource>>>];
export const projectContext = createContext<ProjectContext>([{}, () => {}]);

//

export interface ProjectProviderProps {
  children: React.ReactNode;
}

export const ProjectProvider = (props: ProjectProviderProps) => {
  const { children } = props;
  const context = useState<Partial<EconomicResource>>({});

  return <projectContext.Provider value={context}>{children}</projectContext.Provider>;
};
