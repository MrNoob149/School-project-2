export function initializeContactForm() {
  const contactForm = document.querySelector("#contact-form");
  const contactFiles = document.querySelector("#contact-files");
  const contactMessage = document.querySelector("#contact-message");
  const contactFileList = document.querySelector("#contact-file-list");

  contactFiles.addEventListener("change", () => {
    const fileNames = Array.from(contactFiles.files, (file) => file.name);
    contactFileList.textContent = fileNames.length
      ? `Selected: ${fileNames.join(", ")}`
      : "No files selected.";
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const email = formData.get("email").trim();
    const description = formData.get("description").trim();
    const fileNames = Array.from(contactFiles.files, (file) => file.name);
    const body = [
      `From: ${email}`,
      "",
      description,
      "",
      fileNames.length
        ? `Files to attach: ${fileNames.join(", ")}`
        : "No files selected.",
      fileNames.length ? "Please attach the listed files before sending." : "",
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:yatklaitw100@gmail.com?subject=${encodeURIComponent(
      "Project enquiry — Swinburne's Showroom",
    )}&body=${encodeURIComponent(body)}`;

    contactMessage.textContent =
      "Your email app should open. Attach the selected files before sending.";
    window.location.href = mailto;
  });
}
