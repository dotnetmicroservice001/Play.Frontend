import React from 'react';
import { decisions } from '../data/decisions';
import { PurchaseSagaDiagram } from './ArchFlowDiagrams';
import { PURCHASE_SAGA_SOURCE_URL } from '../data/sourceLinks';

// One decision card: a chamfered ink frame (the page's RPG card shape), flat
const Decision = ({ title, why, tradeoff, link }) => (
  <article className="decision" aria-label={title}>
    <div className="decision__frame">
      <div className="decision__inner">
        <h3 className="decision__title">{title}</h3>
        <p className="decision__why">{why}</p>
        <div className="decision__tradeoff">
          <p className="decision__tradeoff-label">Trade-off</p>
          <p className="decision__tradeoff-text">{tradeoff}</p>
        </div>
        {link && (
          <a className="source-link decision__link" href={link.href}>
            {link.label}
            <i className="bi bi-arrow-down-short" aria-hidden="true"></i>
          </a>
        )}
      </div>
    </div>
  </article>
);

// The choices behind the system, each with the trade-off it costs, then the
// purchase saga as a worked example of one of them.
export const EngineeringDecisions = () => (
  <section className="decisions" aria-labelledby="decisions-heading">
    <header className="decisions__header">
      <h2 id="decisions-heading" className="doc-section__title">Key Decisions</h2>
    </header>

    <ul className="decisions__grid list-unstyled">
      {decisions.map((decision) => (
        <li key={decision.title}>
          <Decision {...decision} />
        </li>
      ))}
    </ul>

    <section className="saga" id="purchase-saga" aria-labelledby="saga-heading">
      {/* Two columns from the top: heading, intro and notes on the left, the framed
          diagram on the right, so the text fills the diagram's height */}
      <div className="saga__body">
        <div className="saga__text">
          <h3 id="saga-heading" className="arch-canvas__heading">How a purchase stays atomic</h3>
          <p className="arch-canvas__desc saga__lede">
            Buying an item touches Trading, Inventory and Identity, and each has its own database. Trading runs the
            purchase as a state machine: it asks Inventory to grant the items, then Identity to charge the wallet,
            and removes the items if the charge fails.
          </p>
          <a className="source-link saga__source" href={PURCHASE_SAGA_SOURCE_URL} target="_blank" rel="noreferrer">
            <i className="bi bi-github" aria-hidden="true"></i>
            PurchaseStateMachine.cs
            <i className="bi bi-box-arrow-up-right" aria-hidden="true"></i>
          </a>
          <div className="saga__notes">
            <ul>
              <li>A failed message is retried three times, five seconds apart, before the step counts as failed.</li>
              <li>
                Outgoing messages wait until the saga's state is saved (an in-memory outbox), so a crash can't send a
                message for a step that never happened.
              </li>
              <li>It runs on RabbitMQ locally and Azure Service Bus in production. Switching is a config setting.</li>
              <li>The buyer's browser gets each status change over SignalR.</li>
            </ul>
          </div>
        </div>
        {/* Unframed: the diagram's own state boxes are enough */}
        <div className="saga__diagram">
          <div className="saga__diagram--desktop">
            <PurchaseSagaDiagram />
          </div>
          <div className="saga__diagram--compact">
            <PurchaseSagaDiagram compact />
          </div>
        </div>
      </div>
    </section>
  </section>
);
