import styles from './PowerMeter.module.css'
import frameImage from '../../assets/images/power-meter-frame.png'


// Высота внутренней области мензурки, по которой движется заливка
const TRACK_HEIGHT = 144
// Нижний сдвиг указателя относительно wrapper
const TRACK_BOTTOM_OFFSET = 0
// Высота белой полоски-указателя
const POINTER_HEIGHT = 0

function PowerMeter({ power, active, animateToTop }) {
  // Ограничиваем значение силы от 0 до 1
  const normalizedPower = Math.max(0, Math.min(1, power))
  // В состоянии победы принудительно добиваем шкалу до самого верха
  const visualPower = animateToTop ? 1 : normalizedPower

  // Позиция белого указателя по вертикали
  const pointerBottom =
    TRACK_BOTTOM_OFFSET + visualPower * (TRACK_HEIGHT - POINTER_HEIGHT)

  return (
    <div className={styles.wrapper}>
      {/* Внутренняя область шкалы, в которой живёт зелёная заливка */}
      <div className={`${styles.fillTrack} ${animateToTop ? styles.fillTrackWin : ''}`}>
        <div
          className={`${styles.fill} ${animateToTop ? styles.fillWin : ''}`}
          style={{ '--fill-scale': visualPower }}
        />
      </div>

      {/* Белый горизонтальный указатель уровня */}
      <div
        className={`${styles.pointer} ${animateToTop ? styles.pointerWin : ''}`}
        style={{ bottom: `${pointerBottom}px` }}
      />

      {/* Рамка мензурки поверх заливки */}
      <img
        className={`${styles.frame} ${active ? styles.frameActive : ''}`}
        src={frameImage}
        alt="Шкала силы удара"
      />
    </div>
  )
}

export default PowerMeter