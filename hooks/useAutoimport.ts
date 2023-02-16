import { Gitlab } from "@gitbeaker/browser";
import devLog from "lib/devLog";
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
  const gl = new Gitlab({ host: gitlabHost });

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
        tags: _data.topics?.map((t: any) => t) || [],
      };
    } catch (e) {
      devLog("error fetching metadata", e);
    }
  };

  const getGhLicenses = async (u: { owner: string; repo: string }) => {
    try {
      const licenses = await o.rest.licenses.getForRepo(u);
      devLog("licenses", licenses);
      // setLicense(licenses.data.license?.spdx_id || "UNLICENSED");
      return licenses.data.license?.spdx_id || "UNLICENSED";
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
      const metadata = await gl.Projects.show(id);
      const readmePath = metadata.readme_url?.split("/").pop() || "README.md";
      const readme = await gl.RepositoryFiles.show(id, readmePath, metadata.default_branch || "master");
      const readmeFile = await decodeBase64(readme.content);
      // const images = findImagesInReadme(readmeFile);
      const data = {
        main: {
          title: metadata.name,
          link: metadata.web_url,
          description: metadata.description || readmeFile,
          tags: metadata.tag_list?.map((t: any) => t) || [],
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
    if (main) main.description = readme || main!.description || "";
    return { main, licenses: [{ scope: "general", licenseID: license }] };
  };

  const importFromGitlab = async (projectId: string, host?: string) => {
    setGitlabHost(host || "https://gitlab.com");
    const data: Partial<CreateProjectValues> | undefined = await getGlMetadata(projectId);
    return data;
  };

  const importRepository = async (data: AutoimportInput) => {
    devLog("importing", data);
    if (data.source === AutoimportSource.GITHUB) {
      const ghData: Partial<CreateProjectValues> = await importFromGithub(data[AutoimportSource.GITHUB].url);
      return ghData;
    } else {
      return await importFromGitlab(data[AutoimportSource.GITLAB].projectId, data[AutoimportSource.GITLAB].host);
    }
  };
  return {
    importRepository,
  };
};

export default useAutoImport;
