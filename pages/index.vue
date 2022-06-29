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
    const ITEM_OFFSET = -0.1;
    const TUBE_OFFSET = -0.5;
    const LIGHT_INTENSITY = 1000;

    const geometryLength = ITEMS_COUNT * ITEM_SPACE + Math.abs(ITEM_OFFSET);

    const scene = new THREE.Scene();

    // const fog = new THREE.Fog(0x000000, geometryLength - ITEM_OFFSET, geometryLength);
    // scene.fog = fog;

    // const textureLoader = new THREE.TextureLoader();
    // const gridTexture = textureLoader.load(TEXTURE_PATH);

    const geometry = new THREE.CylinderGeometry(0.1, 0.1, geometryLength, 4, 1, true);
    const material = new THREE.MeshStandardMaterial({
      side: THREE.BackSide,
      color: 0x000000,
      // map: gridTexture,
    });

    const tube1 = new THREE.Mesh(geometry, material);
    tube1.rotation.x = Math.PI / 2;
    tube1.rotation.y = Math.PI / 4;
    tube1.position.z = -TUBE_OFFSET;
    scene.add(tube1);

    const tube2 = new THREE.Mesh(geometry, material);
    tube2.rotation.x = Math.PI / 2;
    tube2.rotation.y = Math.PI / 4;
    tube2.position.z = -TUBE_OFFSET - geometryLength;
    scene.add(tube2);

    // const ambientLight = new THREE.AmbientLight(0xffffff, 10);
    // scene.add(ambientLight);

    RectAreaLightUniformsLib.init();

    const rectLights: any[] = [];
    const cases: any[] = [];

    const HALF_TUBE = 0.07;

    for (let i = 0; i < ITEMS_COUNT; i += 1) {
      // remember for an also interesting light effect
      // rectLight1.position.x = -HALF_TUBE;

      const rectLight1 = new THREE.RectAreaLight(0xffffff, LIGHT_INTENSITY - (Math.min(i, 2) * LIGHT_INTENSITY / 2), 0.005, 0.125);
      rectLight1.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      rectLight1.position.x = i % 2 === 0 ? HALF_TUBE : -HALF_TUBE;
      rectLight1.position.z = ITEM_OFFSET - (i * ITEM_SPACE);
      scene.add(rectLight1);
      scene.add(new RectAreaLightHelper(rectLight1));
      rectLights.push(rectLight1);

      const rectLight2 = new THREE.RectAreaLight(0xffffff, 0, 0.005, 0.125);
      rectLight2.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      rectLight2.position.x = i % 2 === 0 ? HALF_TUBE : -HALF_TUBE;
      rectLight2.position.z = ITEM_OFFSET - (i * ITEM_SPACE) - geometryLength;
      scene.add(rectLight2);
      scene.add(new RectAreaLightHelper(rectLight2));
      rectLights.push(rectLight2);

      const caseGeometry = new THREE.PlaneGeometry(0.08, 0.08, 1, 1);
      const caseMaterial = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x00ff00 : 0x00ffbf,
      });

      const case1 = new THREE.Mesh(caseGeometry, caseMaterial);
      case1.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      case1.position.x = i % 2 === 0 ? -HALF_TUBE : HALF_TUBE;
      case1.position.z = ITEM_OFFSET - (i * ITEM_SPACE);
      scene.add(case1);
      cases.push(case1);

      const case2 = new THREE.Mesh(caseGeometry, caseMaterial);
      case2.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      case2.position.x = i % 2 === 0 ? -HALF_TUBE : HALF_TUBE;
      case2.position.z = ITEM_OFFSET - (i * ITEM_SPACE);
      scene.add(case2);
      cases.push(case2);
    }

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.01, LIGHT_INTENSITY);

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

      const speed = 0.05;

      tube1.position.z = (elapsedTime * speed) % geometryLength;
      tube2.position.z = ((elapsedTime * speed) % geometryLength) - geometryLength;

      for (let i = 0; i < ITEMS_COUNT * 2; i += 2) {
        rectLights[i].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE);
        rectLights[i].intensity = LIGHT_INTENSITY + rectLights[i].position.z * 1.5 * LIGHT_INTENSITY;
        cases[i].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE);

        rectLights[i + 1].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE) - geometryLength;
        rectLights[i + 1].intensity = LIGHT_INTENSITY + rectLights[i + 1].position.z * 1.5 * LIGHT_INTENSITY;
        cases[i + 1].position.z = ITEM_OFFSET + ((elapsedTime * speed) % geometryLength) - (i / 2 * ITEM_SPACE) - geometryLength;

        const range = 0.75;
        const currentCase = cases[i];
        const duplicatedCase = cases[i + 1];
        if (currentCase.position.z > 0 && currentCase.position.z < range || duplicatedCase.position.z > 0 && duplicatedCase.position.z < range) {
          const casePositionZ = currentCase.position.z < range ? currentCase.position.z - (range / 2) : duplicatedCase.position.z - (range / 2);

          if (i % 4 === 0) {
            // turn camera to left (Math.PI / 2)
            camera.rotation.y = Math.max(Math.PI / 4 - Math.abs(casePositionZ * (1 / (range / 2))), 0);
            // move camera to the right (only works because HALF_TUBE and range fit kind of together)
            camera.position.x = Math.max(HALF_TUBE - Math.abs(casePositionZ * 0.2 * (1 / (range))), 0);
          } else {
            // turn camera to right (-Math.PI / 2)
            camera.rotation.y = Math.min(-Math.PI / 4 + Math.abs(casePositionZ * (1 / (range / 2))), 0);
            // move camera to the left (only works because HALF_TUBE and range fit kind of together)
            camera.position.x = Math.min(-HALF_TUBE + Math.abs(casePositionZ * 0.2 * (1 / (range))), 0);
          }
        }
      }

      // controls.update();

      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };

    render(0);
  }
})
</script>
