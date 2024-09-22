import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as _ from "lodash"

// const _ = require("lodash")

const inputElement = document.getElementById("input");

let reader = new FileReader()

inputElement.addEventListener("change", handleFiles, false);

let cube = []
let isFile = false
let separateLines

function handleFiles() {
	const fileList = this.files;
	console.log(fileList[0])
	reader.readAsText(fileList[0])
	reader.onload = function() {
		isFile = true
		separateLines = reader.result.split(/\r?\n|\r|\n/g)
		console.log(separateLines);
		console.log(separateLines[1].length)
	};
}

let camera, controls, scene, renderer;

let cubeSize = 5
let spacing = 10

init();
//render(); // remove when using animation loop

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xcccccc);
	// scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(400, 200, 0);

	// controls

	controls = new OrbitControls(camera, renderer.domElement);
	controls.listenToKeyEvents(window); // optional

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 100;
	controls.maxDistance = 500;

	controls.maxPolarAngle = Math.PI / 2;

	// world

	const points = [];
	points.push( new THREE.Vector3( 0, 0, 0 ) );
	points.push( new THREE.Vector3( 0, 100, 0 ) );

	const geometry2 = new THREE.BufferGeometry().setFromPoints( points );
	const material2 = new THREE.LineBasicMaterial( { color: 0x0000ff } );

	const line = new THREE.Line( geometry2, material2 );

	scene.add( line );

	// const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
	const geometry = new THREE.SphereGeometry(cubeSize/2)
	// const material = new THREE.MeshPhongMaterial({
	// 	color: 0x00ff00,
	// 	flatShading: true,
	// });

	// for ( let i = 0; i < 500; i ++ ) {

	// 	const mesh = new THREE.Mesh( geometry, material );
	// 	mesh.position.x = Math.random() * 1600 - 800;
	// 	mesh.position.y = 0;
	// 	mesh.position.z = Math.random() * 1600 - 800;
	// 	mesh.updateMatrix();
	// 	mesh.matrixAutoUpdate = false;
	// 	scene.add( mesh );

	// }

	for (let x = 0; x < 16; x++) {
		let floor = []
		for (let y = 0; y < 16; y++) {
			let row = []
			for (let z = 0; z < 16; z++) {
				const material = new THREE.MeshPhongMaterial({
					color: new THREE.Color( x / 16, y / 16, z / 16 ),
					flatShading: true,
				});
				const mesh = new THREE.Mesh( geometry, material );
				mesh.position.x = x * spacing - (7,5 * cubeSize + 6 * spacing);
				mesh.position.y = y * spacing - 10;
				mesh.position.z = z * spacing - (7,5 * cubeSize + 6 * spacing);
				mesh.updateMatrix();
				mesh.matrixAutoUpdate = false;
				scene.add( mesh );
				row.push(mesh)
			}
			// console.log(row.length)
			floor.push(row)
		}
		// console.log(floor.length)
		cube.push(floor)
	}
	// console.log(cube)

	// lights

	const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
	dirLight1.position.set(1, 1, 1);
	scene.add(dirLight1);

	const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
	dirLight2.position.set(-1, -1, -1);
	scene.add(dirLight2);

	const ambientLight = new THREE.AmbientLight(0x555555);
	scene.add(ambientLight);

	//

	window.addEventListener("resize", onWindowResize);
}

const throttleFunction = (func, delay) => {

	// Previously called time of the function
	let prev = 0;
	return (...args) => {
		// Current called time of the function
		let now = new Date().getTime();

		// Logging the difference
		// between previously 
		// called and current called timings
		console.log(now - prev, delay);

		// If difference is greater
		// than delay call
		// the function again.
		if (now - prev > delay) {
			prev = now;

			// "..." is the spread
			// operator here 
			// returning the function with the 
			// array of arguments
			return func(...args);
		}
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	

	render();
}

function updateCube() {
	let colors = separateLines[1]
	// let colors = "123456654321123456654321"
	let char = 0

	for (const floor in cube) {
		for (const row in cube[floor]) {
			for (const node in cube[floor][row]) {
				let i = parseInt(floor) * 256 + parseInt(row) * 16 + parseInt(node)
				console.log("i val: " + i)
				cube[floor][row][node].material.setValues({
					color: parseInt("0x" + colors.substring(i,i+6))
				})
				// console.log(node)
			}
		}
	}
	console.log("New frame")
}

function render() {
	if (isFile) {
		throttleFunction(updateCube(), 1000)
		// _.throttle(updateCube, 100)
		// updateCube()
	}

	renderer.render(scene, camera);
}

