window.addEventListener('click', () => SubscribersMouseClick.forEach(x => x()));
export const SubscribersMouseClick: (() => void)[] = [];

window.addEventListener('mousedown', () => SubscribersMouseDown.forEach(x => x()));
export const SubscribersMouseDown: (() => void)[] = [];

window.addEventListener('mouseup', (e: any) => SubscribersMouseUp.forEach(x => x(e)));
export const SubscribersMouseUp: ((e: any) => void)[] = [];

window.addEventListener('resize', () => SubscribersWindowResize.forEach(x => x()));
export const SubscribersWindowResize: (() => void)[] = [];
