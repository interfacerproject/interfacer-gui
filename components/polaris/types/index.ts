export type ChildrenComponent<T> = T & {
  children?: React.ReactNode;
};

export interface ChildrenProp {
  children?: React.ReactNode;
}

export interface HtmlForProp {
  htmlFor?: string;
}

export interface TestProp {
  testID?: string;
}
