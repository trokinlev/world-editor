import { Vector3 } from "three";
import type { World } from "../../core/world";

export enum BlockSide {
  LEFT = 0,
  RIGHT = 1,
  BOTTOM = 2,
  TOP = 3,
  FRONT = 4,
  BACK = 5,
}

export class Intersection {
  static rayAABB(
      rayOrigin: Vector3,
      rayDirection: Vector3,
      blockPosition: Vector3,
      blockSize: Vector3
    ): number | null {
  
      // Проверка на нулевой вектор направления
      // if (normalizedDirection.length() === 0) {
      //   return null;
      // }
  
      // Вычисление границ блока (если blockPosition — левый нижний угол)
      const blockMin = blockPosition.clone();
      const blockMax = blockPosition.clone().add(blockSize);
  
      // Вычисление tMin и tMax
      const tMin = blockMin.clone().sub(rayOrigin).divide(rayDirection);
      const tMax = blockMax.clone().sub(rayOrigin).divide(rayDirection);
  
      // Поэлементный минимум и максимум
      const t1 = new Vector3(
        Math.min(tMin.x, tMax.x),
        Math.min(tMin.y, tMax.y),
        Math.min(tMin.z, tMax.z)
      );
      const t2 = new Vector3(
        Math.max(tMin.x, tMax.x),
        Math.max(tMin.y, tMax.y),
        Math.max(tMin.z, tMax.z)
      );
  
      // Ближайшая и дальняя точки пересечения
      const tNear = Math.max(t1.x, t1.y, t1.z);
      const tFar = Math.min(t2.x, t2.y, t2.z);
  
      // Проверка на пересечение
      if (tNear > tFar || tFar < 0) {
        return null;
      }
  
      // Точка пересечения
      const intersectionPoint = rayOrigin.add(
        rayDirection.clone().multiplyScalar(tNear)
      );
  
      const epsilon = 0.0001; // Погрешность для сравнения
  
      if (Math.abs(intersectionPoint.x - blockMin.x) < epsilon) {
        return BlockSide.LEFT;
      }
      
      if (Math.abs(intersectionPoint.x - blockMax.x) < epsilon) {
        return BlockSide.RIGHT;
      }
      
      if (Math.abs(intersectionPoint.y - blockMin.y) < epsilon) {
        return BlockSide.BOTTOM;
      }
      
      if (Math.abs(intersectionPoint.y - blockMax.y) < epsilon) {
        return BlockSide.TOP;
      }
      
      if (Math.abs(intersectionPoint.z - blockMin.z) < epsilon) {
        return BlockSide.BACK;
      }
      
      if (Math.abs(intersectionPoint.z - blockMax.z) < epsilon) {
        return BlockSide.FRONT;
      }

      return null;
    }

    static rayDDA(
        rayOrigin: Vector3,
        rayDirection: Vector3,
        gridItemSize: number,
        world: World
      ): Vector3 | null {
        // Определяем начальную ячейку
        let cellX = Math.floor(rayOrigin.x / gridItemSize);
        let cellY = Math.floor(rayOrigin.y / gridItemSize);
        let cellZ = Math.floor(rayOrigin.z / gridItemSize);
    
        // Направление шага
        let stepX = rayDirection.x > 0 ? 1 : -1;
        let stepY = rayDirection.y > 0 ? 1 : -1;
        let stepZ = rayDirection.z > 0 ? 1 : -1;
    
        // Вычисляем следующую границу ячейки
        let nextX = (cellX + (stepX > 0 ? 1 : 0)) * gridItemSize;
        let nextY = (cellY + (stepY > 0 ? 1 : 0)) * gridItemSize;
        let nextZ = (cellZ + (stepZ > 0 ? 1 : 0)) * gridItemSize;
    
        // Время до пересечения с границами ячеек
        let tMaxX = (nextX - rayOrigin.x) / rayDirection.x;
        let tMaxY = (nextY - rayOrigin.y) / rayDirection.y;
        let tMaxZ = (nextZ - rayOrigin.z) / rayDirection.z;
    
        // Время для шага между границами ячеек
        let tDeltaX = gridItemSize / Math.abs(rayDirection.x);
        let tDeltaY = gridItemSize / Math.abs(rayDirection.y);
        let tDeltaZ = gridItemSize / Math.abs(rayDirection.z);
    
        // Максимальное количество шагов для предотвращения бесконечного цикла
        const maxSteps = 32;
        let step = 0;
    
        while (step < maxSteps) {
          // Выбираем ближайшую границу
          if (tMaxX < tMaxY && tMaxX < tMaxZ) {
            cellX += stepX;
            tMaxX += tDeltaX;
          } else if (tMaxY < tMaxZ) {
            cellY += stepY;
            tMaxY += tDeltaY;
          } else {
            cellZ += stepZ;
            tMaxZ += tDeltaZ;
          }
    
          // Создаем вектор текущей ячейки
          const vec = new Vector3(cellX, cellY, cellZ);
    
          // Проверяем, есть ли блок в этой ячейке
          if (world.hasBlock(vec)) {
            // Возвращаем позицию блока (левый нижний угол)
            return vec;
          }
    
          step++;
        }
    
        // Если луч не пересек ни одного блока
        return null;
      }
}