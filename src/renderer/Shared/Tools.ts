export const linearGenerator = function* (){
	let i = 0;
	while (true) {
		yield i++;
	}
}();

