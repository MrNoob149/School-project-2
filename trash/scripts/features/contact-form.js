export function initializeContactForm() {
  const contactForm = document.querySelector("#contact-form");
  const contactMessage = document.querySelector("#contact-message");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const phone = formData.get("phone").trim();
    const organization = formData.get("organization").trim();
    const description = formData.get("description").trim();
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nOrganization: ${organization || "Not provided"}\n\n${description}`;

    const mailto = `mailto:yatklaitw100@gmail.com?subject=${encodeURIComponent(
      "Website enquiry — Swinburne Student Showcase",
    )}&body=${encodeURIComponent(body)}`;

    contactMessage.textContent = "Your email app should open with your message.";
    window.location.href = mailto;
  });
}
