interface ExternalLink {
  label: string
  url: string
  description?: string
}

const EMAIL_USER = 'you'
const EMAIL_DOMAIN = 'example.com'
const EMAIL = `${EMAIL_USER}@${EMAIL_DOMAIN}`

const links: ExternalLink[] = [
  {
    label: 'GitHub',
    url: 'https://github.com/username',
  },
  {
    label: 'Blog',
    url: 'https://example.com/blog',
    description: '아직 글이 없습니다',
  },
]

function Contact() {
  return (
    <section id="contact" className="section contact">
      <h2 className="section-heading">Contact</h2>
      <p className="contact__email">
        <a href={`mailto:${EMAIL}`} className="contact__email-link">
          {EMAIL}
        </a>
      </p>
      <ul className="contact__links">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact__link"
            >
              {link.label}
            </a>
            {link.description && (
              <p className="contact__link-description">{link.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Contact
