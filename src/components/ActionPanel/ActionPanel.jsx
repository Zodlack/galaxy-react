import styles from './ActionPanel.module.css'
import robotNeutral from '../../assets/images/robot-neutral.png'
import robotLose from '../../assets/images/robot-lose.png'
import robotWin from '../../assets/images/robot-win.png'


// / Какой робот показывается в зависимости от состояния игры
const robotByState = {
  start: robotNeutral,
  charging: robotNeutral,
  hit: robotNeutral,
  resolving: robotNeutral,
  lose: robotLose,
  win: robotWin,
}

function ActionPanel({
  phase,
  titleLines,
  subtitle,
  actionLabel,
  actionTone,
  onAction,
  disabled,
  hideCopyContent,
}) {

  // Выбираем нужное изображение робота для текущей фазы
  const robot = robotByState[phase] ?? robotNeutral

  return (
    <>
      <div className={styles.copyBlock}>
        <p className={`${styles.title} ${hideCopyContent ? styles.hiddenContent : ''}`}>
          {titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

         {/* Подзаголовок показываем только если он есть */}
        {subtitle ? (
          <p className={`${styles.subtitle} ${hideCopyContent ? styles.hiddenContent : ''}`}>
            {subtitle}
          </p>
        ) : null}

        {/* Основная кнопка действия: новая игра или удар */}
        <button
          type="button"
          className={`${styles.actionButton} ${actionTone === 'warning' ? styles.warning : styles.primary} ${hideCopyContent ? styles.hiddenContent : ''}`}
          onClick={onAction}
          disabled={disabled || hideCopyContent}
          tabIndex={hideCopyContent ? -1 : 0}
        >
          {actionLabel}
        </button>
      </div>

      {/* Блок с роботом справа */}  
      <div className={styles.robotCard}>
        <img src={robot} alt="Робот-помощник" className={styles.robot} />
      </div>
    </>
  )
}

export default ActionPanel