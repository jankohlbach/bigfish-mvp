<template>
  <canvas id="canvas"></canvas>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'IndexPage',

  async mounted() {
    const THREE = await import('three');
    const {RectAreaLightHelper} = await import('three/examples/jsm/helpers/RectAreaLightHelper.js');
		const {RectAreaLightUniformsLib} = await import('three/examples/jsm/lights/RectAreaLightUniformsLib.js');
    // const {OrbitControls} = await import('three/examples/jsm/controls/OrbitControls.js');
    // const PANE = await import('tweakpane');

    // const TEXTURE_PATH = "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657168/blog/vaporwave-threejs-textures/grid.png";

    // const pane = new PANE.Pane();
    // const planeSettings = pane.addFolder({title: 'plane settings'});
    // planeSettings.addInput(plane.rotation, 'x', {min: Math.PI / 4, max: Math.PI / 1});

    const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');

    if (!canvas) {
      return;
    }

    const ITEMS_COUNT = 4;
    const ITEM_SPACE = 0.7;
    const ITEM_OFFSET = 0.2;
    const PLANE_OFFSET = -0.5;
    const LIGHT_INTENSITY = 1000;

    const geometryLength = ITEMS_COUNT * ITEM_SPACE;

    const scene = new THREE.Scene();

    const fog = new THREE.Fog(0x000000, geometryLength - ITEM_OFFSET, geometryLength);
    scene.fog = fog;

    // const textureLoader = new THREE.TextureLoader();
    // const gridTexture = textureLoader.load(TEXTURE_PATH);

    const geometry = new THREE.CylinderGeometry(0.1, 0.1, geometryLength, 4, 1, true);
    const material = new THREE.MeshStandardMaterial({
      side: THREE.BackSide,
      color: 0x000000,
      // map: gridTexture,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    plane.rotation.y = Math.PI / 4;
    plane.position.z = -PLANE_OFFSET;
    scene.add(plane);

    const plane2 = new THREE.Mesh(geometry, material);
    plane2.rotation.x = Math.PI / 2;
    plane2.rotation.y = Math.PI / 4;
    plane2.position.z = -PLANE_OFFSET - geometryLength;
    scene.add(plane2);

    // const ambientLight = new THREE.AmbientLight(0xffffff, 10);
    // scene.add(ambientLight);

    RectAreaLightUniformsLib.init();

    const rectLights: any[] = [];
    const cases: any[] = [];

    for (let i = 0; i < ITEMS_COUNT; i += 1) {
      // remember for an also interesting light effect
      // rectLight1.position.x = -0.07;

      const rectLight1 = new THREE.RectAreaLight(0xffffff, LIGHT_INTENSITY - (Math.min(i, 2) * LIGHT_INTENSITY / 2), 0.005, 0.125);
      rectLight1.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      rectLight1.position.x = i % 2 === 0 ? 0.07 : -0.07;
      rectLight1.position.z = ITEM_OFFSET - (i * ITEM_SPACE);
      scene.add(rectLight1);
      scene.add(new RectAreaLightHelper(rectLight1));
      rectLights.push(rectLight1);

      const rectLight2 = new THREE.RectAreaLight(0xffffff, 0, 0.005, 0.125);
      rectLight2.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      rectLight2.position.x = i % 2 === 0 ? 0.07 : -0.07;
      rectLight2.position.z = ITEM_OFFSET - (i * ITEM_SPACE) - geometryLength;
      scene.add(rectLight2);
      scene.add(new RectAreaLightHelper(rectLight2));
      rectLights.push(rectLight2);

      const caseGeometry = new THREE.PlaneGeometry(0.08, 0.08, 1, 1);
      const caseMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffbf,
      });

      const case1 = new THREE.Mesh(caseGeometry, caseMaterial);
      case1.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      case1.position.x = i % 2 === 0 ? -0.07 : 0.07;
      case1.position.z = ITEM_OFFSET - (i * ITEM_SPACE);
      scene.add(case1);
      cases.push(case1);

      const case2 = new THREE.Mesh(caseGeometry, caseMaterial);
      case2.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      case2.position.x = i % 2 === 0 ? -0.07 : 0.07;
      case2.position.z = ITEM_OFFSET - (i * ITEM_SPACE);
      scene.add(case2);
      cases.push(case2);
    }

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.01, LIGHT_INTENSITY);

    camera.position.y = -0.03;
    camera.position.z = 0.45;

    // const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;
    // controls.enableZoom = false;

    const renderer = new THREE.WebGLRenderer({canvas});

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.addEventListener('resize', () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const render = (ts: number) => {
      const elapsedTime = ts / 1000;

      const speed = 0.15;

      plane.position.z = (elapsedTime * speed) % geometryLength;
      plane2.position.z = ((elapsedTime * speed) % geometryLength) - geometryLength;

      for (let i = 0; i < ITEMS_COUNT * 2; i += 2) {
        rectLights[i].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE);
        rectLights[i].intensity = LIGHT_INTENSITY + rectLights[i].position.z * 1.5 * LIGHT_INTENSITY;
        cases[i].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE);

        rectLights[i + 1].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE) - geometryLength;
        rectLights[i + 1].intensity = LIGHT_INTENSITY + rectLights[i + 1].position.z * 1.5 * LIGHT_INTENSITY;
        cases[i + 1].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE) - geometryLength;
      }

      // controls.update();

      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };

    render(0);
  }
})
</script>
