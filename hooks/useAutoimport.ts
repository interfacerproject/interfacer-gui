import { Gitlab } from "@gitbeaker/browser";
import devLog from "lib/devLog";
import { Octokit } from "octokit";
import { useEffect, useState } from "react";
import { zencode_exec } from "zenroom";
import { CreateProjectValues } from "./../components/partials/create/project/CreateProjectForm";

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
  importFromGithub: (url: string) => Promise<Partial<CreateProjectValues>>;
  importFromGitlab: (projectId: number, host?: string) => void;
  loading: boolean;
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
  const [loading, setLoading] = useState<boolean>(false);

  const o = new Octokit();
  const gl = new Gitlab({ host: gitlabHost });

  const findImagesInReadme = (readme: string) => readme.match(/(https?:\/\/.*\.(?:png|jpe?g))/i);

  const analyze = async (repo: string) => {
    try {
      const request = { method: "POST", body: JSON.stringify({ repo: repo }) };
      const result = await (await fetch(`${process.env.NEXT_PUBLIC_OSH}/analyze`, request)).json();
      setMetadata(result.ok);
      return result.ok;
    } catch (e) {
      devLog("error fetching osh metadata", e);
    }
  };

  const getGhMetadata = async (u?: { owner: string; repo: string }) => {
    try {
      devLog("fetching metadata", u);
      const metadata = await o.rest.repos.get({ owner: u?.owner || githubUsername, repo: u?.repo || githubRepo });
      const _data = metadata.data;
      setRepo(_data.html_url);
      setName(_data.name);
      setDescription(_data.description || "");
      setTags(_data.topics?.map(t => t) || []);
    } catch (e) {
      devLog("error fetching metadata", e);
    }
  };

  const getGhLicenses = async (u?: { owner: string; repo: string }) => {
    try {
      const licenses = await o.rest.licenses.getForRepo(u || { owner: githubUsername, repo: githubRepo });
      devLog("licenses", licenses);
      setLicense(licenses.data.license?.spdx_id || "UNLICENSED");
    } catch (e) {
      devLog(e);
    }
  };

  const getGhReadme = async (u?: { owner: string; repo: string }) => {
    try {
      const readme = await o.rest.repos.getReadme(u || { owner: githubUsername, repo: githubRepo });
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

  const getGhContributors = async (u?: { owner: string; repo: string }) => {
    try {
      const contributors = await o.request(
        "GET /repos/{owner}/{repo}/contributors{?anon,per_page,page}",
        u || {
          owner: githubUsername,
          repo: githubRepo,
        }
      );
      setContributors(contributors.data.map((c: any) => c.login));
    } catch (e) {
      devLog(e);
    }
  };

  const getGhResources = async (u?: { owner: string; repo: string }) => {
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
      const readme = await gl.RepositoryFiles.show(gitlabId!, readmePath, metadata.default_branch || "master");
      const readmeFile = await decodeBase64(readme.content);
      setReadme(readmeFile);
      const images = findImagesInReadme(readmeFile);
      setImages(images as string[]);
    } catch (e) {
      devLog(e);
    }
  };

  useEffect(() => {
    // if (service === "github") {
    //   Promise.all([getGhMetadata(), getGhReadme(), getGhContributors(), getGhResources()]);
    // }
    if (service === "gitlab") {
      Promise.resolve(getGlMetadata());
    }
  }, [service]);

  const importFromGithub = async (url: string): Promise<Partial<CreateProjectValues>> => {
    const owner = url.split("/")[3];
    const repoName = url.split("/")[4];
    const u = { owner, repo: repoName };
    setGithubUsername(owner);
    setGithubRepo(repo);
    setService("github");
    setLoading(true);
    await Promise.all([getGhMetadata(u), getGhReadme(u), getGhContributors(u), getGhResources(u), getGhLicenses(u)])
      .catch(err => {
        devLog("error", err);
      })
      .finally(() => {
        setLoading(false);
        devLog("done");
      });
    return {
      main: {
        title: name,
        description: description.length > 0 ? description : readme,
        tags: tags.map(tag => ({ value: tag, label: tag })),
        link: url,
      },
      linkedDesign: "",
      images: [],
      contributors: contributors,
      relations: resources,
      licenses: [{ scope: "general", licenseId: license }],
    };
  };
  const importFromGitlab = async (projectId: number, host?: string) => {
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
    loading,
  };
};

export default useAutoImport;
