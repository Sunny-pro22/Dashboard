import React, { useState, useEffect } from 'react';
// import './Calculator.css';

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.59.127:8080');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {

      setInput(event.data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    // Clean up the WebSocket when the component unmounts.
    return () => ws.close();
  }, []);

  // If you want to allow manual input via on-screen buttons.
  const handleClick = (value) => {
    if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '=') {
      try {
        // Using eval for simplicity.
        // For production, consider using a dedicated math parser for security.
        const evalResult = eval(input);
        setResult(evalResult);
      } catch (error) {
        setResult('Error');
      }
    } else {
      setInput((prev) => prev + value);
    }
  };

  // Define the buttons on the calculator.
  const buttons = [
    '7', '8', '9', '/', 
    '4', '5', '6', '*', 
    '1', '2', '3', '-', 
    '0', '.', 'C', '+', 
    '(', ')', 'sin(', 'cos(', 
    'tan(', 'log(', 'sqrt(', '=', 
  ];

  return (
    <div className="calculator">
      <div className="display">
        <div className="input">{input}</div>
        <div className="result">{result}</div>
      </div>
      <div className="buttons">
        {buttons.map((btn, index) => (
          <button key={index} onClick={() => handleClick(btn)}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
