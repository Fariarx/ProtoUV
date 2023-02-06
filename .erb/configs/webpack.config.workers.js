// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require('webpack-node-externals');

module.exports = {
	mode: 'development',
	name: 'webworker',
	target: 'node',
	entry: './src/workers/slice.worker.ts',
	output: {
		path: path.resolve(__dirname, '../../assets/workers'),
		filename: 'slice.worker.bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.(ts)x?$/, // Just `tsx?` file only
				use: [
					// options.defaultLoaders.babel, I don't think it's necessary to have this loader too
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true,
							experimentalWatchApi: true,
							allowTsInNodeModules: true,
							onlyCompileBundledFiles: true
						},
					},
				],
			}
		]
	}
};
