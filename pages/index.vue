<template>
  <canvas id="canvas"></canvas>
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

    // const pane = new PANE.Pane();

    const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');

    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();

    // const fog = new THREE.Fog(0x000000, 1, 2.5);
    // scene.fog = fog;

    const textureLoader = new THREE.TextureLoader();
    const gridTexture = textureLoader.load(TEXTURE_PATH);

    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 4, 1, true);
    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      map: gridTexture,
    });
    const plane = new THREE.Mesh(geometry, material);
    const plane2 = new THREE.Mesh(geometry, material);

    plane.rotation.x = Math.PI / 2;
    plane.rotation.y = Math.PI / 4;
    plane.position.z = -0.5;

    plane2.rotation.x = Math.PI / 2;
    plane2.rotation.y = Math.PI / 4;
    plane2.position.z = -1.5;

    // const planeSettings = pane.addFolder({title: 'plane settings'});
    // planeSettings.addInput(plane.rotation, 'x', {min: Math.PI / 4, max: Math.PI / 1});
    // planeSettings.addInput(plane.rotation, 'y', {min: Math.PI / 4, max: Math.PI / 1});

    // const plane2Settings = pane.addFolder({title: 'plane2 settings'});
    // plane2Settings.addInput(plane2.rotation, 'x', {min: Math.PI / 4, max: Math.PI / 1});
    // plane2Settings.addInput(plane2.rotation, 'y', {min: Math.PI / 4, max: Math.PI / 1});

    scene.add(plane);
    scene.add(plane2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 10);
    scene.add(ambientLight);

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.01, 1000);

    camera.position.y = -0.03;
    camera.position.z = 0.5;

    // const cameraSettings = pane.addFolder({title: 'camera settings'});
    // cameraSettings.addInput(camera.position, 'y', {min: -1, max: 1});
    // cameraSettings.addInput(camera.position, 'z', {min: 0, max: 2});

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    // controls.enableZoom = false;

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

      plane.position.z = (elapsedTime * 0.1) % 1;
      plane2.position.z = ((elapsedTime * 0.1) % 1) - 1;

      controls.update();

      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };

    render();
  }
})
</script>
