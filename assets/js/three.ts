import * as THREE from 'three'

export const createThree = () => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer()

  camera.position.z = 100

  const geometry = new THREE.BoxGeometry(20, 20, 20)
  const material = new THREE.MeshNormalMaterial()
  const cube = new THREE.Mesh(geometry, material)

  scene.add(cube)

  const light = new THREE.PointLight(0xffff00)

  light.position.set(10, 0, 25)
  scene.add(light)

  renderer.setSize(window.innerWidth, window.innerHeight)
  document.querySelector('#scene')?.appendChild(renderer.domElement)

  const render = () => {
    requestAnimationFrame(render)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera)
  }

  render()
}
