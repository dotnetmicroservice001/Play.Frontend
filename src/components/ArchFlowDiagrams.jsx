import React from 'react';

/*
 * Build-and-delivery and observability flows, drawn as inline SVG so they use
 * the page's fonts, palette and card treatment (ink outline, purple offset
 * shadow) instead of raster images. Colours and type live in landing.css
 * (.flow-diagram__*); this file only lays things out in viewBox units.
 *
 * Both diagrams are laid out tall and ~420 units wide: they sit in a half-width
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

const WIDTH = 420;
const SHADOW = 4;
const RADIUS = 10;
const TILE = 40;

const viewBox = (h) => `0 0 ${WIDTH + SHADOW + 2} ${h + SHADOW + 2}`;

// The shadow stays put while the card and its content lift on hover, the same
// press/lift feel as the page's other offset-shadow cards.
const Card = ({ x, y, w, h, hub = false, children }) => (
  <g className="flow-diagram__node">
    <rect x={x + SHADOW} y={y + SHADOW} width={w} height={h} rx={RADIUS} className="flow-diagram__shadow" />
    <g className="flow-diagram__lift">
      <rect x={x} y={y} width={w} height={h} rx={RADIUS} className={`flow-diagram__card${hub ? ' flow-diagram__card--hub' : ''}`} />
      {children}
    </g>
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

// Title + subtitle beside a tile, the layout every row-style card uses
const RowCard = ({ x, y, w, h, node, hub }) => (
  <Card x={x} y={y} w={w} h={h} hub={hub}>
    <Tile x={x + 10} y={y + (h - TILE) / 2} logo={node.logo} icon={node.icon} fit={node.fit} />
    <text x={x + 62} y={y + h / 2 - 3} className="flow-diagram__title">{node.title}</text>
    <text x={x + 62} y={y + h / 2 + 15} className="flow-diagram__sub">{node.sub}</text>
  </Card>
);

const ArrowMarker = ({ id, dashed = false }) => (
  <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" className={`flow-diagram__arrowhead${dashed ? ' flow-diagram__arrowhead--dashed' : ''}`} />
  </marker>
);

/* ---- Build and delivery: pipeline down the left, Key Vault beside it ---- */

const PIPE = { x: 0, w: 244, h: 58, gap: 48 };
const pipeY = (i) => i * (PIPE.h + PIPE.gap);

const pipeline = [
  { title: 'GitHub Actions', sub: 'CI workflows', logo: GitHubActionsIcon },
  { title: 'Docker', sub: 'Service images', logo: DockerIcon, fit: 0.86 },
  { title: 'Container Registry', sub: 'Azure ACR', logo: AcrIcon, fit: 0.86 },
  { title: 'Helm', sub: 'Release charts', logo: HelmIcon },
  { title: 'AKS', sub: 'Kubernetes cluster', logo: KubernetesIcon },
];
const pipeSteps = ['CI/CD', 'package', 'publish', 'run'];

const PIPE_BOTTOM = pipeY(pipeline.length - 1) + PIPE.h;
const VAULT = { x: 292, w: WIDTH - 292, h: 124 };
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
        <ArrowMarker id="flow-build-arrow-dashed" dashed />
      </defs>

      {/* Connectors first so the cards and their shadows sit on top */}
      {pipeSteps.map((step, i) => {
        const y1 = pipeY(i) + PIPE.h;
        const y2 = pipeY(i + 1) - 2;
        return (
          <g key={step}>
            <path d={`M ${spineX} ${y1} V ${y2}`} className="flow-diagram__line" markerEnd="url(#flow-build-arrow)" />
            <text x={spineX + 12} y={(y1 + SHADOW + y2) / 2 + 4} className="flow-diagram__edge-label">
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
        <Tile x={vaultX - TILE / 2} y={VAULT.y + 16} icon="key-fill" />
        <text x={vaultX} y={VAULT.y + 80} textAnchor="middle" className="flow-diagram__title">Key Vault</text>
        <text x={vaultX} y={VAULT.y + 99} textAnchor="middle" className="flow-diagram__sub">Secrets &amp; config</text>
      </Card>
    </svg>
  );
};

/* ---- Operations and observability: signals → OpenTelemetry → backends ---- */

const SIGNAL = { w: 128, h: 100, gap: (WIDTH - 3 * 128) / 2 };
const signalX = (i) => i * (SIGNAL.w + SIGNAL.gap);
const HUB = { x: 0, y: SIGNAL.h + 40, w: WIDTH, h: 64 };
const TRUNK_X = 22;
const BACKEND = { x: 50, w: WIDTH - 50, h: 54, gap: 12, top: HUB.y + HUB.h + 26 };
const backendY = (i) => BACKEND.top + i * (BACKEND.h + BACKEND.gap);

const signals = [
  { title: 'Traces', sub: 'Request flows', icon: 'diagram-3' },
  { title: 'Metrics', sub: 'Service metrics', icon: 'bar-chart-fill' },
  { title: 'Logs', sub: 'App & infra logs', icon: 'journal-text' },
];

const backends = [
  { title: 'Jaeger', sub: 'Distributed tracing', logo: JaegerIcon, fit: 0.8 },
  { title: 'Prometheus', sub: 'Metrics & alerting', logo: PrometheusIcon },
  { title: 'Grafana', sub: 'Dashboards', logo: GrafanaIcon },
  { title: 'Seq', sub: 'Structured logs', icon: 'file-earmark-text' },
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

    {signals.map((s, i) => {
      const x = signalX(i);
      const cx = x + SIGNAL.w / 2;
      return (
        <Card key={s.title} x={x} y={0} w={SIGNAL.w} h={SIGNAL.h}>
          <Tile x={cx - TILE / 2} y={12} icon={s.icon} />
          <text x={cx} y={71} textAnchor="middle" className="flow-diagram__title">{s.title}</text>
          <text x={cx} y={89} textAnchor="middle" className="flow-diagram__sub">{s.sub}</text>
        </Card>
      );
    })}

    <RowCard {...HUB} hub node={{ title: 'OpenTelemetry', sub: 'Collection layer', logo: OpenTelemetryIcon }} />

    {backends.map((b, i) => (
      <RowCard key={b.title} x={BACKEND.x} y={backendY(i)} w={BACKEND.w} h={BACKEND.h} node={b} />
    ))}
  </svg>
);
