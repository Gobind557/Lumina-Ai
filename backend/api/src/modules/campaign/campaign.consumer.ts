import { subscribe } from "../../infrastructure/eventBus";
import {
  EMAIL_QUEUED,
  EMAIL_SENT,
  EMAIL_OPENED,
  type DomainEvent,
} from "../email/email.events";

/**
 * Campaign engine consumer: reacts to email lifecycle events.
 * Stub ready for campaign/sequence logic when backend supports it.
 */
async function handle(event: DomainEvent): Promise<void> {
  switch (event.type) {
    case EMAIL_QUEUED:
      break;
    case EMAIL_SENT:
      break;
    case EMAIL_OPENED:
      break;
    default:
      break;
  }
}

function main(): void {
  // eslint-disable-next-line no-console
  console.log("Campaign engine consumer started");
  subscribe(
    [EMAIL_QUEUED, EMAIL_SENT, EMAIL_OPENED],
    (event) => handle(event)
  );
}

main();
