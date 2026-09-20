import { ExternalLink } from 'lucide-react'
import styles from './Footer.module.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <span>© {year} Portfolio. All rights reserved.</span>
        {/* §3.3: 저장소가 어차피 공개되므로(NFR-D3) 약점이 아니라 신호로 노출한다.
            TODO: GitHub에서 my-portfolio2 → R00neyj.github.io로 이름 변경 완료 후 이 링크가 유효해진다. */}
        <a
          href="https://github.com/R00neyj/R00neyj.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <ExternalLink size={16} aria-hidden="true" />
          이 사이트의 소스 코드
        </a>
      </div>
    </footer>
  )
}

export default Footer
