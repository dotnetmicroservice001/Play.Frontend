import React from 'react';

/*
 * Build-and-delivery and observability flows, drawn as inline SVG so they use
 * the page's fonts, palette and outline style instead of raster images. Nodes
 * are flat (the offset shadow is reserved for top-level cards); hubs stand out
 * by fill. Colours and type live in landing.css
 * (.flow-diagram__*); this file only lays things out in viewBox units.
 *
 * Both diagrams are laid out ~320 units tall and ~420 units wide: they sit in a half-width
 * column on desktop and a full-width one on phones, which is roughly 1 unit per
 * CSS pixel either way, so the text stays at body size instead of shrinking.
 */

import GitHubActionsIcon from '../assets/icons/githubactions.svg';
import DockerIcon from '../assets/icons/docker.svg';
import AcrIcon from '../assets/icons/acr.png';
import HelmIcon from '../assets/icons/helm.svg';
import KubernetesIcon from '../assets/icons/kubernetes.svg';
import OpenTelemetryIcon from '../assets/icons/opentelemetry.svg';
import JaegerIcon from '../assets/icons/jaegertracing.svg';
import PrometheusIcon from '../assets/icons/prometheus.svg';
import GrafanaIcon from '../assets/icons/grafana.svg';
import CosmosDbIcon from '../assets/icons/cosmosdb.svg';
import ServiceBusIcon from '../assets/icons/servicebus.svg';
import KeyVaultIcon from '../assets/icons/keyvault.svg';

const WIDTH = 420;
const RADIUS = 10;
const TILE = 40;
// Row cards use a smaller tile so the rows (and both diagrams) stay short
const ROW_TILE = 32;

const viewBox = (h) => `0 0 ${WIDTH + 2} ${h + 2}`;

// `raised` adds the small soft shadow the architecture diagram gives its services
const Card = ({ x, y, w, h, hub = false, raised = false, children }) => (
  <g className="flow-diagram__node">
    {raised && <rect x={x + 4} y={y + 4} width={w} height={h} rx={RADIUS} className="flow-diagram__shadow-soft" />}
    <rect x={x} y={y} width={w} height={h} rx={RADIUS} className={`flow-diagram__card${hub ? ' flow-diagram__card--hub' : ''}`} />
    {children}
  </g>
);

// Every node gets the same tile: a product logo, or a Bootstrap icon where there is none.
// `fit` evens out logos whose artwork carries its own padding (Docker, ACR...).
const Tile = ({ x, y, size = TILE, logo, icon, fit = 0.7 }) => (
  <foreignObject x={x} y={y} width={size} height={size}>
    <div className="flow-diagram__tile" style={{ fontSize: size * 0.5 }}>
      {logo ? <img src={logo} alt="" style={{ width: `${fit * 100}%`, height: `${fit * 100}%` }} /> : <i className={`bi bi-${icon}`}></i>}
    </div>
  </foreignObject>
);

// Title beside a tile, the layout every row-style card uses
const RowCard = ({ x, y, w, h, node, hub }) => (
  <Card x={x} y={y} w={w} h={h} hub={hub}>
    <Tile x={x + 7} y={y + (h - ROW_TILE) / 2} size={ROW_TILE} logo={node.logo} icon={node.icon} fit={node.fit} />
    <text x={x + 50} y={y + h / 2 + 5} className="flow-diagram__title">{node.title}</text>
  </Card>
);

const ArrowMarker = ({ id, variant }) => (
  <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" className={`flow-diagram__arrowhead${variant ? ` flow-diagram__arrowhead--${variant}` : ''}`} />
  </marker>
);

/* ---- Build and delivery: pipeline down the left, Key Vault beside it ---- */

const PIPE = { x: 0, w: 244, h: 44, gap: 30 };
const pipeY = (i) => i * (PIPE.h + PIPE.gap);

const pipeline = [
  { title: 'GitHub Actions', logo: GitHubActionsIcon },
  { title: 'Docker', logo: DockerIcon, fit: 0.86 },
  { title: 'Azure Container Registry', logo: AcrIcon, fit: 0.86 },
  { title: 'Helm', logo: HelmIcon },
  { title: 'AKS', logo: KubernetesIcon },
];
const pipeSteps = ['CI/CD', 'package', 'publish', 'run'];

const PIPE_BOTTOM = pipeY(pipeline.length - 1) + PIPE.h;
const VAULT = { x: 292, w: WIDTH - 292, h: 92 };
VAULT.y = (PIPE_BOTTOM - VAULT.h) / 2;

export const BuildDeliveryDiagram = () => {
  const spineX = PIPE.x + PIPE.w / 2;
  const vaultX = VAULT.x + VAULT.w / 2;
  const ghaY = pipeY(0) + PIPE.h / 2;
  const aksY = pipeY(pipeline.length - 1) + PIPE.h / 2;

  return (
    <svg
      className="flow-diagram"
      viewBox={viewBox(PIPE_BOTTOM)}
      role="img"
      aria-label="Build and delivery: GitHub Actions builds Docker images, publishes them to Azure Container Registry, and Helm deploys them to AKS. GitHub Actions and AKS read secrets from Azure Key Vault."
    >
      <defs>
        <ArrowMarker id="flow-build-arrow" />
        <ArrowMarker id="flow-build-arrow-dashed" variant="dashed" />
      </defs>

      {/* Connectors first so the cards and their shadows sit on top */}
      {pipeSteps.map((step, i) => {
        const y1 = pipeY(i) + PIPE.h;
        const y2 = pipeY(i + 1) - 2;
        return (
          <g key={step}>
            <path d={`M ${spineX} ${y1} V ${y2}`} className="flow-diagram__line" markerEnd="url(#flow-build-arrow)" />
            <text x={spineX + 12} y={(y1 + y2) / 2 + 4} className="flow-diagram__edge-label">
              {step}
            </text>
          </g>
        );
      })}
      <path
        d={`M ${PIPE.x + PIPE.w} ${ghaY} H ${vaultX} V ${VAULT.y - 2}`}
        className="flow-diagram__line flow-diagram__line--dashed"
        markerEnd="url(#flow-build-arrow-dashed)"
      />
      <path
        d={`M ${PIPE.x + PIPE.w} ${aksY} H ${vaultX} V ${VAULT.y + VAULT.h + 2}`}
        className="flow-diagram__line flow-diagram__line--dashed"
        markerEnd="url(#flow-build-arrow-dashed)"
      />
      <text x={vaultX} y={ghaY - 8} textAnchor="middle" className="flow-diagram__edge-label">secrets</text>
      <text x={vaultX} y={aksY + 20} textAnchor="middle" className="flow-diagram__edge-label">secrets</text>

      {pipeline.map((node, i) => (
        <RowCard key={node.title} x={PIPE.x} y={pipeY(i)} w={PIPE.w} h={PIPE.h} node={node} />
      ))}

      <Card {...VAULT} hub>
        <Tile x={vaultX - TILE / 2} y={VAULT.y + 14} logo={KeyVaultIcon} fit={0.8} />
        <text x={vaultX} y={VAULT.y + 76} textAnchor="middle" className="flow-diagram__title">Key Vault</text>
      </Card>
    </svg>
  );
};

/* ---- Operations and observability: signals → OpenTelemetry → backends ---- */

const SIGNAL = { w: 128, h: 50, gap: (WIDTH - 3 * 128) / 2 };
const signalX = (i) => i * (SIGNAL.w + SIGNAL.gap);
const HUB = { x: 0, y: SIGNAL.h + 28, w: WIDTH, h: 44 };
const TRUNK_X = 22;
const BACKEND = { x: 50, w: WIDTH - 50, h: 44, gap: 8, top: HUB.y + HUB.h + 18 };
const backendY = (i) => BACKEND.top + i * (BACKEND.h + BACKEND.gap);

const signals = [
  { title: 'Traces', icon: 'diagram-3' },
  { title: 'Metrics', icon: 'bar-chart-fill' },
  { title: 'Logs', icon: 'journal-text' },
];

const backends = [
  { title: 'Jaeger', logo: JaegerIcon, fit: 0.8 },
  { title: 'Prometheus', logo: PrometheusIcon },
  { title: 'Grafana', logo: GrafanaIcon },
  { title: 'Seq', icon: 'file-earmark-text' },
];

const OBS_BOTTOM = backendY(backends.length - 1) + BACKEND.h;

export const ObservabilityDiagram = () => (
  <svg
    className="flow-diagram"
    viewBox={viewBox(OBS_BOTTOM)}
    role="img"
    aria-label="Operations and observability: traces, metrics and logs flow through OpenTelemetry to Jaeger for distributed tracing, Prometheus for metrics and alerting, Grafana for dashboards, and Seq for structured logs."
  >
    <defs>
      <ArrowMarker id="flow-obs-arrow" />
    </defs>

    {signals.map((s, i) => {
      const x = signalX(i) + SIGNAL.w / 2;
      return (
        <path
          key={s.title}
          d={`M ${x} ${SIGNAL.h} V ${HUB.y - 2}`}
          className="flow-diagram__line"
          markerEnd="url(#flow-obs-arrow)"
        />
      );
    })}
    <path d={`M ${TRUNK_X} ${HUB.y + HUB.h} V ${backendY(backends.length - 1) + BACKEND.h / 2}`} className="flow-diagram__line" />
    {backends.map((b, i) => {
      const y = backendY(i) + BACKEND.h / 2;
      return (
        <path
          key={b.title}
          d={`M ${TRUNK_X} ${y} H ${BACKEND.x - 2}`}
          className="flow-diagram__line"
          markerEnd="url(#flow-obs-arrow)"
        />
      );
    })}

    {signals.map((s, i) => (
      <RowCard key={s.title} x={signalX(i)} y={0} w={SIGNAL.w} h={SIGNAL.h} node={s} />
    ))}

    <RowCard {...HUB} hub node={{ title: 'OpenTelemetry', logo: OpenTelemetryIcon }} />

    {backends.map((b, i) => (
      <RowCard key={b.title} x={BACKEND.x} y={backendY(i)} w={BACKEND.w} h={BACKEND.h} node={b} />
    ))}
  </svg>
);

/* ---- Purchase saga (PurchaseStateMachine in Play.Trading), in general terms ---- */

const sagaStates = [
  { title: 'Accepted', sub: 'price calculated', y: 40 },
  { title: 'Items Granted', sub: 'awaiting payment', y: 172 },
  { title: 'Completed', sub: 'wallet charged', y: 304, hub: true },
];
// Request sent on the way out, reply that moves the saga on
const sagaSteps = [
  ['grant items → Inventory', '← items granted'],
  ['charge wallet → Identity', '← wallet charged'],
];

// Two layouts of the same diagram: the default (420 units, desktop) and a
// compact one (330 units) for phones, so it renders near 1:1 at phone width
// instead of shrinking its labels to ~8px.
const sagaLayout = (compact) => {
  const width = compact ? 330 : WIDTH;
  const faultX = compact ? 180 : 230;
  return {
    width,
    state: { x: 0, w: compact ? 168 : 180, h: 52 },
    fault: { x: faultX, w: width - faultX, h: 72, y: 292 },
    faultRailX: compact ? 296 : 325,
    // The compact Failed card is narrower, so its note is shorter
    faultNote: compact
      ? ['If the charge fails,', 'items are removed']
      : ['A failed charge removes', 'the granted items'],
  };
};

export const PurchaseSagaDiagram = ({ compact = false }) => {
  const { width, state: STATE, fault: FAULT, faultRailX: FAULT_X, faultNote } = sagaLayout(compact);
  const SAGA_BOTTOM = FAULT.y + FAULT.h;
  // Marker ids must be unique on the page: both layouts are rendered (one hidden by CSS)
  const idSuffix = compact ? '-compact' : '';
  const asyncArrow = `url(#saga-arrow-async${idSuffix})`;
  const faultArrow = `url(#saga-arrow${idSuffix})`;
  const cx = STATE.x + STATE.w / 2;
  const [accepted, granted] = sagaStates;

  return (
    <svg
      className="flow-diagram"
      viewBox={`0 0 ${width + 2} ${SAGA_BOTTOM + 2}`}
      role="img"
      aria-label="Purchase saga: a purchase request moves the saga to Accepted, which asks Inventory to grant the items. Once they are granted it asks Identity to charge the wallet, and a successful charge completes the purchase. If the grant fails the purchase fails; if the charge fails the granted items are removed first."
    >
      <defs>
        <ArrowMarker id={`saga-arrow-async${idSuffix}`} variant="async" />
        <ArrowMarker id={`saga-arrow${idSuffix}`} />
      </defs>

      {/* Entry event */}
      <text x={cx} y={12} textAnchor="middle" className="flow-diagram__edge-label flow-diagram__edge-label--async">
        purchase requested
      </text>
      <path d={`M ${cx} 18 V ${accepted.y - 2}`} className="flow-diagram__line flow-diagram__line--async" markerEnd={asyncArrow} />

      {/* Happy path: each step sends a command and waits for the reply event */}
      {sagaSteps.map(([command, reply], i) => {
        const y1 = sagaStates[i].y + STATE.h;
        const y2 = sagaStates[i + 1].y - 2;
        const mid = (y1 + y2) / 2;
        return (
          <g key={command}>
            <path d={`M ${cx} ${y1} V ${y2}`} className="flow-diagram__line flow-diagram__line--async" markerEnd={asyncArrow} />
            <text x={cx + 12} y={mid - 4} className="flow-diagram__edge-label flow-diagram__edge-label--async">{command}</text>
            <text x={cx + 12} y={mid + 13} className="flow-diagram__edge-label flow-diagram__edge-label--async">{reply}</text>
          </g>
        );
      })}

      {/* Fault paths into Faulted */}
      {[
        [accepted, 'grant fails'],
        [granted, 'charge fails'],
      ].map(([state, label], i) => {
        const y = state.y + 14;
        return (
          <g key={label}>
            <path
              d={i === 0 ? `M ${STATE.w} ${y} H ${FAULT_X} V ${FAULT.y - 2}` : `M ${STATE.w} ${y} H ${FAULT_X}`}
              className="flow-diagram__line flow-diagram__line--fault"
              markerEnd={i === 0 ? faultArrow : undefined}
            />
            <text x={STATE.w + 10} y={y - 6} className="flow-diagram__edge-label flow-diagram__edge-label--fault">{label}</text>
          </g>
        );
      })}

      {sagaStates.map((state) => (
        <Card key={state.title} x={STATE.x} y={state.y} w={STATE.w} h={STATE.h} hub={state.hub}>
          <text x={cx} y={state.y + 22} textAnchor="middle" className="flow-diagram__title">{state.title}</text>
          <text x={cx} y={state.y + 40} textAnchor="middle" className="flow-diagram__sub">{state.sub}</text>
        </Card>
      ))}

      <g className="flow-diagram__node">
        <rect x={FAULT.x} y={FAULT.y} width={FAULT.w} height={FAULT.h} rx={RADIUS} className="flow-diagram__card flow-diagram__card--fault" />
        <text x={FAULT.x + 14} y={FAULT.y + 24} className="flow-diagram__title">Failed</text>
        <text x={FAULT.x + 14} y={FAULT.y + 44} className="flow-diagram__sub">{faultNote[0]}</text>
        <text x={FAULT.x + 14} y={FAULT.y + 61} className="flow-diagram__sub">{faultNote[1]}</text>
      </g>
    </svg>
  );
};

/* ---- Runtime architecture, vertical, for phones ----
 * The same system as the desktop diagram (new-arch-diagram), restacked top to
 * bottom so it stays readable at phone width: client → ingress → services,
 * async events down a rail to Service Bus, managed Azure resources below. */

// Narrower than the other diagrams (340 vs 420 units) so it renders larger in
// the ~300px a phone gives it: ~13px titles instead of ~10px.
const MW = 340;
const CLIENT = { x: (MW - 160) / 2, y: 0, w: 160, h: 44 };
const CLUSTER = { x: 0, y: 84 };
const INGRESS = { x: 16, y: 108, w: MW - 32, h: 44 };
const SVC = { x: 52, w: 232, h: 44, gap: 10, top: 176 };
const SVC_TRUNK_X = 32;
const ASYNC_RAIL_X = 312;
const svcY = (i) => SVC.top + i * (SVC.h + SVC.gap);

const services = [
  { title: 'Frontend' },
  { title: 'Catalog', db: true },
  { title: 'Inventory', db: true },
  { title: 'Identity', db: true },
  { title: 'Trading', db: true },
];

const SVC_BOTTOM = svcY(services.length - 1) + SVC.h;
const CLUSTER_BOTTOM = SVC_BOTTOM + 18;
const MANAGED_Y = CLUSTER_BOTTOM + 46;
const MANAGED = { h: 46, w: (MW - 12) / 2 };
const LEGEND_Y = MANAGED_Y + MANAGED.h + 34;

export const MobileArchitectureDiagram = () => {
  const firstBackendMid = svcY(1) + SVC.h / 2;
  const busX = MW - MANAGED.w;

  return (
    <svg
      className="flow-diagram flow-diagram--arch-mobile"
      viewBox={`0 0 ${MW + 6} ${LEGEND_Y + 10}`}
      role="img"
      aria-label="Runtime architecture: clients call Emissary ingress over HTTPS inside an AKS cluster, which routes requests to the Frontend, Catalog, Inventory, Identity and Trading services. Each backend service owns its own database in Cosmos DB and exchanges asynchronous events through Azure Service Bus."
    >
      <defs>
        <ArrowMarker id="arch-m-arrow" />
        <ArrowMarker id="arch-m-arrow-async" variant="async" />
      </defs>

      {/* AKS cluster boundary with its label tab */}
      <rect
        x={CLUSTER.x + 1}
        y={CLUSTER.y}
        width={MW - 2}
        height={CLUSTER_BOTTOM - CLUSTER.y}
        rx={RADIUS}
        className="flow-diagram__boundary"
      />
      <rect x={14} y={CLUSTER.y - 12} width={132} height={24} rx={6} className="flow-diagram__boundary-tab" />
      <image href={KubernetesIcon} x={20} y={CLUSTER.y - 9} width={18} height={18} />
      <text x={44} y={CLUSTER.y + 4} className="flow-diagram__edge-label">AKS cluster</text>

      {/* Client → ingress over HTTPS */}
      <path d={`M ${MW / 2} ${CLIENT.h} V ${INGRESS.y - 2}`} className="flow-diagram__line" markerEnd="url(#arch-m-arrow)" />
      <text x={MW / 2 + 10} y={CLIENT.h + 22} className="flow-diagram__edge-label">HTTPS</text>

      {/* Ingress → each service (requests) */}
      <path d={`M ${SVC_TRUNK_X} ${INGRESS.y + INGRESS.h} V ${svcY(services.length - 1) + SVC.h / 2}`} className="flow-diagram__line" />
      {services.map((svc, i) => (
        <path
          key={svc.title}
          d={`M ${SVC_TRUNK_X} ${svcY(i) + SVC.h / 2} H ${SVC.x - 2}`}
          className="flow-diagram__line"
          markerEnd="url(#arch-m-arrow)"
        />
      ))}

      {/* Async events: backend services ↔ rail → Service Bus */}
      {services.map((svc, i) =>
        svc.db ? (
          <path
            key={svc.title}
            d={`M ${SVC.x + SVC.w} ${svcY(i) + SVC.h / 2} H ${ASYNC_RAIL_X}`}
            className="flow-diagram__line flow-diagram__line--async flow-diagram__line--dashed-async"
          />
        ) : null
      )}
      <path
        d={`M ${ASYNC_RAIL_X} ${firstBackendMid} V ${MANAGED_Y - 2}`}
        className="flow-diagram__line flow-diagram__line--async flow-diagram__line--dashed-async"
        markerEnd="url(#arch-m-arrow-async)"
      />
      <text
        x={ASYNC_RAIL_X - 8}
        y={CLUSTER_BOTTOM + 28}
        textAnchor="end"
        className="flow-diagram__edge-label flow-diagram__edge-label--async"
      >
        async events
      </text>

      <Card {...CLIENT}>
        <text x={CLIENT.x + CLIENT.w / 2} y={CLIENT.y + 27} textAnchor="middle" className="flow-diagram__title">Client</text>
      </Card>

      <Card {...INGRESS} hub>
        <text x={INGRESS.x + INGRESS.w / 2} y={INGRESS.y + 27} textAnchor="middle" className="flow-diagram__title">Emissary Ingress</text>
      </Card>

      {services.map((svc, i) => {
        const y = svcY(i);
        return (
          <Card key={svc.title} x={SVC.x} y={y} w={SVC.w} h={SVC.h} raised>
            <text x={SVC.x + 14} y={y + 27} className="flow-diagram__title">{svc.title}</text>
            {svc.db && <Tile x={SVC.x + SVC.w - 38} y={y + 8} size={28} logo={CosmosDbIcon} fit={0.8} />}
          </Card>
        );
      })}

      {/* Azure-managed resources, outside the cluster */}
      <text x={0} y={MANAGED_Y - 12} className="flow-diagram__edge-label flow-diagram__edge-label--muted">Azure managed</text>
      <Card x={0} y={MANAGED_Y} w={MANAGED.w} h={MANAGED.h}>
        <Tile x={10} y={MANAGED_Y + 8} size={30} logo={CosmosDbIcon} fit={0.8} />
        <text x={50} y={MANAGED_Y + 28} className="flow-diagram__title">Cosmos DB</text>
      </Card>
      <Card x={busX} y={MANAGED_Y} w={MANAGED.w} h={MANAGED.h} hub>
        <Tile x={busX + 10} y={MANAGED_Y + 8} size={30} logo={ServiceBusIcon} fit={0.85} />
        <text x={busX + 50} y={MANAGED_Y + 28} className="flow-diagram__title">Service Bus</text>
      </Card>

      {/* Legend */}
      <path d={`M 0 ${LEGEND_Y} H 26`} className="flow-diagram__line" markerEnd="url(#arch-m-arrow)" />
      <text x={34} y={LEGEND_Y + 4} className="flow-diagram__sub">request</text>
      <path d={`M 118 ${LEGEND_Y} H 144`} className="flow-diagram__line flow-diagram__line--async flow-diagram__line--dashed-async" markerEnd="url(#arch-m-arrow-async)" />
      <text x={152} y={LEGEND_Y + 4} className="flow-diagram__sub">async event</text>
    </svg>
  );
};
