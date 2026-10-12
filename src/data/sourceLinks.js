// GitHub sources for the system. Every service lives in its own repo under one org.
export const GITHUB_ORG_URL = 'https://github.com/dotnetmicroservice001';

export const SERVICE_REPOS = [
  'Play.Catalog',
  'Play.Inventory',
  'Play.Identity',
  'Play.Trading',
  'Play.Common',
  'Play.Infra',
  'Play.Frontend',
].map((name) => ({ name, url: `${GITHUB_ORG_URL}/${name}` }));

// Every deployable repo has the same workflow (on push to main); Catalog's
// stands in for all of them
export const CICD_WORKFLOW_URL = `${GITHUB_ORG_URL}/Play.Catalog/blob/main/.github/workflows/cicd.yml`;

export const PURCHASE_SAGA_SOURCE_URL =
  `${GITHUB_ORG_URL}/Play.Trading/blob/main/src/Play.Trading.Service/StateMachines/PurchaseStateMachine.cs`;

// Live tools on the production cluster, path-routed through Emissary-ingress
// (Play.Infra mappings). Always the production URLs, so the links work from
// local dev too.
export const PRODUCTION_URL = 'https://gameplayeconomy.com';

export const LIVE_DASHBOARDS = [
  { label: 'Jaeger', url: `${PRODUCTION_URL}/jaeger/` },
  { label: 'Prometheus', url: `${PRODUCTION_URL}/prometheus/` },
  { label: 'Grafana', url: `${PRODUCTION_URL}/grafana/` },
];
