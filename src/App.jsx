import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Skills from "./components/Skills/Skills";
import Projects from "./components/Projects/Projects";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";
import Socials from "./components/Socials/Socials";
import Stats from "./components/Stats/Stats";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Socials />
      <About />
      <Stats />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}

export default App;