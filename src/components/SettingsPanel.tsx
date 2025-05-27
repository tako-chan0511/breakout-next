import React from 'react'
import styles from '../styles/SettingsPanel.module.css'

type SettingsPanelProps = {
  disabled: boolean
  paddleWidth: number
  onPaddleWidthChange: (width: number) => void
  ballColor: string
  onBallColorChange: (color: string) => void
  paddleColor: string
  onPaddleColorChange: (color: string) => void
  onStart: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  disabled,
  paddleWidth,
  onPaddleWidthChange,
  ballColor,
  onBallColorChange,
  paddleColor,
  onPaddleColorChange,
  onStart,
}) => {
  return (
    <div className={`${styles.panel} ${disabled ? styles.disabled : ''}`}>      
      <label className={styles.label}>
        パドル幅:
        <input
          type="number"
          min={20}
          max={300}
          value={paddleWidth}
          disabled={disabled}
          onChange={e => onPaddleWidthChange(Number(e.target.value))}
        />
      </label>

      <label className={styles.label}>
        ボールカラー:
        <input
          type="color"
          value={ballColor}
          disabled={disabled}
          onChange={e => onBallColorChange(e.target.value)}
        />
      </label>

      <label className={styles.label}>
        パドルカラー:
        <input
          type="color"
          value={paddleColor}
          disabled={disabled}
          onChange={e => onPaddleColorChange(e.target.value)}
        />
      </label>

      <button
        className={styles.button}
        onClick={onStart}
        disabled={disabled}
      >
        {disabled ? 'ゲーム中…' : 'ゲームスタート'}
      </button>
    </div>
  )
}

export default SettingsPanel
