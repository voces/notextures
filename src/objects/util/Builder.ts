import {
	BoxGeometry,
	ConeGeometry,
	CylinderGeometry,
	Geometry,
	LatheGeometry,
	OctahedronGeometry,
	SphereGeometry,
	TetrahedronGeometry,
	TubeGeometry,
	Vector3,
	Vector2,
	Color,
	BufferGeometry,
	Mesh,
} from "three";
import Randomizer, { Variation } from "./Randomizer.js";
import { faceColorMaterial } from "./materials.js";

// const compose = <R>(fn1: (a: R) => R, ...fns: Array<(a: R) => R>) =>
// 	fns.reduce((prevFn, nextFn) => (value) => prevFn(nextFn(value)), fn1);

// const compose = (arr) => {
// 	if (!arr || arr.length === 0) return;

// 	if (arr.length === 1) return arr[0];

// 	return (val) => {
// 		for (let i = 0; i < arr.length; i++) val = arr[i](val);

// 		return val;
// 	};
// };

const compose = <A, C extends (arg: A) => A>(fns?: C[]) => {
	if (!fns || fns.length === 0) return;

	if (fns.length === 1) return fns[0];

	return (val: A) => {
		for (let i = 0; i < fns.length; i++) val = fns[i](val);

		return val;
	};
};

const IDENTITY = <T>(v: T) => v;
const LEFT = new Vector2(-1, 0);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tail<T extends any[]> = ((...t: T) => void) extends (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x: any,
	...u: infer U
) => void
	? U
	: never;

export default class Builder {
	parent?: Builder;

	private _geometry?: Geometry;
	private children: Builder[];
	private _color?: Color;
	private _colorVariation?: Variation[];
	private _position?: Vector3;
	private _positionVariation?: Variation[];
	private _rotation?: Vector3;
	private _rotationVariation?: Variation[];
	private _scale?: Vector3;
	private _scaleVariation?: Variation[];
	private _blur?: number;

	constructor(geometry?: Geometry, parent?: Builder) {
		this._geometry = geometry;
		this.parent = parent;
		this.children = [];
	}

	// Child builders

	group(): Builder {
		const group = new Builder(undefined, this);
		this.children.push(group);

		return group;
	}

	box(...args: ConstructorParameters<typeof BoxGeometry>): Builder {
		const box = new Builder(new BoxGeometry(...args), this);
		this.children.push(box);

		return box;
	}

	cone(...args: ConstructorParameters<typeof ConeGeometry>): Builder {
		const cone = new Builder(new ConeGeometry(...args), this);
		this.children.push(cone);

		return cone;
	}

	cylinder(...args: ConstructorParameters<typeof CylinderGeometry>): Builder {
		const cylinder = new Builder(new CylinderGeometry(...args), this);
		this.children.push(cylinder);

		return cylinder;
	}

	octahedron(
		...args: ConstructorParameters<typeof OctahedronGeometry>
	): Builder {
		const octahedron = new Builder(new OctahedronGeometry(...args), this);
		this.children.push(octahedron);

		return octahedron;
	}

	sphere(...args: ConstructorParameters<typeof SphereGeometry>): Builder {
		const sphere = new Builder(new SphereGeometry(...args), this);
		this.children.push(sphere);

		return sphere;
	}

	tetrahedron(
		...args: ConstructorParameters<typeof TetrahedronGeometry>
	): Builder {
		const tetrahedron = new Builder(new TetrahedronGeometry(...args), this);
		this.children.push(tetrahedron);

		return tetrahedron;
	}

	tube(...args: ConstructorParameters<typeof TubeGeometry>): Builder {
		const tube = new Builder(new TubeGeometry(...args), this);
		this.children.push(tube);

		return tube;
	}

	lathe(...args: ConstructorParameters<typeof LatheGeometry>): Builder {
		const lathe = new Builder(new LatheGeometry(...args), this);
		this.children.push(lathe);

		return lathe;
	}

	thickLathe(
		points: Vector2[],
		thickness = 1 / 32,
		direction = LEFT,
		...rest: Tail<ConstructorParameters<typeof LatheGeometry>>
	): Builder {
		const adjustment = direction.clone().multiplyScalar(thickness);
		const allPoints = [
			...points,
			...[...points].reverse().map((p) => p.clone().add(adjustment)),
			points[0],
		];

		return this.lathe(allPoints, ...rest);
	}
	// Transformations

	color(color: Color, variation?: Variation): Builder {
		this._color = color;
		if (variation)
			if (this._colorVariation) this._colorVariation.push(variation);
			else this._colorVariation = [variation];

		return this;
	}

	translate(x = 0, y = 0, z = 0, variation?: Variation): Builder {
		// if (typeof position === "object") {
		// 	variation = typeof y === "function" ? y : undefined;
		// 	position.x = position.x || 0;
		// 	position.y = position.y || 0;
		// 	position.z = position.z || 0;
		// } else position = new Vector3(position || 0, y || 0, z || 0);
		const position = new Vector3(x, y, z);

		this._position = this._position
			? this._position.add(position)
			: position;
		if (variation)
			if (this._positionVariation)
				this._positionVariation.push(variation);
			else this._positionVariation = [variation];

		return this;
	}

	translateX(x: number): Builder {
		if (this._position) this._position.x += x;
		else this._position = new Vector3(x, 0, 0);
		return this;
	}

	translateY(y: number): Builder {
		if (this._position) this._position.y += y;
		else this._position = new Vector3(0, y, 0);
		return this;
	}

	translateZ(z: number): Builder {
		if (this._position) this._position.z += z;
		else this._position = new Vector3(0, 0, z);

		return this;
	}

	rotate(x?: number, y?: number, z?: number, variation?: Variation): Builder {
		if (x === undefined) return this;
		const rotation = new Vector3(x ?? 0, y ?? 0, z ?? 0);

		this._rotation = this._rotation
			? this._rotation.add(rotation)
			: rotation;
		if (variation)
			if (this._rotationVariation)
				this._rotationVariation.push(variation);
			else this._rotationVariation = [variation];

		return this;
	}

	rotateX(x: number): Builder {
		if (this._rotation) this._rotation.x += x;
		else this._rotation = new Vector3(x, 0, 0);

		return this;
	}

	rotateY(y: number): Builder {
		if (this._rotation) this._rotation.y += y;
		else this._rotation = new Vector3(0, y, 0);

		return this;
	}

	rotateZ(z: number): Builder {
		if (this._rotation) this._rotation.z += z;
		else this._rotation = new Vector3(0, 0, z);

		return this;
	}

	scale(x: number, y: number, z: number, variation?: Variation): Builder {
		const scale = new Vector3(x, y, z);

		if (this._scale) this._scale.multiply(scale);
		else this._scale = scale;

		if (variation)
			if (this._scaleVariation) this._scaleVariation.push(variation);
			else this._scaleVariation = [variation];

		return this;
	}

	scaleX(x: number): Builder {
		if (this._scale) this._scale.x += x;
		else this._scale = new Vector3(x, 0, 0);

		return this;
	}

	scaleY(y: number): Builder {
		if (this._scale) this._scale.y += y;
		else this._scale = new Vector3(0, y, 0);

		return this;
	}

	scaleZ(z: number): Builder {
		if (this._scale) this._scale.z += z;
		else this._scale = new Vector3(0, 0, z);

		return this;
	}

	// Some random translation, rotation, and blurring
	randomize(
		props:
			| {
					color: Variation;
					position: Variation;
					rotation: Variation;
					scale: Variation;
					blur: number;
			  }
			| number = {
			color: Randomizer.flatSpreader(1 / 24),
			position: Randomizer.percentSpreader(),
			rotation: Randomizer.flatSpreader(),
			scale: Randomizer.percentSpreader(),
			blur: 0.01,
		},
	): Builder {
		let color, position, rotation, scale, blur;
		if (typeof props === "number") {
			color = Randomizer.flatSpreader((1 / 24) * props);
			position = Randomizer.percentSpreader((1 / 32) * props);
			rotation = Randomizer.flatSpreader((1 / 16) * props);
			blur = 0.01 * props;
		} else ({ color, position, rotation, scale, blur } = props);

		if (color) {
			if (typeof color === "number")
				color = Randomizer.flatSpreader(color);
			if (this._colorVariation) this._colorVariation.push(color);
			else this._colorVariation = [color];
		}

		if (position) {
			if (typeof position === "number")
				position = Randomizer.percentSpreader(position);
			if (this._positionVariation) this._positionVariation.push(position);
			else this._positionVariation = [position];
		}

		if (rotation) {
			if (typeof rotation === "number")
				rotation = Randomizer.flatSpreader(rotation);
			if (this._rotationVariation) this._rotationVariation.push(rotation);
			else this._rotationVariation = [rotation];
		}

		if (scale) {
			if (typeof scale === "number")
				scale = Randomizer.percentSpreader(scale);
			if (this._scaleVariation) this._scaleVariation.push(scale);
			else this._scaleVariation = [scale];
		}

		return this.blur(blur);
	}

	blur(degree = 0.01): Builder {
		this._blur = (this._blur || 0) + degree;
		return this;
	}

	// Finalizers

	repeat(
		count: number,
		fn: (
			builder: Builder,
			left: number,
			right: number,
			mid: number,
			index: number,
			count: number,
		) => void,
	): Builder {
		const mid = (count - 1) / 2;

		for (let i = 0; i < count; i++)
			fn(this, i - mid, mid - Math.abs(i - mid), mid, i, count);

		return this;
	}

	for(
		count: number,
		fn: (
			builder: Builder,
			index: number,
			count: number,
			left: number,
			right: number,
			mid: number,
		) => void,
	): Builder {
		const mid = (count - 1) / 2;

		for (let i = 0; i < count; i++)
			fn(this, i, count, i - mid, mid - Math.abs(i - mid), mid);

		return this;
	}

	do(fn: (builder: Builder) => void): Builder {
		fn(this);
		return this;
	}

	map(
		fn: (
			builder: Builder,
			leftOrIndex: number,
			rightOrLength: number,
			midOrLeft: number,
			indexOfRight: number,
			lengthOrMid: number,
		) => void,
		centered = true,
	): Builder {
		const mid = (this.children.length - 1) / 2;

		if (centered)
			for (let i = 0; i < this.children.length; i++)
				fn(
					this.children[i],
					i - mid,
					mid - Math.abs(i - mid),
					mid,
					i,
					this.children.length,
				);
		else
			for (let i = 0; i < this.children.length; i++)
				fn(
					this.children[i],
					i,
					this.children.length,
					i - mid,
					mid - Math.abs(i - mid),
					mid,
				);

		return this;
	}

	add(builder: Builder): Builder {
		this.children.push(builder);
		return this;
	}

	root(): Builder {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let cur: Builder = this;
		while (cur.parent) cur = cur.parent;

		return cur;
	}

	geometry(): Geometry {
		const geometry = this._geometry
			? this._geometry.clone()
			: new Geometry();

		for (let i = 0; i < this.children.length; i++)
			geometry.merge(this.children[i].geometry());

		if (this._color)
			Randomizer.colorize(
				geometry,
				this._color,
				compose(this._colorVariation) ?? IDENTITY,
			);

		if (this._rotation || this._rotationVariation)
			Randomizer.rotate(
				geometry,
				this._rotation ?? new Vector3(0, 0, 0),
				compose(this._rotationVariation) ?? IDENTITY,
			);

		if (this._position || this._positionVariation)
			Randomizer.translate(
				geometry,
				this._position,
				compose(this._positionVariation) ?? IDENTITY,
			);

		if (this._scale || this._scaleVariation)
			Randomizer.scale(
				geometry,
				this._scale ?? new Vector3(1, 1, 1),
				compose(this._scaleVariation) ?? IDENTITY,
			);

		if (this._blur) Randomizer.blur(geometry, this._blur);

		return geometry;
	}

	buffer(): BufferGeometry {
		return new BufferGeometry().fromGeometry(this.geometry());
	}

	mesh(): Mesh {
		return new Mesh(this.buffer(), faceColorMaterial);
	}
}
