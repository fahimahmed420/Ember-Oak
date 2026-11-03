// "Concept site by Zordev" badge: dismissible for this browser session; ?shots=1 hides it for screenshots.
const KEY = 'zordev-pill-hidden';

export function initDemoPill() {
  const pill = document.getElementById('demoPill');
  if (!pill) return;
  let hidden = new URLSearchParams(location.search).has('shots');
  try { hidden ||= sessionStorage.getItem(KEY) === '1'; } catch {}
  pill.hidden = hidden;
  pill.querySelector('.demo-pill__close').addEventListener('click', () => {
    pill.hidden = true;
    try { sessionStorage.setItem(KEY, '1'); } catch {}
  });
}
