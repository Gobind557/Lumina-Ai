import { subscribe } from "../../infrastructure/eventBus";
import {
  EMAIL_QUEUED,
  EMAIL_SENT,
  EMAIL_OPENED,
  type DomainEvent,
  type EmailOpenedPayload,
} from "../email/email.events";
import { recordEmailOpened } from "./analytics.service";

async function onEmailOpened(payload: EmailOpenedPayload): Promise<void> {
  await recordEmailOpened(payload.emailId, new Date(payload.openedAt));
}

async function handle(event: DomainEvent): Promise<void> {
  switch (event.type) {
    case EMAIL_OPENED:
      await onEmailOpened(event.payload);
      break;
    case EMAIL_QUEUED:
    case EMAIL_SENT:
      break;
    default:
      break;
  }
}

function main(): void {
  // eslint-disable-next-line no-console
  console.log("Analytics consumer started");
  subscribe(
    [EMAIL_QUEUED, EMAIL_SENT, EMAIL_OPENED],
    (event) => handle(event)
  );
}

main();
