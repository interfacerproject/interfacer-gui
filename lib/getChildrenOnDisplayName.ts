import { Children, ReactNode } from "react";

const getChildrenOnDisplayName = (children: JSX.Element[], displayName: string) =>
  Children.map(children, child => (child?.type.DisplayName === displayName ? child : null));

export default getChildrenOnDisplayName;
