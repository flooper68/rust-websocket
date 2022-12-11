export function CanvasControl(props: { createRectangle: () => void }) {
  const { createRectangle } = props;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
      }}
    >
      <button onClick={createRectangle}>Rectangle</button>
    </div>
  );
}
