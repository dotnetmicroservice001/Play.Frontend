import React from 'react';

/*
 * TechStackOverview
 *
 * Renders the tech stack as a grid of cards, one per layer of the system.
 * Each card lists the tools used (logo tile + visible name, same tile as the
 * architecture flow diagrams; a Bootstrap icon where there is no logo) and the
 * concepts implemented with them (chips).
 */

import DotnetIcon from '../assets/icons/dotnetcore.svg';
import MongoDBIcon from '../assets/icons/mongodb.svg';
import PostmanIcon from '../assets/icons/postman.svg';
import RabbitMQIcon from '../assets/icons/rabbitmq.svg';
import NugetIcon from '../assets/icons/nuget.svg';
import DockerIcon from '../assets/icons/docker.svg';
import KubernetesIcon from '../assets/icons/kubernetes.svg';
import HelmIcon from '../assets/icons/helm.svg';
import GitHubIcon from '../assets/icons/github.svg';
import GitHubActionsIcon from '../assets/icons/githubactions.svg';
import PrometheusIcon from '../assets/icons/prometheus.svg';
import GrafanaIcon from '../assets/icons/grafana.svg';
import OpenTelemetryIcon from '../assets/icons/opentelemetry.svg';
import JaegerIcon from '../assets/icons/jaegertracing.svg';
import AzureIcon from '../assets/icons/Azure.svg';
import cosmosDbIcon from '../assets/icons/cosmosdb.svg';
import EmissaryIcon from '../assets/icons/emissary.png';
import AcrIcon from '../assets/icons/acr.png';

const sections = [
  {
    title: 'Core Microservices',
    items: [
      { text: 'REST APIs', icon: 'bi-code-slash' },
      { text: 'Database per service', icon: 'bi-hdd-stack' },
      { text: 'Shared NuGet libraries', icon: 'bi-arrow-repeat' },
      { text: 'Inter‑service communication', icon: 'bi-chat-dots' },
      { text: 'Eventual consistency', icon: 'bi-clock-history' },
      { text: 'Token-based security', icon: 'bi-shield-lock' },
      { text: 'Authentication & authorization', icon: 'bi-person-check' },
      { text: 'Sagas', icon: 'bi-lightning-charge' },
      { text: 'React SPA', icon: 'bi-window' },
      { text: 'Real‑time communication', icon: 'bi-broadcast' }
    ],
    tools: [
      { src: DotnetIcon, name: '.NET' },
      { src: MongoDBIcon, name: 'MongoDB' },
      { src: PostmanIcon, name: 'Postman' },
      { src: RabbitMQIcon, name: 'RabbitMQ' },
      { src: NugetIcon, name: 'NuGet' },
      { icon: 'shield-lock', name: 'Duende IdentityServer' },
      { icon: 'broadcast', name: 'SignalR' }
    ]
  },
  {
    title: 'Cloud Infrastructure & Deployment',
    items: [
      { text: 'Containerized services', icon: 'bi-box-seam' },
      { text: 'Azure resource integration', icon: 'bi-cloud' },
      { text: 'Kubernetes deployment', icon: 'bi-diagram-3' },
      { text: 'Health checks', icon: 'bi-heart-pulse' },
      { text: 'Secrets management', icon: 'bi-key' },
      { text: 'API Gateway', icon: 'bi-door-open' },
      { text: 'HTTPS and TLS', icon: 'bi-lock-fill' }
    ],
    tools: [
      { src: DockerIcon, name: 'Docker' },
      { src: AzureIcon, name: 'Azure' },
      { src: cosmosDbIcon, name: 'Cosmos DB' },
      { src: AcrIcon, name: 'Azure Container Registry' },
      { src: KubernetesIcon, name: 'Kubernetes' },
      { src: EmissaryIcon, name: 'Emissary-ingress' },
      { icon: 'envelope-paper', name: 'Service Bus' },
      { icon: 'key-fill', name: 'Key Vault' }
    ]
  },
  {
    title: 'CI/CD',
    items: [
      { text: 'Helm charts', icon: 'bi-stack' },
      { text: 'Versioning', icon: 'bi-clock-history' },
      { text: 'GitHub → Azure deploys', icon: 'bi-github' },
      { text: 'Continuous integration', icon: 'bi-play-circle' },
      { text: 'Continuous deployment', icon: 'bi-upload' }
    ],
    tools: [
      { src: HelmIcon, name: 'Helm' },
      { src: GitHubIcon, name: 'GitHub' },
      { src: GitHubActionsIcon, name: 'GitHub Actions' }
    ]
  },
  {
    title: 'Observability',
    items: [
      { text: 'Structured logging', icon: 'bi-journal-text' },
      { text: 'Log search', icon: 'bi-search' },
      { text: 'Distributed tracing', icon: 'bi-diagram-3' },
      { text: 'Metrics', icon: 'bi-graph-up' },
      { text: 'Alerting & monitoring', icon: 'bi-eye' }
    ],
    tools: [
      { src: PrometheusIcon, name: 'Prometheus' },
      { src: GrafanaIcon, name: 'Grafana' },
      { src: OpenTelemetryIcon, name: 'OpenTelemetry' },
      { src: JaegerIcon, name: 'Jaeger' },
      { icon: 'file-earmark-text', name: 'Seq' }
    ]
  }
];

export const TechStackOverview = () => (
  <div className="techstack-grid">
    {sections.map((section) => (
      <article key={section.title} className="techstack-card">
        <header className="techstack-card__header">
          <h4 className="techstack-card__title">{section.title}</h4>
          <ul className="techstack-card__tools" aria-label={`${section.title} tools`}>
            {section.tools.map((tool) => (
              <li key={tool.name} className="techstack-tool">
                <span className="techstack-tool__tile" aria-hidden="true">
                  {tool.src ? <img src={tool.src} alt="" /> : <i className={`bi bi-${tool.icon}`}></i>}
                </span>
                <span>{tool.name}</span>
              </li>
            ))}
          </ul>
        </header>
        <ul className="techstack-card__chips">
          {section.items.map((item) => (
            <li key={item.text} className="techstack-chip">
              <i className={`bi ${item.icon}`} aria-hidden="true"></i>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </article>
    ))}
  </div>
);

export default TechStackOverview;
