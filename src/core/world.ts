import {
  NearestFilter,
  Object3D,
  Scene,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import { Chunk } from "./chunk";
import { packAndHashCoordinates } from "./utils";
import { TerrainGenerator } from "./trg";
import BlockWorker from "./worker?worker";

interface WorldProps {
  gridItemSize: number;
  chunkSize: number;
  scene: Scene | null;
}

export class World {
  private chunks: Map<number, Chunk> = new Map();
  private texture: Texture = this.loadTexture();
  private blockWorker = new BlockWorker();

  constructor(private props: WorldProps) {
    this.blockWorker.onmessage = (event: MessageEvent) => {
      const { chunkKey, blocks } = event.data;
      const chunk = this.chunks.get(chunkKey);
      if (!chunk) return;

      this.startAddBlocks();
      blocks.forEach(({ x, y, z }: { x: number; y: number; z: number }) => {
        this.addBlocks(new Vector3(x, y, z));
      });
      this.endAddBlocks();
    };
  }

  setScene(scene: Scene) {
    this.props.scene = scene;
  }

  getChunkSize(): number {
    return this.props.chunkSize;
  }

  getGridItemSize(): number {
    return this.props.gridItemSize;
  }

  worldToGrid(position: Vector3): Vector3 {
    return new Vector3(
      Math.floor(position.x / this.props.gridItemSize),
      Math.floor(position.y / this.props.gridItemSize),
      Math.floor(position.z / this.props.gridItemSize)
    );
  }

  private getChunkKey(position: Vector3): number {
    return packAndHashCoordinates(position.x, position.y, position.z);
  }

  private batching = false;
  private chunksMap = new Map<number, { chunk: Chunk; positions: Vector3[] }>();

  startAddBlocks() {
    this.batching = true;
  }

  addBlocks(...positions: Vector3[]) {
    positions.forEach((position) => {
      const chunkPosition = this.getChunkPosition(position);
      const chunkKey = this.getChunkKey(chunkPosition);

      // Получаем или создаем запись для чанка
      let chunkData = this.chunksMap.get(chunkKey);
      if (!chunkData) {
        let chunk = this.chunks.get(chunkKey);
        if (!chunk) {
          chunk = new Chunk(chunkPosition, this.texture, this);
          this.chunks.set(chunkKey, chunk);
        }
        chunkData = { chunk, positions: [] };
        this.chunksMap.set(chunkKey, chunkData);
      }

      // Преобразуем глобальные координаты в локальные
      const localPos = position.clone().sub(chunkPosition);
      chunkData.positions.push(localPos);
    });

    // Если не в режиме батчинга, сразу применяем
    if (!this.batching) {
      this.endAddBlocks();
    }
  }

  endAddBlocks() {
    this.batching = false;

    this.chunksMap.forEach(({ chunk, positions }) => {
      chunk.addBlocks(...positions);
    });

    // Добавляем новые чанки в сцену (если они были созданы)
    if (this.props.scene) {
      this.chunksMap.forEach(({ chunk }) => {
        if (!this.props.scene?.children.includes(chunk.getObject3D())) {
          this.props.scene?.add(chunk.getObject3D());
        }
      });
    }
  }

  getChunkPosition(position: Vector3): Vector3 {
    const cx = Math.floor(position.x / this.props.chunkSize);
    const cz = Math.floor(position.z / this.props.chunkSize);
    return new Vector3(cx * this.props.chunkSize, 0, cz * this.props.chunkSize);
  }

  hasBlock(position: Vector3): boolean {
    const chunkPosition = this.getChunkPosition(position);
    const chunkKey = this.getChunkKey(chunkPosition);
    const chunk = this.chunks.get(chunkKey);

    if (!chunk) return false;
    const localPos = position.clone().sub(chunkPosition);
    return chunk.hasBlock(localPos);
  }

  private loadTexture(): Texture {
    return new TextureLoader().load(
      "/textures/atlas.png",
      (texture) => {
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.needsUpdate = true;
      },
      undefined
    );
  }

  private generator = new TerrainGenerator();
  generateChunk(chunkPosition: Vector3) {
    const chunkKey = this.getChunkKey(chunkPosition);
    if (this.chunks.has(chunkKey)) return;

    const chunk = new Chunk(chunkPosition, this.texture, this);
    this.chunks.set(chunkKey, chunk);

    // Отправляем данные воркеру
    this.blockWorker.postMessage({
      chunkPosition,
      chunkSize: this.props.chunkSize,
      gridSize: this.props.gridItemSize,
    });

    if (this.props.scene) {
      this.props.scene.add(chunk.getObject3D());
    }
  }

  addSideIfNeeded(x: number, y: number, z: number, offset: Vector3) {
    const neighborX = x + offset.x;
    const neighborZ = z + offset.z;
    const neighborHeight = this.generator.getHeight(neighborX, neighborZ);

    if (neighborHeight < y) {
      // Если соседний блок ниже — нужна стена
      for (let h = neighborHeight + 1; h < y; h++) {
        this.addBlocks(new Vector3(x, h, z)); // Добавляем через `this.addBlocks()`
      }
    }
  }

  loadChunksAround(position: Vector3, radius: number = 3) {
    const playerChunk = this.getChunkPosition(position);
    const newLoadedChunks = new Set<number>();

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const chunkPos = new Vector3(
          playerChunk.x + dx * this.props.chunkSize,
          0,
          playerChunk.z + dz * this.props.chunkSize
        );

        const chunkKey = this.getChunkKey(chunkPos);
        newLoadedChunks.add(chunkKey);

        if (!this.chunks.has(chunkKey)) {
          this.generateChunk(chunkPos);
        }
      }
    }

    // Удаляем чанки, которые больше не в радиусе
    this.chunks.forEach((_, key) => {
      if (!newLoadedChunks.has(key)) {
        this.unloadChunk(key);
      }
    });
  }

  unloadChunk(chunkKey: number) {
    const chunk = this.chunks.get(chunkKey);
    if (!chunk) return;

    if (this.props.scene) {
      this.props.scene.remove(chunk.getObject3D());
    }

    this.chunks.delete(chunkKey);
  }
}