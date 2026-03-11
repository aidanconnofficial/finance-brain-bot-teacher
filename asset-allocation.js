/* ================================================================
   asset-allocation.js — Asset Allocation deep-dive module
   ================================================================ */
(function () {
  function render() {
    return `
<div class="page-header">
  <div class="badge cyan">◎ Module 1</div>
  <h1 class="page-title"><span class="hi">Asset Allocation</span></h1>
  <p class="page-sub">From Modern Portfolio Theory to dynamic multi-asset frameworks. Master the mathematics of portfolio construction.</p>
</div>
<div class="page-content">

  <div class="tabs" id="aaTabs">
    <button class="tab active" data-tab="mvo">Efficient Frontier & MVO</button>
    <button class="tab" data-tab="bl">Black-Litterman</button>
    <button class="tab" data-tab="rp">Risk Parity</button>
    <button class="tab" data-tab="dynamic">Dynamic Allocation</button>
  </div>

  <!-- MVO Tab -->
  <div id="tab-mvo" class="tab-content">
    <div class="g2">
      <div>
        <div class="section-title">Mean-Variance Optimisation</div>
        <div class="section-sub">Markowitz (1952) — minimise portfolio variance for a given expected return.</div>

        <div class="formula">min  w'Σw
s.t. w'μ = μ_p   (target return)
     w'1 = 1     (fully invested)
     w ≥ 0       (no short-selling)</div>

        <div class="card-body mt1">
          The Lagrangian dual yields the <strong style="color:var(--cyan)">two-fund separation theorem</strong>: every efficient portfolio is a 
          linear combination of any two efficient portfolios — typically the <em>minimum-variance portfolio (MVP)</em> 
          and the <em>tangency portfolio</em> (max Sharpe ratio).
        </div>

        <div class="insight mt2">
          <strong>Key insight:</strong> The efficient frontier is a hyperbola in (σ, μ) space, 
          and a straight line (Capital Market Line) emerges when a risk-free asset exists: 
          <em>Sharpe = (μ_p − r_f) / σ_p</em>.
        </div>

        <div class="insight gold mt1">
          <strong>Curse of estimation:</strong> MVO is extremely sensitive to input errors 
          (Michaud, 1989). A 1% error in expected returns can flip an optimal allocation by 20%+. 
          This motivates Black-Litterman and robust optimisation.
        </div>

        <div class="flex gap2 mt2">
          <button class="btn btn-ai" onclick="navigate('ai-tutor');window._primeQuestion='Derive the Lagrangian solution to the Markowitz portfolio optimisation problem step by step.'">Ask AI: Derive MVO ›</button>
          <button class="btn btn-ai" onclick="navigate('visualizations')">See Frontier Chart ›</button>
        </div>
      </div>

      <div>
        <div class="section-title">Efficient Frontier: 6 Asset Classes</div>
        <div class="chart-wrap" style="padding:20px">
          <canvas id="aaFrontierCanvas" width="520" height="360"></canvas>
        </div>
        <div class="legend mt1" id="aaLegend"></div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section-title mt1">Capital Asset Pricing Model (CAPM)</div>
    <div class="g2 mt1">
      <div class="card">
        <div class="card-title">Security Market Line</div>
        <div class="formula" style="margin:8px 0">E[r_i] = r_f + β_i · (E[r_M] − r_f)</div>
        <div class="card-body">Beta (β) measures systematic risk — the covariance of asset i with the market, scaled by market variance. Only <em>systematic</em> risk is priced; idiosyncratic risk can be diversified away.</div>
      </div>
      <div class="card">
        <div class="card-title">Implications for Allocation</div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:8px">
          <div>📌 <strong>Passive strategy:</strong> hold the market cap-weighted portfolio (index)</div>
          <div>📌 <strong>Active strategy:</strong> bet on mispriced securities (α ≠ 0)</div>
          <div>📌 <strong>Empirical failure:</strong> CAPM is rejected — size, value, momentum anomalies persist → Factor models</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Black-Litterman Tab -->
  <div id="tab-bl" class="tab-content" style="display:none">
    <div class="section-title">Black-Litterman Model (1990)</div>
    <div class="section-sub">Bayesian framework combining equilibrium returns (prior) with investor views (likelihood) to produce posterior expected returns.</div>

    <div class="g2 mt2">
      <div>
        <div class="card-title mb1">Step 1 — Equilibrium Prior (Reverse Optimisation)</div>
        <div class="formula">Π = λ · Σ · w_mkt</div>
        <div class="card-body">CAPM implied returns Π are derived by reverse-engineering the market-cap portfolio. λ is the risk-aversion coefficient (≈ 2.5 for global equities), w_mkt is the market weights vector.</div>

        <div class="card-title mt2 mb1">Step 2 — Investor Views (P, Q, Ω)</div>
        <div class="formula">P · μ = Q + ε,   ε ~ N(0, Ω)</div>
        <div class="card-body">
          <strong>P</strong>: K×N pick matrix (which assets each view involves)<br>
          <strong>Q</strong>: K×1 vector of view expected returns<br>
          <strong>Ω</strong>: K×K diagonal confidence matrix (low = high confidence)
        </div>

        <div class="card-title mt2 mb1">Step 3 — Posterior Returns</div>
        <div class="formula">μ_BL = [(τΣ)⁻¹ + P'Ω⁻¹P]⁻¹
       × [(τΣ)⁻¹Π + P'Ω⁻¹Q]</div>
        <div class="insight mt1"><strong>Result:</strong> μ_BL tilts toward views in proportion to confidence (1/Ω). When Ω → ∞, μ_BL = Π (no view). When Ω → 0, μ_BL fully reflects views.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title">Why BL Beats Vanilla MVO</div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:10px">
            <div>✦ Equilibrium prior prevents extreme corner solutions</div>
            <div>✦ Views are incorporated in a statistically coherent way</div>
            <div>✦ Resulting portfolios are more diversified and intuitive</div>
            <div>✦ Industry standard at major asset managers (Goldman, Bridgewater)</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Example: Bullish EM View</div>
          <div class="card-body">
            View: "Emerging Markets will outperform Developed Markets by 3% annually"<br><br>
            <strong style="color:var(--cyan)">P</strong> = [0, 0, +1, −1, 0, 0] (long EM, short Intl Dev)<br>
            <strong style="color:var(--gold)">Q</strong> = [0.03] (3% excess)<br>
            <strong style="color:var(--purple)">Ω</strong> = [0.001] (high confidence)
          </div>
        </div>
        <button class="btn btn-ai" onclick="navigate('ai-tutor');window._primeQuestion='Walk me through a full numerical Black-Litterman example with 3 assets and 2 investor views, showing all matrix operations.'">Full Numerical Example ›</button>
      </div>
    </div>
  </div>

  <!-- Risk Parity Tab -->
  <div id="tab-rp" class="tab-content" style="display:none">
    <div class="section-title">Risk Parity & Equal Risk Contribution</div>
    <div class="section-sub">Allocate capital so every asset contributes equally to total portfolio risk — not equal capital weights.</div>

    <div class="g2 mt2">
      <div>
        <div class="card-title mb1">Risk Contribution Formula</div>
        <div class="formula">RC_i = w_i · (Σw)_i / √(w'Σw)
      = w_i · MRC_i</div>
        <div class="card-body mt1">
          The marginal risk contribution (MRC) of asset i is ∂σ_p/∂w_i = (Σw)_i / σ_p. 
          Equal risk contribution requires RC_i = RC_j ∀ i,j — solved numerically via Newton's method or gradient descent.
        </div>

        <div class="insight mt2">
          <strong>Key property:</strong> Risk parity overweights low-volatility assets (bonds) and underweights high-volatility assets (equities). In practice, 
          leverage is often applied to bonds to achieve equity-like returns — the core idea behind Bridgewater's <em>All Weather</em> fund.
        </div>

        <div class="formula mt2">Risk Parity vs Naive 60/40:
σ_ERC = equal risk by construction
σ_60/40 ≈ 90% driven by equity risk</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title">Comparison: Allocation Strategies</div>
          <table style="width:100%;font-size:12.5px;border-collapse:collapse;margin-top:8px">
            <thead><tr style="color:var(--t2);font-size:11px;text-transform:uppercase;letter-spacing:.5px">
              <th style="text-align:left;padding:6px 0;border-bottom:1px solid var(--border)">Strategy</th>
              <th style="padding:6px 8px;border-bottom:1px solid var(--border)">Equity Wt</th>
              <th style="padding:6px 8px;border-bottom:1px solid var(--border)">Bond Wt</th>
              <th style="padding:6px 8px;border-bottom:1px solid var(--border)">Risk Driver</th>
            </tr></thead>
            <tbody>
              ${[
                ['60/40', '60%', '40%', '~90% equity'],
                ['Risk Parity (unlevered)', '~25%', '~75%', 'Equal by asset'],
                ['Risk Parity (levered)', '~50%', '~150%', 'Equal, target σ'],
                ['Min Variance', 'Low', 'High', 'Minimise σ'],
                ['Max Sharpe', 'Varies', 'Varies', 'Max Sharpe'],
              ].map(([s,e,b,r]) => `<tr style="border-bottom:1px solid var(--border)">
                <td style="padding:7px 0;color:var(--t1)">${s}</td>
                <td style="padding:7px 8px;text-align:center;color:var(--cyan)">${e}</td>
                <td style="padding:7px 8px;text-align:center;color:var(--gold)">${b}</td>
                <td style="padding:7px 8px;text-align:center;color:var(--t2);font-size:11.5px">${r}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <button class="btn btn-ai" onclick="navigate('ai-tutor');window._primeQuestion='Solve the risk parity optimisation numerically for a 4-asset portfolio using Newton-Raphson. Show all steps.'">Solve Numerically with AI ›</button>
      </div>
    </div>
  </div>

  <!-- Dynamic Allocation Tab -->
  <div id="tab-dynamic" class="tab-content" style="display:none">
    <div class="section-title">Dynamic Asset Allocation</div>
    <div class="section-sub">Static allocation ignores regime changes. Dynamic strategies condition on economic signals, momentum, or Bayesian state estimates.</div>

    <div class="g3 mt2">
      <div class="card">
        <div class="card-title">Tactical Asset Allocation (TAA)</div>
        <div class="card-body">Short-term deviations from strategic benchmark based on valuation, momentum, or macro signals. Tracking error constrained, typically ±5–15% from SAA weights.</div>
      </div>
      <div class="card">
        <div class="card-title">Regime-Based Switching</div>
        <div class="card-body">Hidden Markov Models (HMM) or Markov-Switching VAR identify bull/bear/crisis regimes. Portfolio weights adapt to regime probabilities in real time.</div>
      </div>
      <div class="card">
        <div class="card-title">Momentum Tilts</div>
        <div class="card-body">12-1 month cross-sectional momentum (Jegadeesh & Titman, 1993) applied across asset classes. Overweight recent winners, underweight losers with quarterly rebalance.</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section-title">Lifecycle / Glide Path Allocation</div>
    <div class="g2 mt2">
      <div class="card">
        <div class="card-title">Human Capital Model</div>
        <div class="formula">Total Wealth = Financial Capital + PV(Human Capital)</div>
        <div class="card-body mt1">Young investors have large human capital (bond-like salary stream) → hold more equities in financial portfolio. Near retirement: human capital depleted → shift to bonds. This is the theoretical basis for target-date funds.</div>
      </div>
      <div class="card">
        <div class="card-title">Consumption-Savings Problem (Merton 1969)</div>
        <div class="formula">w* = (μ - r_f) / (γ · σ²)</div>
        <div class="card-body mt1">Optimal risky asset weight is Return / (RiskAversion × Variance). γ ≈ 2–4 for typical investors. Merton extends this to continuous-time with stochastic opportunity sets (hedging demand term).</div>
      </div>
    </div>
    <button class="btn btn-ai mt2" onclick="navigate('ai-tutor');window._primeQuestion='Explain Merton continuous-time portfolio theory and how it extends Markowitz. Include the hedging demand term and its economic interpretation.'">Deep Dive with AI ›</button>
  </div>

</div>`;
  }

  function initTabs() {
    document.querySelectorAll('#aaTabs .tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#aaTabs .tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
        const target = document.getElementById('tab-' + btn.dataset.tab);
        if (target) target.style.display = 'block';
      });
    });
    drawMiniEfficientFrontier();
  }

  function drawMiniEfficientFrontier() {
    const canvas = document.getElementById('aaFrontierCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { l: 50, r: 20, t: 20, b: 40 };

    const assets = [
      { name: 'US Equity',   mu: 0.10, sigma: 0.16, color: '#00d4ff' },
      { name: 'Intl Equity', mu: 0.085, sigma: 0.175, color: '#8b5cf6' },
      { name: 'Emerging',    mu: 0.11,  sigma: 0.23,  color: '#f0b429' },
      { name: 'Bonds',       mu: 0.04,  sigma: 0.06,  color: '#10b981' },
      { name: 'Real Estate', mu: 0.08,  sigma: 0.15,  color: '#f43f5e' },
      { name: 'Commodities', mu: 0.05,  sigma: 0.18,  color: '#fb923c' },
    ];

    // Generate Monte Carlo portfolios
    const portfolios = [];
    for (let i = 0; i < 1800; i++) {
      let w = assets.map(() => Math.random());
      const s = w.reduce((a, b) => a + b, 0);
      w = w.map(x => x / s);
      const mu = w.reduce((a, x, j) => a + x * assets[j].mu, 0);
      // Simplified variance (no correlation for speed)
      const variance = w.reduce((a, x, j) => a + x * x * assets[j].sigma * assets[j].sigma, 0) * 1.35;
      portfolios.push({ sigma: Math.sqrt(variance), mu });
    }

    const allSigmas = portfolios.map(p => p.sigma);
    const allMus    = portfolios.map(p => p.mu);
    const minS = Math.min(...allSigmas) * 0.85;
    const maxS = Math.max(...allSigmas) * 1.05;
    const minM = Math.min(...allMus)    * 0.85;
    const maxM = Math.max(...allMus)    * 1.05;

    const toX = s => pad.l + (s - minS) / (maxS - minS) * (W - pad.l - pad.r);
    const toY = m => H - pad.b - (m - minM) / (maxM - minM) * (H - pad.t - pad.b);

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(80,140,230,.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / 5;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    }

    // Portfolios (scatter)
    ctx.fillStyle = 'rgba(139,92,246,.25)';
    for (const p of portfolios) {
      ctx.beginPath();
      ctx.arc(toX(p.sigma), toY(p.mu), 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Efficient frontier (upper boundary)
    const bins = 60;
    const minSig = Math.min(...allSigmas);
    const maxSig = Math.max(...allSigmas);
    const step = (maxSig - minSig) / bins;
    const frontier = [];
    for (let b = 0; b < bins; b++) {
      const lo = minSig + b * step, hi = lo + step;
      const bucket = portfolios.filter(p => p.sigma >= lo && p.sigma < hi);
      if (bucket.length) frontier.push({ sigma: (lo + hi) / 2, mu: Math.max(...bucket.map(p => p.mu)) });
    }
    frontier.sort((a, b) => a.sigma - b.sigma);

    ctx.strokeStyle = 'rgba(0,212,255,.9)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    frontier.forEach((p, i) => {
      const x = toX(p.sigma), y = toY(p.mu);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Individual assets
    for (const a of assets) {
      const x = toX(a.sigma), y = toY(a.mu);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.shadowColor = a.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter';
      ctx.fillText(a.name, x + 8, y + 4);
    }

    // Axes labels
    ctx.fillStyle = 'rgba(200,210,230,.5)';
    ctx.font = '11px Inter';
    ctx.fillText('Risk (σ)', W / 2, H - 8);
    ctx.save(); ctx.translate(14, H / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('Return (μ)', 0, 0); ctx.restore();

    // Legend
    const legend = document.getElementById('aaLegend');
    if (legend) {
      legend.innerHTML = assets.map(a =>
        `<div class="legend-item"><div class="legend-dot" style="background:${a.color}"></div>${a.name}</div>`
      ).join('');
    }
  }

  window.PageAssetAllocation = { render };
  window.init_asset_allocation = initTabs;
})();
