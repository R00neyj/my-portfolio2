function Hero() {
  return (
    <section id="hero" className="section hero">
      <h1>당신의 이름</h1>
      <p className="hero__role">Frontend Engineer (신입 · 전환)</p>
      <p className="hero__tagline">만든 것으로 이야기하는 프론트엔드 개발자입니다.</p>
      <p className="hero__cta-group">
        <a href="#projects" className="button button--primary">
          프로젝트 보기
        </a>
        <a
          href="https://github.com/username"
          target="_blank"
          rel="noopener noreferrer"
          className="button button--secondary"
        >
          GitHub
        </a>
      </p>
    </section>
  )
}

export default Hero
