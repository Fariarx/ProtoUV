import * as THREE from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

//eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const bridge = window.electron.ipcRenderer.window;

export const AppName = 'protouv';
export const AppLink = 'https://github.com/Fariarx/ProtoUV';
export const AppLinkReleases = 'https://github.com/Fariarx/ProtoUV/releases';
export const AppVersion = 'alpha0.01';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export const MaxNumber = 999999999999999;
export const MinNumber = -999999999999999;

export const toUnits = (mm: number) => mm / 10;
export const toMM = (units: number) => units * 10;

export const UVToolsFormats = [
	'SL1 (sl1, sl1s)',
	'ChituboxZip (zip)',
	'Chitubox (photon, cbddlp, ctb, gktwo.ctb)',
	'CTBEncrypted (ctb, encrypted.ctb)',
	'PhotonS (photons)',
	'PHZ (phz)',
	'PhotonWorkshop (pws, pw0, pwx, dlp, dl2p, pwmx, pmx2, pwmb, pwmo, pwms, pwma, pmsq, pm3, pm3m, pm3r, pwc)',
	'CWS (cws, rgb.cws, xml.cws)',
	'Anet (n4, n7)',
	'LGS (lgs, lgs30, lgs120, lgs4k)',
	'VDA (zip)',
	'VDT (vdt)',
	'CXDLP (cxdlp)',
	'FDG (fdg)',
	'ZCode (zcode)',
	'JXS (jxs)',
	'ZCodex (zcodex)',
	'MDLP (mdlp)',
	'GR1 (gr1)',
	'FlashForgeSVGX (svgx)',
	'OSLA (osla)',
	'OSF (osf)',
	'UVJ (uvj)',
	'GenericZIP (zip)',
];
