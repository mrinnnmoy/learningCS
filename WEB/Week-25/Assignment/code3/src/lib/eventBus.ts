import Redis from "ioredis";

// Define all domain events and their payload shapes in one place
export interface DomainEvents {
  "order.placed": {
    orderId: number;
    userId: number;
    total: number;
    items: { productName: string; quantity: number; price: number }[];
  };
  "payment.processed": {
    orderId: number;
    userId: number;
    total: number;
    success: boolean;
    at: string;
  };
  "stock.updated": {
    orderId: number;
    items: { productName: string; quantity: number }[];
    at: string;
  };
  "notification.sent": {
    userId: number;
    message: string;
    at: string;
  };
}

export type DomainEventChannel = keyof DomainEvents;

export class EventBus {
  constructor(
    private readonly pub: Redis,
    private readonly sub: Redis,
  ) {}

  // Publish a typed event to a named channel
  async publish<K extends DomainEventChannel>(
    channel: K,
    payload: DomainEvents[K],
  ): Promise<void> {
    const message = JSON.stringify({
      channel,
      payload,
      publishedAt: new Date().toISOString(),
    });
    await this.pub.publish(channel, message);
    console.log(`[EventBus] Published → ${channel}`);
  }

  // Subscribe to a specific typed channel
  subscribe<K extends DomainEventChannel>(
    channel: K,
    handler: (payload: DomainEvents[K]) => void | Promise<void>,
  ): void {
    this.sub.subscribe(channel).catch(console.error);

    this.sub.on("message", (ch: string, rawMessage: string) => {
      if (ch !== channel) return;
      try {
        const { payload } = JSON.parse(rawMessage) as {
          payload: DomainEvents[K];
        };
        void handler(payload);
      } catch (e) {
        console.error(`[EventBus] Failed to parse message on ${ch}:`, e);
      }
    });
  }

  // Subscribe to multiple channels via a pattern
  psubscribeAll(handler: (channel: string, rawPayload: string) => void): void {
    this.sub.psubscribe("*").catch(console.error);
    this.sub.on(
      "pmessage",
      (_pattern: string, channel: string, message: string) => {
        handler(channel, message);
      },
    );
  }

  async close(): Promise<void> {
    await this.pub.quit();
    await this.sub.quit();
  }
}
