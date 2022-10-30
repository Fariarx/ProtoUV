window.addEventListener('dblclick', (e: any) => SubscribersDoubleMouseClick.forEach(x => x(e)));
export const SubscribersDoubleMouseClick: ((e: any) => void)[] = [];

window.addEventListener('click', (e: any) => SubscribersMouseClick.forEach(x => x(e)));
export const SubscribersMouseClick: ((e: any) => void)[] = [];

window.addEventListener('mousedown', (e: any) => SubscribersMouseDown.forEach(x => x(e)));
export const SubscribersMouseDown: ((e: any) => void)[] = [];

window.addEventListener('mouseup', (e: any) => SubscribersMouseUp.forEach(x => x(e)));
export const SubscribersMouseUp: ((e: any) => void)[] = [];

window.addEventListener('resize', (e: any) => SubscribersWindowResize.forEach(x => x(e)));
export const SubscribersWindowResize: ((e: any) => void)[] = [];
