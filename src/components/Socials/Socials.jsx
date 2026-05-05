import "./Socials.css";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaTelegram,
  FaFacebook,
  FaGoogle
} from "react-icons/fa";

function Socials() {
  return (
    <div className="socials">

      <a href="https://github.com/mismark" target="_blank" rel="noreferrer" className="icon github">
        <FaGithub />
      </a>

      <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="icon linkedin">
        <FaLinkedin />
      </a>

      <a href="https://instagram.com/mismarkol2121" target="_blank" rel="noreferrer" className="icon instagram">
        <FaInstagram />
      </a>

      <a href="https://twitter.com" target="_blank" rel="noreferrer" className="icon twitter">
        <FaTwitter />
      </a>

      <a href="https://t.me/mismarkol" target="_blank" rel="noreferrer" className="icon telegram">
        <FaTelegram />
      </a>

      <a href="https://facebook.com" target="_blank" rel="noreferrer" className="icon facebook">
        <FaFacebook />
      </a>

      <a href="mailto:mismarkol903@email.com" className="icon google">
        <FaGoogle />
      </a>

    </div>
  );
}

export default Socials;