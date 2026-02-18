import Redis from "ioredis";
import { env } from "../config/env";
import { EVENT_CHANNEL, type DomainEvent } from "../modules/email/email.events";

let subscriber: Redis | null = null;
let publisher: Redis | null = null;

function getPublisher(): Redis {
  if (!publisher) {
    publisher = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return publisher;
}

export async function publish<E extends DomainEvent>(
  type: E["type"],
  payload: E["payload"]
): Promise<void> {
  const client = getPublisher();
  const message: DomainEvent = { type, payload } as DomainEvent;
  await client.publish(EVENT_CHANNEL, JSON.stringify(message));
}

export function subscribe(
  eventTypes: DomainEvent["type"][],
  handler: (event: DomainEvent) => void | Promise<void>
): () => void {
  if (!subscriber) {
    subscriber = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  const set = new Set(eventTypes);

  const onMessage = async (_channel: string, message: string) => {
    try {
      const event = JSON.parse(message) as DomainEvent;
      if (set.has(event.type)) {
        await handler(event);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Event handler error", err);
    }
  };

  subscriber.subscribe(EVENT_CHANNEL, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error("Event bus subscribe error", err);
    }
  });
  subscriber.on("message", onMessage);

  return () => {
    subscriber?.off("message", onMessage);
    subscriber?.unsubscribe(EVENT_CHANNEL);
  };
}

export async function closeEventBus(): Promise<void> {
  if (publisher) {
    await publisher.quit();
    publisher = null;
  }
  if (subscriber) {
    await subscriber.quit();
    subscriber = null;
  }
}
