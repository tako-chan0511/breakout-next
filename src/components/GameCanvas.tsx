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
  onGameOver: (payload: { score: number; lives: number; level: number }) => void;
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
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // ─── Canvas 定数 ─────────────────────────────
    const width = 480;
    const height = 320;
    const ballRadius = 10;
    const paddleHeight = 10;

    // ─── ゲームステート（ref）───────────────────
    const ballX = useRef(width / 2);
    const ballY = useRef(height - paddleHeight - ballRadius);
    const dx = useRef(2);
    const dy = useRef(-2);
    const paddleX = useRef((width - paddleWidth) / 2);
    const lives = useRef(3);
    const paused = useRef(false);
    const gameOver = useRef(false);
    const score = useRef(0);
    const level = useRef(1);

    // ─── ブロック設定 ────────────────────────────
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const bricks = useRef<{ x: number; y: number; status: number }[][]>([]);

    // ─── タッチ用ハンドラ & 最後のタッチX ───────────────────
    let lastTouchX: number | null = null;
    function touchStartHandler(e: React.TouchEvent) {
      if (!gameActive || gameOver.current) return;
      lastTouchX = e.touches[0].clientX;
    }
    function touchMoveHandler(e: React.TouchEvent) {
      if (
        !gameActive ||
        gameOver.current ||
        lastTouchX === null ||
        !canvasRef.current
      )
        return;
      const tx = e.touches[0].clientX;
      const scale =
        width / canvasRef.current.getBoundingClientRect().width;
      const delta = (tx - lastTouchX) * scale;
      paddleX.current = Math.max(
        0,
        Math.min(paddleX.current + delta, width - paddleWidth)
      );
      lastTouchX = tx;
    }
    function touchEndHandler() {
      lastTouchX = null;
    }

    // ─── 初期ブロック配置 ─────────────────────────
    useEffect(() => {
      bricks.current = [];
      for (let c = 0; c < brickColumnCount; c++) {
        bricks.current[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
          bricks.current[c][r] = { x: 0, y: 0, status: 1 };
        }
      }
    }, []);

    // ─── resetBall を親から呼べるように公開 ─────────────────
    useImperativeHandle(ref, () => ({
      resetBall() {
        ballX.current = width / 2;
        ballY.current = height - paddleHeight - ballRadius;
        dx.current = 2;
        dy.current = -2;
        paused.current = false;
      },
    }));

    // ─── マウント時に一度だけ「初期画面描画」 ─────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      // 背景
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      // ブロック
      bricks.current.forEach((col, c) =>
        col.forEach((b, r) => {
          if (b.status !== 1) return;
          const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const y = r * (brickHeight + brickPadding) + brickOffsetTop;
          ctx.fillStyle = brickColors[r % brickColors.length];
          ctx.fillRect(x, y, brickWidth, brickHeight);
        })
      );
      // パドル
      ctx.fillStyle = paddleColor;
      ctx.fillRect(paddleX.current, height - paddleHeight, paddleWidth, paddleHeight);
      // ボール
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = ballColor;
      ctx.fill();
      ctx.closePath();
    }, []); // deps 空 = マウント時のみ

    // ─── ゲームループ & 入力管理 ──────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ゲーム初期化
      function initGame() {
        ballX.current = width / 2;
        ballY.current = height - paddleHeight - ballRadius;
        dx.current = 2;
        dy.current = -2;
        paddleX.current = (width - paddleWidth) / 2;
        lives.current = 3;
        score.current = 0;
        level.current = 1;
        paused.current = false;
        gameOver.current = false;
        bricks.current.forEach((col) => col.forEach((b) => (b.status = 1)));
        onUpdateScore(0);
        onUpdateLives(3);
        onUpdateLevel(1);
      }
      if (!gameActive) return;
      initGame();

      // 入力
      const leftPressed = { value: false };
      const rightPressed = { value: false };
      const keyDown = (e: KeyboardEvent) => {
        if (!gameActive || gameOver.current || paused.current) return;
        if (e.key === "ArrowLeft") leftPressed.value = true;
        if (e.key === "ArrowRight") rightPressed.value = true;
      };
      const keyUp = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") leftPressed.value = false;
        if (e.key === "ArrowRight") rightPressed.value = false;
      };
      const touchStart = (e: TouchEvent) => {
        if (!gameActive || gameOver.current || paused.current) return;
        lastTouchX = e.touches[0].clientX;
      };
      const touchMove = (e: TouchEvent) => {
        if (!gameActive || gameOver.current || paused.current || lastTouchX === null)
          return;
        const tx = e.touches[0].clientX;
        const scale = width / canvas.getBoundingClientRect().width;
        paddleX.current = Math.max(
          0,
          Math.min(paddleX.current + (tx - lastTouchX) * scale, width - paddleWidth)
        );
        lastTouchX = tx;
      };
      const touchEnd = () => {
        lastTouchX = null;
      };

      // 描画ヘルパー
      const clearBG = () => {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      };
      const drawBricks = () => {
        bricks.current.forEach((col, c) =>
          col.forEach((b, r) => {
            if (b.status !== 1) return;
            const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const y = r * (brickHeight + brickPadding) + brickOffsetTop;
            ctx.fillStyle = brickColors[r % brickColors.length];
            ctx.fillRect(x, y, brickWidth, brickHeight);
          })
        );
      };
      const drawPaddle = () => {
        ctx.fillStyle = paddleColor;
        ctx.fillRect(paddleX.current, height - paddleHeight, paddleWidth, paddleHeight);
      };
      const drawBall = () => {
        ctx.beginPath();
        ctx.arc(ballX.current, ballY.current, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballColor;
        ctx.fill();
        ctx.closePath();
      };
      const collisionDetection = () => {
        let rem = 0;
        bricks.current.forEach((col) =>
          col.forEach((b) => {
            if (b.status === 1) {
              rem++;
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
          })
        );
        if (rem === 0) {
          level.current++;
          dx.current *= 1.2;
          dy.current *= 1.2;
          bricks.current.forEach((col) => col.forEach((b) => (b.status = 1)));
          onUpdateLevel(level.current);
        }
      };

      // メインループ
      function draw() {
        clearBG();
        drawBricks();
        drawPaddle();
        drawBall();

        if (gameActive && !gameOver.current && !paused.current) {
          if (leftPressed.value)
            paddleX.current = Math.max(0, paddleX.current - 7);
          if (rightPressed.value)
            paddleX.current = Math.min(
              width - paddleWidth,
              paddleX.current + 7
            );

          collisionDetection();

          // 壁
          if (
            ballX.current + dx.current > width - ballRadius ||
            ballX.current + dx.current < ballRadius
          ) {
            dx.current = -dx.current;
          }
          if (ballY.current + dy.current < ballRadius) {
            dy.current = -dy.current;
          } else if (ballY.current + dy.current > height - ballRadius) {
            if (
              ballX.current > paddleX.current &&
              ballX.current < paddleX.current + paddleWidth
            ) {
              dy.current = -dy.current;
            } else {
              lives.current--;
              onUpdateLives(lives.current);
              if (lives.current > 0) {
                paused.current = true;
                onLostBall(lives.current);
              } else {
                paused.current = true;
                gameOver.current = true;
                onGameOver({
                  score: score.current,
                  lives: lives.current,
                  level: level.current,
                });
                return;
              }
            }
          }

          // ボール移動
          ballX.current += dx.current;
          ballY.current += dy.current;
        }
        if (!gameOver.current) {
          requestAnimationFrame(draw);
        }
      }

      // イベント登録
      window.addEventListener("keydown", keyDown);
      window.addEventListener("keyup", keyUp);
      if (enableMouse) {
        canvas.addEventListener("touchstart", touchStart, {
          passive: false,
        });
        canvas.addEventListener("touchmove", touchMove, {
          passive: false,
        });
        canvas.addEventListener("touchend", touchEnd);
      }
      draw();

      return () => {
        window.removeEventListener("keydown", keyDown);
        window.removeEventListener("keyup", keyUp);
        if (enableMouse) {
          canvas.removeEventListener("touchstart", touchStart as any);
          canvas.removeEventListener("touchmove", touchMove as any);
          canvas.removeEventListener("touchend", touchEnd as any);
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
        <div
          className={styles.swipeArea}
          onTouchStart={touchStartHandler}
          onTouchMove={touchMoveHandler}
          onTouchEnd={touchEndHandler}
        />
      </div>
    );
  }
);

GameCanvas.displayName = "GameCanvas";
export default GameCanvas;
