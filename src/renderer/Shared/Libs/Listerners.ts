window.addEventListener('click', () => SubscribersMouseClick.forEach(x => x()));
export const SubscribersMouseClick: (() => void)[] = [];

window.addEventListener('mousedown', () => SubscribersMouseDown.forEach(x => x()));
export const SubscribersMouseDown: (() => void)[] = [];
