import { z } from "zod";

export class ClientConnected {
  readonly type = "ClientConnected";
  constructor(public readonly id: number) {}
}

export class ClientDisconnected {
  readonly type = "ClientDisconnected";
  constructor(public readonly id: number) {}
}

export class StateSent {
  readonly type = "StateSent";
  constructor(
    public readonly state: {
      connections: Record<number, { id: number }>;
      rectangles: Record<
        string,
        {
          uuid: string;
          height: number;
          left: number;
          top: number;
          width: number;
        }
      >;
    }
  ) {}
}

export class RectangleCreated {
  readonly type = "RectangleCreated";
  constructor(
    public readonly state: {
      uuid: string;
      left: number;
      top: number;
      width: number;
      height: number;
    }
  ) {}
}

export class RectangleMoved {
  readonly type = "RectangleMoved";
  constructor(
    public readonly state: {
      uuid: string;
      diffX: number;
      diffY: number;
    }
  ) {}
}

export type WsMessage =
  | ClientConnected
  | ClientDisconnected
  | StateSent
  | RectangleMoved
  | RectangleCreated;

export function parseWsMessage(data: string): WsMessage | undefined {
  const message = data.split(";");
  const type = message[0];

  try {
    const payload = JSON.parse(message[1]);
    console.log(data);
    switch (type) {
      case "StateSent": {
        const parsedPayload = z
          .object({
            connections: z.record(
              z.object({
                id: z.number(),
              })
            ),
            rectangles: z.record(
              z.object({
                uuid: z.string(),
                height: z.number(),
                width: z.number(),
                left: z.number(),
                top: z.number(),
              })
            ),
          })
          .safeParse(payload);

        if (parsedPayload.success) {
          return new StateSent(parsedPayload.data);
        } else {
          console.error(
            `Could not parse payload for StateSent.`,
            parsedPayload.error
          );
          return undefined;
        }
      }
      case "RectangleMoved": {
        const parsedPayload = z
          .object({
            uuid: z.string(),
            diff_x: z.number(),
            diff_y: z.number(),
          })
          .safeParse(payload);

        if (parsedPayload.success) {
          return new RectangleMoved({
            uuid: parsedPayload.data.uuid,
            diffX: parsedPayload.data.diff_x,
            diffY: parsedPayload.data.diff_y,
          });
        } else {
          console.error(
            `Could not parse payload for RectangleMoved.`,
            parsedPayload.error
          );
          return undefined;
        }
      }
      case "RectangleCreated": {
        const parsedPayload = z
          .object({
            uuid: z.string(),
            left: z.number(),
            top: z.number(),
            width: z.number(),
            height: z.number(),
          })
          .safeParse(payload);

        if (parsedPayload.success) {
          return new RectangleCreated({
            uuid: parsedPayload.data.uuid,
            width: parsedPayload.data.width,
            height: parsedPayload.data.height,
            left: parsedPayload.data.left,
            top: parsedPayload.data.top,
          });
        } else {
          console.error(
            `Could not parse payload for RectangleMoved.`,
            parsedPayload.error
          );
          return undefined;
        }
      }
      case "ClientConnected": {
        const parsedPayload = z.object({ id: z.number() }).safeParse(payload);

        if (parsedPayload.success) {
          return new ClientConnected(parsedPayload.data.id);
        } else {
          console.error(
            `Could not parse payload for ClientConnected.`,
            parsedPayload.error
          );
          return undefined;
        }
      }
      case "ClientDisconnected": {
        const parsedPayload = z.object({ id: z.number() }).safeParse(payload);

        if (parsedPayload.success) {
          return new ClientDisconnected(parsedPayload.data.id);
        } else {
          console.error(
            `Could not parse payload for ClientDisconnected.`,
            parsedPayload.error
          );
          return undefined;
        }
      }
    }
  } catch (e) {
    console.error(`Could not parse payload.`, e);
    return undefined;
  }
}
