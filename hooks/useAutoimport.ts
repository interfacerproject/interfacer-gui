import { Gitlab } from "Gitlab";
import devLog from "lib/devLog";
import { Octokit } from "octokit";
import { useEffect, useState } from "react";
import { zencode_exec } from "zenroom";

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

const decodeBase64 = async (s: string) => {
  const contract = `Given I have a 'base64' named 'content'
      Then print 'content' as 'string'`;
  const result = await zencode_exec(contract, { data: JSON.stringify({ content: s }) });
  return JSON.parse(result.result).content;
};

type AutoImportReturnValue = {
  name: string;
  description: string;
  repo: string;
  tags: string[];
  license: string;
  images: string[];
  contributors: string[];
  resources: string[];
  metadata: any;
  readme: string;
  importFromGithub: (u: { owner: string; repo: string }) => void;
  importFromGitlab: (projectId: number, host?: string) => void;
};

const useAutoImport = (): AutoImportReturnValue => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [license, setLicense] = useState<string>("");
  const [repo, setRepo] = useState<string>("");
  const [readme, setReadme] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<any | undefined>(undefined);
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [githubRepo, setGithubRepo] = useState<string>("");
  const [gitlabId, setGitlabId] = useState<number | undefined>();
  const [gitlabHost, setGitlabHost] = useState<string>("https://gitlab.com");
  const [service, setService] = useState<"github" | "gitlab" | undefined>(undefined);

  const o = new Octokit();
  const gl = new Gitlab({ host: gitlabHost });

  const findImagesInReadme = (readme: string) => readme.match(/(https?:\/\/.*\.(?:png|jpe?g))/i);

  const analyze = async (repo: string) => {
    const request = { method: "POST", body: JSON.stringify({ repo: repo }) };
    const result = await (await fetch(`${process.env.NEXT_PUBLIC_OSH}/analyze`, request)).json();
    if (result.err) devLog(result.err);
    return result.ok;
  };

  const getGhMetadata = async () => {
    try {
      const metadata = await o.rest.repos.get({ owner: githubUsername, repo: githubRepo });
      setRepo(metadata.data.html_url);
      setName(metadata.data.name);
      setDescription(metadata.data.description || "");
      setLicense(metadata.data.license?.spdx_id || "UNLICENSED");
      setTags(metadata.data.topics?.map(t => t) || []);
      const osh_metadata = await analyze(metadata.data.html_url);
      setMetadata(osh_metadata);
    } catch (e) {
      devLog(e);
    }
  };

  const getGhReadme = async () => {
    try {
      const readme = await o.rest.repos.getReadme({ owner: githubUsername, repo: githubRepo });
      const readmeFile = await o.rest.repos.getContent({
        mediaType: {
          format: "raw",
        },
        owner: githubUsername,
        repo: githubRepo,
        path: readme.data.path,
      });
      setReadme(readmeFile.data.toString());
      const images = findImagesInReadme(readmeFile.data.toString());
      setImages(images as string[]);
    } catch (e) {
      devLog(e);
    }
  };

  const getGhContributors = async () => {
    try {
      const contributors = await o.request("GET /repos/{owner}/{repo}/contributors{?anon,per_page,page}", {
        owner: githubUsername,
        repo: githubRepo,
      });
      setContributors(contributors.data.map((c: any) => c.login));
    } catch (e) {
      devLog(e);
    }
  };

  const getGhResources = async () => {
    try {
      const pulls = await o.rest.pulls.list({
        owner: githubUsername,
        repo: githubRepo,
        state: "closed",
      });
      const filteredPulls = pulls.data.filter(p => p.head.repo?.fork)?.map(p => p.head.repo.html_url);
      setResources(filteredPulls);
    } catch (e) {
      devLog(e);
    }
  };

  const getGlMetadata = async () => {
    try {
      const metadata = await gl.Projects.show(gitlabId!);
      setRepo(metadata.web_url);
      setName(metadata.name);
      setDescription(metadata.description || "");
      setTags(metadata.tag_list?.map(t => t) || []);
      const readmePath = metadata.readme_url?.split("/").pop() || "README.md";
      const readme = await gl.RepositoryFiles.show(gitlabId!, readmePath, metadata.default_branch);
      const readmeFile = await decodeBase64(readme.content);
      setReadme(readmeFile);
      const images = findImagesInReadme(readmeFile);
      setImages(images as string[]);
    } catch (e) {
      devLog(e);
    }
  };

  useEffect(() => {
    if (service === "github") {
      Promise.all([getGhMetadata(), getGhReadme(), getGhContributors(), getGhResources()]);
    }
    if (service === "gitlab") {
      Promise.resolve(getGlMetadata());
    }
  }, [service]);

  const importFromGithub = (u: { owner: string; repo: string }) => {
    setGithubUsername(u.owner);
    setGithubRepo(u.repo);
    setService("github");
  };
  const importFromGitlab = (projectId: number, host?: string) => {
    setGitlabId(projectId);
    setGitlabHost(host || "https://gitlab.com");
    setService("gitlab");
  };

  return {
    name,
    description,
    license,
    repo,
    readme,
    tags,
    images,
    contributors,
    resources,
    metadata,
    importFromGithub,
    importFromGitlab,
  };
};

export default useAutoImport;
