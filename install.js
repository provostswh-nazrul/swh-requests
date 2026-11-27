// "Install the app" help: Android/desktop Chrome get an Install button,
// iPhone/iPad users get Share → Add to Home Screen instructions.
// Hidden when the app is already running from the home screen.
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }

  var box = document.getElementById('install');
  if (!box) return;
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var dismissed = false;
  try { dismissed = localStorage.getItem('swh_install_dismissed') === '1'; } catch (e) {}
  if (standalone || dismissed) return;

  var text = box.querySelector('.install-text');
  var btn = box.querySelector('.install-btn');
  var close = box.querySelector('.install-close');
  close.addEventListener('click', function () {
    box.hidden = true;
    try { localStorage.setItem('swh_install_dismissed', '1'); } catch (e) {}
  });

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    text.textContent = 'Install this app: tap the Share button, then "Add to Home Screen".';
    btn.hidden = true;
    box.hidden = false;
    return;
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    text.textContent = 'Install this app on your phone for quick access.';
    btn.hidden = false;
    box.hidden = false;
  });
  btn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; box.hidden = true; });
  });
  window.addEventListener('appinstalled', function () { box.hidden = true; });
})();
