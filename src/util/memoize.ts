// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchCache = (rootCache: any, args: any[]) => {
	let cache = rootCache;
	for (let i = 0; i < args.length - 1; i++) {
		if (!(args[i] in cache)) cache[args[i]] = {};
		cache = cache[args[i]];
	}

	const lastArg = args[args.length - 1];
	return [cache[lastArg], cache, lastArg in cache, lastArg];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default <A extends any[], B>(
	fn: (...rest: A) => B,
): ((...rest: A) => B) => {
	const cache = {};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const memoizedFn = function (this: any, ...args: A): B {
		const [value, container, contains, lastArg] = fetchCache(cache, args);
		if (contains) return value;
		return (container[lastArg] = fn.apply(this, args));
	};

	return memoizedFn;
};
