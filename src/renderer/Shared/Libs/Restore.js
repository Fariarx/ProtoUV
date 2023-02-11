import { bridge } from '../Globals';

const fs = bridge.fs;
const path = bridge.path;

export class Restore {
	constructor(opts, userData = null) {
		const userDataPath = userData ? userData : bridge.userData();

		// We'll use the `configName` property to set the file name and path.join to bring it all together as a string
		this.path = path.join(userDataPath, opts.configName + '.json');
		this.data = parseDataFile(this.path, opts.defaults);
	}

	// This will just return the property on the `data` object
	get(key) {
		return this.data[key];
	}

	// ...and this will set it
	set(key, val) {
		this.data[key] = val;
		// Wait, I thought using the node.js' synchronous APIs was bad form?
		// We're not writing a server so there's not nearly the same IO demand on the process
		// Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
		// we might lose that data. Note that in a real app, we would try/catch this.
		fs.writeFileSync(this.path, JSON.stringify(this.data));
	}

	fullSave() {
		fs.writeFileSync(this.path, JSON.stringify(this.data));
	}
}

const parseDataFile = (filePath, defaults) => {
	// We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
	// `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
	try {
		const parsed = JSON.parse(Utf8ArrayToStr(fs.readFileSync(filePath)));

		if(defaults.version && parsed.version !== defaults.version)
		{
			return {
				...defaults
			};
		}

		return parsed;
	} catch(error) {
		console.log('Config parse error: ', error);
		// if there was some kind of error, return the passed in defaults instead.
		return defaults;
	}
};

const Utf8ArrayToStr = (array) => {
	let out, i, len, c;
	let char2, char3;

	out = '';
	// eslint-disable-next-line prefer-const
	len = array.length;
	i = 0;
	while(i < len) {
		c = array[i++];
		switch(c >> 4)
		{
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
				// 0xxxxxxx
				out += String.fromCharCode(c);
				break;
			case 12: case 13:
				// 110x xxxx   10xx xxxx
				char2 = array[i++];
				out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
				break;
			case 14:
				// 1110 xxxx  10xx xxxx  10xx xxxx
				char2 = array[i++];
				char3 = array[i++];
				out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
				break;
		}
	}

	return out;
};
