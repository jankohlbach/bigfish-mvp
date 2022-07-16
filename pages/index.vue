<template>
  <canvas id="canvas"></canvas>
</template>

<script lang="ts">
import Vue from 'vue';
import normalizeWheel from 'normalize-wheel';
import * as THREE from 'three';
import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import {RectAreaLightUniformsLib} from'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export default Vue.extend({
  name: 'IndexPage',

  data() {
    return ({
      ITEMS_COUNT: 4,
      ITEM_SPACE: 0.7,
      ITEM_OFFSET: 0.3,
      TUBE_OFFSET: 0.2,
      CAMERA_OFFSET: 0.2,
      HALF_TUBE: 0.07,
      LIGHT_INTENSITY: 1000,
      geometryLength: 0,
      touch: {
        start: 0,
      },
      scroll: {
        current: 1,
        target: 1,
        base: 1,
      },
      speed: 0.0008,
      isTouchDown: false,
      canvas: null as HTMLCanvasElement | null,
      scene: null as unknown as THREE.Scene,
      camera: null as unknown as  THREE.PerspectiveCamera,
      renderer: null as unknown as  THREE.WebGLRenderer,
      tube: null as unknown as THREE.Mesh,
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
        const normalized = normalizeWheel(e).pixelY;

        if (normalized > 0) {
          this.scroll.target = this.scroll.current + Math.max(normalizeWheel(e).pixelY / 100, 0.03);
        } else {
          this.scroll.target = this.scroll.current + Math.min(normalizeWheel(e).pixelY / 100, -0.03);
        }

        if (this.scroll.target > 0) {
          this.scroll.base = Math.abs(this.scroll.base);
        } else {
          this.scroll.base = -Math.abs(this.scroll.base);
        }
      });
    },
    addTouchEvent() {
      window.addEventListener('touchstart', (e) => {
        this.isTouchDown = true;
        this.touch.start = e.touches[0].clientY;
      });

      window.addEventListener('touchmove', (e) => {
        if (!this.isTouchDown) { return; }

        const y = e.touches[0].clientY;
        const distance = (this.touch.start - y) / 10;

        this.scroll.target = this.scroll.current + distance;

        if (this.scroll.target > 0) {
          this.scroll.base = Math.abs(this.scroll.base);
        } else {
          this.scroll.base = -Math.abs(this.scroll.base);
        }

        this.touch.start = y;
      });

      window.addEventListener('touchend', () => {
        this.isTouchDown = false;

        let raf: any;

        const lerpBack = () => {
          this.scroll.target = this.lerp(this.scroll.target, this.scroll.base, 0.05);

          raf = window.requestAnimationFrame(lerpBack);
        };

        lerpBack();

        setTimeout(() => {
          cancelAnimationFrame(raf);
        }, 1000);
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

      this.geometryLength = this.TUBE_OFFSET + this.ITEM_OFFSET + this.ITEMS_COUNT * this.ITEM_SPACE;

      this.makeTube();
      this.makeLightsAndCases();
      this.makeCamera();
      this.makeRenderer();
      this.addResizeEvent();
      this.makeRenderLoop();
      this.addWheelEvent();
      this.addTouchEvent();
    },
    makeTube() {
      const geometry = new THREE.CylinderGeometry(0.1, 0.1, this.geometryLength, 4, 1, true);
      const material = new THREE.MeshStandardMaterial({
        side: THREE.BackSide,
        color: 0x000000,
      });

      this.tube = new THREE.Mesh(geometry, material);
      this.tube.rotation.x = Math.PI / 2;
      this.tube.rotation.y = Math.PI / 4;
      this.tube.position.z = -this.geometryLength / 2 + this.TUBE_OFFSET;
      this.scene.add(this.tube);
    },
    makeLightsAndCases() {
      RectAreaLightUniformsLib.init();

      for (let i = 0; i < this.ITEMS_COUNT; i += 1) {
        const rectLight = new THREE.RectAreaLight(0xffffff, this.LIGHT_INTENSITY - (Math.min(i, 2) * this.LIGHT_INTENSITY / 2), 0.005, 0.125);
        rectLight.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
        rectLight.position.x = i % 2 === 0 ? this.HALF_TUBE : -this.HALF_TUBE;
        rectLight.position.z = -this.ITEM_OFFSET - (i * this.ITEM_SPACE);
        this.scene.add(rectLight);
        this.scene.add(new RectAreaLightHelper(rectLight));
        this.rectLights.push(rectLight);

        const caseGeometry = new THREE.PlaneGeometry(0.08, 0.08, 1, 1);
        const caseMaterial = new THREE.MeshStandardMaterial({
          color: i === 0 ? 0x00ff00 : 0x00ffbf,
        });

        const newCase = new THREE.Mesh(caseGeometry, caseMaterial);
        newCase.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
        newCase.position.x = i % 2 === 0 ? -this.HALF_TUBE : this.HALF_TUBE;
        newCase.position.z = -this.ITEM_OFFSET - (i * this.ITEM_SPACE);
        this.scene.add(newCase);
        this.cases.push(newCase);
      }
    },
    makeCamera() {
      this.sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      this.camera = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.01, 1000);
      this.camera.position.z = this.CAMERA_OFFSET;
    },
    makeRenderer() {
      this.renderer = new THREE.WebGLRenderer({canvas: this.canvas as HTMLCanvasElement});
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    makeRenderLoop() {
      // const controls = new OrbitControls(this.camera, this.canvas as HTMLCanvasElement);
      // controls.enableDamping = true;
      // controls.enableZoom = false;

      const render = () => {
        for (let i = 0; i < this.ITEMS_COUNT; i += 1) {
          this.scroll.current = this.lerp(this.scroll.target, this.scroll.base, 0.2);

          this.cases[i].position.z += this.speed * this.scroll.current;
          this.rectLights[i].position.z += this.speed * this.scroll.current;

          if (this.scroll.base > 0 && this.cases[i].position.z > this.ITEM_OFFSET) {
            this.cases[i].position.z = this.cases[i].position.z - this.geometryLength + this.TUBE_OFFSET;
            this.rectLights[i].position.z = this.rectLights[i].position.z - this.geometryLength + this.TUBE_OFFSET;
          } else if (this.scroll.base < 0 && this.cases[i].position.z < -this.geometryLength + this.TUBE_OFFSET + this.ITEM_SPACE) {
            this.cases[i].position.z = this.cases[i].position.z + this.geometryLength - this.TUBE_OFFSET;
            this.rectLights[i].position.z = this.rectLights[i].position.z + this.geometryLength - this.TUBE_OFFSET;
          }

          this.rectLights[i].intensity = this.LIGHT_INTENSITY + this.rectLights[i].position.z * this.LIGHT_INTENSITY;

          const range = 0.2;
          const turn = Math.PI / 4;
          const currentCase = this.cases[i];
          if (currentCase.position.z > -range && currentCase.position.z < range) {
            const casePositionZ = currentCase.position.z;

            if (i % 2 === 0) {
              // turn camera to left (Math.PI / 2)
              this.camera.rotation.y = Math.max(turn - Math.abs(casePositionZ * ((turn) / range)), 0);
              // move camera to right
              this.camera.position.x = Math.max(this.HALF_TUBE - Math.abs((casePositionZ * (this.HALF_TUBE / range))), 0);
            } else {
              // turn camera to right (-Math.PI / 2)
              this.camera.rotation.y = Math.min(-turn + Math.abs(casePositionZ * ((turn) / range)), 0);
              // move camera to left
              this.camera.position.x = Math.min(-this.HALF_TUBE + Math.abs((casePositionZ * (this.HALF_TUBE / range))), 0);
            }
          }
        }

        // controls.update();

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(render);
      };

      render();
    },
  },
})
</script>

<style>
canvas {
  display: block;
}
</style>
