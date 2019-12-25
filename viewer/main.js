
import scene from "./scene.js";

if ( ! location.hash ) location.hash = "Barn"; // something

const path = `../src/meshes/${location.hash.slice( 1 )}.mjs`;
import( path ).then( async i => {

	const klass = window.klass = i.default;
	const obj = new klass();
	obj.update = () => obj.rotation.z += 0.01;
	scene.add( obj );

} );
