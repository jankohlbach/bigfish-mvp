<template>
  <div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'IndexPage',

  async mounted() {
    const THREE = await import('three');
    const {OrbitControls} = await import('three/examples/jsm/controls/OrbitControls.js');
    // const PANE = await import('tweakpane');

    const TEXTURE_PATH = "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657168/blog/vaporwave-threejs-textures/grid.png";
    const DISPLACEMENT_PATH = "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657200/blog/vaporwave-threejs-textures/displacement.png";

    // const pane = new PANE.Pane();

    const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');

    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();

    const fog = new THREE.Fog(0x000000, 1, 2.5);
    scene.fog = fog;

    const textureLoader = new THREE.TextureLoader();
    const gridTexture = textureLoader.load(TEXTURE_PATH);
    const terrainTexture = textureLoader.load(DISPLACEMENT_PATH);

    const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
    const material = new THREE.MeshStandardMaterial({
      map: gridTexture,
      displacementMap: terrainTexture,
      displacementScale: 0.4,
    });
    const plane = new THREE.Mesh(geometry, material);
    const plane2 = new THREE.Mesh(geometry, material);

    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = 0;
    plane.position.z = 0.15;

    plane2.rotation.x = -Math.PI * 0.5;
    plane2.position.y = 0;
    plane2.position.z = -1.85;

    // const planeSettings = pane.addFolder({title: 'plane settings'});
    // planeSettings.addInput(plane.rotation, 'x', {min: -Math.PI * 0.8, max: -Math.PI * 0.2});
    // planeSettings.addInput(plane.position, 'y', {min: -1, max: 1});
    // planeSettings.addInput(plane.position, 'z', {min: -1, max: 1});

    scene.add(plane);
    scene.add(plane2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 10);
    scene.add(ambientLight);

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 20);

    camera.position.x = 0;
    camera.position.y = 0.06;
    camera.position.z = 1.1;

    // const cameraSettings = pane.addFolder({title: 'camera settings'});
    // cameraSettings.addInput(camera.position, 'x', {min: -1, max: 1});
    // cameraSettings.addInput(camera.position, 'y', {min: -1, max: 1});
    // cameraSettings.addInput(camera.position, 'z', {min: 0, max: 2});

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enableZoom = false;

    const renderer = new THREE.WebGLRenderer({canvas});

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.addEventListener('resite', () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const clock = new THREE.Clock();

    const render = () => {
      const elapsedTime = clock.getElapsedTime();

      plane.position.z = (elapsedTime * 0.15) % 2;
      plane2.position.z = ((elapsedTime * 0.15) % 2) - 2;

      controls.update();

      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };

    render();
  }
})
</script>
