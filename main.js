import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

const inputElement = document.getElementById("input")

let reader = new FileReader()

inputElement.addEventListener("change", handleFiles, false)

let cube = []
let isFile = false
let separateLines
let maxFrames
let loopCount

function handleFiles() {
    const fileList = this.files
    console.log(fileList[0])
    reader.readAsText(fileList[0])
    reader.onload = function () {
        isFile = true
        separateLines = reader.result.split(/\r?\n|\r|\n/g)
        console.log(separateLines)
        console.log(separateLines[1].length)

        let data = separateLines[0]
        let lastX = data.lastIndexOf("x")
        loopCount = data.substring(lastX + 1)
        if (separateLines[1].length == 4096 * 6) staticCube()

        let tmp = data
        for (let i = 0; i < 2; i++) {
            tmp = tmp.substring(0, tmp.lastIndexOf("x"))
        }
        maxFrames = tmp.substring(tmp.lastIndexOf("x") + 1, tmp.length)
    }
}

let camera, controls, scene, renderer

let cubeSize = 5
let spacing = 10

init()
//render(); // remove when using animation loop

function init() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xcccccc)
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setAnimationLoop(animate)
    document.body.appendChild(renderer.domElement)

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
    )
    camera.position.set(400, 200, 0)

    // controls

    controls = new OrbitControls(camera, renderer.domElement)
    controls.listenToKeyEvents(window) // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05

    controls.screenSpacePanning = false

    controls.minDistance = 100
    controls.maxDistance = 500

    controls.maxPolarAngle = Math.PI / 2

    // world

    const points = []
    points.push(new THREE.Vector3(0, 0, 0))
    points.push(new THREE.Vector3(0, 100, 0))

    const geometry2 = new THREE.BufferGeometry().setFromPoints(points)
    const material2 = new THREE.LineBasicMaterial({ color: 0x0000ff })

    const line = new THREE.Line(geometry2, material2)

    scene.add(line)

    const geometry = new THREE.SphereGeometry(cubeSize / 2)

    for (let x = 0; x < 16; x++) {
        let floor = []
        for (let y = 0; y < 16; y++) {
            let row = []
            for (let z = 0; z < 16; z++) {
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(x / 16, y / 16, z / 16),
                    flatShading: true,
                })
                const mesh = new THREE.Mesh(geometry, material)
                mesh.position.x = x * spacing - (7, 5 * cubeSize + 6 * spacing)
                mesh.position.y = y * spacing - 10
                mesh.position.z = z * spacing - (7, 5 * cubeSize + 6 * spacing)
                mesh.name = "Cube" + x + "-" + y + "-" + z
                // mesh.updateMatrix()
                // mesh.matrixAutoUpdate = false
                scene.add(mesh)
                row.push(mesh)
            }
            floor.push(row)
        }
        cube.push(floor)
    }

    // lights

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3)
    dirLight1.position.set(1, 1, 1)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x002288, 3)
    dirLight2.position.set(-1, -1, -1)
    scene.add(dirLight2)

    const ambientLight = new THREE.AmbientLight(0x555555)
    scene.add(ambientLight)

    //

    window.addEventListener("resize", onWindowResize)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
    controls.update() // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render()
}

function staticCube() {
    let colors = separateLines[1]

    scene.traverse((obj) => {
        let a = obj.name
        let z = a.substring(a.lastIndexOf("-") + 1)
        let b = a.substring(0, a.lastIndexOf("-"))
        let y = b.substring(b.lastIndexOf("-") + 1)
        let c = b.substring(0, b.lastIndexOf("-"))
        let x = c.substring(c.lastIndexOf("e") + 1)

        if (obj.name.includes(`Cube${x}-${y}-${z}`)) {
            let i = parseInt(x) * 256 + parseInt(y) * 16 + parseInt(z)

            if (colors.substring(i * 6, i * 6 + 6) == "000000") {
                obj.material = new THREE.MeshPhongMaterial({
                    color: parseInt("0x" + colors.substring(i * 6, i * 6 + 6)),
                    flatShading: true,
                    transparent: true,
                    opacity: 0.4,
                })
            } else {
                obj.material = new THREE.MeshPhongMaterial({
                    color: parseInt("0x" + colors.substring(i * 6, i * 6 + 6)),
                    flatShading: true,
                })
            }
        }
    })
}

let frame = 0

function updateCube() {
    let colors = separateLines[1]

    scene.traverse((obj) => {
        let a = obj.name
        let z = a.substring(a.lastIndexOf("-") + 1)
        let b = a.substring(0, a.lastIndexOf("-"))
        let y = b.substring(b.lastIndexOf("-") + 1)
        let c = b.substring(0, b.lastIndexOf("-"))
        let x = c.substring(c.lastIndexOf("e") + 1)

        if (obj.name.includes(`Cube${x}-${y}-${z}`)) {
            let i = parseInt(x) * 256 + parseInt(y) * 16 + parseInt(z)
            let colorIndexFrom = i * 6 + frame * 4096 * 6
            let colorIndexTo = i * 6 + 6 + frame * 4096 * 6

            if (colors.substring(colorIndexFrom, colorIndexTo) == "000000") {
                obj.material = new THREE.MeshPhongMaterial({
                    color: parseInt(
                        "0x" + colors.substring(colorIndexFrom, colorIndexTo)
                    ),
                    flatShading: true,
                    transparent: true,
                    opacity: 0.4,
                })
            } else {
                obj.material = new THREE.MeshPhongMaterial({
                    color: parseInt(
                        "0x" + colors.substring(colorIndexFrom, colorIndexTo)
                    ),
                    flatShading: true,
                })
            }
        }
    })

    frame += 1
    if (frame >= maxFrames) frame = 0
}

let prev = 0
let delay = 50

function render() {
    if (isFile && separateLines[1].length != 4096 * 6) {
        let now = new Date().getTime()

        if (now - prev > delay) {
            prev = now

            updateCube()
        }
    }

    renderer.render(scene, camera)
}
