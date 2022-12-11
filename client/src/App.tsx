import { useSession } from "./session/use-session";
import { useWs } from "./ws/use-ws";
import { Canvas } from "./canvas/canvas";

export function App() {
  const { isConnected, $eventStream, wsClient } = useWs();
  const state = useSession($eventStream);

  if (!isConnected) {
    return <div>Loading...</div>;
  }

  if (!state) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {Object.values(state.connections).map((item) => (
        <div key={item.id}>{item.id}</div>
      ))}
      <Canvas stream={$eventStream} wsClient={wsClient} />
    </div>
  );
}
