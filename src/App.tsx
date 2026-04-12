import { useState, useEffect } from 'react';
import './App.css';
import * as MatrixLogic from './logic/matrix';
import { VectorCore, type Vector } from './logic/vector';

type Mode = 'matrix' | 'sle' | 'vectors';

export default function App() {
  const [mode, setMode] = useState<Mode>('matrix');

  const [inputA, setInputA] = useState('1 2\n2 4');
  const [inputB, setInputB] = useState('1 2\n3 4');
  const [inputSLE, setInputSLE] = useState('5\n10');

  const [inputVecA, setInputVecA] = useState('1, 2, 3');
  const [inputVecB, setInputVecB] = useState('4, 5, 6');
  const [inputVecC, setInputVecC] = useState('7, 8, 9');
  const [inputScalar, setInputScalar] = useState('2');

  const [matrixA, setMatrixA] = useState<MatrixLogic.Matrix>([[1,2],[2,4]]);
  const [matrixB, setMatrixB] = useState<MatrixLogic.Matrix>([[1,2],[3,4]]);
  const [vectorB, setVectorB] = useState<number[]>([5, 10]);

  const [vecA, setVecA] = useState<Vector>([1, 2, 3]);
  const [vecB, setVecB] = useState<Vector>([4, 5, 6]);
  const [vecC, setVecC] = useState<Vector>([7, 8, 9]);
  const [scalar, setScalar] = useState<number>(2);

  const [result, setResult] = useState<MatrixLogic.Matrix | number[] | number | string | null>(null);
  const [steps, setSteps] = useState<(string | MatrixLogic.MatrixStep | string)[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lines = inputA.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;
    const newMatrix = lines.map(row => row.trim().split(/[\s,;\t]+/).map(val => parseFloat(val) || 0));
    setMatrixA(newMatrix);
  }, [inputA]);

  useEffect(() => {
    const lines = inputB.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;
    const newMatrix = lines.map(row => row.trim().split(/[\s,;\t]+/).map(val => parseFloat(val) || 0));
    setMatrixB(newMatrix);
  }, [inputB]);

  useEffect(() => {
    const vals = inputSLE.trim().split(/[\s\n,;\t]+/).filter(v => v.trim() !== '').map(val => parseFloat(val) || 0);
    setVectorB(vals);
  }, [inputSLE]);

  const parseVector = (str: string): Vector => str.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

  useEffect(() => setVecA(parseVector(inputVecA)), [inputVecA]);
  useEffect(() => setVecB(parseVector(inputVecB)), [inputVecB]);
  useEffect(() => setVecC(parseVector(inputVecC)), [inputVecC]);
  useEffect(() => setScalar(Number(inputScalar)), [inputScalar]);

  const handleVectorOperation = (op: string) => {
    setError(null);
    setResult(null);
    setSteps([]);
    try {
      let res;
      switch (op) {
        case 'v_add': res = VectorCore.add(vecA, vecB); break;
        case 'v_sub': res = VectorCore.subtract(vecA, vecB); break;
        case 'v_scalar': res = VectorCore.multiplyByScalar(vecA, scalar); break;
        case 'v_dot': res = VectorCore.dotProduct(vecA, vecB); break;
        case 'v_cross': res = VectorCore.crossProduct(vecA, vecB); break;
        case 'v_mixed': res = VectorCore.mixedProduct(vecA, vecB, vecC); break;
        default: throw new Error('Неизвестная операция');
      }
      setResult(res.result);
      setSteps(res.steps);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e));
    }
  };

  const handleOperation = (op: string) => {
    setError(null);
    setResult(null);
    setSteps([]);
    try {
      let res: MatrixLogic.CalculationResult<MatrixLogic.Matrix | number>;
      switch (op) {
        case 'add': res = MatrixLogic.addMatrices(matrixA, matrixB); break;
        case 'sub': res = MatrixLogic.subtractMatrices(matrixA, matrixB); break;
        case 'mul': res = MatrixLogic.multiplyMatrices(matrixA, matrixB); break;
        case 'scalar': {
          const s = parseFloat(prompt('Введите число:') || '1');
          res = MatrixLogic.multiplyScalar(matrixA, s); 
          break;
        }
        case 'transpose': res = MatrixLogic.transpose(matrixA); break;
        case 'det': res = MatrixLogic.getDeterminant(matrixA); break;
        case 'rank': res = MatrixLogic.getRank(matrixA); break;
        default: throw new Error('Неизвестная операция');
      }
      setResult(res.result);
      setSteps(res.steps);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e));
    }
  };

  const solveSLE = (method: string) => {
    setError(null);
    setResult(null);
    setSteps([]);
    try {
      let res: MatrixLogic.CalculationResult<number[] | string | null>;
      if (method === 'gauss') res = MatrixLogic.solveByGauss(matrixA, vectorB);
      else if (method === 'cramer') res = MatrixLogic.solveByCramer(matrixA, vectorB);
      else res = MatrixLogic.solveByMatrixMethod(matrixA, vectorB);

      setSteps(res.steps);
      if (res.result !== null) {
        setResult(res.result);
      } else {
        setError('Система не имеет единственного решения (см. анализ ниже)');
      }
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError(String(e));
    }
  };

  const renderMiniMatrix = (step: MatrixLogic.MatrixStep) => {
    const { data: m, strikeRows = [], strikeCols = [], highlightPivot } = step;
    return (
      <div className="mini-matrix" style={{ gridTemplateColumns: `repeat(${m[0].length}, auto)` }}>
        {m.map((row, r) => row.map((val, c) => {
          const isStruck = strikeRows.includes(r) || strikeCols.includes(c);
          const isPivot = highlightPivot && highlightPivot[0] === r && highlightPivot[1] === c;
          return (
            <span 
              key={`${r}-${c}`} 
              className={`${isStruck ? 'struck-cell' : ''} ${isPivot ? 'pivot-cell' : ''}`}
            >
              {MatrixLogic.formatVal(val)}
            </span>
          );
        }))}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Матричный Калькулятор</h1>
      
      <div className="mode-toggle">
        <button className={mode === 'matrix' ? 'active' : ''} onClick={() => setMode('matrix')}>Операции</button>
        <button className={mode === 'sle' ? 'active' : ''} onClick={() => setMode('sle')}>СЛАУ</button>
        <button className={mode === 'vectors' ? 'active' : ''} onClick={() => { setMode('vectors'); setResult(null); setSteps([]); setError(null); }}>Векторы</button>
      </div>

      <div className="input-section">
        {mode === 'vectors' ? (
          <>
            <div className="card">
              <h3>Вектор A</h3>
              <p className="hint">Через запятую: 1, 2, 3</p>
              <input className="vector-input" value={inputVecA} onChange={(e) => setInputVecA(e.target.value)} />
            </div>
            <div className="card">
              <h3>Вектор B</h3>
              <p className="hint">Через запятую: 4, 5, 6</p>
              <input className="vector-input" value={inputVecB} onChange={(e) => setInputVecB(e.target.value)} />
            </div>
            <div className="card">
              <h3>Вектор C (для смешанного произведения)</h3>
              <p className="hint">Через запятую: 7, 8, 9</p>
              <input className="vector-input" value={inputVecC} onChange={(e) => setInputVecC(e.target.value)} />
            </div>
            <div className="card">
              <h3>Скаляр</h3>
              <input className="vector-input" value={inputScalar} onChange={(e) => setInputScalar(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <h3>Матрица A</h3>
              <p className="hint">Числа через пробел, строки — с новой строки</p>
              <textarea className="bulk-textarea" value={inputA} onChange={(e) => setInputA(e.target.value)} spellCheck={false} />
            </div>

            {mode === 'matrix' ? (
              <div className="card">
                <h3>Матрица B</h3>
                <p className="hint">Для операций с двумя матрицами</p>
                <textarea className="bulk-textarea" value={inputB} onChange={(e) => setInputB(e.target.value)} spellCheck={false} />
              </div>
            ) : (
              <div className="card">
                <h3>Вектор B</h3>
                <p className="hint">Свободные члены</p>
                <textarea className="bulk-textarea" value={inputSLE} onChange={(e) => setInputSLE(e.target.value)} spellCheck={false} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="controls">
        {mode === 'matrix' ? (
          <>
            <button onClick={() => handleOperation('add')}>A + B</button>
            <button onClick={() => handleOperation('sub')}>A - B</button>
            <button onClick={() => handleOperation('mul')}>A * B</button>
            <button onClick={() => handleOperation('scalar')}>A * k</button>
            <button onClick={() => handleOperation('transpose')}>Aᵀ</button>
            <button className="secondary" onClick={() => handleOperation('det')}>det(A)</button>
            <button className="secondary" onClick={() => handleOperation('rank')}>rank(A)</button>
          </>
        ) : mode === 'sle' ? (
          <>
            <button onClick={() => solveSLE('gauss')}>Гаусс</button>
            <button onClick={() => solveSLE('cramer')}>Крамер</button>
            <button onClick={() => solveSLE('matrix')}>Матричный</button>
          </>
        ) : (
          <>
            <button onClick={() => handleVectorOperation('v_add')}>a + b</button>
            <button onClick={() => handleVectorOperation('v_sub')}>a - b</button>
            <button onClick={() => handleVectorOperation('v_scalar')}>a * k</button>
            <button className="secondary" onClick={() => handleVectorOperation('v_dot')}>a · b</button>
            <button className="secondary" onClick={() => handleVectorOperation('v_cross')}>a × b</button>
            <button className="secondary" onClick={() => handleVectorOperation('v_mixed')}>(a × b) · c</button>
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {(result !== null || steps.length > 0) && (
        <div className="card result-area">
          {result !== null && (
            <>
              <h3>Результат:</h3>
              {Array.isArray(result) ? (
                Array.isArray(result[0]) ? (
                  <div className="matrix-display" style={{ gridTemplateColumns: `repeat(${(result as MatrixLogic.Matrix)[0].length}, auto)` }}>
                    {(result as MatrixLogic.Matrix).map((row, r) => row.map((val, c) => 
                      <span key={`${r}-${c}`}>{MatrixLogic.formatVal(val)}</span>
                    ))}
                  </div>
                ) : (
                  <div className="vector-display">
                    {(result as number[]).map((v: number) => MatrixLogic.formatVal(v)).join('; ')}
                  </div>
                )
              ) : (
                typeof result === 'string' ? (
                  <div className="general-solution-container">
                    <div className="system-brace">{'{'}</div>
                    <div className="equations-list">
                      {result.split('\n').filter(line => line.trim() && !line.includes('Общее решение')).map((eq, i) => (
                        <div key={i} className="equation-line">{eq}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="scalar-result">{MatrixLogic.formatVal(result as number)}</div>
                )
              )}
            </>
          )}

          {steps.length > 0 && (
            <div className="steps-container">
              <h4>Подробный анализ:</h4>
              <div className="steps-list">
                {steps.map((step, i) => (
                  <div key={i} className="step-wrapper">
                    {typeof step === 'string' ? (
                      <div className="step-text">{step}</div>
                    ) : (
                      renderMiniMatrix(step)
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
