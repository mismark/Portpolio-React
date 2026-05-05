import "./Hero.css";
import profile from "../../assets/profile.jpg";

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="text">
        <h1>Hi, I'm <span>Mekunint</span></h1>
        <h2>Full Stack Developer</h2>
        <p>3rd year Information Systems student at Bahir Dar University.</p>
        <button>Contact Me</button>
      </div>

      <div className="image">
        <img src={profile} alt="profile" />
      </div>
    </section>
  );
}

export default Hero;