import type { Matrix, MatrixStep, CalculationResult } from './types';
import { formatVal } from './types';

export const getDeterminant = (a: Matrix): CalculationResult<number> => {
  const steps: (string | MatrixStep)[] = ["Вычисляем определитель разложением по 1-й строке:"];
  const calculate = (m: Matrix, depth = 0): number => {
    const n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    let totalDet = 0;
    for (let i = 0; i < n; i++) {
      const minor = m.slice(1).map(row => row.filter((_, j) => j !== i));
      const subDet = calculate(minor, depth + 1);
      const sign = i % 2 === 0 ? 1 : -1;
      const term = sign * m[0][i] * subDet;
      totalDet += term;
      if (depth === 0) {
        steps.push(`Шаг ${i+1}: a[1,${i+1}] = ${m[0][i]}. Вычеркиваем строку и столбец:`, { data: m, strikeRows: [0], strikeCols: [i] }, `Минор:`, { data: minor }, `A[1,${i+1}] = (${sign === 1 ? '' : '-'}${formatVal(subDet)}) * ${m[0][i]} = ${formatVal(term)}`);
      }
    }
    return totalDet;
  };
  const res = calculate(a);
  steps.push(`Итоговый определитель det = ${formatVal(res)}`);
  return { result: res, steps };
};

export const getRankInternal = (m: Matrix) => {
  const rows = m.length, cols = m[0].length, mat = m.map(r => [...r]);
  let rank = 0;
  const pivotCols: number[] = [];
  for (let c = 0; c < cols && rank < rows; c++) {
    let p = rank;
    while (p < rows && Math.abs(mat[p][c]) < 1e-10) p++;
    if (p < rows) {
      [mat[rank], mat[p]] = [mat[p], mat[rank]];
      const lv = mat[rank][c];
      for (let j = c; j < cols; j++) mat[rank][j] /= lv;
      for (let i = 0; i < rows; i++) {
        if (i !== rank) {
          const f = mat[i][c];
          for (let j = c; j < cols; j++) mat[i][j] -= f * mat[rank][j];
        }
      }
      pivotCols.push(c);
      rank++;
    }
  }
  return { rank, rref: mat, pivotCols };
};

export const getRank = (a: Matrix): CalculationResult<number> => {
  const { rank, rref } = getRankInternal(a);
  const steps: (string | MatrixStep)[] = ["Находим ранг матрицы приведением к ступенчатому виду:", { data: a }, "Итоговая матрица в RREF форме:", { data: rref }];
  const zeroRows = [];
  for (let i = 0; i < rref.length; i++) if (rref[i].every(v => Math.abs(v) < 1e-10)) zeroRows.push(i);
  if (zeroRows.length > 0) steps.push("Вычеркиваем нулевые строки:", { data: rref, strikeRows: zeroRows });
  steps.push(`Количество ненулевых строк = ${rank}. Ранг rank(A) = ${rank}`);
  return { result: rank, steps };
};
