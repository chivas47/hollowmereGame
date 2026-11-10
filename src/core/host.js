// v233: where the game is being played from. itch.io runs HTML games in an iframe on itch.zone (an origin every
// itch game shares), embedded in a page on itch.io, so either host, or an itch.io page that embeds us, means itch.
const itchy = (host) => /(^|\.)itch\.(zone|io)$/i.test(host || '');

export function isItchHost(hostname, referrer = '') {
  let from = '';
  try { from = referrer ? new URL(referrer).hostname : ''; } catch (e) { /* not a URL */ }
  return itchy(hostname) || itchy(from);
}

// True when this page is running on itch.io. False in Node (tests, the balance bot), where there is no page.
export const onItch = typeof location !== 'undefined' && isItchHost(location.hostname, typeof document !== 'undefined' ? document.referrer : '');
