import { createRoot } from 'react-dom/client';
import { bridgeTypeOf } from '../main/preload';
import { App } from './App';
import '../renderer/Shared/Config';

const container = document.getElementById('root')!;
const root = createRoot(container);
document.body.style.overflow = 'hidden';
root.render(<App />);

declare global {
  interface Window {
    electron: {
      ipcRenderer: typeof bridgeTypeOf;
    };
  }
}

export {};
