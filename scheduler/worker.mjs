const workflowDispatchUrl =
  "https://api.github.com/repos/raylia529/market-indicators-dashboard/actions/workflows/pages.yml/dispatches";

const scheduleProfiles = new Map([
  ["40 23 * * 1-5", "us"],
  ["10 2 * * 2-6", "us"],
  ["10 5 * * 2-6", "us"],
  ["40 10 * * 1-5", "asia"],
  ["40 12 * * 1-5", "asia"],
]);

export function profileForCron(cron) {
  return scheduleProfiles.get(cron) || null;
}

async function dispatchWorkflow(profile, token) {
  if (!token) {
    throw new Error("GITHUB_ACTIONS_TOKEN is not configured.");
  }

  const response = await fetch(workflowDispatchUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "market-dashboard-scheduler",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      ref: "main",
      inputs: { update_profile: profile },
    }),
  });

  if (response.status !== 204) {
    const details = (await response.text()).slice(0, 500);
    throw new Error(`GitHub workflow dispatch failed with HTTP ${response.status}: ${details}`);
  }
}

export default {
  async scheduled(controller, env, context) {
    const profile = profileForCron(controller.cron);

    if (!profile) {
      throw new Error(`No update profile is configured for cron ${controller.cron}.`);
    }

    context.waitUntil(dispatchWorkflow(profile, env.GITHUB_ACTIONS_TOKEN));
  },
};
