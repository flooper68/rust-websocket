import { Application, DisplayObject, Graphics, Point, Sprite } from "pixi.js";
import { useEffect, useRef } from "react";
import { Observable } from "rxjs";
import imgUrl from "./assets/image.png";
import { CanvasControl } from "./canvas-control";
import { WsClient } from "../ws/use-ws";
import { StateSent, WsMessage } from "../ws/ws-parser";

let draggingTarget: string | null = null;
let lastPoint: Point | null = null;

function createApplication(canvasContainer: HTMLElement) {
  const app = new Application({
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const rectangles: Record<string, DisplayObject> = {};

  canvasContainer.appendChild(app.view as unknown as Node);

  function initializeDragging(client: WsClient) {
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    app.stage.on("pointermove", (e) => {
      if (draggingTarget != null) {
        if (lastPoint != null) {
          client.moveRectangle(
            draggingTarget,
            e.global.x - lastPoint.x,
            e.global.y - lastPoint.y
          );
        }

        lastPoint = e.global.clone();
      }
    });
    app.stage.on("pointerup", () => {
      draggingTarget = null;
      lastPoint = null;
    });
  }

  function moveRectangle(uuid: string, diffX: number, diffY: number) {
    const target = rectangles[uuid];
    target.position.x += diffX;
    target.position.y += diffY;
  }

  function createRectangle(props: {
    uuid: string;
    left: number;
    top: number;
    width: number;
    height: number;
  }) {
    const rectangle: Graphics = new Graphics();

    rectangles[props.uuid] = rectangle;

    rectangle.lineStyle({ width: 4, color: 0xff3300, alpha: 1 });
    rectangle.beginFill(0xffffff);
    rectangle.drawRoundedRect(
      props.left,
      props.top,
      props.width,
      props.height,
      10
    );
    rectangle.endFill();
    rectangle.cursor = "pointer";
    rectangle.interactive = true;

    rectangle.on("pointerdown", (e) => {
      draggingTarget = props.uuid;
    });

    app.stage.addChild(rectangle);
  }

  function createBackgroundAnimation() {
    const clampy: Sprite = Sprite.from(imgUrl);

    clampy.anchor.set(0.5);

    clampy.x = app.screen.width / 2;
    clampy.y = app.screen.height / 2;

    app.stage.addChild(clampy);

    let growing = true;
    const step = 0.002;

    setInterval(() => {
      if (clampy.scale.x > 1.2) {
        growing = false;
      } else if (clampy.scale.x < 0.8) {
        growing = true;
      }

      if (growing) {
        clampy.scale.set(clampy.scale.x + step, clampy.scale.y + step);
      } else {
        clampy.scale.set(clampy.scale.x - step, clampy.scale.y - step);
      }
    }, 1000 / 60);
  }

  function initialize(stateSent: StateSent) {
    Object.values(stateSent.state.rectangles).forEach((rectangle) => {
      createRectangle(rectangle);
    });
  }

  return {
    initialize,
    initializeDragging,
    createBackgroundAnimation,
    createRectangle,
    moveRectangle,
  };
}

export function Canvas(props: {
  stream: Observable<WsMessage>;
  wsClient: WsClient;
}) {
  const { stream, wsClient } = props;

  const canvasRef = useRef<null | HTMLDivElement>(null);
  const appended = useRef(false);

  useEffect(() => {
    if (canvasRef.current == null || appended.current === true) {
      return;
    }

    const app = createApplication(canvasRef.current);

    app.initializeDragging(wsClient);
    app.createBackgroundAnimation();

    stream.subscribe((event) => {
      console.log(`Rendering event`, event);
      switch (event.type) {
        case "RectangleMoved": {
          app.moveRectangle(
            event.state.uuid,
            event.state.diffX,
            event.state.diffY
          );
          break;
        }
        case "RectangleCreated": {
          app.createRectangle(event.state);
          break;
        }
        case "StateSent": {
          if (appended.current) {
            return;
          }
          app.initialize(event);
          break;
        }
        default: {
          console.log(`Unhandled rendering event`, event);
        }
      }
    });

    appended.current = true;

    console.log(`Rendering initialized`);
  }, [wsClient]);

  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          display: "grid",
          alignItems: "center",
          justifyContent: "center",
        }}
        ref={canvasRef}
      />
      <CanvasControl createRectangle={wsClient.createRectangle} />
    </>
  );
}
