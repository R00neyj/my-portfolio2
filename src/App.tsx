import { useEffect } from 'react'
import { setupSmoothScroll } from './motion/smoothScroll'
import Loader from './components/Loader/Loader'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Skills from './components/Skills/Skills'
import Projects from './components/Projects/Projects'
import Education from './components/Education/Education'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'

function App() {
  // Lenis 스크롤 스무더 + 앵커 이동 (DESIGN.md §8.2)
  useEffect(() => setupSmoothScroll(), [])

  return (
    <>
      <Loader />
      <a href="#main-content" className="skip-link">
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
