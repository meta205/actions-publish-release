import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

(async (): Promise<void> => {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    let owner: string = core.getInput('owner');
    let repo: string = core.getInput('repo');
    let releaseId: number = Number.parseInt(core.getInput('release-id') || '0');
    let tagName: string = core.getInput('tag-name');

    if (!owner || !repo) {
      const repoInfo: string[] = process.env.GITHUB_REPOSITORY!.split('/');
      owner = repoInfo[0];
      repo = repoInfo[1];
    }

    if (releaseId === 0) {
      const releases = await octokit.repos.listReleases({
        owner,
        repo
      });

      let targetReleases: any[] = releases.data.filter(release => release.tag_name === tagName);
      for (const targetRelease of targetReleases) {
        console.log(`Publishing release "${targetRelease.id}"...`);
        await octokit.repos.updateRelease({
          owner,
          repo,
          release_id: targetRelease.id,
          draft: false
        });
      }
    } else {
      console.log(`Publishing release "${releaseId}"...`);
      await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: releaseId,
        draft: false
      });
    }
  } catch (err: any) {
    core.setFailed(err.message);
  }
})();
