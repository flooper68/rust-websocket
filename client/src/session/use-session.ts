import { useEffect, useState } from "react";
import { Observable } from "rxjs";
import { WsMessage } from "../ws/ws-parser";

interface SessionState {
  connections: { id: number }[];
  rectangles: {
    height: number;
    left: number;
    top: number;
    width: number;
  }[];
}

export function useSession($eventStream: Observable<WsMessage>) {
  const [sessionState, setSessionState] = useState<null | SessionState>(null);

  useEffect(() => {
    const sub = $eventStream.subscribe((event) => {
      switch (event.type) {
        case "ClientConnected": {
          setSessionState((prevState) => {
            if (prevState == null) {
              console.log(
                `Skipping ClientConnected, state is not yet initialized.`
              );
              return prevState;
            }

            console.log(`Client added.`);
            return {
              ...prevState,
              connections: [...prevState.connections, { id: event.id }],
            };
          });
          break;
        }

        case "ClientDisconnected": {
          setSessionState((prevState) => {
            if (prevState == null) {
              console.log(
                `Skipping ClientDisconnected, state is not yet initialized.`
              );
              return prevState;
            }

            console.log(`Client removed.`);
            return {
              ...prevState,
              connections: prevState.connections.filter(
                (connection) => connection.id !== event.id
              ),
            };
          });
          break;
        }
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [$eventStream]);

  return sessionState;
}
