function hideBlock(el) {
  const block =
    el.closest('#rso > div, #center_col > div, div[jsmodel]') || el;
  block.style.setProperty('display', 'none', 'important');
}

function hideAIOverview() {
  document
    .querySelectorAll('div[data-async-type="folsrch"], div[data-aim]')
    .forEach(hideBlock);

  const headings = document.querySelectorAll(
    'h1, h2, [role="heading"], strong'
  );
  headings.forEach((h) => {
    if (/^\s*AI Overview\s*$/i.test(h.textContent)) {
      hideBlock(h);
    }
  });
}

hideAIOverview();

const observer = new MutationObserver(() => {
  hideAIOverview();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
