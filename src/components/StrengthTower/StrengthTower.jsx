import styles from './StrengthTower.module.css'
// import towerFrame from '../../assets/images/measure-frame.png'
import rubyImage from '../../assets/images/ruby.png'
import glowSoft from '../../assets/images/prize-glow-soft.png'
import glowSharp from '../../assets/images/prize-glow-sharp.png'


// Настройки сегментов центральной шкалы:
// базовый цвет, активный цвет и высота каждого сегмента
const SEGMENTS = [
   {
    activeColor: 'var(--segment-green-1)',
    baseColor: '#254B9D',
    height: '50px',
  },
  {
    activeColor: 'var(--segment-green-2)',
    baseColor: '#3A5CA5',
    height: '45px',
  },
  {
    activeColor: 'var(--segment-green-3)',
    baseColor: '#5878BE',
    height: '40px',
  },
  {
    activeColor: 'var(--segment-lime)',
    baseColor: '#7593D6',
    height: '35px',
  },
  {
    activeColor: 'var(--segment-yellow)',
    baseColor: '#94AADC',
    height: '30px',
  },
  {
    activeColor: 'var(--segment-orange)',
    baseColor: '#B7C8ED',
    height: '25px',
  },
  {
    activeColor: 'var(--segment-coral)',
    baseColor: '#D1DEFB',
    height: '20px',
  },
]

function StrengthTower({ activeSegments, animating, win}) {
  return (
    <div className={styles.wrapper}>
      {/* <img className={styles.frame} src={towerFrame} alt="Силомер" /> */}

      {/* Верхний слот с рубином */}
      <div className={`${styles.prizeSlot} ${win ? styles.prizeSlotWin : ''}`}>
        {win && (
          <>
            <img className={`${styles.prizeGlow} ${styles.prizeGlowSoft}`} src={glowSoft} alt="" aria-hidden="true" />
            <img className={`${styles.prizeGlow} ${styles.prizeGlowSharp}`} src={glowSharp} alt="" aria-hidden="true" />
          </>
        )}
        <img className={`${styles.ruby} ${win ? styles.rubyWin : ''}`} src={rubyImage} alt="Рубин" />
      </div>


      {/* Колонка сегментов шкалы */}
      <div className={styles.segmentColumn}>
        {SEGMENTS.map((segment, index) => {
          const active = index < activeSegments
          return (
            <div
              key={index}
              className={`${styles.segment} ${active ? styles.segmentActive : ''} ${animating && active ? styles.segmentAnimating : ''}`}
              style={{
                '--segment-color': segment.activeColor,
                '--segment-base-color': segment.baseColor,
                '--segment-height': segment.height,
              }}
            >
              <div className={styles.segmentGloss} />
              <div className={styles.segmentGloss} />
            </div>
          )
        })}
      </div>
      

    </div>
  )
}

export default StrengthTower
