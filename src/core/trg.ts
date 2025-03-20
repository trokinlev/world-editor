import Alea from "alea";
import { createNoise2D, type NoiseFunction2D } from "simplex-noise";

export class TerrainGenerator {
  private noise: NoiseFunction2D;

  constructor(seed: string = "default") {
    this.noise = createNoise2D(Alea(seed));
  }

  getHeight(x: number, z: number): number {
    // Используем шум для генерации высоты
    const scale = 0.1; // Чем меньше, тем больше холмы
    const height = this.noise(x * scale, z * scale) * 10; // Масштабируем
    return Math.floor(height);
  }
}

