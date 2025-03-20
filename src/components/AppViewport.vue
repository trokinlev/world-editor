<script lang="ts" setup>
import { onMounted, ref } from "vue";
import {
  AmbientLight,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
} from "three";
import { FpsLimiter } from "../plugins/fps-limiter";
import { World } from "../core/world";
import { WorldEditor } from "../core/world-editor";
import { StatsAdapter } from "../plugins/stats";
import { Player } from "../plugins/palyer/player";
import { Cursor } from "../plugins/cursor/cursor";

const viewportElement = ref<HTMLElement | null>(null);
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

onMounted(() => {
  if (!viewportElement.value) return;
  const cursor = new Cursor();
  const worldEditor = new WorldEditor(window, viewportElement.value, camera);
  const world = new World({
    gridItemSize: 1,
    chunkSize: 1028,
    scene: null,
  });

  worldEditor.setWorld(world);
  worldEditor.usePlugin(new FpsLimiter(20));
  worldEditor.usePlugin(new StatsAdapter());
  worldEditor.usePlugin(new Player());
  worldEditor.usePlugin(cursor);
  worldEditor.usePlugin(new GridHelper(500, 500));
  worldEditor.usePlugin(new DirectionalLight(0xffffff, 1));
  worldEditor.usePlugin(new AmbientLight(0xaaaaaa));

  cursor.addEventListener("move", (event) => {});
  cursor.addEventListener("click", (event) => {});
});
</script>

<template>
  <div class="viewport-container">
    <div
      id="viewport"
      ref="viewportElement"
      style="overflow: hidden; width: 100%; height: 100vh"
    ></div>
  </div>
</template>
