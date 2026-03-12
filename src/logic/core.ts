import type { Matrix, CalculationResult } from './types';

export const createEmptyMatrix = (rows: number, cols: number): Matrix => {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
};

export const addMatrices = (a: Matrix, b: Matrix): CalculationResult<Matrix> => {
  const res = a.map((r, i) => r.map((v, j) => v + b[i][j]));
  return { result: res, steps: ["Складываем матрицы:", { data: a }, "+", { data: b }, "=", { data: res }] };
};

export const subtractMatrices = (a: Matrix, b: Matrix): CalculationResult<Matrix> => {
  const res = a.map((r, i) => r.map((v, j) => v - b[i][j]));
  return { result: res, steps: ["Вычитаем матрицы:", { data: a }, "-", { data: b }, "=", { data: res }] };
};

export const multiplyMatrices = (a: Matrix, b: Matrix): CalculationResult<Matrix> => {
  const rowsA = a.length, colsA = a[0].length, colsB = b[0].length;
  const res = createEmptyMatrix(rowsA, colsB);
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) res[i][j] += a[i][k] * b[k][j];
    }
  }
  return { result: res, steps: ["Умножаем матрицы (строка на столбец):", { data: a }, "×", { data: b }, "=", { data: res }] };
};

export const multiplyScalar = (a: Matrix, s: number): CalculationResult<Matrix> => {
  const res = a.map(r => r.map(v => v * s));
  return { result: res, steps: ["Умножение на число:", { data: a }, `× ${s} =`, { data: res }] };
};

export const transpose = (a: Matrix): CalculationResult<Matrix> => {
  const res = a[0].map((_, c) => a.map(r => r[c]));
  return { result: res, steps: ["Транспонирование (строки ↔ столбцы):", { data: a }, "→", { data: res }] };
};
