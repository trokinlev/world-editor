import * as THREE from "three";

export class Square {
  static vertices(
    side: "front" | "back" | "top" | "down" | "left" | "right"
  ): Float32Array {
    switch (side) {
      case "front":
        return new Float32Array([
          0,
          0,
          1, // левый нижний угол    | вершина 0
          1,
          0,
          1, // правый нижний угол   | вершина 1
          1,
          1,
          1, // правый верхний угол  | вершина 2
          0,
          1,
          1, // левый верхний угол   | вершина 3
        ]);
      case "back":
        return new Float32Array([
          1,
          0,
          0, // правый нижний угол   | вершина 0
          0,
          0,
          0, // левый нижний угол    | вершина 1
          0,
          1,
          0, // левый верхний угол   | вершина 2
          1,
          1,
          0, // правый верхний угол  | вершина 3
        ]);
      case "top":
        return new Float32Array([
          0,
          1,
          1, // левый верхний угол (передний) | вершина 0
          1,
          1,
          1, // правый верхний угол (передний)| вершина 1
          1,
          1,
          0, // правый верхний угол (задний)  | вершина 2
          0,
          1,
          0, // левый верхний угол (задний)   | вершина 3
        ]);
      case "down":
        return new Float32Array([
          0,
          0,
          0, // левый нижний угол (задний)   | вершина 0
          1,
          0,
          0, // правый нижний угол (задний)  | вершина 1
          1,
          0,
          1, // правый нижний угол (передний)| вершина 2
          0,
          0,
          1, // левый нижний угол (передний)  | вершина 3
        ]);
      case "left":
        return new Float32Array([
          0,
          0,
          0, // левый нижний угол (задний)   | вершина 0
          0,
          0,
          1, // левый нижний угол (передний)  | вершина 1
          0,
          1,
          1, // левый верхний угол (передний)| вершина 2
          0,
          1,
          0, // левый верхний угол (задний)   | вершина 3
        ]);
      case "right":
        return new Float32Array([
          1,
          0,
          1, // правый нижний угол (передний)| вершина 0
          1,
          0,
          0, // правый нижний угол (задний)  | вершина 1
          1,
          1,
          0, // правый верхний угол (задний) | вершина 2
          1,
          1,
          1, // правый верхний угол (передний)| вершина 3
        ]);
      default:
        throw new Error(`Unknown side: ${side}`);
    }
  }

  static indices(): Uint16Array {
    return new Uint16Array([
      0,
      1,
      2, // Первый треугольник (нижний правый)
      0,
      2,
      3, // Второй треугольник (верхний левый)
    ]);
  }

  static uvs(): Float32Array {
    return new Float32Array([
      0,
      0, // UV для вершины 0
      1,
      0, // UV для вершины 1
      1,
      1, // UV для вершины 2
      0,
      1, // UV для вершины 3
    ]);
  }

  static sideUVs(side: string): Float32Array {
    switch (side) {
      case "top":
        return new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);
      case "down":
        return new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
      case "left":
        return new Float32Array([1, 1, 1, 0, 0, 0, 0, 1]);
      case "right":
        return new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);
      case "front":
        return new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]);
      case "back":
        return new Float32Array([1, 1, 0, 1, 0, 0, 1, 0]);
      default:
        throw new Error(`Unknown side: ${side}`);
    }
  }

  static side(
    side: "front" | "back" | "top" | "down" | "left" | "right"
  ): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.vertices(side), 3)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(this.sideUVs(side), 2)
    );
    geometry.setIndex(new THREE.BufferAttribute(this.indices(), 1));

    return geometry;
  }
}