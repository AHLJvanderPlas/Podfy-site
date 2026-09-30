// Share buttons on insights pages (were inline onclick="" handlers — not allowed by the CSP).
//   data-copy-link="<url>" data-copied-text="…"      copy the URL, show the confirmation
//   data-share-track="<channel>" data-entity-type data-entity-id   record the share
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-copy-link], [data-share-track]");
  if (!el) return;
  if (el.dataset.copyLink) {
    navigator.clipboard.writeText(el.dataset.copyLink);
    el.textContent = el.dataset.copiedText || "Copied";
  }
  if (el.dataset.shareTrack) {
    fetch("/api/insights/share", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ entity_type: el.dataset.entityType, entity_id: el.dataset.entityId, channel: el.dataset.shareTrack }),
    });
  }
});
