(function (w) {
  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 2800);
  }

  function radar(svg, actuel, ids) {
    const list = ids.filter((id) => actuel[id] && actuel[id].niveau != null);
    if (!list.length) {
      svg.innerHTML = "";
      return;
    }
    const cx = 160, cy = 160, r = 108, n = list.length;
    const rings = [1, 2, 3].map((k) => {
      const rr = (k / 3) * r;
      const pts = list.map((_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return (cx + rr * Math.cos(a)).toFixed(1) + "," + (cy + rr * Math.sin(a)).toFixed(1);
      }).join(" ");
      return `<polygon class="ring" points="${pts}"/>`;
    }).join("");
    const axes = list.map((_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return `<line class="axis" x1="${cx}" y1="${cy}" x2="${(cx + r * Math.cos(a)).toFixed(1)}" y2="${(cy + r * Math.sin(a)).toFixed(1)}"/>`;
    }).join("");
    const area = list.map((id, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const rr = (actuel[id].niveau / 3) * r;
      return (cx + rr * Math.cos(a)).toFixed(1) + "," + (cy + rr * Math.sin(a)).toFixed(1);
    }).join(" ");
    const labs = list.map((id, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const x = cx + (r + 22) * Math.cos(a);
      const y = cy + (r + 22) * Math.sin(a) + 4;
      return `<text class="rlab" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${id}</text>`;
    }).join("");
    svg.setAttribute("viewBox", "0 0 320 320");
    svg.innerHTML = rings + axes + `<polygon class="area" points="${area}"/>` + labs;
  }

  function spark(hist) {
    const pts = w.Engine.sparkPoints(hist, 200, 28);
    if (!pts) return "";
    return `<svg class="spark" viewBox="0 0 200 28" preserveAspectRatio="none"><polyline fill="none" stroke="#983830" stroke-width="2" points="${pts}"/></svg>`;
  }

  w.UI = { toast, radar, spark };
})(window);
