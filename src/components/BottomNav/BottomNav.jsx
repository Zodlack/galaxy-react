import styles from './BottomNav.module.css'

function BottomNav() {
  return (
    <div className={styles.nav} aria-hidden="true">
      <div className={`${styles.icon} ${styles.back}`} />
      <div className={`${styles.icon} ${styles.home}`} />
      <div className={`${styles.icon} ${styles.overview}`} />
    </div>
  )
}

export default BottomNav
