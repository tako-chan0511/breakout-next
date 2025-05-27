import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import styles from '../styles/GameCanvas.module.css';
import type { GameCanvasHandle } from './GameCanvasHandle';

export interface GameCanvasProps {
  paddleWidth: number;
  ballColor: string;
  paddleColor: string;
  brickColors: string[];
  backgroundColor: string;
  enableMouse?: boolean;
  gameActive: boolean;
  onUpdateScore: (score: number) => void;
  onUpdateLives: (lives: number) => void;
  onUpdateLevel: (level: number) => void;
  onLostBall: (lives: number) => void;
  onGameOver: (payload: { score: number; lives: number }) => void;
}

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>((
  {
    paddleWidth,
    ballColor,
    paddleColor,
    brickColors,
    backgroundColor,
    enableMouse = false,
    gameActive,
    onUpdateScore,
    onUpdateLives,
    onUpdateLevel,
    onLostBall,
    onGameOver,
  },
  ref
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas dimensions
  const width = 480;
  const height = 320;

  // Mutable game state refs
  const ballX = useRef(width / 2);
  const ballY = useRef(height - 30);
  const dx = useRef(2);
  const dy = useRef(-2);
  const paddleX = useRef((width - paddleWidth) / 2);
  const lives = useRef(3);
  const paused = useRef(false);
  const gameOver = useRef(false);
  const score = useRef(0);
  const level = useRef(1);

  // Brick settings
  const brickRowCount = 3;
  const brickColumnCount = 5;
  const brickWidth = 75;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 30;
  const bricks = useRef<{ x: number; y: number; status: number }[][]>([]);

  // Initialize bricks
  useEffect(() => {
    bricks.current = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks.current[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks.current[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }, []);

  // Expose resetBall method
  useImperativeHandle(ref, () => ({
    resetBall() {
      ballX.current = width / 2;
      ballY.current = height - 30;
      dx.current = 2;
      dy.current = -2;
      paused.current = false;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize game state
    function initGame() {
      ballX.current = width / 2;
      ballY.current = height - 30;
      dx.current = 2;
      dy.current = -2;
      paddleX.current = (width - paddleWidth) / 2;
      lives.current = 3;
      score.current = 0;
      level.current = 1;
      gameOver.current = false;
      paused.current = false;
      bricks.current.forEach(col => col.forEach(b => (b.status = 1)));
      onUpdateScore(0);
      onUpdateLives(3);
      onUpdateLevel(1);
    }
    initGame();

    // Input handlers
    const leftPressed = { value: false };
    const rightPressed = { value: false };

    function keyDownHandler(e: KeyboardEvent) {
      if (!gameActive || gameOver.current || paused.current) return;
      if (e.key === 'ArrowLeft') leftPressed.value = true;
      if (e.key === 'ArrowRight') rightPressed.value = true;
    }
    function keyUpHandler(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') leftPressed.value = false;
      if (e.key === 'ArrowRight') rightPressed.value = false;
    }

    let lastTouchX: number | null = null;
    function touchStartHandler(e: TouchEvent) {
      if (!gameActive || gameOver.current || paused.current) return;
      lastTouchX = e.touches[0].clientX;
    }
    function touchMoveHandler(e: TouchEvent) {
      if (!gameActive || gameOver.current || paused.current || lastTouchX === null) return;
      const tx = e.touches[0].clientX;
      const scale = width / canvas.getBoundingClientRect().width;
      const delta = (tx - lastTouchX) * scale;
      paddleX.current = Math.max(0, Math.min(paddleX.current + delta, width - paddleWidth));
      lastTouchX = tx;
    }
    function touchEndHandler() {
      lastTouchX = null;
    }

    // Drawing functions
    function clearBackground() {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    function drawHUD() {
      ctx.font = '16px Arial';
      ctx.fillStyle = ballColor;
      ctx.fillText(`Score: ${score.current}`, 8, 20);
      ctx.fillText(`Level: ${level.current}`, width - 70, 20);
      ctx.fillText(`Lives: ${lives.current}`, width / 2 - 30, 20);
    }
    function drawBricks() {
      bricks.current.forEach((col, c) => {
        col.forEach((b, r) => {
          if (b.status !== 1) return;
          const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const y = r * (brickHeight + brickPadding) + brickOffsetTop;
          b.x = x;
          b.y = y;
          ctx.beginPath();
          ctx.fillStyle = brickColors[r % brickColors.length];
          ctx.rect(x, y, brickWidth, brickHeight);
          ctx.fill();
          ctx.closePath();
        });
      });
    }
    function drawBall() {
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = ballColor;
      ctx.fill();
      ctx.closePath();
    }
    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(paddleX.current, height - paddleHeight, paddleWidth, paddleHeight);
      ctx.fillStyle = paddleColor;
      ctx.fill();
      ctx.closePath();
    }
    function collisionDetection() {
      let remaining = 0;
      bricks.current.forEach(col => col.forEach(b => {
        if (b.status === 1) {
          remaining++;
          if (
            ballX.current > b.x &&
            ballX.current < b.x + brickWidth &&
            ballY.current > b.y &&
            ballY.current < b.y + brickHeight
          ) {
            dy.current = -dy.current;
            b.status = 0;
            score.current += 10;
            onUpdateScore(score.current);
          }
        }
      }));
      if (remaining === 0) {
        level.current++;
        dx.current *= 1.2;
        dy.current *= 1.2;
        bricks.current.forEach(col => col.forEach(b => (b.status = 1)));
        onUpdateLevel(level.current);
      }
    }

    // Main draw loop
    function draw() {
      clearBackground();
      drawHUD();
      drawBricks();
      drawPaddle();
      drawBall();
      if (gameActive && !gameOver.current) {
        // Move paddle
        if (leftPressed.value) paddleX.current = Math.max(0, paddleX.current - 7);
        if (rightPressed.value) paddleX.current = Math.min(width - paddleWidth, paddleX.current + 7);
        // Brick collision
        collisionDetection();
        // Wall collision
        if (ballX.current + dx.current > width - ballRadius || ballX.current + dx.current < ballRadius) dx.current = -dx.current;
        if (ballY.current + dy.current < ballRadius) dy.current = -dy.current;
        else if (ballY.current + dy.current > height - ballRadius) {
          // Paddle collision
          if (ballX.current > paddleX.current && ballX.current < paddleX.current + paddleWidth) {
            dy.current = -dy.current;
          } else {
            // Lost ball
            lives.current--;
            onUpdateLives(lives.current);
            onLostBall(lives.current);
            paused.current = true;
            if (lives.current === 0) {
              gameOver.current = true;
              onGameOver({ score: score.current, lives: lives.current });
            }
          }
        }
        // Move ball
        ballX.current += dx.current;
        ballY.current += dy.current;
      }
      requestAnimationFrame(draw);
    }

    // Attach input listeners
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    if (enableMouse) {
      canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
      canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
      canvas.addEventListener('touchend', touchEndHandler);
    }

    draw();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      if (enableMouse) {
        canvas.removeEventListener('touchstart', touchStartHandler as EventListener);
        canvas.removeEventListener('touchmove', touchMoveHandler as EventListener);
        canvas.removeEventListener('touchend', touchEndHandler as EventListener);
      }
    };
  }, [gameActive, paddleWidth]);

  return (
    <div className={styles.canvasWrapper}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.gameCanvas}
      />
    </div>
  );
});

export default GameCanvas;
