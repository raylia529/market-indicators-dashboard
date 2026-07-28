const workflowDispatchUrl =
  "https://api.github.com/repos/raylia529/market-indicators-dashboard/actions/workflows/pages.yml/dispatches";

const scheduleProfiles = new Map([
  ["15 23 * * MON-FRI", ["combined", "breadth"]],
  ["15 3 * * TUE-SAT", ["us"]],
  ["15 9 * * MON-FRI", ["asia"]],
  ["15 11 * * MON-FRI", ["asia-retry"]],
  ["15 13 * * MON-FRI", ["combined"]],
]);

export function profileForCron(cron) {
  return scheduleProfiles.get(cron)?.[0] || null;
}

export function profilesForCron(cron) {
  return scheduleProfiles.get(cron) || [];
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
    const profiles = profilesForCron(controller.cron);

    if (profiles.length === 0) {
      throw new Error(`No update profile is configured for cron ${controller.cron}.`);
    }

    context.waitUntil(Promise.all(profiles.map((profile) => dispatchWorkflow(profile, env.GITHUB_ACTIONS_TOKEN))));
  },
};
