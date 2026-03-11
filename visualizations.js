/* ================================================================
   visualizations.js — Interactive Visualizations module
   ================================================================ */
(function () {
  const ASSETS = [
    { name: 'US Equity',   mu: 0.10, sigma: 0.16, color: '#00d4ff' },
    { name: 'Intl Equity', mu: 0.085, sigma: 0.175, color: '#8b5cf6' },
    { name: 'Emerging',    mu: 0.11,  sigma: 0.23,  color: '#f0b429' },
    { name: 'Bonds',       mu: 0.04,  sigma: 0.06,  color: '#10b981' },
    { name: 'Real Estate', mu: 0.08,  sigma: 0.15,  color: '#f43f5e' },
    { name: 'Commodities', mu: 0.05,  sigma: 0.18,  color: '#fb923c' },
  ];
  const RF = 0.045;

  function render() {
    return `
<div class="page-header">
  <div class="badge purple">📈 Module 3</div>
  <h1 class="page-title"><span class="hi">Interactive Visualizations</span></h1>
  <p class="page-sub">Hands-on quantitative tools — explore the efficient frontier, run Monte Carlo simulations, and decompose portfolio risk.</p>
</div>
<div class="page-content">

  <div class="tabs" id="vizTabs">
    <button class="tab active" data-tab="frontier">Efficient Frontier</button>
    <button class="tab" data-tab="montecarlo">Monte Carlo Simulation</button>
    <button class="tab" data-tab="risk">Risk Decomposition</button>
    <button class="tab" data-tab="corr">Correlation Matrix</button>
  </div>

  <!-- Efficient Frontier -->
  <div id="tab-frontier" class="tab-content">
    <div class="g2">
      <div>
        <div class="section-title">Efficient Frontier Explorer</div>
        <div class="section-sub">Adjust risk aversion to trace portfolios along the frontier. Click to lock a point.</div>
        <div class="chart-wrap" style="padding:16px;margin-top:12px">
          <canvas id="vizFrontierCanvas" width="500" height="360"></canvas>
        </div>
        <div class="legend mt1" id="vizLegend"></div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-title">Risk Aversion (γ)</div>
          <input type="range" id="gammaSlider" min="1" max="8" step="0.1" value="3" style="width:100%;accent-color:var(--cyan);margin:10px 0">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--t2)"><span>Aggressive (γ=1)</span><span id="gammaVal">γ = 3.0</span><span>Defensive (γ=8)</span></div>
        </div>
        <div class="card" id="portfolioStatsCard">
          <div class="card-title">Selected Portfolio</div>
          <div id="portfolioStats" style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
            <div style="font-size:13px;color:var(--t2)">Move the slider to see portfolio stats.</div>
          </div>
        </div>
        <div class="card mt2">
          <div class="card-title">Capital Market Line</div>
          <div class="card-body">The CML connects the risk-free rate (r_f = 4.5%) to the tangency portfolio (max Sharpe). All efficient portfolios lie on this line when a risk-free asset is available.</div>
          <div class="formula" style="margin-top:10px;font-size:12px">Sharpe = (μ_p − r_f) / σ_p</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Monte Carlo -->
  <div id="tab-montecarlo" class="tab-content" style="display:none">
    <div class="section-title">Portfolio Wealth Monte Carlo</div>
    <div class="section-sub">Simulate 10-year wealth paths for a 60/40 portfolio using geometric Brownian motion.</div>
    <div class="g2 mt2">
      <div>
        <div class="chart-wrap" style="padding:16px">
          <canvas id="mcCanvas" width="500" height="340"></canvas>
        </div>
        <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap">
          <div class="card" style="flex:1;padding:14px">
            <div class="stat-label">Median Wealth</div>
            <div class="stat-val c" id="mcMedian">—</div>
          </div>
          <div class="card" style="flex:1;padding:14px">
            <div class="stat-label">5th Percentile</div>
            <div class="stat-val" style="color:var(--red)" id="mcP5">—</div>
          </div>
          <div class="card" style="flex:1;padding:14px">
            <div class="stat-label">95th Percentile</div>
            <div class="stat-val gr" id="mcP95">—</div>
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title">Simulation Parameters</div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px">
            <div>
              <label class="label">Annual Return (μ) — <span id="mcMuVal">7%</span></label>
              <input type="range" id="mcMu" min="2" max="15" step="0.5" value="7" style="width:100%;accent-color:var(--cyan)">
            </div>
            <div>
              <label class="label">Annual Volatility (σ) — <span id="mcSigVal">12%</span></label>
              <input type="range" id="mcSig" min="3" max="30" step="0.5" value="12" style="width:100%;accent-color:var(--purple)">
            </div>
            <div>
              <label class="label">Horizon (years) — <span id="mcHorizonVal">10</span></label>
              <input type="range" id="mcHorizon" min="1" max="40" step="1" value="10" style="width:100%;accent-color:var(--gold)">
            </div>
            <div>
              <label class="label">Simulations — <span id="mcNVal">500</span></label>
              <input type="range" id="mcN" min="50" max="1000" step="50" value="500" style="width:100%;accent-color:var(--green)">
            </div>
            <button class="btn btn-primary" id="mcRunBtn" style="width:100%">▶ Run Simulation</button>
          </div>
        </div>
        <div class="insight">
          <strong>GBM Model:</strong> W_t = W_0 · exp[(μ − σ²/2)t + σ√t · Z], Z ~ N(0,1). The log-normal drift term μ − σ²/2 is the <em>compounding drag</em> — critical for long-horizon planning.
        </div>
      </div>
    </div>
  </div>

  <!-- Risk Decomposition -->
  <div id="tab-risk" class="tab-content" style="display:none">
    <div class="section-title">Portfolio Risk Decomposition</div>
    <div class="section-sub">Understand which assets are driving portfolio risk — not capital weight.</div>
    <div class="g2 mt2">
      <div>
        <div class="section-title" style="font-size:15px;margin-bottom:8px">Portfolio Weights (%)</div>
        <div id="weightSliders" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px"></div>
        <div class="chart-wrap" style="padding:20px">
          <canvas id="riskCanvas" width="460" height="300"></canvas>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card" id="riskStatsCard">
          <div class="card-title">Portfolio Statistics</div>
          <div id="riskStats" style="margin-top:10px;display:flex;flex-direction:column;gap:8px"></div>
        </div>
        <div class="insight">
          <strong>Risk Contribution ≠ Capital Weight.</strong> A 60/40 portfolio has ~90% of risk coming from equities. Risk decomposition reveals the true drivers and enables more balanced construction.
        </div>
      </div>
    </div>
  </div>

  <!-- Correlation Matrix -->
  <div id="tab-corr" class="tab-content" style="display:none">
    <div class="section-title">Asset Correlation Matrix</div>
    <div class="section-sub">Pairwise correlations drive diversification benefits. Low or negative correlations are the investor's best friend.</div>
    <div style="margin-top:20px" id="corrContainer"></div>
    <div class="g2 mt3">
      <div class="insight">
        <strong>Diversification benefit</strong> is maximised when ρ → −1. In practice, correlations spike in crisis periods (correlation goes to 1 exactly when you need diversification most — Longin & Solnik, 2001).
      </div>
      <div class="insight gold">
        <strong>Covariance shrinkage (Ledoit-Wolf):</strong> Sample covariance matrix is rank-deficient with N stocks. Shrink toward structured target (e.g., single-factor, identity) to improve out-of-sample optimisation.
      </div>
    </div>
  </div>
</div>`;
  }

  /* ─── Efficient Frontier ─── */
  function drawFrontier(gamma) {
    const canvas = document.getElementById('vizFrontierCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { l: 52, r: 16, t: 16, b: 44 };

    // Monte Carlo portfolios
    const portfolios = [];
    for (let i = 0; i < 2000; i++) {
      let w = ASSETS.map(() => Math.random());
      const s = w.reduce((a, b) => a + b, 0);
      w = w.map(x => x / s);
      const mu = w.reduce((a, x, j) => a + x * ASSETS[j].mu, 0);
      const variance = w.reduce((a, x, j) => a + x * x * ASSETS[j].sigma * ASSETS[j].sigma, 0) * 1.3;
      const sr = (mu - RF) / Math.sqrt(variance);
      portfolios.push({ sigma: Math.sqrt(variance), mu, sr, w });
    }

    const sigs = portfolios.map(p => p.sigma);
    const mus  = portfolios.map(p => p.mu);
    const minS = Math.min(...sigs) * 0.82, maxS = Math.max(...sigs) * 1.05;
    const minM = Math.min(...mus)  * 0.82, maxM = Math.max(...mus) * 1.1;

    const toX = s => pad.l + (s - minS) / (maxS - minS) * (W - pad.l - pad.r);
    const toY = m => H - pad.b - (m - minM) / (maxM - minM) * (H - pad.t - pad.b);

    ctx.clearRect(0, 0, W, H);

    // Grid background
    ctx.strokeStyle = 'rgba(80,140,230,.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      const xG = pad.l + i * (W - pad.l - pad.r) / 4;
      ctx.beginPath(); ctx.moveTo(xG, pad.t); ctx.lineTo(xG, H - pad.b); ctx.stroke();
    }

    // Scatter (heat by Sharpe)
    const maxSR = Math.max(...portfolios.map(p => p.sr));
    for (const p of portfolios) {
      const t = Math.max(0, p.sr / maxSR);
      ctx.fillStyle = `hsla(${190 + t * 60}, 80%, 60%, 0.18)`;
      ctx.beginPath();
      ctx.arc(toX(p.sigma), toY(p.mu), 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Efficient frontier boundary
    const bins = 70;
    const step = (Math.max(...sigs) - Math.min(...sigs)) / bins;
    const frontier = [];
    for (let b = 0; b < bins; b++) {
      const lo = Math.min(...sigs) + b * step, hi = lo + step;
      const bucket = portfolios.filter(p => p.sigma >= lo && p.sigma < hi);
      if (bucket.length) frontier.push({ sigma: (lo + hi) / 2, mu: Math.max(...bucket.map(p => p.mu)) });
    }
    frontier.sort((a, b) => a.sigma - b.sigma);

    const grad = ctx.createLinearGradient(toX(frontier[0].sigma), 0, toX(frontier[frontier.length-1].sigma), 0);
    grad.addColorStop(0, '#10b981'); grad.addColorStop(0.5, '#00d4ff'); grad.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 8;
    ctx.beginPath();
    frontier.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.sigma), toY(p.mu)) : ctx.lineTo(toX(p.sigma), toY(p.mu)));
    ctx.stroke(); ctx.shadowBlur = 0;

    // Tangency (max Sharpe)
    const tangency = portfolios.reduce((best, p) => p.sr > best.sr ? p : best);
    ctx.beginPath(); ctx.arc(toX(tangency.sigma), toY(tangency.mu), 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f0b429'; ctx.shadowColor = '#f0b429'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = '10px Inter';
    ctx.fillText('⋆ Max Sharpe', toX(tangency.sigma) + 10, toY(tangency.mu) + 4);

    // CML
    const rfY = toY(RF);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(240,180,41,.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad.l, rfY); ctx.lineTo(toX(tangency.sigma) * 1.3, toY(tangency.mu + (tangency.mu - RF) * 0.3)); ctx.stroke();
    ctx.setLineDash([]);

    // Selected portfolio via gamma
    const g = parseFloat(gamma);
    const selected = portfolios.reduce((best, p) => {
      const util = p.mu - 0.5 * g * p.sigma * p.sigma;
      return util > (best.mu - 0.5 * g * best.sigma * best.sigma) ? p : best;
    });
    ctx.beginPath(); ctx.arc(toX(selected.sigma), toY(selected.mu), 7, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff'; ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;

    // Individual assets
    ASSETS.forEach(a => {
      const x = toX(a.sigma), y = toY(a.mu);
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = a.color; ctx.shadowColor = a.color; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#ccc'; ctx.font = '9.5px Inter'; ctx.fillText(a.name, x + 7, y + 3);
    });

    // Axes
    ctx.fillStyle = 'rgba(180,190,210,.45)'; ctx.font = '11px Inter';
    ctx.fillText('Volatility (σ)', W / 2 - 30, H - 8);
    ctx.save(); ctx.translate(13, H / 2 + 30); ctx.rotate(-Math.PI / 2);
    ctx.fillText('Expected Return (μ)', 0, 0); ctx.restore();

    // Update portfolio stats
    const statsEl = document.getElementById('portfolioStats');
    if (statsEl) {
      const maxW = Math.max(...selected.w);
      const topAsset = ASSETS[selected.w.indexOf(maxW)].name;
      statsEl.innerHTML = `
        <div style="font-size:12.5px;color:var(--t2);display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between"><span>Expected Return</span><strong style="color:var(--cyan)">${(selected.mu * 100).toFixed(2)}%</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Volatility</span><strong style="color:var(--purple)">${(selected.sigma * 100).toFixed(2)}%</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Sharpe Ratio</span><strong style="color:var(--gold)">${selected.sr.toFixed(3)}</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Largest Weight</span><strong style="color:var(--t1)">${topAsset} (${(maxW * 100).toFixed(0)}%)</strong></div>
        </div>`;
    }

    // Legend
    const leg = document.getElementById('vizLegend');
    if (leg) leg.innerHTML = ASSETS.map(a => `<div class="legend-item"><div class="legend-dot" style="background:${a.color}"></div>${a.name}</div>`).join('');
  }

  /* ─── Monte Carlo ─── */
  function runMonteCarlo() {
    const canvas = document.getElementById('mcCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { l: 56, r: 16, t: 16, b: 44 };

    const mu      = parseFloat(document.getElementById('mcMu').value) / 100;
    const sigma   = parseFloat(document.getElementById('mcSig').value) / 100;
    const horizon = parseInt(document.getElementById('mcHorizon').value);
    const N       = parseInt(document.getElementById('mcN').value);
    const steps   = horizon * 12; // monthly

    const dt    = 1 / 12;
    const drift = (mu - 0.5 * sigma * sigma) * dt;
    const vol   = sigma * Math.sqrt(dt);

    const paths = [];
    for (let i = 0; i < N; i++) {
      let W0 = 1;
      const path = [1];
      for (let t = 0; t < steps; t++) {
        const z = boxMuller();
        W0 *= Math.exp(drift + vol * z);
        path.push(W0);
      }
      paths.push(path);
    }

    // Statistics
    const finals = paths.map(p => p[p.length - 1]).sort((a, b) => a - b);
    const median = finals[Math.floor(N / 2)];
    const p5     = finals[Math.floor(N * 0.05)];
    const p95    = finals[Math.floor(N * 0.95)];

    document.getElementById('mcMedian').textContent = '$' + median.toFixed(2);
    document.getElementById('mcP5').textContent     = '$' + p5.toFixed(2);
    document.getElementById('mcP95').textContent    = '$' + p95.toFixed(2);

    const allVals = paths.flat();
    const maxV = Math.max(...allVals) * 1.02;
    const minV = Math.min(...allVals) * 0.98;

    const toX = t => pad.l + (t / steps) * (W - pad.l - pad.r);
    const toY = v => H - pad.b - (v - minV) / (maxV - minV) * (H - pad.t - pad.b);

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(80,140,230,.07)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    }

    // Draw paths (subset)
    const drawN = Math.min(N, 120);
    for (let i = 0; i < drawN; i++) {
      const path = paths[i];
      ctx.beginPath(); ctx.strokeStyle = 'rgba(139,92,246,.08)'; ctx.lineWidth = 1;
      path.forEach((v, t) => t === 0 ? ctx.moveTo(toX(t), toY(v)) : ctx.lineTo(toX(t), toY(v)));
      ctx.stroke();
    }

    // Percentile bands
    const pBands = [[0.05, 0.95, 'rgba(16,185,129,.12)'], [0.25, 0.75, 'rgba(16,185,129,.18)']];
    for (const [lo, hi, fill] of pBands) {
      ctx.beginPath(); ctx.fillStyle = fill;
      const topPath = [], bottomPath = [];
      for (let t = 0; t <= steps; t++) {
        const vals = paths.map(p => p[t]).sort((a, b) => a - b);
        topPath.push({ x: toX(t), y: toY(vals[Math.floor(N * hi)]) });
        bottomPath.unshift({ x: toX(t), y: toY(vals[Math.floor(N * lo)]) });
      }
      ctx.moveTo(topPath[0].x, topPath[0].y);
      topPath.forEach(p => ctx.lineTo(p.x, p.y));
      bottomPath.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath(); ctx.fill();
    }

    // Median line
    ctx.beginPath(); ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5;
    ctx.shadowColor = '#10b981'; ctx.shadowBlur = 6;
    for (let t = 0; t <= steps; t++) {
      const vals = paths.map(p => p[t]).sort((a, b) => a - b);
      const med = vals[Math.floor(N / 2)];
      t === 0 ? ctx.moveTo(toX(t), toY(med)) : ctx.lineTo(toX(t), toY(med));
    }
    ctx.stroke(); ctx.shadowBlur = 0;

    // Axis
    ctx.fillStyle = 'rgba(180,190,210,.5)'; ctx.font = '11px Inter';
    ctx.fillText('Time (years)', W / 2 - 30, H - 8);
    ctx.save(); ctx.translate(14, H / 2 + 20); ctx.rotate(-Math.PI / 2);
    ctx.fillText('Portfolio Value ($1 initial)', 0, 0); ctx.restore();
    // X axis labels
    for (let i = 0; i <= horizon; i += Math.ceil(horizon / 5)) {
      ctx.fillStyle = 'rgba(150,160,180,.5)';
      ctx.fillText(i + 'y', toX(i * 12) - 5, H - pad.b + 16);
    }
  }

  function boxMuller() {
    const u = Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* ─── Risk Decomposition ─── */
  function initRiskDecomp() {
    const container = document.getElementById('weightSliders');
    if (!container) return;
    const defaults = [0.35, 0.20, 0.10, 0.20, 0.10, 0.05];
    let weights = [...defaults];

    container.innerHTML = ASSETS.map((a, i) => `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:10px;height:10px;border-radius:50%;background:${a.color};flex-shrink:0"></div>
        <span style="font-size:12px;color:var(--t2);width:90px">${a.name}</span>
        <input type="range" id="wSlider${i}" min="0" max="100" step="5" value="${Math.round(defaults[i]*100)}" style="flex:1;accent-color:${a.color}">
        <span id="wVal${i}" style="font-family:var(--fm);font-size:12px;color:${a.color};width:36px;text-align:right">${Math.round(defaults[i]*100)}%</span>
      </div>`).join('');

    function update() {
      weights = ASSETS.map((_, i) => parseFloat(document.getElementById('wSlider' + i).value) / 100);
      const total = weights.reduce((a, b) => a + b, 0);
      if (total <= 0) return;
      ASSETS.forEach((_, i) => {
        document.getElementById('wVal' + i).textContent = Math.round(weights[i] / total * 100) + '%';
      });
      drawRisk(weights.map(w => w / total));
    }

    ASSETS.forEach((_, i) => {
      document.getElementById('wSlider' + i).addEventListener('input', update);
    });
    drawRisk(defaults);
  }

  function drawRisk(weights) {
    // Simplified variance contribution (diagonal only)
    const variances = ASSETS.map((a, i) => weights[i] * weights[i] * a.sigma * a.sigma);
    const totalVar  = variances.reduce((a, b) => a + b, 0) * 1.3;
    const riskContribs = variances.map(v => v / totalVar * 1.3);

    const canvas = document.getElementById('riskCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const barH = 28, gap = 12, startY = 30, labelW = 96;
    const maxRC = Math.max(...riskContribs);

    // Title
    ctx.fillStyle = 'rgba(180,195,215,.6)'; ctx.font = '500 11px Inter';
    ctx.fillText('Risk Contribution', labelW, 16);
    ctx.fillText('Capital Weight', W / 2 + 10, 16);

    ASSETS.forEach((a, i) => {
      const y = startY + i * (barH + gap);

      // Label
      ctx.fillStyle = 'rgba(200,210,230,.85)'; ctx.font = '12px Inter';
      ctx.fillText(a.name, 0, y + barH / 2 + 4);

      // Risk contrib bar (left half)
      const rcW = (riskContribs[i] / maxRC) * (W / 2 - labelW - 20);
      ctx.fillStyle = a.color + '99';
      ctx.fillRect(labelW, y, rcW, barH);
      ctx.fillStyle = a.color; ctx.font = '500 11px Inter';
      ctx.fillText((riskContribs[i] * 100).toFixed(1) + '%', labelW + rcW + 4, y + barH / 2 + 4);

      // Capital weight bar (right half)
      const cwW = (weights[i] / Math.max(...weights)) * (W / 2 - 30);
      ctx.fillStyle = a.color + '44';
      ctx.fillRect(W / 2 + 10, y, cwW, barH);
      ctx.fillStyle = a.color + 'cc'; ctx.font = '500 11px Inter';
      ctx.fillText((weights[i] * 100).toFixed(0) + '%', W / 2 + cwW + 14, y + barH / 2 + 4);
    });

    // Stats
    const statsEl = document.getElementById('riskStats');
    const mu = weights.reduce((a, w, i) => a + w * ASSETS[i].mu, 0);
    const sigma = Math.sqrt(ASSETS.reduce((a, _, i) => a + weights[i] * weights[i] * ASSETS[i].sigma * ASSETS[i].sigma, 0) * 1.3);
    if (statsEl) {
      statsEl.innerHTML = `
        <div style="font-size:12.5px;color:var(--t2);display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between"><span>Expected Return</span><strong style="color:var(--cyan)">${(mu * 100).toFixed(2)}%</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Portfolio Volatility</span><strong style="color:var(--purple)">${(sigma * 100).toFixed(2)}%</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Sharpe Ratio</span><strong style="color:var(--gold)">${((mu - RF) / sigma).toFixed(3)}</strong></div>
          <div style="display:flex;justify-content:space-between"><span>Largest Risk Driver</span><strong style="color:var(--t1)">${ASSETS[riskContribs.indexOf(Math.max(...riskContribs))].name}</strong></div>
        </div>`;
    }
  }

  /* ─── Correlation Matrix ─── */
  function drawCorrMatrix() {
    const CORR = [
      [1.00, 0.75, 0.65,-0.20, 0.60, 0.15],
      [0.75, 1.00, 0.78,-0.15, 0.55, 0.20],
      [0.65, 0.78, 1.00,-0.10, 0.50, 0.30],
      [-0.20,-0.15,-0.10, 1.00,-0.05, 0.00],
      [0.60, 0.55, 0.50,-0.05, 1.00, 0.10],
      [0.15, 0.20, 0.30, 0.00, 0.10, 1.00],
    ];
    const n = ASSETS.length, cell = 72, label = 96;
    const svgW = label + n * cell + 10, svgH = label + n * cell + 10;

    function corrColor(v) {
      if (v === 1) return '#00d4ff22';
      if (v > 0) return `rgba(139,92,246,${v * 0.7})`;
      return `rgba(16,185,129,${(-v) * 0.7})`;
    }

    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="display:block;min-width:${svgW}px" font-family="Inter,sans-serif">`;
    // Headers
    ASSETS.forEach((a, i) => {
      svg += `<text x="${label + i * cell + cell/2}" y="${label - 6}" text-anchor="middle" font-size="11" fill="${a.color}" transform="rotate(-30,${label + i * cell + cell/2},${label - 6})">${a.name}</text>`;
      svg += `<text x="${label - 6}" y="${label + i * cell + cell/2 + 4}" text-anchor="end" font-size="11" fill="${a.color}">${a.name}</text>`;
    });
    // Cells
    CORR.forEach((row, i) => {
      row.forEach((v, j) => {
        const x = label + j * cell, y = label + i * cell;
        svg += `<rect x="${x+2}" y="${y+2}" width="${cell-4}" height="${cell-4}" rx="6" fill="${corrColor(v)}"/>`;
        svg += `<text x="${x+cell/2}" y="${y+cell/2+4}" text-anchor="middle" font-size="11.5" fill="${Math.abs(v) > 0.5 ? '#fff' : 'rgba(200,210,230,.85)'}" font-weight="600">${v.toFixed(2)}</text>`;
      });
    });
    svg += '</svg>';
    const el = document.getElementById('corrContainer');
    if (el) el.innerHTML = svg;
  }

  function initViz() {
    document.querySelectorAll('#vizTabs .tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#vizTabs .tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
        const t = document.getElementById('tab-' + btn.dataset.tab);
        if (t) t.style.display = 'block';
        if (btn.dataset.tab === 'frontier')    drawFrontier(document.getElementById('gammaSlider')?.value || 3);
        if (btn.dataset.tab === 'montecarlo')  runMonteCarlo();
        if (btn.dataset.tab === 'risk')        initRiskDecomp();
        if (btn.dataset.tab === 'corr')        drawCorrMatrix();
      });
    });

    // Gamma slider
    const slider = document.getElementById('gammaSlider');
    if (slider) {
      slider.addEventListener('input', () => {
        document.getElementById('gammaVal').textContent = 'γ = ' + parseFloat(slider.value).toFixed(1);
        drawFrontier(slider.value);
      });
    }

    // MC sliders
    ['mcMu','mcSig','mcHorizon','mcN'].forEach(id => {
      const el = document.getElementById(id);
      const labels = { mcMu: 'mcMuVal', mcSig: 'mcSigVal', mcHorizon: 'mcHorizonVal', mcN: 'mcNVal' };
      const fmts   = { mcMu: v => v+'%', mcSig: v => v+'%', mcHorizon: v => v, mcN: v => v };
      if (el) el.addEventListener('input', () => {
        const lbl = document.getElementById(labels[id]);
        if (lbl) lbl.textContent = fmts[id](el.value);
      });
    });
    document.getElementById('mcRunBtn')?.addEventListener('click', runMonteCarlo);

    drawFrontier(3);
  }

  window.PageVisualizations = { render };
  window.init_visualizations = initViz;
})();
