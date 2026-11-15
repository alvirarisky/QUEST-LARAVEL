/** Base artwork space stays unchanged; this is only its camera projection. */
export function coverView(
  width: number,
  height: number,
  focalX = 800,
  focalY = 450,
) {
  const zoom = Math.max(width / 1600, height / 900);
  const viewW = width / zoom,
    viewH = height / zoom;
  const left = Math.max(0, Math.min(1600 - viewW, focalX - viewW / 2));
  const top = Math.max(0, Math.min(900 - viewH, focalY - viewH / 2));
  return {
    zoom,
    left,
    top,
    project: (x: number, y: number) => ({
      x: (x - left) * zoom,
      y: (y - top) * zoom,
    }),
  };
}
