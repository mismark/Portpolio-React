import "./Contact.css";

function Contact() {
  return (
    <section id="contact" className="contact">
      <h2>Contact</h2>

      <form>
        <input placeholder="Name" />
        <input placeholder="Email" />
        <textarea placeholder="Message"></textarea>
        <button>Send</button>
      </form>
    </section>
  );
}

export default Contact;