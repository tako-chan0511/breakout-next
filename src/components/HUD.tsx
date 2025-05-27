import React from 'react';
import styles from '../styles/HUD.module.css';

type HUDProps = {
  score: number;
  lives: number;
  level: number;
};

const HUD: React.FC<HUDProps> = ({ score, lives, level }) => {
  return (
    <div className={styles.hudContainer}>
      <div className={styles.hudItem}>
        <span className={styles.label}>スコア:</span>
        <span className={styles.value}>{score}</span>
      </div>
      <div className={styles.hudItem}>
        <span className={styles.label}>残ボール数:</span>
        <span className={styles.value}>{lives}</span>
      </div>
      <div className={styles.hudItem}>
        <span className={styles.label}>レベル:</span>
        <span className={styles.value}>{level}</span>
      </div>
    </div>
  );
};

export default HUD;
