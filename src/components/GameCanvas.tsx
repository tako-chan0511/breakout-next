// src/components/GameCanvas.tsx
"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import styles from "@/styles/GameCanvas.module.css";
import type { GameCanvasHandle } from "./GameCanvasHandle";

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
  onGameOver: (payload: {
    score: number;
    lives: number;
    level: number;
  }) => void;
}

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  (
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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const width = 480;
    const height = 320;
    const ballRadius = 10;
    const paddleHeight = 10;

    const ballX = useRef(width / 2);
    const ballY = useRef(height - paddleHeight - ballRadius);
    const dx = useRef(2);
    const dy = useRef(-2);
    const paddleX = useRef((width - paddleWidth) / 2);
    const livesRef = useRef(3);
    const paused = useRef(false);
    const gameOverRef = useRef(false);
    const scoreRef = useRef(0);
    const levelRef = useRef(1);

    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const bricks = useRef<{ x: number; y: number; status: number }[][]>([]);

    // 初回マウントでブロック配置を準備
    useEffect(() => {
      bricks.current = Array.from({ length: brickColumnCount }, () =>
        Array.from({ length: brickRowCount }, () => ({
          x: 0,
          y: 0,
          status: 1,
        }))
      );
    }, []);

    // 親からリセットメソッド公開
    useImperativeHandle(ref, () => ({
      resetBall() {
        ballX.current = width / 2;
        ballY.current = height - paddleHeight - ballRadius;
        dx.current = 2;
        dy.current = -2;
        paused.current = false;
      },
    }));

    // ブロック描画ヘルパー
    const drawBricks = (ctx: CanvasRenderingContext2D) => {
      bricks.current.forEach((col, c) =>
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
        })
      );
    };

    // 初期一回描画: 背景＋ブロック＋パドル＋ボール
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      drawBricks(ctx);
      // パドル
      ctx.beginPath();
      ctx.rect(
        paddleX.current,
        height - paddleHeight,
        paddleWidth,
        paddleHeight
      );
      ctx.fillStyle = paddleColor;
      ctx.fill();
      ctx.closePath();
      // ボール
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = ballColor;
      ctx.fill();
      ctx.closePath();
    }, [backgroundColor, brickColors, paddleColor, paddleWidth, ballColor]);

    // メインゲームループ
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      function initGame() {
        ballX.current = width / 2;
        ballY.current = height - paddleHeight - ballRadius;
        dx.current = 2;
        dy.current = -2;
        paddleX.current = (width - paddleWidth) / 2;
        livesRef.current = 3;
        scoreRef.current = 0;
        levelRef.current = 1;
        paused.current = false;
        gameOverRef.current = false;
        bricks.current.forEach(col => col.forEach(b => (b.status = 1)));
        onUpdateScore(0);
        onUpdateLives(3);
        onUpdateLevel(1);
      }
      if (!gameActive) return;
      initGame();

      const leftPressed = { value: false };
      const rightPressed = { value: false };
      const keyDownHandler = (e: KeyboardEvent) => {
        if (!gameActive || gameOverRef.current || paused.current) return;
        if (e.key === "ArrowLeft") leftPressed.value = true;
        if (e.key === "ArrowRight") rightPressed.value = true;
      };
      const keyUpHandler = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") leftPressed.value = false;
        if (e.key === "ArrowRight") rightPressed.value = false;
      };

      // タッチ用
      let lastTouchX: number | null = null;
      const tStart = (e: TouchEvent) => {
        if (!gameActive || gameOverRef.current || paused.current) return;
        lastTouchX = e.touches[0].clientX;
      };
      const tMove = (e: TouchEvent) => {
        if (
          !gameActive ||
          gameOverRef.current ||
          paused.current ||
          lastTouchX === null
        )
          return;
        const tx = e.touches[0].clientX;
        const scale = width / canvas.getBoundingClientRect().width;
        const delta = (tx - lastTouchX) * scale;
        paddleX.current = Math.max(
          0,
          Math.min(paddleX.current + delta, width - paddleWidth)
        );
        lastTouchX = tx;
      };
      const tEnd = () => {
        lastTouchX = null;
      };

      const collisionDetection = () => {
        let remaining = 0;
        bricks.current.forEach(col =>
          col.forEach(b => {
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
                scoreRef.current += 10;
                onUpdateScore(scoreRef.current);
              }
            }
          })
        );
        if (remaining === 0) {
          levelRef.current++;
          dx.current *= 1.2;
          dy.current *= 1.2;
          bricks.current.forEach(col => col.forEach(b => (b.status = 1)));
          onUpdateLevel(levelRef.current);
        }
      };

      function loop() {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        drawBricks(ctx);

        // パドル
        ctx.beginPath();
        ctx.rect(
          paddleX.current,
          height - paddleHeight,
          paddleWidth,
          paddleHeight
        );
        ctx.fillStyle = paddleColor;
        ctx.fill();
        ctx.closePath();
        // ボール
        ctx.beginPath();
        ctx.arc(ballX.current, ballY.current, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballColor;
        ctx.fill();
        ctx.closePath();

        if (gameActive && !gameOverRef.current && !paused.current) {
          if (leftPressed.value)
            paddleX.current = Math.max(0, paddleX.current - 7);
          if (rightPressed.value)
            paddleX.current = Math.min(
              width - paddleWidth,
              paddleX.current + 7
            );

          collisionDetection();

          // 壁バウンス
          if (
            ballX.current + dx.current > width - ballRadius ||
            ballX.current + dx.current < ballRadius
          )
            dx.current = -dx.current;
          if (ballY.current + dy.current < ballRadius) dy.current = -dy.current;
          else if (ballY.current + dy.current > height - ballRadius) {
            if (
              ballX.current > paddleX.current &&
              ballX.current < paddleX.current + paddleWidth
            ) {
              dy.current = -dy.current;
            } else {
              livesRef.current--;
              onUpdateLives(livesRef.current);
              if (livesRef.current > 0) {
                paused.current = true;
                onLostBall(livesRef.current);
              } else {
                paused.current = true;
                gameOverRef.current = true;
                onGameOver({
                  score: scoreRef.current,
                  lives: livesRef.current,
                  level: levelRef.current,
                });
                return;
              }
            }
          }

          ballX.current += dx.current;
          ballY.current += dy.current;
        }

        if (!gameOverRef.current) requestAnimationFrame(loop);
      }

      window.addEventListener("keydown", keyDownHandler);
      window.addEventListener("keyup", keyUpHandler);
      if (enableMouse) {
        canvas.addEventListener("touchstart", tStart, { passive: false });
        canvas.addEventListener("touchmove", tMove, { passive: false });
        canvas.addEventListener("touchend", tEnd);
      }

      loop();

      return () => {
        window.removeEventListener("keydown", keyDownHandler);
        window.removeEventListener("keyup", keyUpHandler);
        if (enableMouse) {
          canvas.removeEventListener("touchstart", tStart as any);
          canvas.removeEventListener("touchmove", tMove as any);
          canvas.removeEventListener("touchend", tEnd as any);
        }
      };
    }, [
      gameActive,
      paddleWidth,
      backgroundColor,
      brickColors,
      paddleColor,
      ballColor,
    ]);

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
  }
);

GameCanvas.displayName = "GameCanvas";
export default GameCanvas;
