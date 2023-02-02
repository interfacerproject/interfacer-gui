import { SelectOption } from "components/brickroom/utils/BrSelectUtils";
import devLog from "lib/devLog";
import { analyze } from "lib/osh";
import { Octokit } from "octokit";

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

export const GithubImport = async (u: { owner: string; repo: string }): Promise<AutocompletationData | null> => {
  if (!u) return null;
  const o = new Octokit();
  const _contributors = await o.request("GET /repos/{owner}/{repo}/contributors{?anon,per_page,page}", u);
  devLog(_contributors);
  const contributors = _contributors.data.map((c: any) => c.login);
  const metadata = await o.rest.repos.get(u);
  devLog(metadata);
  const readme = await o.rest.repos.getReadme(u);
  devLog(readme);
  const readmeFile = await o.rest.repos.getContent({
    mediaType: {
      format: "raw",
    },
    owner: u.owner,
    repo: u.repo,
    path: readme.data.path,
  });
  devLog(readmeFile);
  const images = readmeFile.data.toString().match(/(https?:\/\/.*\.(?:png|jpe?g))/i);

  const pulls = await o.rest.pulls.list({
    owner: u.owner,
    repo: u.repo,
    state: "closed",
  });
  const filteredPulls = pulls.data.filter(p => p.head.repo?.fork)?.map(p => p.head.repo.html_url);
  devLog(filteredPulls);
  const analyzedRepo = await analyze(metadata.data.html_url);

  const values: AutocompletationData = {
    name: metadata.data.name,
    description: readmeFile.data.toString(),
    license: metadata.data.license?.spdx_id || "UNLICENSED",
    repo: metadata.data.url,
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

export const GiteaImport = null;
