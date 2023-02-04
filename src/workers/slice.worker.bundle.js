/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/workers/slice.worker.ts":
/*!*************************************!*\
  !*** ./src/workers/slice.worker.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\r\n    if (k2 === undefined) k2 = k;\r\n    var desc = Object.getOwnPropertyDescriptor(m, k);\r\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\r\n      desc = { enumerable: true, get: function() { return m[k]; } };\r\n    }\r\n    Object.defineProperty(o, k2, desc);\r\n}) : (function(o, m, k, k2) {\r\n    if (k2 === undefined) k2 = k;\r\n    o[k2] = m[k];\r\n}));\r\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\r\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\r\n}) : function(o, v) {\r\n    o[\"default\"] = v;\r\n});\r\nvar __importStar = (this && this.__importStar) || function (mod) {\r\n    if (mod && mod.__esModule) return mod;\r\n    var result = {};\r\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\r\n    __setModuleDefault(result, mod);\r\n    return result;\r\n};\r\nvar __importDefault = (this && this.__importDefault) || function (mod) {\r\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.sliceLayers = void 0;\r\nconst fs_1 = __importDefault(__webpack_require__(/*! fs */ \"fs\"));\r\nconst three_1 = __webpack_require__(/*! three */ \"three\");\r\nconst THREE = __importStar(__webpack_require__(/*! three */ \"three\"));\r\nconst three_mesh_bvh_1 = __webpack_require__(/*! three-mesh-bvh */ \"three-mesh-bvh\");\r\nconst worker_threads_1 = __webpack_require__(/*! worker_threads */ \"worker_threads\");\r\nconst zlib = __importStar(__webpack_require__(/*! zlib */ \"zlib\"));\r\nconst slice = async (printer, layer, mesh, raycaster) => {\r\n    const voxelSizes = printer.workerData.voxelSize;\r\n    const startPixelPositionX = printer.workerData.gridSize.x / 2 - voxelSizes.voxelSizeX * printer.Resolution.X / 2;\r\n    const startPixelPositionY = layer * voxelSizes.voxelSizeY;\r\n    const startPixelPositionZ = printer.workerData.gridSize.z / 2 - .1 * printer.Workspace.SizeY / 2;\r\n    const imageBuffer = new Uint8Array(printer.Resolution.X * printer.Resolution.Y);\r\n    imageBuffer.fill(0x00);\r\n    let voxelDrawCount = 0;\r\n    let indexPixelX = 0;\r\n    raycaster.ray.direction.set(0, 0, 1);\r\n    while (indexPixelX < printer.Resolution.X) {\r\n        const newPixelPositionX = startPixelPositionX + voxelSizes.voxelSizeX * indexPixelX;\r\n        raycaster.ray.origin.set(newPixelPositionX, startPixelPositionY, startPixelPositionZ);\r\n        const intersection = mesh.raycast(raycaster.ray, THREE.DoubleSide);\r\n        //DrawDirLine(raycaster.ray.origin, raycaster.ray.direction, sceneStore.scene)\r\n        intersection.sort((a, b) => {\r\n            return a.distance < b.distance ? -1 : 1;\r\n        });\r\n        //console.log(intersection)\r\n        for (let i = 0; i < intersection.length; i++) {\r\n            const isFrontFacing = intersection[i].face.normal.dot(raycaster.ray.direction) < 0;\r\n            if (!isFrontFacing) {\r\n                continue;\r\n            }\r\n            let numSolidsInside = 0;\r\n            let j = i + 1;\r\n            while (j < intersection.length) {\r\n                const isFrontFacing = intersection[j].face.normal.dot(raycaster.ray.direction) < 0;\r\n                if (!isFrontFacing) {\r\n                    if (numSolidsInside === 0) {\r\n                        // Found it\r\n                        break;\r\n                    }\r\n                    numSolidsInside--;\r\n                }\r\n                else {\r\n                    numSolidsInside++;\r\n                }\r\n                j++;\r\n            }\r\n            if (j >= intersection.length) {\r\n                continue;\r\n            }\r\n            const indexStartZ = Math.floor((intersection[i].point.z - (startPixelPositionZ)) / voxelSizes.voxelSizeZ);\r\n            const indexFinishZ = Math.ceil((intersection[j].point.z - (startPixelPositionZ)) / voxelSizes.voxelSizeZ);\r\n            const bufferStartIndexX = printer.Resolution.X * indexPixelX;\r\n            voxelDrawCount += indexFinishZ - indexPixelX;\r\n            imageBuffer.fill(0xff, bufferStartIndexX + indexStartZ, bufferStartIndexX + indexFinishZ);\r\n            i = j;\r\n        }\r\n        indexPixelX += 1;\r\n    }\r\n    fs_1.default.writeFileSync(userData + '/slice/' + layer + '.layer', zlib.gzipSync(imageBuffer), 'binary');\r\n};\r\nconst sliceLayers = async (printerJson, numLayerFrom, numLayerTo) => {\r\n    const start = numLayerFrom;\r\n    const printer = JSON.parse(printerJson);\r\n    const raycaster = new three_1.Raycaster();\r\n    const geometry = new three_1.BufferGeometryLoader().parse(printer.workerData.geometry);\r\n    const mesh = new three_mesh_bvh_1.MeshBVH(geometry, {\r\n        maxLeafTris: 20\r\n    });\r\n    const _w = printer.Resolution.X;\r\n    const _h = printer.Resolution.Y;\r\n    const _slice = (layer) => {\r\n        slice(printer, layer, mesh, raycaster);\r\n    };\r\n    while (numLayerFrom <= numLayerTo) {\r\n        _slice(numLayerFrom);\r\n        worker_threads_1.parentPort?.postMessage((numLayerFrom - start) / (numLayerTo - start));\r\n        numLayerFrom++;\r\n    }\r\n};\r\nexports.sliceLayers = sliceLayers;\r\nconst userData = worker_threads_1.workerData[3];\r\nif (fs_1.default.existsSync(userData + '/slice')) {\r\n    fs_1.default.rmSync(userData + '/slice', { recursive: true, force: true });\r\n}\r\nfs_1.default.mkdirSync(userData + '/slice');\r\nworker_threads_1.parentPort?.postMessage(userData);\r\n(0, exports.sliceLayers)(worker_threads_1.workerData[0], worker_threads_1.workerData[1], worker_threads_1.workerData[2]).then(x => {\r\n    worker_threads_1.parentPort?.postMessage('slice finished from worker');\r\n});\r\nworker_threads_1.parentPort?.postMessage('slice started from worker');\r\n\n\n//# sourceURL=webpack://protouv/./src/workers/slice.worker.ts?");

/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "three" ***!
  \************************/
/***/ ((module) => {

module.exports = require("three");

/***/ }),

/***/ "three-mesh-bvh":
/*!*********************************!*\
  !*** external "three-mesh-bvh" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("three-mesh-bvh");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/workers/slice.worker.ts");
/******/ 	
/******/ })()
;