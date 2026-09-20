import { ExternalLink, Mail } from 'lucide-react'
import { EMAIL_DOMAIN, EMAIL_USER, links } from '../../data/links'
import shared from '../../styles/shared.module.css'
import styles from './Contact.module.css'

const EMAIL = `${EMAIL_USER}@${EMAIL_DOMAIN}`

function Contact() {
  return (
    <section id="contact" className={shared.section}>
      <h2 className={shared.sectionHeading}>Contact</h2>
      <p className={styles.email}>
        <Mail size={20} aria-hidden="true" />
        <a href={`mailto:${EMAIL}`} className={styles.emailLink}>
          {EMAIL}
        </a>
      </p>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <ExternalLink size={18} aria-hidden="true" />
              {link.label}
            </a>
            {link.description && (
              <p className={styles.description}>{link.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Contact
