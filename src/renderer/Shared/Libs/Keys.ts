import { Key } from 'ts-keycode-enum';

const keysPressed: Array<Key> = [];

export const SubscribersKeyPressed: ((k: Key) => void)[] = [];
export const isKeyPressed = (key: Key) => {
	return keysPressed.indexOf(key) !== -1;
};

window.addEventListener( 'keydown', (e)=>{
	if (keysPressed.indexOf(e.keyCode as Key) === -1)
	{
		keysPressed.push(e.keyCode as Key);
	}

	SubscribersKeyPressed.forEach(x => x(e.keyCode as Key));
}, false);
window.addEventListener( 'keyup',(e)=>{
	const index = keysPressed.indexOf(e.keyCode as Key);

	if (index > -1)
	{
		keysPressed.splice(index, 1);
	}
}, false );
