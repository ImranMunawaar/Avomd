export function checkInputType(cards = []) {
  return cards.some((panel) => {
    switch (panel.type) {
      case "SEGMENTED":
      case "MULTI":
      case "PREDETERMINED":
        return true;
      default:
        return false;
    }
  });
}
