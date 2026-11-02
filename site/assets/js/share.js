(function () {
  "use strict";

  const status = document.querySelector("[data-share-status]");
  const copyButton = document.querySelector("[data-copy-link]");
  const shareButton = document.querySelector("[data-native-share]");

  function announce(message) {
    if (status) status.textContent = message;
  }

  function fallbackCopy(text) {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Copy command was unavailable");
  }

  async function copyLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      fallbackCopy(url);
    }
    announce("Link copied.");
  }

  if (copyButton) {
    copyButton.hidden = false;
    copyButton.addEventListener("click", async function () {
      try {
        await copyLink(copyButton.dataset.url);
      } catch (error) {
        announce("Copy was unavailable. Use the address in your browser instead.");
      }
    });
  }

  if (shareButton && navigator.share) {
    shareButton.hidden = false;
    shareButton.addEventListener("click", async function () {
      try {
        await navigator.share({
          title: shareButton.dataset.title,
          text: shareButton.dataset.text,
          url: shareButton.dataset.url
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          announce("Sharing was unavailable. Copy the link instead.");
        }
      }
    });
  }
})();
