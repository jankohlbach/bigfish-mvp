<template>
  <canvas id="canvas"></canvas>
</template>

<script lang="ts">
import Vue from 'vue';
import normalizeWheel from 'normalize-wheel';
import * as THREE from 'three';
import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import {RectAreaLightUniformsLib} from'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

export default Vue.extend({
  name: 'IndexPage',

  data() {
    return ({
      ITEMS_COUNT: 4,
      ITEM_SPACE: 0.7,
      ITEM_OFFSET: -0.1,
      TUBE_OFFSET: -0.5,
      HALF_TUBE: 0.07,
      LIGHT_INTENSITY: 1000,
      geometryLength: 0,
      zPosition: {
        current: 0,
        target: 0,
      },
      speed: 0.001,
      canvas: null as HTMLCanvasElement | null,
      scene: null as unknown as THREE.Scene,
      camera: null as unknown as  THREE.PerspectiveCamera,
      renderer: null as unknown as  THREE.WebGLRenderer,
      tube1: null as unknown as THREE.Mesh,
      tube2: null as unknown as THREE.Mesh,
      rectLights: [] as THREE.RectAreaLight[],
      cases: [] as THREE.Mesh[],
      sizes: {
        width: 0,
        height: 0,
      },
    });
  },

  mounted() {
    this.initThree();
  },

  methods: {
    lerp(a: number, b: number, n: number) {
      return (1 - n) * a + n * b;
    },
    addWheelEvent() {
      window.addEventListener('wheel', (e) => {
        this.zPosition.target = this.zPosition.current + Math.abs(normalizeWheel(e).pixelY / 100);

        // TODO: check how to make reverse scrolling possible
        // if (this.zPosition.target >= this.zPosition.current) {
        //   this.speed = Math.abs(this.speed);
        // } else {
        //   this.speed = -Math.abs(this.speed);
        // }
      });
    },
    addResizeEvent() {
      window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    },
    initThree() {
      this.canvas = document.querySelector('#canvas');

      if (!this.canvas) {
        return;
      }

      this.scene = new THREE.Scene();

      this.geometryLength = this.ITEMS_COUNT * this.ITEM_SPACE + Math.abs(this.ITEM_OFFSET);

      this.makeTubes();
      this.makeLightsAndCases();
      this.makeCamera();
      this.makeRenderer();
      this.addResizeEvent();
      this.makeRenderLoop();
      this.addWheelEvent();
    },
    makeTubes() {
      const geometry = new THREE.CylinderGeometry(0.1, 0.1, this.geometryLength, 4, 1, true);
      const material = new THREE.MeshStandardMaterial({
        side: THREE.BackSide,
        color: 0x000000,
      });

      this.tube1 = new THREE.Mesh(geometry, material);
      this.tube1.rotation.x = Math.PI / 2;
      this.tube1.rotation.y = Math.PI / 4;
      this.tube1.position.z = -this.TUBE_OFFSET;
      this.scene.add(this.tube1);

      this.tube2 = new THREE.Mesh(geometry, material);
      this.tube2.rotation.x = Math.PI / 2;
      this.tube2.rotation.y = Math.PI / 4;
      this.tube2.position.z = -this.TUBE_OFFSET - this.geometryLength;
      this.scene.add(this.tube2);
    },
    makeLightsAndCases() {
      RectAreaLightUniformsLib.init();

      for (let i = 0; i < this.ITEMS_COUNT; i += 1) {
        const rectLight1 = new THREE.RectAreaLight(0xffffff, this.LIGHT_INTENSITY - (Math.min(i, 2) * this.LIGHT_INTENSITY / 2), 0.005, 0.125);
        rectLight1.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
        rectLight1.position.x = i % 2 === 0 ? this.HALF_TUBE : -this.HALF_TUBE;
        rectLight1.position.z = this.ITEM_OFFSET - (i * this.ITEM_SPACE);
        this.scene.add(rectLight1);
        this.scene.add(new RectAreaLightHelper(rectLight1));
        this.rectLights.push(rectLight1);

        const rectLight2 = new THREE.RectAreaLight(0xffffff, 0, 0.005, 0.125);
        rectLight2.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
        rectLight2.position.x = i % 2 === 0 ? this.HALF_TUBE : -this.HALF_TUBE;
        rectLight2.position.z = this.ITEM_OFFSET - (i * this.ITEM_SPACE) - this.geometryLength;
        this.scene.add(rectLight2);
        this.scene.add(new RectAreaLightHelper(rectLight2));
        this.rectLights.push(rectLight2);

        const caseGeometry = new THREE.PlaneGeometry(0.08, 0.08, 1, 1);
        const caseMaterial = new THREE.MeshStandardMaterial({
          color: i === 0 ? 0x00ff00 : 0x00ffbf,
        });

        const case1 = new THREE.Mesh(caseGeometry, caseMaterial);
        case1.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
        case1.position.x = i % 2 === 0 ? -this.HALF_TUBE : this.HALF_TUBE;
        case1.position.z = this.ITEM_OFFSET - (i * this.ITEM_SPACE);
        this.scene.add(case1);
        this.cases.push(case1);

        const case2 = new THREE.Mesh(caseGeometry, caseMaterial);
        case2.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
        case2.position.x = i % 2 === 0 ? -this.HALF_TUBE : this.HALF_TUBE;
        case2.position.z = this.ITEM_OFFSET - (i * this.ITEM_SPACE) - this.geometryLength;
        this.scene.add(case2);
        this.cases.push(case2);
      }
    },
    makeCamera() {
      this.sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      this.camera = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.01, this.LIGHT_INTENSITY);
      this.camera.position.z = 0.45;
    },
    makeRenderer() {
      this.renderer = new THREE.WebGLRenderer({canvas: this.canvas as HTMLCanvasElement});
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    makeRenderLoop() {
      const render = () => {
        this.zPosition.target += this.speed;

        this.zPosition.current = this.lerp(this.zPosition.current, this.zPosition.target, 0.05);

        this.tube1.position.z = this.zPosition.current % this.geometryLength;
        if (this.speed >= 0) {
          this.tube2.position.z = (this.zPosition.current % this.geometryLength) - this.geometryLength;
        } else {
          this.tube2.position.z = (this.zPosition.current % this.geometryLength) + this.geometryLength;
        }

        for (let i = 0; i < this.ITEMS_COUNT * 2; i += 2) {
          this.cases[i].position.z = this.ITEM_OFFSET + (this.zPosition.current % this.geometryLength) - (i / 2 * this.ITEM_SPACE);
          this.rectLights[i].position.z = this.ITEM_OFFSET + (this.zPosition.current % this.geometryLength) - (i / 2 * this.ITEM_SPACE);
          this.rectLights[i].intensity = this.LIGHT_INTENSITY + this.rectLights[i].position.z * 1.5 * this.LIGHT_INTENSITY;

          if (this.speed >= 0) {
            this.cases[i + 1].position.z = this.ITEM_OFFSET + (this.zPosition.current % this.geometryLength) - (i / 2 * this.ITEM_SPACE) - this.geometryLength;
            this.rectLights[i + 1].position.z = this.ITEM_OFFSET + (this.zPosition.current % this.geometryLength) - (i / 2 * this.ITEM_SPACE) - this.geometryLength;
          } else {
            this.cases[i + 1].position.z = this.ITEM_OFFSET + (this.zPosition.current % this.geometryLength) - (i / 2 * this.ITEM_SPACE) + this.geometryLength;
            this.rectLights[i + 1].position.z = this.ITEM_OFFSET + (this.zPosition.current % this.geometryLength) - (i / 2 * this.ITEM_SPACE) + this.geometryLength;
          }
          this.rectLights[i + 1].intensity = this.LIGHT_INTENSITY + this.rectLights[i + 1].position.z * 1.5 * this.LIGHT_INTENSITY;

          const range = 0.75;
          const currentCase = this.cases[i];
          const duplicatedCase = this.cases[i + 1];
          if (currentCase.position.z > 0 && currentCase.position.z < range || duplicatedCase.position.z > 0 && duplicatedCase.position.z < range) {
            let casePositionZ = 0;

            if (this.speed >= 0) {
              casePositionZ = currentCase.position.z < range ? currentCase.position.z - (range / 2.5) : duplicatedCase.position.z - (range / 2.5);
            } else {
              casePositionZ = currentCase.position.z < range ? duplicatedCase.position.z - (range / 2.5) : currentCase.position.z - (range / 2.5);
            }

            if (i % 4 === 0) {
              // turn camera to left (Math.PI / 2)
              this.camera.rotation.y = Math.max(Math.PI / 4 - Math.abs(casePositionZ * (1 / (range / 2))), 0);
              // move camera to the right (only works because HALF_TUBE and range fit kind of together)
              this.camera.position.x = Math.max(this.HALF_TUBE - Math.abs(casePositionZ * 0.2 * (1 / (range))), 0);
            } else {
              // turn camera to right (-Math.PI / 2)
              this.camera.rotation.y = Math.min(-Math.PI / 4 + Math.abs(casePositionZ * (1 / (range / 2))), 0);
              // move camera to the left (only works because HALF_TUBE and range fit kind of together)
              this.camera.position.x = Math.min(-this.HALF_TUBE + Math.abs(casePositionZ * 0.2 * (1 / (range))), 0);
            }
          }
        }

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(render);
      };

      render();
    },
  },
})
</script>
