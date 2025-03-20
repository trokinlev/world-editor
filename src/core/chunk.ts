import {
  BoxHelper,
  BufferGeometry,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Texture,
  Vector3,
} from "three";
import { Block } from "./block";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import type { World } from "./world";
import { packAndHashCoordinates } from "./utils";

export class Chunk {
  private mesh = new Mesh();
  private blockMap: Map<number, Block> = new Map();
  private boxHelper = new BoxHelper(this.mesh, 0x00ff00);

  constructor(
    public position: Vector3,
    texture: Texture,
    private world: World
  ) {
    this.mesh.material = new MeshBasicMaterial({
      map: texture,
      vertexColors: false,
      side: FrontSide,
    });
    this.boxHelper.visible = true;
    this.mesh.position.set(position.x, position.y, position.z);
  }

  getObject3D(): Object3D {
    const group = new Object3D();
    group.add(this.mesh);
    group.add(this.boxHelper);
    return group;
  }

  addBlocks(...positions: Vector3[]) {
    for (const position of positions) {
      const block = new Block(position, { x: 0, y: 2 });
      this.blockMap.set(this.getBlockKey(position), block);
    }

    this.rebuildMesh();
    this.boxHelper.update();
  }

  private rebuildMesh() {
    const geometries: BufferGeometry[] = [];

    this.blockMap.forEach((block) => {
      // Получаем глобальные координаты блока
      const globalPos = block.position.clone().add(this.position);

      // Проверяем наличие соседних блоков (включая соседние чанки)
      const top = !this.world.hasBlock(
        globalPos.clone().add(new Vector3(0, 1, 0))
      );
      const down = !this.world.hasBlock(
        globalPos.clone().add(new Vector3(0, -1, 0))
      );
      const left = !this.world.hasBlock(
        globalPos.clone().add(new Vector3(-1, 0, 0))
      );
      const right = !this.world.hasBlock(
        globalPos.clone().add(new Vector3(1, 0, 0))
      );
      const front = !this.world.hasBlock(
        globalPos.clone().add(new Vector3(0, 0, 1))
      );
      const back = !this.world.hasBlock(
        globalPos.clone().add(new Vector3(0, 0, -1))
      );

      // Создаем геометрию блока с учетом видимых граней
      const blockGeometry = block.geometry({
        top,
        down,
        left,
        right,
        front,
        back,
      });

      geometries.push(...blockGeometry);
    });

    // Объединяем геометрии в один меш
    this.mesh.geometry = BufferGeometryUtils.mergeGeometries(geometries);
  }

  private getAdjacentPos(pos: Vector3, side: string): Vector3 {
    const offset = {
      top: [0, 1, 0],
      down: [0, -1, 0],
      left: [-1, 0, 0],
      right: [1, 0, 0],
      front: [0, 0, 1],
      back: [0, 0, -1],
    }[side];

    if (!offset) return new Vector3();

    // Возвращаем глобальные координаты соседнего блока
    return pos
      .clone()
      .add(new Vector3(...offset))
      .add(this.position);
  }

  hasBlock(position: Vector3): boolean {
    const key = this.getBlockKey(position);
    return this.blockMap.has(key);
  }

  private getBlockKey(position: Vector3): number {
    return packAndHashCoordinates(position.x, position.y, position.z);
  }
}
