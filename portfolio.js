/* ================================================================
   portfolio.js — Fictional Portfolio Builder
   Real Yahoo Finance data via Flask backend
   ================================================================ */
(function () {
  const ASSET_CLASSES = [
    { id: 'SPY',  name: 'US Large Cap Equity',    color: '#00d4ff', desc: 'S&P 500 — 500 largest US companies' },
    { id: 'EFA',  name: 'Intl Developed Equity',  color: '#8b5cf6', desc: 'MSCI EAFE — Europe, Australasia, Far East' },
    { id: 'VWO',  name: 'Emerging Market Equity', color: '#f0b429', desc: 'MSCI EM — China, India, Brazil, etc.' },
    { id: 'TLT',  name: 'US Treasuries (Long)',   color: '#10b981', desc: '20+ Year Treasury Bonds (iShares)' },
    { id: 'LQD',  name: 'Investment Grade Bonds', color: '#34d399', desc: 'Corporate bond index (iShares IG)' },
    { id: 'VNQ',  name: 'Real Estate (REITs)',    color: '#f43f5e', desc: 'Vanguard REIT ETF — diversified real estate' },
    { id: 'GLD',  name: 'Gold',                   color: '#fbbf24', desc: 'SPDR Gold Shares — physical gold-backed' },
    { id: 'PDBC', name: 'Broad Commodities',      color: '#fb923c', desc: 'Invesco Optimum Yield Diversified Commodity' },
    { id: 'TIP',  name: 'TIPS (Inflation)',       color: '#a78bfa', desc: 'Treasury Inflation-Protected Securities' },
    { id: 'IWM',  name: 'US Small Cap',           color: '#38bdf8', desc: 'Russell 2000 — US small-capitalisation stocks' },
  ];

  let marketData     = null;
  let backtestResult = null;
  let weights        = {};

  // Default weights: equal weight
  ASSET_CLASSES.forEach(a => { weights[a.id] = 10; });

  function render() {
    return `
<div class="page-header">
  <div class="badge cyan">💼 Portfolio Builder</div>
  <h1 class="page-title">Fictional <span class="hi">Portfolio Builder</span></h1>
  <p class="page-sub">Build a portfolio from the 10 largest asset classes using <strong>live Yahoo Finance data</strong>. Backtest against the S&P 500 benchmark.</p>
</div>
<div class="page-content">

  <!-- Live Market Data Ticker -->
  <div class="card mb3" id="marketDataCard">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="card-title">📡 Live Market Data</div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="api-dot" id="mktDot"></div>
        <span style="font-size:12px;color:var(--t2)" id="mktStatus">Loading…</span>
        <button class="btn btn-ghost" style="padding:5px 12px;font-size:12px" onclick="window.PortfolioRefresh()">↺ Refresh</button>
      </div>
    </div>
    <div id="tickerGrid" class="g2" style="gap:10px">
      ${ASSET_CLASSES.map(a => `
      <div class="stat" id="ticker-${a.id}" style="border-left:3px solid ${a.color};padding:12px 16px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:11.5px;font-weight:700;color:${a.color};font-family:var(--fm)">${a.id}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">${a.name}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--fd);font-size:16px;font-weight:700;color:var(--t1)" id="price-${a.id}">—</div>
          <div style="font-size:12px;font-weight:600" id="chg-${a.id}">—</div>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Portfolio Builder -->
  <div class="g2">
    <!-- Left: weight sliders -->
    <div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div class="card-title">🎛 Allocation Weights</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost" style="font-size:11.5px;padding:5px 10px" onclick="window.PortfolioEqualWeight()">Equal Weight</button>
            <button class="btn btn-ghost" style="font-size:11.5px;padding:5px 10px" onclick="window.PortfolioClassic()">60/40</button>
          </div>
        </div>

        <div id="sliderContainer" style="display:flex;flex-direction:column;gap:10px"></div>

        <div style="margin-top:16px;padding:12px;background:rgba(0,0,0,.3);border-radius:var(--r1);display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:13px;color:var(--t2)">Total Allocated</span>
          <span style="font-family:var(--fm);font-size:15px;font-weight:700" id="totalPct">100%</span>
        </div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1">
            <label class="label">Backtest Period</label>
            <select class="input" id="periodSelect" style="padding:8px 12px">
              <option value="1y">1 Year</option>
              <option value="3y">3 Years</option>
              <option value="5y" selected>5 Years</option>
              <option value="10y">10 Years</option>
              <option value="max">Max</option>
            </select>
          </div>
          <div style="display:flex;align-items:flex-end">
            <button class="btn btn-primary" id="backtestBtn" onclick="window.PortfolioBacktest()">
              ▶ Run Backtest
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: results -->
    <div id="resultsPanel">
      <div class="card" style="height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;min-height:320px;border-style:dashed">
        <div style="font-size:32px">📊</div>
        <div style="font-family:var(--fd);font-size:15px;color:var(--t1)">Set weights and run backtest</div>
        <div style="font-size:13px;color:var(--t2);text-align:center;max-width:280px">Adjust allocations on the left, choose a time period, then click Run Backtest to see historical performance vs S&P 500.</div>
      </div>
    </div>
  </div>

  <!-- Chart (hidden until backtest runs) -->
  <div id="chartSection" style="display:none;margin-top:24px">
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div class="card-title">📈 Portfolio vs S&P 500 Benchmark</div>
        <div style="display:flex;gap:16px">
          <div class="legend-item"><div class="legend-dot" style="background:var(--cyan)"></div><span>My Portfolio</span></div>
          <div class="legend-item"><div class="legend-dot" style="background:rgba(200,200,200,.4)"></div><span>S&P 500 (SPY)</span></div>
        </div>
      </div>
      <canvas id="backtestCanvas" style="width:100%" height="320"></canvas>
    </div>
  </div>

  <!-- AI Analysis button -->
  <div id="aiAnalysisSection" style="display:none;margin-top:16px">
    <button class="btn btn-ai" style="width:100%;justify-content:center;padding:12px"
      id="aiAnalysisBtn">🤖 Ask AI to Analyse My Portfolio Backtest Results</button>
  </div>
</div>`;
  }

  /* ── Load market data ── */
  async function loadMarketData() {
    const dot    = document.getElementById('mktDot');
    const status = document.getElementById('mktStatus');
    if (dot) dot.className = 'api-dot';
    if (status) status.textContent = 'Fetching live data…';

    try {
      marketData = await window.InvestAPI.getAssets();
      marketData.forEach(asset => {
        const priceEl = document.getElementById('price-' + asset.ticker);
        const chgEl   = document.getElementById('chg-' + asset.ticker);
        if (priceEl) priceEl.textContent = '$' + asset.price.toFixed(2);
        if (chgEl) {
          const up = asset.change_pct >= 0;
          chgEl.textContent = (up ? '+' : '') + asset.change_pct.toFixed(2) + '%';
          chgEl.style.color = up ? 'var(--green)' : 'var(--red)';
        }
      });
      if (dot) { dot.className = 'api-dot ok'; }
      if (status) status.textContent = 'Live — ' + new Date().toLocaleTimeString();
    } catch (e) {
      if (dot) dot.className = 'api-dot error';
      if (status) status.textContent = 'Error loading data';
    }
  }

  /* ── Build weight sliders ── */
  function buildSliders() {
    const container = document.getElementById('sliderContainer');
    if (!container) return;

    container.innerHTML = ASSET_CLASSES.map(a => `
<div style="display:flex;align-items:center;gap:10px">
  <div style="width:10px;height:10px;border-radius:50%;background:${a.color};flex-shrink:0"></div>
  <div style="width:155px;flex-shrink:0">
    <div style="font-size:12px;color:var(--t1);font-weight:500;line-height:1.2">${a.name}</div>
    <div style="font-size:10.5px;color:var(--t3)">${a.desc}</div>
  </div>
  <input type="range" id="w_${a.id}" min="0" max="100" step="5" value="${weights[a.id]}"
    style="flex:1;accent-color:${a.color}" oninput="window.PortfolioUpdateWeight('${a.id}', this.value)">
  <span style="font-family:var(--fm);font-size:13px;color:${a.color};width:38px;text-align:right" id="wlbl_${a.id}">${weights[a.id]}%</span>
</div>`).join('');

    updateTotal();
  }

  function updateTotal() {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const el = document.getElementById('totalPct');
    if (el) {
      el.textContent = total + '%';
      el.style.color = Math.abs(total - 100) < 1 ? 'var(--green)' : total > 100 ? 'var(--red)' : 'var(--gold)';
    }
  }

  /* ── Run backtest ── */
  async function runBacktest() {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total === 0) return alert('Please set at least one allocation.');

    const normalised = {};
    Object.entries(weights).forEach(([k, v]) => { if (v > 0) normalised[k] = v / total; });

    const period = document.getElementById('periodSelect')?.value || '5y';
    const btn    = document.getElementById('backtestBtn');

    if (btn) { btn.textContent = '⏳ Running…'; btn.disabled = true; }

    try {
      backtestResult = await window.InvestAPI.backtestPortfolio(normalised, period);
      renderResults(backtestResult, normalised);
      drawChart(backtestResult.performance);
      document.getElementById('chartSection').style.display = 'block';
      document.getElementById('aiAnalysisSection').style.display = 'block';

      // Wire up AI button
      document.getElementById('aiAnalysisBtn').onclick = () => {
        const r = backtestResult;
        const allocs = Object.entries(normalised)
          .map(([t, w]) => `${t}: ${(w*100).toFixed(0)}%`).join(', ');
        window._primeQuestion = `Analyse my fictional portfolio backtest results:

**Allocations:** ${allocs}
**Period:** ${r.years} years
**Total Return:** ${r.total_return}% (vs S&P 500: ${r.benchmark_return}%)
**Annualized Return:** ${r.annualized_return}%
**Annualized Volatility:** ${r.annualized_vol}%
**Sharpe Ratio:** ${r.sharpe}
**Max Drawdown:** ${r.max_drawdown}%

Please provide: (1) a critique of this allocation, (2) risk-adjusted performance interpretation, (3) whether this portfolio makes sense from an academic perspective, and (4) specific improvements you would suggest.`;
        navigate('ai-tutor');
      };
    } catch (e) {
      const panel = document.getElementById('resultsPanel');
      if (panel) panel.innerHTML = `<div class="card" style="border-color:var(--red)"><div style="color:var(--red);font-weight:600">⚠ Backtest failed</div><div style="font-size:13px;color:var(--t2);margin-top:8px">${e.message}</div><div style="font-size:12px;color:var(--t3);margin-top:6px">Make sure the Flask server is running.</div></div>`;
    } finally {
      if (btn) { btn.textContent = '▶ Run Backtest'; btn.disabled = false; }
    }
  }

  /* ── Render stats panel ── */
  function renderResults(r, w) {
    const outperform = r.total_return > r.benchmark_return;
    const panel = document.getElementById('resultsPanel');
    if (!panel) return;

    const allocHtml = ASSET_CLASSES
      .filter(a => (w[a.id] || 0) > 0)
      .sort((a, b) => (w[b.id] || 0) - (w[a.id] || 0))
      .map(a => `
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
  <div style="width:8px;height:8px;border-radius:50%;background:${a.color};flex-shrink:0"></div>
  <span style="font-size:12px;color:var(--t2);flex:1">${a.name}</span>
  <span style="font-family:var(--fm);font-size:12px;color:${a.color}">${((w[a.id]||0)*100).toFixed(0)}%</span>
</div>`).join('');

    panel.innerHTML = `
<div style="display:flex;flex-direction:column;gap:14px">
  <div class="g2" style="gap:10px">
    <div class="stat">
      <div class="stat-label">Total Return</div>
      <div class="stat-val ${r.total_return >= 0 ? 'gr' : ''}" style="${r.total_return < 0 ? 'color:var(--red)' : ''}">${r.total_return >= 0 ? '+' : ''}${r.total_return}%</div>
      <div class="stat-change">${r.years}y period</div>
    </div>
    <div class="stat">
      <div class="stat-label">S&P 500 Return</div>
      <div class="stat-val" style="color:rgba(180,190,210,.6)">${r.benchmark_return >= 0 ? '+' : ''}${r.benchmark_return}%</div>
      <div class="stat-change">Benchmark</div>
    </div>
    <div class="stat">
      <div class="stat-label">Sharpe Ratio</div>
      <div class="stat-val ${r.sharpe > 0.5 ? 'c' : ''}">${r.sharpe}</div>
      <div class="stat-change">${r.sharpe > 1 ? 'Excellent' : r.sharpe > 0.5 ? 'Good' : 'Weak'}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Max Drawdown</div>
      <div class="stat-val" style="color:var(--red)">${r.max_drawdown}%</div>
      <div class="stat-change">Peak-to-trough loss</div>
    </div>
  </div>

  <div class="g2" style="gap:10px">
    <div class="stat">
      <div class="stat-label">Ann. Return (est.)</div>
      <div class="stat-val gr">${r.annualized_return}%</div>
    </div>
    <div class="stat">
      <div class="stat-label">Ann. Volatility</div>
      <div class="stat-val" style="color:var(--purple)">${r.annualized_vol}%</div>
    </div>
  </div>

  <div class="card" style="padding:14px">
    <div style="font-size:12px;font-weight:700;color:var(--t2);margin-bottom:10px;text-transform:uppercase;letter-spacing:.8px">Allocation Breakdown</div>
    ${allocHtml}
  </div>

  <div class="${outperform ? 'insight' : 'insight gold'}">
    <strong>${outperform ? '✓ Outperformed' : '⚠ Underperformed'} S&P 500</strong> by 
    ${Math.abs(r.total_return - r.benchmark_return).toFixed(2)}% over ${r.years} years.
    ${outperform ? 'Diversification added value vs 100% US equity.' : 'US large caps dominated this period. Consider your risk-adjusted rationale.'}
  </div>
</div>`;
  }

  /* ── Draw chart ── */
  function drawChart(performance) {
    const canvas = document.getElementById('backtestCanvas');
    if (!canvas || !performance.length) return;
    canvas.width = canvas.offsetWidth || 900;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { l: 60, r: 20, t: 20, b: 44 };

    const portVals  = performance.map(p => p.portfolio);
    const benchVals = performance.map(p => p.benchmark);
    const allVals   = [...portVals, ...benchVals];
    const minV = Math.min(...allVals) * 0.97;
    const maxV = Math.max(...allVals) * 1.03;
    const n    = performance.length;

    const toX = i => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const toY = v => H - pad.b - (v - minV) / (maxV - minV) * (H - pad.t - pad.b);

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(80,140,230,.07)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / 5;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      const val = minV + (maxV - minV) * (1 - i / 5);
      ctx.fillStyle = 'rgba(150,165,185,.45)'; ctx.font = '10px Inter';
      ctx.fillText('$' + val.toFixed(2), 2, y + 4);
    }

    // Benchmark area
    ctx.beginPath();
    performance.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p.benchmark)) : ctx.lineTo(toX(i), toY(p.benchmark)));
    const benchGrad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
    benchGrad.addColorStop(0, 'rgba(160,170,190,.15)');
    benchGrad.addColorStop(1, 'rgba(160,170,190,.01)');
    ctx.lineTo(toX(n-1), H - pad.b); ctx.lineTo(toX(0), H - pad.b); ctx.closePath();
    ctx.fillStyle = benchGrad; ctx.fill();

    // Benchmark line
    ctx.beginPath(); ctx.strokeStyle = 'rgba(180,190,210,.35)'; ctx.lineWidth = 1.5;
    performance.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p.benchmark)) : ctx.lineTo(toX(i), toY(p.benchmark)));
    ctx.stroke();

    // Portfolio area
    ctx.beginPath();
    performance.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p.portfolio)) : ctx.lineTo(toX(i), toY(p.portfolio)));
    const portGrad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
    portGrad.addColorStop(0, 'rgba(0,212,255,.2)');
    portGrad.addColorStop(1, 'rgba(0,212,255,.01)');
    ctx.lineTo(toX(n-1), H - pad.b); ctx.lineTo(toX(0), H - pad.b); ctx.closePath();
    ctx.fillStyle = portGrad; ctx.fill();

    // Portfolio line
    ctx.beginPath(); ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 6;
    performance.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p.portfolio)) : ctx.lineTo(toX(i), toY(p.portfolio)));
    ctx.stroke(); ctx.shadowBlur = 0;

    // X axis labels (dates)
    const labelGap = Math.floor(n / 6);
    ctx.fillStyle = 'rgba(140,155,175,.55)'; ctx.font = '10px Inter';
    for (let i = 0; i < n; i += labelGap) {
      const d = performance[i].date.slice(0, 7);
      ctx.fillText(d, toX(i) - 18, H - pad.b + 16);
    }

    // Baseline annotation
    const baseY = toY(1.0);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(140,155,175,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, baseY); ctx.lineTo(W - pad.r, baseY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(140,155,175,.4)'; ctx.font = '10px Inter';
    ctx.fillText('$1.00', 2, baseY + 4);
  }

  /* ── Preset buttons ── */
  window.PortfolioEqualWeight = () => {
    ASSET_CLASSES.forEach(a => {
      weights[a.id] = 10;
      const el = document.getElementById('w_' + a.id);
      const lbl = document.getElementById('wlbl_' + a.id);
      if (el) el.value = 10;
      if (lbl) lbl.textContent = '10%';
    });
    updateTotal();
  };

  window.PortfolioClassic = () => {
    // 60% equity (split 4 ways), 40% bonds (split 2 ways)
    const equityIds  = ['SPY', 'EFA', 'VWO', 'IWM'];
    const bondIds    = ['TLT', 'LQD', 'TIP'];
    const otherIds   = ['VNQ', 'GLD', 'PDBC'];
    ASSET_CLASSES.forEach(a => {
      let w = 0;
      if (equityIds.includes(a.id)) w = 15;
      else if (bondIds.includes(a.id)) w = 10;
      else if (otherIds.includes(a.id)) w = Math.round(10/3);
      weights[a.id] = w;
      const el = document.getElementById('w_' + a.id);
      const lbl = document.getElementById('wlbl_' + a.id);
      if (el) el.value = w;
      if (lbl) lbl.textContent = w + '%';
    });
    updateTotal();
  };

  window.PortfolioUpdateWeight = (id, val) => {
    weights[id] = parseInt(val);
    const lbl = document.getElementById('wlbl_' + id);
    if (lbl) lbl.textContent = val + '%';
    updateTotal();
  };

  window.PortfolioBacktest = runBacktest;
  window.PortfolioRefresh  = loadMarketData;

  window.PagePortfolio = { render };
  window.init_portfolio = () => {
    buildSliders();
    loadMarketData();
  };
})();
