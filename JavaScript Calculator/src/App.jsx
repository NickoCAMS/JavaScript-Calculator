import React, { useReducer } from 'react';
import './App.scss';

const initialState = {
  display: '0',
  expression: '0',
  previousResult: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'CLEAR':
      return initialState;

    case 'ADD_POINT':
      if (state.display.includes('.')) {
        return state;
      }
      return {
        ...state,
        display: state.display === '0' ? '0.' : state.display + action.payload,
        expression: state.display === '0' ? state.expression + '.' : state.expression + action.payload
      };

    case 'ADD_DIGIT':
      return {
        ...state,
        display: state.display === '0' || ['+', '-', '*', '/'].includes(state.display) ? action.payload : state.display + action.payload,
        expression: state.display === '0' ? action.payload : state.expression + action.payload
      };

    case 'SET_OPERATOR':
      if (action.payload === '-' && ['+', '*', '/'].includes(state.expression.trim().slice(-1))) {
        return {
          ...state,
          expression: state.expression + ' ' + action.payload + ' ',
          display: '-'
        };
      }

      if (['+', '*', '/'].includes(state.expression.trim().slice(-1))) {
        return {
          ...state,
          expression: state.expression.slice(0, -2) + action.payload + ' ',
          display: action.payload
        };
      }

      return {
        ...state,
        expression: state.previousResult !== null 
          ? state.previousResult + ' ' + action.payload + ' ' 
          : state.expression + ' ' + action.payload + ' ',
        display: action.payload,
        previousResult: null
      };

    case 'EVALUATE':
      if (!state.expression || !/[+\-*/]/.test(state.expression) || isNaN(state.expression.trim().slice(-1))) {
        return state;
      }
      if (state.expression.includes('=')) {
        return {
          ...state
        };
      }
      let count = 0;
      let previousWasOperator = false;

      for (const char of state.expression) {
        if (char === ' ') continue; 
        if (['+', '-', '*', '/'].includes(char)) {
          if (previousWasOperator) {
            count += 1; 
          } else {
            count = 1;
          }
          previousWasOperator = true;
        } else {
          previousWasOperator = false;
          count = 0;
        }

        if (count >= 3) {
          break; 
        }
      }

      if (count >= 3) {
        const operators = state.expression.match(/[+\-*/]/g);
        const lastOperator = operators ? operators[operators.length - 1] : null;

        const cleanedExpression = state.expression
          .replace(/[+\-*/]/g, '') 
          .trim(); 

        const finalExpression = cleanedExpression.split(/\s+/).join(` ${lastOperator} `); 

        try {
          const result = eval(finalExpression);
          return {
            display: String(result),
            expression: finalExpression + ' = ' + result,
            previousResult: result
          };
        } catch {
          return {
            display: 'NaN',
            expression: '0',
            previousResult: null
          };
        }
      } else {
        try {
          const result = eval(state.expression);
          return {
            display: String(result),
            expression: state.expression + ' = ' + result,
            previousResult: result
          };
        } catch {
          return {
            display: 'NaN',
            expression: '0',
            previousResult: null
          };
        }
      }

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const numberButtons = [
    { id: 'zero', value: '0' },
    { id: 'one', value: '1' },
    { id: 'two', value: '2' },
    { id: 'three', value: '3' },
    { id: 'four', value: '4' },
    { id: 'five', value: '5' },
    { id: 'six', value: '6' },
    { id: 'seven', value: '7' },
    { id: 'eight', value: '8' },
    { id: 'nine', value: '9' },
  ];

  const operatorButtons = [
    { id: 'add', value: '+' },
    { id: 'subtract', value: '-' },
    { id: 'multiply', value: '*' },
    { id: 'divide', value: '/' },
    { id: 'equals', value: '=' },
  ];

  const handleDigitClick = (digit) => {
    dispatch({ type: 'ADD_DIGIT', payload: digit });
  };

  const handleOperatorClick = (operator) => {
    dispatch({ type: 'SET_OPERATOR', payload: operator });
  };

  const handleEvaluate = () => {
    dispatch({ type: 'EVALUATE' });
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR' });
  };

  const handleDecimal = () => {
    dispatch({ type: 'ADD_POINT', payload: '.' });
  };

  return (
    <div className="calculator">
      <div className="expression">{state.expression || '0'}</div>
      <div className="display" id='display'>{state.display}</div>
      <div className="buttons">
        <button id="clear" onClick={handleClear}>AC</button>
        <button id="decimal" onClick={handleDecimal}>.</button>
        {numberButtons.map(({ id, value }) => (
          <button 
            key={id} 
            id={id} 
            onClick={() => handleDigitClick(value)}
            disabled={value === '.' && state.display.includes('.')} 
          >
            {value}
          </button>
        ))}
        {operatorButtons.map(({ id, value }) => (
          <button key={id} id={id} onClick={() => value === '=' ? handleEvaluate() : handleOperatorClick(value)}>
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;

