import React from 'react';

/*
 * TechStackOverview
 *
 * Renders the tech stack as a spec sheet: one panel, one row per layer of the
 * system, the layer name on the left and its tools flowing to the right. Each
 * tool is shown (logo tile + visible name, same tile as the
 * architecture flow diagrams; a Bootstrap icon where there is no logo). The
 * practices behind them are covered by the diagrams and Key Decisions.
 */

import DotnetIcon from '../assets/icons/dotnetcore.svg';
import MongoDBIcon from '../assets/icons/mongodb.svg';
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
import cosmosDbIcon from '../assets/icons/cosmosdb.svg';
import EmissaryIcon from '../assets/icons/emissary.png';
import AcrIcon from '../assets/icons/acr.png';
import ServiceBusIcon from '../assets/icons/servicebus.svg';
import KeyVaultIcon from '../assets/icons/keyvault.svg';

const sections = [
  {
    title: 'Core microservices',
    tools: [
      { src: DotnetIcon, name: '.NET' },
      { src: MongoDBIcon, name: 'MongoDB' },
      { src: RabbitMQIcon, name: 'RabbitMQ' },
      { src: NugetIcon, name: 'NuGet' },
      { icon: 'shield-lock', name: 'Duende IdentityServer' },
      { icon: 'broadcast', name: 'SignalR' }
    ]
  },
  {
    title: 'Cloud infrastructure & deployment',
    tools: [
      // Short names keep this row on one line; all of these are Azure services
      { src: DockerIcon, name: 'Docker' },
      { src: cosmosDbIcon, name: 'Cosmos DB' },
      { src: AcrIcon, name: 'ACR' },
      { src: KubernetesIcon, name: 'AKS' },
      { src: EmissaryIcon, name: 'Emissary' },
      { src: ServiceBusIcon, name: 'Service Bus' },
      { src: KeyVaultIcon, name: 'Key Vault' }
    ]
  },
  {
    title: 'CI/CD',
    tools: [
      { src: HelmIcon, name: 'Helm' },
      { src: GitHubIcon, name: 'GitHub' },
      { src: GitHubActionsIcon, name: 'GitHub Actions' }
    ]
  },
  {
    title: 'Observability',
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
  <div className="techstack-sheet">
    {sections.map((section) => (
      <section key={section.title} className="techstack-row">
        <h3 className="techstack-row__title">{section.title}</h3>
        <ul className="techstack-row__tools" aria-label={`${section.title} tools`}>
          {section.tools.map((tool) => (
            <li key={tool.name} className="techstack-tool">
              <span className="techstack-tool__tile" aria-hidden="true">
                {tool.src ? <img src={tool.src} alt="" /> : <i className={`bi bi-${tool.icon}`}></i>}
              </span>
              <span>{tool.name}</span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default TechStackOverview;
