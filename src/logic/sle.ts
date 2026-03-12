import type { Matrix, MatrixStep, CalculationResult } from './types';
import { formatVal } from './types';
import { getRankInternal, getDeterminant } from './advanced';
import { createEmptyMatrix } from './core';

export const solveByGauss = (a: Matrix, b: number[]): CalculationResult<number[] | string | null> => {
  const n = a[0].length, m = a.length;
  const augmented = a.map((row, i) => [...row, b[i]]);
  const steps: (string | MatrixStep)[] = ["Решение методом Гаусса (анализ совместности):", { data: augmented.map(r => [...r]) }];
  
  const { rank: rA } = getRankInternal(a);
  const { rank: rAug, rref, pivotCols } = getRankInternal(augmented);
  
  steps.push(`rank(A) = ${rA}, rank(A|B) = ${rAug}`);
  if (rA < rAug) {
    steps.push("Система НЕСОВМЕСТНА (rank(A) < rank(A|B)). Решений нет.");
    return { result: null, steps };
  }

  if (rA === n) {
    const mat = augmented.map(r => [...r]);
    steps.push("1. Прямой ход (приведение к ступенчатому виду):");
    
    for (let r = 0; r < n; r++) {
      let p = r;
      while (p < m && Math.abs(mat[p][r]) < 1e-10) p++;
      if (p < m) {
        if (p !== r) {
          [mat[r], mat[p]] = [mat[p], mat[r]];
          steps.push(`Переставляем строки R${r+1} ↔ R${p+1}:`, { data: mat.map(r => [...r]) });
        }
        
        steps.push(`Выбран опорный элемент a[${r+1},${r+1}] = ${formatVal(mat[r][r])}:`);
        steps.push({ data: mat.map(r => [...r]), highlightPivot: [r, r] });

        for (let i = r + 1; i < m; i++) {
          if (Math.abs(mat[i][r]) > 1e-10) {
            const factor = mat[i][r] / mat[r][r];
            steps.push(`Обнуляем элемент в R${i+1}: R${i+1} = R${i+1} - (${formatVal(factor)}) * R${r+1}`);
            for (let j = r; j <= n; j++) mat[i][j] -= factor * mat[r][j];
            steps.push({ data: mat.map(r => [...r]) });
          }
        }
      }
    }

    const x = new Array(n).fill(0);
    steps.push("2. Обратный ход:");
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      let expr = `${formatVal(mat[i][n])}`;
      for (let j = i + 1; j < n; j++) {
        const val = mat[i][j] * x[j];
        sum += val;
        expr += ` - (${formatVal(mat[i][j])} * ${formatVal(x[j])})`;
      }
      x[i] = (mat[i][n] - sum) / mat[i][i];
      steps.push(`x${i+1} = (${expr}) / ${formatVal(mat[i][i])} = ${formatVal(x[i])}`);
    }
    return { result: x, steps };
  }

  if (rA < n) {
    steps.push(`Бесконечно много решений (Ранг ${rA} < ${n} переменных).`);
    steps.push("Улучшенный ступенчатый вид (RREF):", { data: rref });
    let sol = "Общее решение:\n";
    for (let i = 0; i < pivotCols.length; i++) {
      const pc = pivotCols[i];
      if (pc >= n) continue;
      let eq = `x${pc + 1} = ${formatVal(rref[i][n])}`;
      for (let j = 0; j < n; j++) {
        if (!pivotCols.includes(j) && Math.abs(rref[i][j]) > 1e-10) {
          eq += ` ${rref[i][j] > 0 ? '-' : '+'} ${formatVal(Math.abs(rref[i][j]))}*t${j + 1}`;
        }
      }
      sol += eq + "\n";
    }
    for (let j = 0; j < n; j++) if (!pivotCols.includes(j)) sol += `x${j + 1} = t${j + 1}\n`;
    return { result: sol, steps };
  }

  return { result: null, steps };
};

export const solveByCramer = (a: Matrix, b: number[]): CalculationResult<number[] | null> => {
  const n = a.length, detA = getDeterminant(a);
  const steps: (string | MatrixStep)[] = ["Решение методом Крамера:", ...detA.steps];
  const D = detA.result;
  if (Math.abs(D) < 1e-10) return { result: null, steps: [...steps, "Δ = 0, Крамер неприменим."] };

  const x = [];
  for (let i = 0; i < n; i++) {
    const ai = a.map((row, rIdx) => row.map((v, cIdx) => cIdx === i ? b[rIdx] : v));
    const di = getDeterminant(ai).result;
    steps.push(`Δ${i+1} (замена столбца ${i+1}):`, { data: ai }, `Δ${i+1} = ${formatVal(di)}, x${i+1} = ${formatVal(di)}/${formatVal(D)} = ${formatVal(di/D)}`);
    x.push(di / D);
  }
  return { result: x, steps };
};

export const solveByMatrixMethod = (a: Matrix, b: number[]): CalculationResult<number[] | null> => {
  const detA = getDeterminant(a);
  const steps: (string | MatrixStep)[] = ["Решение матричным методом:", ...detA.steps];
  if (Math.abs(detA.result) < 1e-10) return { result: null, steps: [...steps, "det=0, обратной матрицы нет."] };
  const n = a.length, adj = createEmptyMatrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = a.filter((_, r) => r !== i).map(row => row.filter((_, c) => c !== j));
      adj[j][i] = Math.pow(-1, i + j) * getDeterminant(minor).result;
    }
  }
  steps.push("Союзная матрица (транспонированная):", { data: adj });
  const x = new Array(n).fill(0).map((_, i) => adj[i].reduce((sum, v, j) => sum + (v / detA.result) * b[j], 0));
  steps.push("Решение (X = A⁻¹ * B):");
  x.forEach((v, i) => steps.push(`x${i+1} = ${formatVal(v)}`));
  return { result: x, steps };
};
