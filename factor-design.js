/* ================================================================
   factor-design.js — Factor Design module
   ================================================================ */
(function () {
  const FACTORS = [
    { id: 'mkt', name: 'Mkt-RF', label: 'Market',       color: '#00d4ff', desc: 'Excess return of the market portfolio over the risk-free rate. The only factor in CAPM. Premium ≈ 5–8% per year historically.' },
    { id: 'smb', name: 'SMB',    label: 'Size',          color: '#f0b429', desc: 'Small Minus Big — long small-cap, short large-cap. Fama-French (1993). Premium ≈ 2–3%. Diminished post-publication (McLean & Pontiff).' },
    { id: 'hml', name: 'HML',    label: 'Value',         color: '#10b981', desc: 'High Minus Low book-to-market. Long value stocks (high B/M), short growth (low B/M). Premium ≈ 3–5%. Compressed since 2007 growth run.' },
    { id: 'rmw', name: 'RMW',    label: 'Profitability', color: '#8b5cf6', desc: 'Robust Minus Weak — long high operating profitability, short low. Fama-French (2015). Premium ≈ 3%. Negatively correlated with Value.' },
    { id: 'cma', name: 'CMA',    label: 'Investment',    color: '#f43f5e', desc: 'Conservative Minus Aggressive — long low asset growth firms, short high growers. Overinvestment destroys value (Jensen free cash flow hypothesis).' },
    { id: 'wml', name: 'WML',    label: 'Momentum',      color: '#fb923c', desc: 'Winners Minus Losers — long 12-1 month return winners, short losers. Jegadeesh & Titman (1993). Premium ≈ 7–8%. Crashes in rebounds.' },
  ];

  // Factor loadings for 8 asset classes (rows=assets, cols=factors)
  const ASSETS = ['US Value','US Growth','Small Cap','Intl Dev','Emerg Mkt','REITs','Corp Bonds','Commodities'];
  const LOADINGS = [
    // Mkt,  SMB,   HML,   RMW,   CMA,   WML
    [  0.95,  0.02,  0.45,  0.30, -0.05,  0.10 ],  // US Value
    [  0.98, -0.05, -0.35,  0.40,  0.10,  0.20 ],  // US Growth
    [  0.92,  0.65,  0.15,  0.05,  0.00,  0.05 ],  // Small Cap
    [  0.88,  0.00,  0.25,  0.20, -0.10,  0.15 ],  // Intl Dev
    [  0.82,  0.30,  0.20,  0.00,  0.05,  0.00 ],  // Emerging
    [  0.75, -0.10,  0.55,  0.15, -0.20, -0.05 ],  // REITs
    [  0.30, -0.05,  0.10,  0.05,  0.10, -0.10 ],  // Corp Bonds
    [  0.35,  0.10,  0.05, -0.10,  0.15, -0.15 ],  // Commodities
  ];

  function render() {
    return `
<div class="page-header">
  <div class="badge gold">⬡ Module 2</div>
  <h1 class="page-title"><span class="hi">Factor Design</span></h1>
  <p class="page-sub">From the factor zoo to disciplined multi-factor alpha generation. Construction methodology, signal decay, and portfolio implementation.</p>
</div>
<div class="page-content">

  <div class="tabs" id="fdTabs">
    <button class="tab active" data-tab="ff5">Fama-French 5 + Momentum</button>
    <button class="tab" data-tab="construction">Factor Construction</button>
    <button class="tab" data-tab="smartbeta">Smart Beta</button>
    <button class="tab" data-tab="alpha">Alpha Generation</button>
  </div>

  <!-- Fama French Tab -->
  <div id="tab-ff5" class="tab-content">
    <div class="section-title">The Fama-French Five-Factor Model + Momentum</div>
    <div class="section-sub">r_i − r_f = α + β₁(Mkt-RF) + β₂SMB + β₃HML + β₄RMW + β₅CMA + β₆WML + ε</div>

    <div class="g3 mt2" id="factorCards">
      ${FACTORS.map(f => `
      <div class="card" style="border-color:${f.color}22;cursor:pointer" id="fcard-${f.id}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:36px;height:36px;border-radius:10px;background:${f.color}18;border:1px solid ${f.color}44;display:flex;align-items:center;justify-content:center;font-family:var(--fm);font-size:13px;font-weight:700;color:${f.color}">${f.name}</div>
          <div><div style="font-family:var(--fd);font-size:14px;font-weight:600;color:var(--t1)">${f.label} Factor</div></div>
        </div>
        <div class="card-body" style="font-size:12.5px">${f.desc}</div>
      </div>`).join('')}
    </div>

    <div class="divider"></div>
    <div class="section-title">Factor Loading Heatmap</div>
    <div class="section-sub">Estimated factor exposures (betas) for 8 major asset classes.</div>
    <div style="overflow-x:auto;margin-top:16px" id="heatmapContainer"></div>
    <button class="btn btn-ai mt2" onclick="navigate('ai-tutor');window._primeQuestion='Explain why the investment factor (CMA) and profitability factor (RMW) were added to Fama-French 3, and how they relate to the dividend discount model.'">Why 5 factors? Ask AI ›</button>
  </div>

  <!-- Construction Tab -->
  <div id="tab-construction" class="tab-content" style="display:none">
    <div class="section-title">Factor Construction Methodology</div>
    <div class="section-sub">The choices made in constructing a factor portfolio determine its purity, turnover, capacity, and return profile.</div>

    <div class="g2 mt2">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title">1. Signal Definition</div>
          <div class="card-body">
            <strong style="color:var(--cyan)">Accounting signals:</strong> book-to-price (B/P), earnings yield (E/P), gross profitability (GP/Assets)<br><br>
            <strong style="color:var(--gold)">Price signals:</strong> 12-1 momentum, short-term reversal (1-month), 52-week high<br><br>
            <strong style="color:var(--purple)">Composite signals:</strong> IC-weighted combination of multiple signals (e.g., QMJ quality score)
          </div>
        </div>
        <div class="card">
          <div class="card-title">2. Universe & Sorting</div>
          <div class="card-body">
            <strong>Univariate sort:</strong> Rank all stocks by signal → long top decile, short bottom decile<br><br>
            <strong>Bivariate / Double sort:</strong> Size-adjusted value (controls for size within B/M buckets). Standard Fama-French approach uses 2×3 sorts on Size × B/M<br><br>
            <strong>z-score approach:</strong> Standardise signals cross-sectionally, weight proportionally
          </div>
        </div>
        <div class="card">
          <div class="card-title">3. Rebalancing Frequency</div>
          <div class="card-body">
            Annual (Fama-French): low turnover, stale signals, suitable for slow value<br>
            Monthly: fresh momentum signal, high turnover (80–120% p.a.)<br>
            Daily: only for short-term reversal / microstructure factors<br><br>
            <strong style="color:var(--gold)">Key trade-off:</strong> More frequent = fresher signal but higher transaction costs
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title">4. Weighting Scheme</div>
          <div class="formula" style="font-size:11.5px">Equal weight: w_i = 1/N_long   (ignores signal strength)
Value weight: w_i ∝ mktcap_i (index-like, capacity-feasible)
Signal weight: w_i ∝ z-score_i (maximises IC utilisation)
Optimised: w = argmin w'Σw s.t. w'z = 1</div>
        </div>
        <div class="card">
          <div class="card-title">5. Decay & Signal Half-Life</div>
          <div class="formula" style="font-size:11.5px">IC_t = IC_0 · ρ^t
Half-life = -ln(2) / ln(ρ)

Factor       IR    Half-life
Momentum     0.05  1–3 months
Value        0.03  12–24 months
Profitability 0.04 6–18 months</div>
          <div class="card-body mt1">The Information Decay Rate governs how quickly to rebalance. IC (information coefficient) = correlation of signal with forward returns.</div>
        </div>
        <div class="insight">
          <strong>Implementation Shortfall:</strong> Transaction costs eat 20–60% of gross alpha for high-turnover strategies. Use Almgren-Chriss model to optimise trade schedules.
        </div>
      </div>
    </div>
  </div>

  <!-- Smart Beta Tab -->
  <div id="tab-smartbeta" class="tab-content" style="display:none">
    <div class="section-title">Smart Beta & Factor ETFs</div>
    <div class="section-sub">Rules-based systematic strategies that tilt toward factor premia at low cost, bridging passive and active management.</div>

    <div class="mt2" style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="color:var(--t2);font-size:11px;text-transform:uppercase;letter-spacing:.7px;border-bottom:1px solid var(--border)">
            <th style="text-align:left;padding:10px 0">ETF</th>
            <th style="padding:10px 12px">AUM ($B)</th>
            <th style="padding:10px 12px">Factor</th>
            <th style="padding:10px 12px">Expense</th>
            <th style="padding:10px 12px">Mkt β</th>
            <th style="padding:10px 12px">Factor β</th>
            <th style="text-align:left;padding:10px 12px">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ['IWD',  '48',  'Value',     '0.19%', '0.97', 'HML +0.38', 'Large-cap value. Sensitive to value-growth spread.'],
            ['MTUM', '11',  'Momentum',  '0.15%', '0.98', 'WML +0.52', '12-1M momentum, rebalance 2×/yr. Crash risk in sharp reversals.'],
            ['USMV', '26',  'Min-Vol',   '0.15%', '0.72', 'Beta -0.25', 'MSCI USA Min-Vol. Defensive, outperforms in drawdowns.'],
            ['QUAL', '32',  'Quality',   '0.15%', '0.95', 'RMW +0.44', 'High ROE, low debt, stable earnings. Buffett factor.'],
            ['SIZE', '0.4', 'Size',      '0.25%', '0.98', 'SMB +0.60', 'Pure small-cap. Illiquidity premium embedded.'],
            ['VLUE', '3.2', 'Value',     '0.15%', '0.94', 'HML +0.55', 'MSCI enhanced value. Multi-metric: B/P, E/P, EV/FCF.'],
            ['DWAS', '1.5', 'Small-Mom', '0.60%', '0.90', 'Combo',     'Small-cap momentum (DWA). Factor combination with higher turnover.'],
          ].map(([e,a,f,ex,b,fb,n]) => `<tr style="border-bottom:1px solid var(--border)">
            <td style="padding:10px 0;color:var(--cyan);font-family:var(--fm);font-weight:600">${e}</td>
            <td style="padding:10px 12px;text-align:center;color:var(--t1)">$${a}</td>
            <td style="padding:10px 12px;text-align:center;color:var(--gold)">${f}</td>
            <td style="padding:10px 12px;text-align:center;color:var(--t2)">${ex}</td>
            <td style="padding:10px 12px;text-align:center;color:var(--t2)">${b}</td>
            <td style="padding:10px 12px;text-align:center;color:var(--green);font-family:var(--fm);font-size:12px">${fb}</td>
            <td style="padding:10px 12px;color:var(--t2);font-size:12px">${n}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="g2 mt3">
      <div class="insight">
        <strong>Factor Crowding Risk:</strong> When many investors pile into the same factor ETF, 
        factor valuations become stretched and unwind risk increases (Arnott et al., 2016). 
        Monitor factor P/E relative to historical norms.
      </div>
      <div class="insight gold">
        <strong>Post-Publication Decay:</strong> McLean & Pontiff (2016) document that factor returns 
        decline ~26% post-publication as arbitrageurs trade them away. 
        Factors with higher implementation costs decay less.
      </div>
    </div>
    <button class="btn btn-ai mt2" onclick="navigate('ai-tutor');window._primeQuestion='Explain factor crowding — how to measure it, what causes it, and how it leads to sharp factor drawdowns with a historical example.'">Factor Crowding Deep Dive ›</button>
  </div>

  <!-- Alpha Generation Tab -->
  <div id="tab-alpha" class="tab-content" style="display:none">
    <div class="section-title">Multi-Factor Alpha Generation</div>
    <div class="section-sub">Combining factors into a robust signal and translating it into an investable portfolio.</div>

    <div class="g2 mt2">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title">Multi-Factor Model</div>
          <div class="formula">r_i = α + Σ_k β_{i,k} · F_k + ε_i

Alpha = r_i − Σ_k β_{i,k} · F_k
      = stock-specific return</div>
          <div class="card-body mt1">True alpha requires controlling for all known factor exposures. A "found" alpha that correlates with an uncontrolled factor is a <em>factor in disguise</em>.</div>
        </div>
        <div class="card">
          <div class="card-title">Signal Combination Methods</div>
          <div class="formula" style="font-size:12px">1. Equal-weight composite:
   Score = (1/K) Σ z_k

2. IC-weighted:
   Score = Σ IC_k · z_k / Σ IC_k

3. Mean-variance optimal:
   w* = (1/γ) Σ⁻¹ · μ̂
   where μ̂_i = IC · σ_i · Score_i</div>
        </div>
        <div class="card">
          <div class="card-title">Fundamental Law of Active Management</div>
          <div class="formula">IR = IC · √BR</div>
          <div class="card-body mt1">Information Ratio = Information Coefficient × √Breadth. To achieve IR = 0.5 with IC = 0.05, you need BR = 100 independent bets. This drives <em>diversification across factors AND stocks</em>.</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-title">Alpha Portability & Overlay</div>
          <div class="card-body">Long-short factor portfolios are <strong>market-neutral</strong> and can be overlaid on any beta exposure. A 130/30 structure captures alpha while maintaining benchmark-level beta. Portable alpha separates the alpha engine from the beta vehicle entirely.</div>
        </div>
        <div class="card">
          <div class="card-title">Factor Timing</div>
          <div class="card-body">
            Most evidence suggests factor timing is <em>extremely difficult</em> (Asness, 2016). Better approaches:<br><br>
            • <strong>Valuation timing:</strong> reduce exposure to expensive factors (low B/M of factor portfolio)<br>
            • <strong>Momentum timing:</strong> reduce exposure to factors in drawdown<br>
            • <strong>Economic regime:</strong> value in late cycle, quality in recessions
          </div>
        </div>
        <button class="btn btn-ai" onclick="navigate('ai-tutor');window._primeQuestion='Derive the Grinold fundamental law of active management and explain its practical implications for portfolio construction in a multi-factor framework.'">Derive FLAM with AI ›</button>
      </div>
    </div>
  </div>

</div>`;
  }

  function drawHeatmap() {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;

    const cellW = 72, cellH = 38, labelW = 110, labelH = 36;
    const svgW = labelW + FACTORS.length * cellW + 20;
    const svgH = labelH + ASSETS.length * cellH + 10;

    function cellColor(v) {
      const maxV = 1.0;
      if (v > 0) {
        const t = Math.min(v / maxV, 1);
        const r = Math.round(0 + t * 0),  g = Math.round(180 + t * 31), b = Math.round(120 + t * 135);
        return `rgba(${r},${g},${b},${0.3 + t * 0.5})`;
      } else {
        const t = Math.min(-v / maxV, 1);
        const r = Math.round(200 + t * 44), g = Math.round(60 - t * 17), b = Math.round(80 - t * 16);
        return `rgba(${r},${g},${b},${0.3 + t * 0.5})`;
      }
    }

    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="display:block;min-width:${svgW}px" font-family="JetBrains Mono, monospace">`;
    svg += `<style>.hm-cell{cursor:pointer;transition:opacity .15s}.hm-cell:hover{stroke:#fff;stroke-width:1.5;opacity:.85}</style>`;

    // Column headers (factors)
    FACTORS.forEach((f, j) => {
      const x = labelW + j * cellW + cellW / 2;
      svg += `<rect x="${labelW + j * cellW}" y="0" width="${cellW}" height="${labelH - 4}" rx="6" fill="${f.color}18"/>`;
      svg += `<text x="${x}" y="${labelH / 2 - 4}" text-anchor="middle" font-size="11" fill="${f.color}" font-weight="700">${f.name}</text>`;
      svg += `<text x="${x}" y="${labelH / 2 + 8}" text-anchor="middle" font-size="9" fill="rgba(150,160,180,.7)">${f.label}</text>`;
    });

    // Rows (assets)
    LOADINGS.forEach((row, i) => {
      const y = labelH + i * cellH;
      svg += `<text x="${labelW - 8}" y="${y + cellH / 2 + 4}" text-anchor="end" font-size="11" fill="rgba(200,210,230,.8)">${ASSETS[i]}</text>`;
      row.forEach((v, j) => {
        const x = labelW + j * cellW;
        const bg = cellColor(v);
        const textColor = Math.abs(v) > 0.5 ? '#fff' : 'rgba(200,210,230,.9)';
        svg += `<rect class="hm-cell" x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${cellH - 4}" rx="6" fill="${bg}" data-v="${v}" data-asset="${ASSETS[i]}" data-factor="${FACTORS[j].name}"/>`;
        svg += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 4}" text-anchor="middle" font-size="11" fill="${textColor}" font-weight="600" pointer-events="none">${v > 0 ? '+' : ''}${v.toFixed(2)}</text>`;
      });
    });

    svg += '</svg>';
    container.innerHTML = svg;

    // Tooltip
    const tip = document.getElementById('hmTooltip');
    container.querySelectorAll('.hm-cell').forEach(cell => {
      cell.addEventListener('mousemove', e => {
        if (!tip) return;
        const v = parseFloat(cell.dataset.v);
        const dir = v > 0 ? 'positive' : 'negative';
        tip.style.display = 'block';
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top  = (e.clientY - 12) + 'px';
        tip.innerHTML = `<strong>${cell.dataset.asset}</strong> / <span style="color:var(--cyan)">${cell.dataset.factor}</span><br>Loading: <strong style="color:${v > 0 ? 'var(--green)' : 'var(--red)'};">${v > 0 ? '+' : ''}${v.toFixed(2)}</strong> (${dir})`;
      });
      cell.addEventListener('mouseleave', () => { if (tip) tip.style.display = 'none'; });
    });
  }

  function initTabs() {
    document.querySelectorAll('#fdTabs .tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#fdTabs .tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
        const t = document.getElementById('tab-' + btn.dataset.tab);
        if (t) t.style.display = 'block';
      });
    });
    drawHeatmap();
  }

  window.PageFactorDesign = { render };
  window.init_factor_design = initTabs;
})();
