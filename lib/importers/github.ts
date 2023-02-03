import { SelectOption } from "components/brickroom/utils/BrSelectUtils";
import { Gitlab } from "Gitlab";
import devLog from "lib/devLog";
import { Octokit } from "octokit";
import { zencode_exec } from "zenroom";

export interface AutocompletationData {
  name: string;
  description: string;
  repo: string;
  tags: Array<SelectOption<string>>;
  license: string;
  images: Array<string>;
  contributors: Array<string>;
  resources: Array<string>;
  metadata: any;
}

const decodeBase64 = async (s: string) => {
  const contract = `Given I have a 'base64' named 'content'
    Then print 'content' as 'string'`;
  const result = await zencode_exec(contract, { data: JSON.stringify({ content: s }) });
  return JSON.parse(result.result).content;
};

const findImagesInReadme = (readme: string) => readme.match(/(https?:\/\/.*\.(?:png|jpe?g))/i);

export const analyze = async (repo: string) => {
  try {
    const request = { method: "POST", body: JSON.stringify({ repo: repo }) };
    const result = await (await fetch(`${process.env.NEXT_PUBLIC_OSH}/analyze`, request)).json();
    if (result.err) return result.err;
    return result.ok;
  } catch (e) {
    return e;
  }
};

export const GithubImport = async (u: { owner: string; repo: string }): Promise<AutocompletationData | null> => {
  if (!u) return null;
  const o = new Octokit();
  const _contributors = await o.request("GET /repos/{owner}/{repo}/contributors{?anon,per_page,page}", u);
  const contributors = _contributors.data.map((c: any) => c.login);
  const metadata = await o.rest.repos.get(u);
  devLog(metadata);
  const readme = await o.rest.repos.getReadme(u);
  const readmeFile = await o.rest.repos.getContent({
    mediaType: {
      format: "raw",
    },
    owner: u.owner,
    repo: u.repo,
    path: readme.data.path,
  });
  const images = findImagesInReadme(readmeFile.data.toString());

  const pulls = await o.rest.pulls.list({
    owner: u.owner,
    repo: u.repo,
    state: "closed",
  });
  const filteredPulls = pulls.data.filter(p => p.head.repo?.fork)?.map(p => p.head.repo.html_url);
  const analyzedRepo = await analyze(metadata.data.clone_url);

  const values: AutocompletationData = {
    name: metadata.data.name,
    description: readmeFile.data.toString(),
    license: metadata.data.license?.spdx_id || "UNLICENSED",
    repo: metadata.data.html_url,
    tags:
      metadata.data.topics?.map(t => {
        const so: SelectOption<string> = { label: t, value: t };
        return so;
      }) || [],
    images: (images as string[]) || [],
    contributors: contributors || [],
    resources: filteredPulls,
    metadata: analyzedRepo || {},
  };
  devLog(values);

  return values;
};

export const GitlabImport = async (projectId: number, host?: string): Promise<AutocompletationData | undefined> => {
  if (!projectId) return undefined;
  const gl = new Gitlab({ host: host || "https://gitlab.com" });
  const metadata = await gl.Projects.show(projectId);
  devLog(metadata);
  const readmePath = metadata.readme_url?.split("/").pop() || "README.md";
  const readme = await gl.RepositoryFiles.show(projectId, readmePath, metadata.default_branch);
  const readmeFile = await decodeBase64(readme.content);
  const images = findImagesInReadme(readmeFile);
  const description = metadata.description || readmeFile;
  const name = metadata.name || metadata.path;
  const license = "UNLICENSED";
  const repo = metadata.web_url;
  const tags = metadata.tag_list?.map(t => ({ label: t, value: t } as SelectOption<string>)) || [];
  // const contributors = await gl.ProjectMembers.all(projectId);
  const analyzedRepo = await analyze(repo);
  const values: AutocompletationData = {
    name,
    description,
    license,
    repo,
    tags,
    images: images || [],
    contributors: [],
    resources: [],
    metadata: analyzedRepo || {},
  };

  return values;
};

export const GiteaImport = null;
