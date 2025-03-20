export const packAndHashCoordinates = (x: number, y: number, z: number) => {
  const BITS = 21; // 21 бит на координату
  const MASK = (1 << BITS) - 1; // Маска для 21 бита

  // Сдвигаем координаты в положительный диапазон
  const offset = 1 << (BITS - 1); // 2^20 (1 048 576)
  const packedX = x + offset;
  const packedY = y + offset;
  const packedZ = z + offset;

  // Проверяем, что координаты находятся в допустимом диапазоне
  if (
    packedX < 0 ||
    packedX > MASK ||
    packedY < 0 ||
    packedY > MASK ||
    packedZ < 0 ||
    packedZ > MASK
  ) {
    throw new Error("Координаты выходят за допустимый диапазон");
  }

  // Упаковываем координаты
  return (packedX << (BITS * 2)) | (packedY << BITS) | packedZ;
};
