import { Vector3 } from "three";
import { packAndHashCoordinates } from "./utils";
import { TerrainGenerator } from "./trg";

const generator = new TerrainGenerator();

self.onmessage = (event: MessageEvent) => {
  const { chunkPosition, chunkSize, gridSize } = event.data;
  const blocks: { x: number; y: number; z: number }[] = [];

  for (let x = 0; x < chunkSize; x += gridSize) {
    for (let z = 0; z < chunkSize; z += gridSize) {
      const worldX = chunkPosition.x + x;
      const worldZ = chunkPosition.z + z;
      const height = generator.getHeight(worldX, worldZ);

      blocks.push({ x: worldX, y: height, z: worldZ });

      // Проверяем соседние блоки и создаём стены
      const neighbors = [
        new Vector3(-1, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(0, 0, -1),
        new Vector3(0, 0, 1),
      ];

      for (const offset of neighbors) {
        const neighborHeight = generator.getHeight(
          worldX + offset.x,
          worldZ + offset.z
        );
        if (neighborHeight < height) {
          for (let h = neighborHeight + 1; h < height; h++) {
            blocks.push({ x: worldX, y: h, z: worldZ });
          }
        }
      }
    }
  }

  self.postMessage({
    chunkKey: packAndHashCoordinates(
      chunkPosition.x,
      chunkPosition.y,
      chunkPosition.z
    ),
    blocks,
  });
};
