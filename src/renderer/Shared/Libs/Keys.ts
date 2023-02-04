import _ from 'lodash';
import { Key } from 'ts-keycode-enum';

export const KeysPressed: Array<Key> = [];
export const SubscribersKeyPressed: ((k: Key) => void)[] = [];
export const isKeyPressed = (key: Key) => {
	return KeysPressed.indexOf(key) !== -1;
};
export const isKeySequencePressed = (keys: Key[]) => {
	return _.isEqual(KeysPressed, keys);
};

window.addEventListener( 'keydown', (e)=>{
	if (KeysPressed.indexOf(e.keyCode as Key) === -1)
	{
		KeysPressed.push(e.keyCode as Key);
	}

	SubscribersKeyPressed.forEach(x => x(e.keyCode as Key));
}, false);
window.addEventListener( 'keyup',(e)=>{
	const index = KeysPressed.indexOf(e.keyCode as Key);

	if (index > -1)
	{
		KeysPressed.splice(index, 1);
	}
}, false );
