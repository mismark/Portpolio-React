import "./Navbar.css";
import profile from "../../assets/profile.jpg";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Mekunint</h2>

      <div className="links">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </div>

      <img src={profile} alt="profile" className="profile" />
    </nav>
  );
}

export default Navbar;