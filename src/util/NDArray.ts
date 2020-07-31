// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class NDArray<T, Indices extends any[]> {
	private _root: T | T[] = [];
	length = 0;

	get(...indicies: Indices): T | undefined {
		let cur = this._root;
		let i = 0;
		for (; i < indicies.length && cur; i++) cur = (cur as T[])[indicies[i]];

		if (i !== indicies.length) return undefined;
		return cur as T;
	}

	set(value: T, ...indicies: Indices): T {
		let cur = this._root;
		for (let i = 0; i < indicies.length - 1; i++) {
			if (!cur[indicies[i]]) cur[indicies[i]] = [];
			cur = cur[indicies[i]];
		}

		this.length++;

		return (cur[indicies[indicies.length - 1]] = value);
	}

	getOrSet(cb, ...indicies): T {
		let cur = this._root;
		for (let i = 0; i < indicies.length - 1; i++) {
			if (!cur[indicies[i]]) cur[indicies[i]] = [];
			cur = cur[indicies[i]];
		}

		if (indicies[indicies.length - 1] in cur)
			return cur[indicies[indicies.length - 1]];

		this.length++;

		return (cur[indicies[indicies.length - 1]] = cb());
	}
}
