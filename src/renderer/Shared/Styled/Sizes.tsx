export const Sizes = {
	four: '4px',
	eight: '8px',
	twelve: '12px',
	sixteen: '16px',
	twentyFour: '24px',
	sum: (a: string, b: string) => parseInt(a) + parseInt(b) + 'px',
	multiply: (a: string, b: number) => parseInt(a) * b + 'px',
	negative: (a: string) => '-' + a
};
