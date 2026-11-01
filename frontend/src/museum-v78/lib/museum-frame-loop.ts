// Presentation scheduling only. A still exhibit consumes no continuous GPU frames.
export function createMuseumFrameLoop(
  draw: (time: number) => boolean,
  request: (callback: FrameRequestCallback) => number = requestAnimationFrame,
  cancel: (id: number) => void = cancelAnimationFrame,
) {
  let frame: number | null = null, disposed = false;
  const invalidate = () => {
    if (!disposed && frame === null) frame = request(time => {
      frame = null;
      if (!disposed && draw(time)) invalidate();
    });
  };
  return { invalidate, dispose() { disposed = true; if (frame !== null) cancel(frame); frame = null; } };
}
