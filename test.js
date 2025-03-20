const buffer = new ArrayBuffer(4096);
// const uint8Array = new Uint8Array(buffer);

// Заполняем массив случайными значениями (для примера)
for (let i = 0; i < buffer.length; i++) {
  buffer[i] = Math.floor(Math.random() * 256); // Случайное число от 0 до 255
}
console.log(buffer );
// Обрабатываем каждый байт с помощью побитовых операций
const startTime = performance.now(); // Начало измерения времени
for (let i = 0; i < buffer.length; i++) {
  // Пример: инвертируем биты каждого байта
  buffer[i] = ~buffer[i];

  // Пример: сдвигаем биты вправо на 1
  buffer[i] = buffer[i] >> 1;

  // Пример: устанавливаем младший бит в 1
  buffer[i] = buffer[i] | 1;
}

const endTime = performance.now(); // Конец измерения времени
console.log(`Время выполнения: ${endTime - startTime} мс`);
