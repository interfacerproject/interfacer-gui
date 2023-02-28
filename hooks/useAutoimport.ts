import devLog from "lib/devLog";
// @ts-ignore
import { Octokit } from "octokit";
import { useState } from "react";
import { zencode_exec } from "zenroom";
import { CreateProjectValues } from "./../components/partials/create/project/CreateProjectForm";
import { AutoimportInput, AutoimportSource } from "./useAutoimportDefs";

const decodeBase64 = async (s: string) => {
  const contract = `Given I have a 'base64' named 'content'
      Then print 'content' as 'string'`;
  const result = await zencode_exec(contract, { data: JSON.stringify({ content: s }) });
  return JSON.parse(result.result).content;
};

type AutoImportReturnValue = {
  importRepository: (input: AutoimportInput) => Promise<Partial<CreateProjectValues> | undefined>;
};

const useAutoImport = (): AutoImportReturnValue => {
  const [gitlabHost, setGitlabHost] = useState<string>("https://gitlab.com");

  const o = new Octokit();

  // const findImagesInReadme = (readme: string) => readme.match(/(https?:\/\/.*\.(?:png|jpe?g))/i);

  // const analyze = async (repo: string) => {
  //   try {
  //     const request = { method: "POST", body: JSON.stringify({ repo: repo }) };
  //     const result = await (await fetch(`${process.env.NEXT_PUBLIC_OSH}/analyze`, request)).json();
  //     return result.ok;
  //   } catch (e) {
  //     devLog("error fetching osh metadata", e);
  //   }
  // };

  const getGhMetadata = async (u: { owner: string; repo: string }) => {
    try {
      const metadata = await o.rest.repos.get({ owner: u.owner, repo: u.repo });
      const _data = metadata.data;
      return {
        title: _data.name,
        link: _data.html_url,
        description: _data.description || "",
        tags: _data.topics || [],
      };
    } catch (e) {
      devLog("error fetching metadata", e);
    }
  };

  const getGhLicenses = async (u: { owner: string; repo: string }) => {
    try {
      const licenses = await o.rest.licenses.getForRepo(u);
      // setLicense(licenses.data.license?.spdx_id || "UNLICENSED");
      return licenses.data.license;
    } catch (e) {
      devLog(e);
    }
  };

  const getGhReadme = async (u: { owner: string; repo: string }) => {
    try {
      const readme = await o.rest.repos.getReadme(u);
      const readmeFile = await o.rest.repos.getContent({
        mediaType: {
          format: "raw",
        },
        owner: u.owner,
        repo: u.repo,
        path: readme.data.path,
      });
      // const images = findImagesInReadme(readmeFile.data.toString());
      // setImages(images as string[]);
      return readmeFile.data.toString();
    } catch (e) {
      devLog(e);
    }
  };

  // const getGhContributors = async (u: { owner: string; repo: string }) => {
  //   try {
  //     const contributors = await o.request(
  //       "GET /repos/{owner}/{repo}/contributors{?anon,per_page,page}",
  //       u
  //     );
  //     // setContributors(contributors.data.map((c: any) => c.login));
  //   } catch (e) {
  //     devLog(e);
  //   }
  // };

  // const getGhResources = async (u: { owner: string; repo: string }) => {
  //   try {
  //     const pulls = await o.rest.pulls.list({
  //       owner: u.owner,
  //       repo: u.repo,
  //       state: "closed",
  //     });
  //     const filteredPulls = pulls.data.filter((p: any) => p.head.repo?.fork)?.map((p: any) => p.head.repo.html_url);
  //     // setResources(filteredPulls);
  //   } catch (e) {
  //     devLog(e);
  //   }
  // };

  const getGlMetadata = async (id: string) => {
    devLog("fetching metadata", id);
    try {
      const metadata = await fetch(`${gitlabHost}/api/v4/projects/${id}`).then(r => r.json());
      const readmePath = metadata.readme_url?.split(`${metadata.default_branch}/`)[1];
      const readme = await fetch(
        `${gitlabHost}/api/v4/projects/${id}/repository/files/${readmePath}?ref=${metadata.default_branch || "master"}`
      ).then(r => r.json());
      const readmeFile = await decodeBase64(readme.content);
      // const images = findImagesInReadme(readmeFile);
      const data: Partial<CreateProjectValues> = {
        main: {
          title: metadata.name,
          link: metadata.web_url,
          description: readmeFile || metadata.description || "",
          tags: metadata.tag_list || [],
        },
      };
      return data;
    } catch (e) {
      devLog(e);
    }
  };

  const importFromGithub = async (url: string): Promise<any> => {
    const owner = url.split("/")[3];
    const repoName = url.split("/")[4];
    const u = { owner, repo: repoName };
    const main = await getGhMetadata(u);
    const license = await getGhLicenses(u);
    const readme = await getGhReadme(u);
    let licenses = [];
    if (license) licenses.push({ scope: license?.name, licenseId: license?.spdx_id });
    if (main) main.description = readme || main!.description || "";
    return { main, licenses };
  };

  const importRepository = async (data: AutoimportInput) => {
    if (data.source === AutoimportSource.GITHUB) {
      const ghData: Partial<CreateProjectValues> = await importFromGithub(data[AutoimportSource.GITHUB].url);
      return ghData;
    } else {
      setGitlabHost(data[AutoimportSource.GITLAB].host || "https://gitlab.com");
      return await getGlMetadata(data[AutoimportSource.GITLAB].projectId);
    }
  };
  return {
    importRepository,
  };
};

export default useAutoImport;
