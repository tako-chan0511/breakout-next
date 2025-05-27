import React from 'react';
import styles from '../styles/GameOverModal.module.css';

type GameOverModalProps = {
  show: boolean;
  lives: number;
  onRestart: () => void;
};

const GameOverModal: React.FC<GameOverModalProps> = ({ show, lives, onRestart }) => {
  if (!show) return null;
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h3 className={styles.title}>ボールを失いました</h3>
        <p className={styles.text}>残り <span className={styles.lives}>{lives}</span> 個</p>
        <button className={styles.button} onClick={onRestart}>OK</button>
      </div>
    </div>
  );
};

export default GameOverModal;
