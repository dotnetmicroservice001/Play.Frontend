import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

/*
 * TechStackOverview
 *
 * This component renders an overview of your microservices architecture and
 * supporting infrastructure. Each section groups related concepts with
 * descriptive bullet points on the left and the corresponding technology
 * icons on the right. The icons are imported as SVGs so they remain
 * crisp on any screen size. To use this component, make sure you have
 * installed `react-bootstrap` and `bootstrap` (as per your existing
 * project dependencies) and that the SVG files reside in the path
 * `../assets/icons/` relative to this file. You can adjust the import
 * paths depending on your project structure.
 */

// Import the icons. Place the corresponding SVG files in `src/assets/icons`.
import DotnetIcon from '../assets/icons/dotnetcore.svg';
import MongoDBIcon from '../assets/icons/mongodb.svg';
import VsCodeIcon from '../assets/icons/vscode.svg';
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


const sections = [
  {
    title: 'Core Microservices',
    // Each item includes a text label and a Bootstrap icon class for a more expressive design.
    items: [
      { text: 'REST APIs', icon: 'bi-code-slash' },
      { text: 'Database storage', icon: 'bi-hdd-stack' },
      { text: 'Code reuse', icon: 'bi-arrow-repeat' },
      { text: 'Inter‑service communication', icon: 'bi-chat-dots' },
      { text: 'Eventual consistency', icon: 'bi-clock-history' },
      { text: 'Token based security', icon: 'bi-shield-lock' },
      { text: 'Authentication & authorization', icon: 'bi-person-check' },
      { text: 'Sagas', icon: 'bi-lightning-charge' },
      { text: 'Frontend integration', icon: 'bi-window' },
      { text: 'Real‑time communication', icon: 'bi-broadcast' }
    ],
    icons: [DotnetIcon, MongoDBIcon, VsCodeIcon, PostmanIcon, RabbitMQIcon, NugetIcon]
  },
  {
    title: 'Cloud Infrastructure & Deployment',
    items: [
      { text: 'Microservices as containers', icon: 'bi-box-seam' },
      { text: 'Integration with Azure resources', icon: 'bi-cloud' },
      { text: 'Kubernetes deployment', icon: 'bi-diagram-3' },
      { text: 'Health checks', icon: 'bi-heart-pulse' },
      { text: 'Secrets management', icon: 'bi-key' },
      { text: 'API Gateway', icon: 'bi-door-open' },
      { text: 'HTTPS and TLS', icon: 'bi-lock-fill' }
    ],
    icons: [DockerIcon, AzureIcon, cosmosDbIcon, KubernetesIcon]
  },
  {
    title: 'CI/CD & Helm',
    items: [
      { text: 'Using Helm charts', icon: 'bi-stack' },
      { text: 'Versioning', icon: 'bi-clock-history' },
      { text: 'Connecting GitHub with Azure', icon: 'bi-github' },
      { text: 'Continuous integration', icon: 'bi-play-circle' },
      { text: 'Continuous deployment', icon: 'bi-upload' }
    ],
    icons: [HelmIcon, GitHubIcon, GitHubActionsIcon]
  },
  {
    title: 'Observability',
    items: [
      { text: 'Adding logging', icon: 'bi-journal-text' },
      { text: 'Querying logs', icon: 'bi-search' },
      { text: 'Distributed tracing', icon: 'bi-diagram-3' },
      { text: 'Using metrics', icon: 'bi-graph-up' },
      { text: 'Monitoring', icon: 'bi-eye' }
    ],
    icons: [PrometheusIcon, GrafanaIcon, OpenTelemetryIcon, JaegerIcon]
  }
];

export const TechStackOverview = () => {
  return (
    <Container className="my-5">
      {sections.map((section, idx) => (
        <Card key={idx} className="mb-4 shadow-sm rounded-3">
          {/*
            Custom header with accent bar. Use CSS classes instead of inline styles
            so that light/dark theme styles can be defined in the main CSS file.
          */}
          <Card.Header className="techstack-header">
            <span className="techstack-header__bar"></span>
            <strong className="techstack-header__title">{section.title}</strong>
          </Card.Header>
          <Card.Body>
            <Row>
              {/* Left column: items rendered as compact chips with icons. */}
              <Col md={7}>
                <div
                  className="d-flex flex-wrap"
                  style={{ gap: '0.5rem 0.75rem' }}
                >
                  {section.items.map((item, j) => (
                    <span
                      key={j}
                      className="techstack-chip d-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                    >
                      <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                      <span>{item.text}</span>
                    </span>
                  ))}
                </div>
              </Col>
              {/* Right column: technology icons */}
              <Col md={5} className="d-flex flex-wrap justify-content-center align-items-center">
                {section.icons.map((iconSrc, k) => (
                  <img
                    key={k}
                    src={iconSrc}
                    alt=""
                    className="m-2"
                    style={{ height: '40px', width: 'auto' }}
                  />
                ))}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

// Provide a default export for convenience as well. This allows
// importing with either `import TechStackOverview from './TechStackOverview'`
// or `import { TechStackOverview } from './TechStackOverview'`.
export default TechStackOverview;