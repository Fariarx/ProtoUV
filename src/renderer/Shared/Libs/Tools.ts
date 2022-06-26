export const linearGenerator = function* (){
	let i = 0;
	while (true) {
		yield i++;
	}
}();

export const generateID = (length = 8) => {
	let result           = '';
	const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for ( let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
	}
	return result;
};
