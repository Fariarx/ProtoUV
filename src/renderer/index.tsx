import { createRoot } from 'react-dom/client';
import { bridgeTypeOf } from '../main/preload';
import { App } from './App';
import '../renderer/Shared/Config';
import { bridge } from './Shared/Globals';
import { sliceLayers } from './Shared/Libs/Slice/Slice.worker';

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

bridge.ipcRenderer.receive('worker-slice', (printerJson: string, numLayerFrom: number, numLayerTo: number) => {
	sliceLayers(printerJson, numLayerFrom, numLayerTo).then(x => {
		bridge.ipcRenderer.send('worker-slice-message', x);
	});
});
