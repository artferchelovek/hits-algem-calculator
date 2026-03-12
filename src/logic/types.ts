export type Matrix = number[][];

export interface MatrixStep {
  data: Matrix;
  strikeRows?: number[];
  strikeCols?: number[];
  highlightPivot?: [number, number];
}

export interface CalculationResult<T> {
  result: T;
  steps: (string | MatrixStep)[];
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export const formatVal = (n: number): string => {
  if (Math.abs(n) < 1e-10) return "0";
  if (Number.isInteger(n)) return n.toString();

  const precision = 1000000;
  let num = Math.round(n * precision);
  let den = precision;
  
  const common = gcd(Math.abs(num), den);
  num /= common;
  den /= common;

  if (den > 1000) return n.toFixed(2);
  return den === 1 ? num.toString() : `${num}/${den}`;
};
