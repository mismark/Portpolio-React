import "./Contact.css";
import emailjs from "emailjs-com";
import { useRef, useState } from "react";

function Contact() {
  const form = useRef();
  const [status, setStatus] = useState(""); // message text
  const [loading, setLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs.sendForm(
      "service_7facpio",     // your Service ID
      "template_hbkizqq",    // your Template ID
      form.current,
      "ZL0cCRFaGbgYwBqaD"    // your Public Key
    )
    .then(() => {
      setStatus("✅ Message sent successfully!");
      setLoading(false);
      form.current.reset(); // clear form
    })
    .catch((error) => {
      console.error(error);
      setStatus("❌ Failed to send message. Try again.");
      setLoading(false);
    });
  };

  return (
    <section id="contact" className="contact">
      <h2>Contact Me</h2>

      <form ref={form} onSubmit={sendEmail}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          required
        />

        <input
          type="text"
          name="title"
          placeholder="Subject"
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          required
        ></textarea>

        <button className="btnSubmit" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* ✅ Status message */}
      {status && <p className="status">{status}</p>}
    </section>
  );
}

export default Contact;