import { Spinner } from "@bbtgnn/polaris-interfacer";
import { ProjectType } from "components/types";
import { User } from "contexts/AuthContext";
import { useAuth } from "hooks/useAuth";
import { EconomicResource } from "lib/types";
import { useRouter } from "next/router";
import { useState } from "react";
import { useProject } from "./FetchProjectLayout";

//

export type RestrictionFunction = (project: Partial<EconomicResource>, user: User | null) => Promise<boolean>;

export type Restriction = { function: RestrictionFunction; redirect?: string } | RestrictionFunction;

export interface Props {
  children?: React.ReactNode;
  restrictions?: Array<Restriction>;
  defaultRedirect?: string;
}

//

export default function RestrictedProjectLayout(props: Props) {
  const { children, restrictions = [], defaultRedirect = "/" } = props;

  const router = useRouter();
  const { user } = useAuth();
  const project = useProject();

  const [isAllowed, setIsAllowed] = useState(false);

  async function runRestriction(r: Restriction) {
    let redirect = defaultRedirect;
    let restrictor: RestrictionFunction;
    if (typeof r === "object") {
      if (r.redirect) redirect = r.redirect;
      restrictor = r.function;
    } else {
      restrictor = r;
    }
    if (await restrictor(project, user)) router.push(redirect);
  }

  async function checkRestrictions() {
    for (const restriction of restrictions) runRestriction(restriction);
    setIsAllowed(true);
  }

  checkRestrictions();

  if (!isAllowed) return <Spinner />;
  else return <>{children}</>;
}

/* Some restrictions */

export const notOwner: RestrictionFunction = async (project, user) => {
  if (!user) return true;
  return user.ulid !== project.primaryAccountable?.id;
};

export const notDesign: RestrictionFunction = async (project, user) => {
  return project.conformsTo?.name !== ProjectType.DESIGN;
};

export const notProduct: RestrictionFunction = async (project, user) => {
  return project.conformsTo?.name !== ProjectType.PRODUCT;
};
