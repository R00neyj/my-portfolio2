import shared from '../../styles/shared.module.css'
import styles from './Footer.module.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <p className={styles.big} aria-hidden="true">
        PORTFOLIO
      </p>
      <div className={`${shared.label} ${styles.bar}`}>
        <span className={styles.dim}>© {year} Portfolio</span>
        {/* §3.3: 저장소가 어차피 공개되므로(NFR-D3) 약점이 아니라 신호로 노출한다.
            TODO: GitHub에서 my-portfolio2 → R00neyj.github.io로 이름 변경 완료 후 이 링크가 유효해진다. */}
        <a
          href="https://github.com/R00neyj/R00neyj.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className={`${shared.underline} ${styles.link}`}
        >
          이 사이트의 소스 코드 <span aria-hidden="true">↗</span>
        </a>
        <a href="#hero" className={`${shared.underline} ${styles.link}`}>
          맨 위로 <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  )
}

export default Footer
