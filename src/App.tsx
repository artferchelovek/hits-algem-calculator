import { useState, useEffect } from 'react';
import './App.css';
import * as MatrixLogic from './logic/matrix';

type Mode = 'matrix' | 'sle';

export default function App() {
  const [mode, setMode] = useState<Mode>('matrix');
  
  const [inputA, setInputA] = useState('1 2\n2 4');
  const [inputB, setInputB] = useState('1 2\n3 4');
  const [inputSLE, setInputSLE] = useState('5\n10');
  
  const [matrixA, setMatrixA] = useState<MatrixLogic.Matrix>([[1,2],[2,4]]);
  const [matrixB, setMatrixB] = useState<MatrixLogic.Matrix>([[1,2],[3,4]]);
  const [vectorB, setVectorB] = useState<number[]>([5, 10]);

  const [result, setResult] = useState<MatrixLogic.Matrix | number[] | number | string | null>(null);
  const [steps, setSteps] = useState<(string | MatrixLogic.MatrixStep)[]>([]);
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
      </div>

      <div className="input-section">
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
        ) : (
          <>
            <button onClick={() => solveSLE('gauss')}>Гаусс</button>
            <button onClick={() => solveSLE('cramer')}>Крамер</button>
            <button onClick={() => solveSLE('matrix')}>Матричный</button>
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
