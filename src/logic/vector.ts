import type { CalculationResult } from './types';

export type Vector = number[];

export class VectorCore {
    static add(a: Vector, b: Vector): CalculationResult<Vector> {
        if (a.length !== b.length) {
            throw new Error('Размерности векторов должны совпадать.');
        }
        const result = a.map((val, i) => val + b[i]);
        const steps = [
            'Сложение векторов:',
            `a = (${a.join(', ')})`,
            `b = (${b.join(', ')})`,
            ...a.map((val, i) => `${val} + ${b[i]} = ${result[i]}`),
            `Результат: (${result.join(', ')})`
        ];
        return { result, steps };
    }

    static subtract(a: Vector, b: Vector): CalculationResult<Vector> {
        if (a.length !== b.length) {
            throw new Error('Размерности векторов должны совпадать.');
        }
        const result = a.map((val, i) => val - b[i]);
        const steps = [
            'Вычитание векторов:',
            `a = (${a.join(', ')})`,
            `b = (${b.join(', ')})`,
            ...a.map((val, i) => `${val} - ${b[i]} = ${result[i]}`),
            `Результат: (${result.join(', ')})`
        ];
        return { result, steps };
    }

    static multiplyByScalar(a: Vector, scalar: number): CalculationResult<Vector> {
        const result = a.map(val => val * scalar);
        const steps = [
            `Умножение вектора на ${scalar}:`,
            `a = (${a.join(', ')})`,
            ...a.map((val) => `${val} * ${scalar} = ${val * scalar}`),
            `Результат: (${result.join(', ')})`
        ];
        return { result, steps };
    }

    static dotProduct(a: Vector, b: Vector): CalculationResult<number> {
        if (a.length !== b.length) {
            throw new Error('Размерности векторов должны совпадать.');
        }
        let sum = 0;
        const products: string[] = [];
        for (let i = 0; i < a.length; i++) {
            const p = a[i] * b[i];
            products.push(`${a[i]} * ${b[i]} = ${p}`);
            sum += p;
        }
        const steps = [
            'Скалярное произведение (a · b = Σ aᵢbᵢ):',
            ...products,
            `Сумма = ${sum}`
        ];
        return { result: sum, steps };
    }

    static crossProduct(a: Vector, b: Vector): CalculationResult<Vector> {
        if (a.length !== 3 || b.length !== 3) {
            throw new Error('Векторное произведение определено только для трёхмерных векторов.');
        }
        const result = [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
        const steps = [
            'Векторное произведение (a × b):',
            `| i    j    k  |`,
            `| ${a[0]}   ${a[1]}   ${a[2]} |`,
            `| ${b[0]}   ${b[1]}   ${b[2]} |`,
            `i: ${a[1]}*${b[2]} - ${a[2]}*${b[1]} = ${result[0]}`,
            `j: ${a[2]}*${b[0]} - ${a[0]}*${b[2]} = ${result[1]}`,
            `k: ${a[0]}*${b[1]} - ${a[1]}*${b[0]} = ${result[2]}`,
            `Результат: (${result.join(', ')})`
        ];
        return { result, steps };
    }

    static mixedProduct(a: Vector, b: Vector, c: Vector): CalculationResult<number> {
        if (a.length !== 3 || b.length !== 3 || c.length !== 3) {
            throw new Error('Смешанное произведение определено только для трёхмерных векторов.');
        }
        const cross = this.crossProduct(a, b);
        const dot = cross.result![0] * c[0] + cross.result![1] * c[1] + cross.result![2] * c[2];
        const steps = [
            'Смешанное произведение ((a × b) · c):',
            ...cross.steps,
            `a × b = (${cross.result!.join(', ')})`,
            `(${cross.result![0]})*${c[0]} + (${cross.result![1]})*${c[1]} + (${cross.result![2]})*${c[2]} = ${dot}`,
            `Результат: ${dot}`
        ];
        return { result: dot, steps };
    }
}
