// ============================================================
//  QuizSphere — viewers.js
//  Simulated live viewers counter starting from 301
// ============================================================

(function () {
  let count = 301 + Math.floor(Math.random() * 40); // start in 301-340 range
  const el  = document.getElementById('viewerCount');

  function tick() {
    // Drift ±1 or ±2 randomly, biased slightly upward over time
    const change = Math.random() < 0.55 ? 1 : -1;
    const jump   = Math.random() < 0.1  ? 2 : 1;   // occasional 2-step jump
    count = Math.max(301, count + change * jump);    // never go below 301
    el.textContent = count;

    // Random interval between 4s–12s for natural feel
    const delay = 4000 + Math.random() * 8000;
    setTimeout(tick, delay);
  }

  // Initial delay before first change
  setTimeout(tick, 6000 + Math.random() * 4000);
})();
