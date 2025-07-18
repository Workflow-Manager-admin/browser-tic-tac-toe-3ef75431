import React, { useState, useEffect } from "react";
import "./App.css";

// Color palette constants (should match .css, used for inline and dynamic styles)
const PRIMARY = "#1976D2";
const SECONDARY = "#424242";
const ACCENT = "#E53935";

// PUBLIC_INTERFACE
function App() {
  // Board is 9 cells, "", "X", or "O"
  const [board, setBoard] = useState(Array(9).fill(""));
  // Tracks the current player: true = X; false = O
  const [isXNext, setIsXNext] = useState(true);
  // Null, "X", "O", or "draw"
  const [winner, setWinner] = useState(null);
  // Score state: {X: num, O: num}
  const [score, setScore] = useState({ X: 0, O: 0 });
  // For animating last move
  const [lastMove, setLastMove] = useState(null);
  // Game number (to animate board in/out on restart)
  const [gameIndex, setGameIndex] = useState(0);

  // PUBLIC_INTERFACE
  function calculateWinner(squares) {
    // All line triplets in a 3x3 board in 1d
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let l = 0; l < lines.length; l++) {
      const [a, b, c] = lines[l];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      )
        return squares[a];
    }
    return null;
  }

  // PUBLIC_INTERFACE
  function isBoardFull(squares) {
    return squares.every((cell) => cell);
  }

  // Effect: Check for win/draw on board update
  useEffect(() => {
    const win = calculateWinner(board);
    if (win) {
      setWinner(win);
      setScore((prev) => ({ ...prev, [win]: prev[win] + 1 }));
    } else if (isBoardFull(board)) {
      setWinner("draw");
    }
  }, [board]);

  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] || winner) return;
    const newBoard = board.slice();
    newBoard[idx] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext((prev) => !prev);
    setLastMove(idx);
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    setBoard(Array(9).fill(""));
    setIsXNext(gameIndex % 2 === 0); // Alternate starter for fairness
    setWinner(null);
    setLastMove(null);
    setGameIndex((prev) => prev + 1);
  }

  // PUBLIC_INTERFACE
  function startNewGame() {
    setScore({ X: 0, O: 0 });
    setGameIndex(0);
    setIsXNext(true);
    setBoard(Array(9).fill(""));
    setWinner(null);
    setLastMove(null);
  }

  // Theme: force light (minimalistic, as required)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  // Env usage demo (for expansion: e.g., dynamic branding, API base URL, etc.)
  // Example: process.env.REACT_APP_GAME_NAME, fallback if not defined
  const gameTitle =
    process.env.REACT_APP_GAME_NAME || "Tic Tac Toe";

  // Get turn text
  let statusText;
  if (!winner) {
    statusText = (
      <span>
        <span style={{ color: isXNext ? ACCENT : PRIMARY }}>
          {isXNext ? "X" : "O"}
        </span>
        <span> to move</span>
      </span>
    );
  } else if (winner === "draw") {
    statusText = (
      <span style={{ color: SECONDARY }}>
        Draw!
      </span>
    );
  } else {
    statusText = (
      <span>
        Winner:{" "}
        <span
          style={{
            color: winner === "X" ? ACCENT : PRIMARY,
            fontWeight: 600,
            textShadow: `0 1px 4px ${
              winner === "X" ? ACCENT + "99" : PRIMARY + "77"
            }`,
          }}
        >
          {winner}
        </span>
        <Trophy />
      </span>
    );
  }

  return (
    <div className="tictactoe-app-root">
      <main className="ttt-main">
        <h1 className="ttt-title">{gameTitle}</h1>

        <div
          className="ttt-scoreboard"
          role="region"
          aria-label="Scoreboard"
        >
          <span className="score-x">
            X&nbsp;
            <span className="score-value">{score.X}</span>
          </span>
          <span className="score-sep">:</span>
          <span className="score-o">
            O&nbsp;
            <span className="score-value">{score.O}</span>
          </span>
        </div>

        <div className="ttt-status" aria-live="polite">
          {statusText}
        </div>

        {/* Game board */}
        <div
          key={gameIndex}
          className={`ttt-board ${winner ? "board-ended" : ""}`}
          aria-label="Tic Tac Toe game board"
          tabIndex={0}
        >
          {board.map((cell, idx) => (
            <Square
              key={idx}
              value={cell}
              onClick={() => handleCellClick(idx)}
              animated={lastMove === idx}
              disabled={!!cell || !!winner}
            />
          ))}
        </div>

        <div className="ttt-controls">
          <button
            onClick={restartGame}
            className="ttt-btn"
            data-variant="primary"
            aria-label="Restart Game"
          >
            Restart Game
          </button>
          <button
            onClick={startNewGame}
            className="ttt-btn"
            data-variant="secondary"
            aria-label="Start New Game"
          >
            New Game
          </button>
        </div>

        <footer className="ttt-footer">
          <small>
            Made with <span style={{ color: ACCENT }}>♥</span> React
          </small>
        </footer>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function Square({ value, onClick, animated, disabled }) {
  // Animate with CSS class or inline transition
  return (
    <button
      className={`ttt-square${animated ? " animated" : ""}${
        disabled ? " disabled" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      aria-label={
        value
          ? `Cell with ${value}`
          : "Empty cell"
      }
    >
      <span className={`cell-content${animated ? " pop" : ""}`}>
        {value}
      </span>
    </button>
  );
}

// SVG trophy for winner indication
function Trophy() {
  return (
    <svg
      width="16"
      height="16"
      style={{ marginLeft: 6, verticalAlign: "middle" }}
      viewBox="0 0 20 20"
      fill={ACCENT}
      aria-label="Trophy"
    >
      <path d="M6 2V4H3V6C3 10.25 6.5 14 10 14C13.5 14 17 10.25 17 6V4H14V2H6ZM4.998 6C5 9.599 8.031 12 10 12C11.969 12 15 9.599 15.002 6H4.998ZM8 17C8 17.552 8.448 18 9 18H11C11.552 18 12 17.552 12 17V16H8V17Z"/>
    </svg>
  );
}

export default App;
