export function gestureFromLandmarks(points, threshold = .3) {
  if (!points || points.length !== 21) return null;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const palm = distance(points[0], points[9]);
  if (palm < .015) return null;
  const anchors = [points[0], points[5], points[9], points[13], points[17]];
  const center = anchors.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  return { x: Math.max(0, Math.min(1, (1 - center.x / anchors.length - .12) / .76)), y: Math.max(0, Math.min(1, (center.y / anchors.length - .1) / .8)), pinch: distance(points[4], points[8]) / palm < threshold };
}

export function gesturesFromHands(hands, threshold = .3) {
  return hands.map(hand => gestureFromLandmarks(hand, threshold)).filter(Boolean);
}
