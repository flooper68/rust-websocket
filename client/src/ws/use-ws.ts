import { useCallback, useEffect, useRef, useState } from "react";
import { ReplaySubject } from "rxjs";
import { parseWsMessage, WsMessage } from "./ws-parser";

const address = `ws://127.0.0.1:6464`;
const client = new WebSocket(address);

const wsClient = {
  moveRectangle(uuid: string, diffX: number, diffY: number) {
    console.log(`Sending Move Rectangle Command`);
    client.send(
      `MoveRectangle;${JSON.stringify({
        uuid,
        diff_x: diffX,
        diff_y: diffY,
      })}`
    );
  },
  createRectangle() {
    // subject.next(
    //   new RectangleCreated({
    //     uuid: v4(),
    //     left: 10,
    //     top: 10,
    //     width: 100,
    //     height: 100,
    //   })
    // );
  },
};

export type WsClient = typeof wsClient;

export function useWs() {
  const [isConnected, setIsConnected] = useState(false);
  const $eventStream = useRef(new ReplaySubject<WsMessage>(100));

  const onConnected = useCallback(() => {
    console.log(`Ws Connected`);
    setIsConnected(true);
  }, []);

  const onDisconnected = useCallback(() => {
    console.log(`Ws Disconnected`);
    setIsConnected(false);
  }, []);

  const onMessage = useCallback((message: MessageEvent<string>) => {
    const event = parseWsMessage(message.data);

    if (!event) {
      return;
    }

    console.log(`Event received.`, event);
    $eventStream.current.next(event);
  }, []);

  useEffect(() => {
    client.onopen = onConnected;
    client.onmessage = onMessage;
    client.onclose = onDisconnected;

    return () => {
      client.onopen = null;
      client.onmessage = null;
      client.onclose = null;
    };
  }, [onConnected, onDisconnected, onMessage]);

  return { isConnected, $eventStream: $eventStream.current, wsClient };
}
