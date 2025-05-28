// src/pages/index.tsx
import { useState, useRef } from "react";
// import { flushSync } from "react-dom";
import type { NextPage } from "next";
import SettingsPanel from "@/components/SettingsPanel";
import HUD from "@/components/HUD";
import GameCanvas, { GameCanvasHandle } from "@/components/GameCanvas";
import GameOverModal from "@/components/GameOverModal";

const Home: NextPage = () => {
  // ── 設定値 ───────────────────────────────────────────────
  const [paddleWidth, setPaddleWidth] = useState(75);
  const [ballColor, setBallColor] = useState("#FF0000");
  const [paddleColor, setPaddleColor] = useState("#00FF00");
  const [brickColors] = useState<string[]>(["#F00", "#0F0", "#00F", "#FF0"]);
  const [backgroundColor] = useState<string>("#000000");

  // ── ゲーム制御フラグ ────────────────────────────────
  const [started, setStarted] = useState(false);

  // ── HUD 用ステート ─────────────────────────────────
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  // ── モーダル表示制御 ─────────────────────────────────
  const [lostModalVisible, setLostModalVisible] = useState(false);
  const [gameOverModalVisible, setGameOverModalVisible] = useState(false);

  // ── GameCanvas のメソッド呼び出し用 ref ─────────────────
  const canvasRef = useRef<GameCanvasHandle>(null);

  // ── ゲーム開始 ───────────────────────────────────────
  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setLostModalVisible(false);
    setGameOverModalVisible(false);
    setStarted(true);
    canvasRef.current?.resetBall();
  };

  // ── ボールロスト時ハンドラ ─────────────────────────────
  const handleLostBall = (remaining: number) => {
    setLives(remaining);
    setLostModalVisible(true);
  };
  const handleRestartBall = () => {
    setLostModalVisible(false);
    canvasRef.current?.resetBall();
  };

  // ── ゲームオーバー時ハンドラ ────────────────────────────
  // payload.level が渡されていればそれを使い、なければ内部ステートの level をそのまま表示します
  const handleGameOver = (payload: {
    score: number;
    lives: number;
    level?: number;
  }) => {
 
      setScore(payload.score);
      setLives(payload.lives);
      if (typeof payload.level === "number") {
        setLevel(payload.level);
      }
  
    // フラグは通常どおり
    setGameOverModalVisible(true);
    setStarted(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h1>Next.js版 ブロック崩し</h1>

      {/* 設定パネル */}
      <SettingsPanel
        disabled={started}
        paddleWidth={paddleWidth}
        onPaddleWidthChange={setPaddleWidth}
        ballColor={ballColor}
        onBallColorChange={setBallColor}
        paddleColor={paddleColor}
        onPaddleColorChange={setPaddleColor}
        onStart={startGame}
      />

      {/* HUD */}
      <HUD score={score} lives={lives} level={level} />

      {/* ゲーム本体 */}
      <GameCanvas
        ref={canvasRef}
        paddleWidth={paddleWidth}
        ballColor={ballColor}
        paddleColor={paddleColor}
        brickColors={brickColors}
        backgroundColor={backgroundColor}
        enableMouse
        gameActive={started}
        onUpdateScore={setScore}
        onUpdateLives={setLives}
        onUpdateLevel={setLevel}
        onLostBall={handleLostBall}
        onGameOver={handleGameOver}
      />

      {/* ボール喪失モーダル */}
      <GameOverModal
        show={lostModalVisible}
        lives={lives}
        onRestart={handleRestartBall}
      />

      {/* ゲームオーバーポップアップ */}
      {gameOverModalVisible && (
        <div
          className="game-over-popup"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#333",
              color: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2>ゲームオーバー</h2>
            <p>レベル: {level}</p>
            <p>得点: {score}</p>
            <button
              onClick={() => setGameOverModalVisible(false)}
              style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
