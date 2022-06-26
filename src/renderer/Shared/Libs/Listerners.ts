export const SubscribersMouseDown: (() => void)[] = [];

window.addEventListener('mousedown', () => SubscribersMouseDown.forEach(x => x()));
