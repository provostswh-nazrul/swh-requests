// Talks to the Apps Script "App API" deployment (Api.gs).
// The body is sent as plain text so the browser makes a simple request (no CORS
// pre-check), which Apps Script web apps accept from any website.
window.swhApi = function (action, payload) {
  if (window.SWH_MOCK) return window.SWH_MOCK(action, payload || {});   // local testing only
  var url = (window.SWH_CONFIG && window.SWH_CONFIG.apiUrl) || '';
  if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url)) {
    return Promise.reject(new Error('The app is not set up yet (config.js has no API address).'));
  }
  var body = JSON.stringify(Object.assign({ action: action }, payload || {}));
  var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 45000) : null;
  return fetch(url, { method: 'POST', body: body, redirect: 'follow', signal: ctrl ? ctrl.signal : undefined })
    .then(function (r) {
      if (!r.ok) throw new Error('The server did not respond (' + r.status + '). Please try again.');
      return r.json();
    })
    .then(function (j) {
      if (!j || !j.ok) throw new Error((j && j.error) || 'Something went wrong. Please try again.');
      return j.data;
    }, function (err) {
      if (err && err.name === 'AbortError') throw new Error('No reply from the server. Check your internet and try again.');
      if (err instanceof TypeError) throw new Error('Could not reach the server. Check your internet and try again.');
      throw err;
    })
    .finally(function () { if (timer) clearTimeout(timer); });
};
