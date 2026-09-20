(function (w) {
  const HASH = "9cb4b00d01890ac6fe166589f709cd82dc6e7c7a87537b55584aa988aa5ba06f";
  const KEY = "suivi-tp-bts-ms-prof";

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function unlocked() {
    try { return sessionStorage.getItem(KEY) === HASH; }
    catch { return false; }
  }

  function lock() {
    try { sessionStorage.removeItem(KEY); }
    catch (_) {}
  }

  async function check(password) {
    const h = await sha256(String(password || "").trim());
    if (h !== HASH) return false;
    try { sessionStorage.setItem(KEY, HASH); }
    catch (_) {}
    return true;
  }

  function gate(onOk) {
    if (unlocked()) {
      onOk();
      return;
    }
    const box = document.getElementById("lock");
    const form = document.getElementById("lock-form");
    const input = document.getElementById("lock-pass");
    const msg = document.getElementById("lock-msg");
    if (!box || !form) return;
    box.hidden = false;
    input.focus();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      const ok = await check(input.value);
      if (!ok) {
        msg.textContent = "Mot de passe incorrect.";
        input.select();
        return;
      }
      box.hidden = true;
      onOk();
    });
  }

  w.Auth = { gate, lock, unlocked, check };
})(window);
