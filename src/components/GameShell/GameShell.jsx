import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './GameShell.module.css'
// import bgImage from '../../assets/images/bg-top.png'
import buttonBase from '../../assets/images/button-base.png'
import buttonPressed from '../../assets/images/button-pressed.png'
import hammerImage from '../../assets/images/hammer.png'
// import robotNeutral from '../../assets/images/robot-neutral.png'
import PowerMeter from '../PowerMeter/PowerMeter'
import StrengthTower from '../StrengthTower/StrengthTower'
import ActionPanel from '../ActionPanel/ActionPanel'
import BottomNav from '../BottomNav/BottomNav'

// Порог победы: если сила удара выше этого значения, показываем win
const WIN_THRESHOLD = 0.965

// Максимальное количество сегментов у центральной шкалы
const MAX_SEGMENTS = 7

// Ограничивает число в заданном диапазоне
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function GameShell() {

  // refs для анимации левой шкалы и таймера перехода между фазами
  // frameRef хранит id запроса на слудующий кадр
  const frameRef = useRef(0)
  const powerRef = useRef(0)
  const directionRef = useRef(1)
  // храним id таймера
  const resolveTimeoutRef = useRef(null)

  // Основные состояния игры
  const [phase, setPhase] = useState('start')
  const [power, setPower] = useState(0)
  const [frozenPower, setFrozenPower] = useState(0)
  const [segments, setSegments] = useState(0)
  const [buttonPressedState, setButtonPressedState] = useState(false)

  //  Флаги для фаз игры
  const isCharging = phase === 'charging'
  const isAnimatingHit = phase === 'hit'
  const isResolving = phase === 'resolving'
  const isWin = phase === 'win'
  const isLose = phase === 'lose'

   // Во время удара и заполнения шкалы скрываем только текст и кнопку в ActionPanel
  const hideCopyContent = phase === 'hit' || phase === 'resolving'

  // const showActionPanel =
  //   phase === 'start' || phase === 'charging' || phase === 'lose' || phase === 'win'
  // const showAnimationRobot = phase === 'hit' || phase === 'resolving'


   // Что показывать в левой шкале:
  // на старте — 0, во время зарядки — текущее значение, после удара — зафиксированное
  const displayPower = phase === 'start' ? 0 : phase === 'charging' ? power : frozenPower

  // Задаем момент , когда кнопка должна быть визуальна нажатой
  const isButtonPressedVisual = buttonPressedState || isResolving || isWin || isLose


  // Анимация "бегущей" силы в левой шкале
  useEffect(() => {
    if (!isCharging) {
      cancelAnimationFrame(frameRef.current)
      return undefined
    }

    let last = performance.now()
    let nextDirectionFlipAt = last + randomRange(380, 840)

    const tick = (timestamp) => {
      const delta = timestamp - last
      last = timestamp


      let current = powerRef.current
      let direction = directionRef.current
      // Скорость немного плавает, чтобы движение выглядело менее механическим
      const speed = 0.00145 + 0.00075 * Math.sin(timestamp / 230)

      // Иногда меняем направление случайно
      if (timestamp >= nextDirectionFlipAt) {
        direction = Math.random() > 0.5 ? 1 : -1
        nextDirectionFlipAt = timestamp + randomRange(340, 920)
      }

      current += speed * delta * direction

      // Не даём значению уйти ниже или выше допустимого диапазона
      if (current >= 1) {
        current = 1
        direction = -1
        nextDirectionFlipAt = timestamp + randomRange(220, 620)
      } else if (current <= 0.04) {
        current = 0.04
        direction = 1
        nextDirectionFlipAt = timestamp + randomRange(220, 620)
      }

      powerRef.current = current
      directionRef.current = direction
      setPower(current)
      
      // после текущего кадра сразу просим браузер вызвать tick ещё раз на следующем кадре 
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameRef.current)
  }, [isCharging])


  // После удара по очереди заполняем сегменты центральной шкалы
  useEffect(() => {
    if (phase !== 'resolving') {
      return undefined
    }

    const targetSegments = computeTargetSegments(frozenPower)
    setSegments(0)

    let current = 0

    const interval = window.setInterval(() => {
      current += 1
      setSegments(current)

      if (current >= targetSegments) {
        window.clearInterval(interval)

         // После заполнения показываем финальное состояние
        window.setTimeout(() => {
          setPhase(frozenPower >= WIN_THRESHOLD ? 'win' : 'lose')
        }, 260)
      }
    }, 170)

    return () => window.clearInterval(interval)
  }, [phase, frozenPower])


  // Очистка animation frame и таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.clearTimeout(resolveTimeoutRef.current)
    }
  }, [])


    // Тексты и подписи для разных фаз игры
  const copy = useMemo(() => {
    switch (phase) {
      case 'charging':
        return {
          titleLines: ['Жми на кнопку', 'в нужный момент!'],
          subtitle: '',
          actionLabel: 'УДАР!',
          actionTone: 'warning',
        }

      case 'lose':
        return {
          titleLines: ['Неплохо!', 'Попробуй ещё раз.'],
          subtitle: '',
          actionLabel: 'НОВАЯ ИГРА',
          actionTone: 'primary',
        }

      case 'win':
        return {
          titleLines: ['ВОТ ЭТО СИЛА!', 'Ты выбил главный приз!'],
          subtitle: 'Рубин',
          actionLabel: 'НОВАЯ ИГРА',
          actionTone: 'primary',
        }

      case 'start':
      default:
        return {
          titleLines: ['Привет!', 'проверим твою силу!'],
          subtitle: '',
          actionLabel: 'НОВАЯ ИГРА',
          actionTone: 'primary',
        }
    }
  }, [phase])


  // Обработка нажатия на кнопку
  const handleAction = () => {
    // Из start / lose / win начинаем новую игру
    if (phase === 'start' || phase === 'lose' || phase === 'win') {
      powerRef.current = 0
      directionRef.current = 1

      window.clearTimeout(resolveTimeoutRef.current)

      setPower(0)
      setFrozenPower(0)
      setSegments(0)
      setButtonPressedState(false)
      setPhase('charging')
      return
    }


    // Нажимать кнопку удара можно только в фазе charging
    if (phase !== 'charging') {
      return
    }

    // Захват силы
    const capturedPower = clamp(powerRef.current, 0, 1)

    cancelAnimationFrame(frameRef.current)
    window.clearTimeout(resolveTimeoutRef.current)

     // Запоминаем силу в момент удара
    setFrozenPower(capturedPower)
    setPower(capturedPower)
    setButtonPressedState(false)
    setPhase('hit')

    // Через небольшую паузу переводим игру в фазу заполнения шкалы
    resolveTimeoutRef.current = window.setTimeout(() => {
      setButtonPressedState(true)
      setPhase('resolving')
    }, 620)
  }

  return (
    <section className={styles.phone}>
      {/* <img className={styles.background} src={bgImage} alt="" aria-hidden="true" /> */}


       {/* Центральный силомер */}
      <StrengthTower
        activeSegments={segments}
        animating={isResolving}
        win={isWin}
      />


       {/* Центральная сцена: кнопка удара и молот */}
      <div className={styles.centerStage}>
        <img
          className={`${styles.hitButton} ${isButtonPressedVisual ? styles.hitButtonPressed : ''}`}
          src={isButtonPressedVisual ? buttonPressed : buttonBase}
          alt="Кнопка силомера"
        />

        <img
          className={`${styles.hammer} ${isCharging ? styles.hammerReady : ''} ${isAnimatingHit ? styles.hammerStrike : ''} ${isResolving || isWin || isLose ? styles.hammerRest : ''}`}
          src={hammerImage}
          alt="Молот"
        />
      </div>


      {/* Нижняя панель: левая шкала, тексты, кнопка и робот */}
      <div className={styles.bottomPanel}>
        <PowerMeter power={displayPower} active={phase !== 'start'} animateToTop={isWin} />

        {/* {showActionPanel ? (
          <ActionPanel
            phase={phase}
            titleLines={copy.titleLines}
            subtitle={copy.subtitle}
            actionLabel={copy.actionLabel}
            actionTone={copy.actionTone}
            onAction={handleAction}
            disabled={phase === 'hit' || phase === 'resolving'}
          />
        ) : null} */}

        <ActionPanel
          phase={phase}
          titleLines={copy.titleLines}
          subtitle={copy.subtitle}
          actionLabel={copy.actionLabel}
          actionTone={copy.actionTone}
          onAction={handleAction}
          disabled={phase === 'hit' || phase === 'resolving'}
          hideCopyContent={hideCopyContent}
        />



        {/* {showAnimationRobot ? (
          <div className={styles.robotAnimationCard}>
            <img
              src={robotNeutral}
              alt="Робот-помощник"
              className={styles.robotAnimation}
            />
          </div>
        ) : null} */}
      </div>

       {/* Нижняя системная панель телефона */}    
      <BottomNav />
    </section>
  )
}

// Возвращаем случайное число в диапазоне
function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

// Определяем, сколько сегментов нужно зажечь по итоговой силе удара
function computeTargetSegments(inputPower) {
  if (inputPower >= WIN_THRESHOLD) {
    return MAX_SEGMENTS
  }
  // переводим значение силы в количество обычных сегментов
  return clamp(Math.round(inputPower * 6) + 1, 2, 6)
}

export default GameShell