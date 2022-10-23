export type EnumLikeValue<T> = string | T;
export type EnumLike<T> = { [s: string]: EnumLikeValue<T> };

export class EnumHelpers {
	static valueOf = <T>(_enum: EnumLike<T> | T, value: EnumLikeValue<T>): string => Object.values(_enum)[Object.values(_enum).indexOf(value)];
	static keyOf = <T>(_enum: EnumLike<T> | T, value: EnumLikeValue<T>): string => Object.keys(_enum)[Object.values(_enum).indexOf(value)];
	static keys = <T>(_enum: EnumLike<T>) => Object.keys(_enum).map(key => _enum[key]).filter(value => typeof value === 'string') as string[];
	static keysDescriptions = <T>(_enum: EnumLike<T>, description: (value: EnumLikeValue<T>) => string): { key: string, description: string }[] => this.keys(_enum).map(key => {
		return { key: key, description: description(_enum[key]) };
	});
}
