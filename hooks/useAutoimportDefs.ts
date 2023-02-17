import { url } from "lib/regex";
import * as yup from "yup";

//

export enum AutoimportSource {
  GITHUB = "github",
  GITLAB = "gitlab",
}
export const autoimportSources = Object.values(AutoimportSource);

//

export interface GithubAutoimportInput {
  url: string;
}

export interface GitlabAutoimportInput {
  projectId: string;
  host?: string;
}

export interface AutoimportInput {
  source: AutoimportSource;
  [AutoimportSource.GITHUB]: GithubAutoimportInput;
  [AutoimportSource.GITLAB]: GitlabAutoimportInput;
}

//

export const githubAutoimportInputSchema = yup.object({
  url: yup
    .string()
    .matches(url, "Invalid URL")
    .matches(/github.com/, "Url does not match a GitHub repo")
    .required(),
});

export const gitlabAutoimportInputSchema = yup.object({
  projectId: yup.string().required(),
  host: yup.string().required().matches(url, "Invalid URL"),
});

export const autoimportInputSchema = yup.object({
  source: yup.string().oneOf(autoimportSources).required(),
  github: yup.object().when("source", {
    is: AutoimportSource.GITHUB,
    then: schema => githubAutoimportInputSchema.required(),
    otherwise: schema => schema.nullable(),
  }),
  gitlab: yup.object().when("source", {
    is: AutoimportSource.GITLAB,
    then: schema => gitlabAutoimportInputSchema.required(),
    otherwise: schema => schema.nullable(),
  }),
});

//

export const autoimportDefaultValues: Partial<AutoimportInput> = {
  source: AutoimportSource.GITHUB,
  github: {
    url: "",
  },
  gitlab: {
    projectId: "",
    host: "https://gitlab.com",
  },
};
