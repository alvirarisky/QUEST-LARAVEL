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

/** Reserve the dialogue strip without changing the room's cover projection. */
export function conversationFrame(
  width: number,
  height: number,
  speakerX: number,
  dialogTop: number,
) {
  const gap = width < 700 ? 220 : 300;
  const playerX = speakerX - gap >= 100 ? speakerX - gap : speakerX + gap;
  const center = (speakerX + playerX) / 2;
  const view = coverView(width, height, center);
  const feetScreen = dialogTop - 8;
  return {
    playerX,
    speakerX,
    center,
    feetY: view.top + feetScreen / view.zoom,
    feetScreen,
    scale: width < 700 ? 0.62 : 0.65,
    view,
  };
}

/** Zoom the existing backdrop around the pair, anchored to its floor, without exposing empty edges. */
export function dialogueBackdrop(
  feetY: number,
  floorY: number,
  center: number,
) {
  const zoom = Math.max(1, Math.min(2, (900 - (feetY - 12)) / (900 - floorY)));
  return { zoom, x: center + (800 - center) * zoom, y: 900 - 450 * zoom };
}
