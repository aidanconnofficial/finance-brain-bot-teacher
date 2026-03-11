/* ================================================================
   dashboard.js — Home page
   ================================================================ */
(function () {
  function render() {
    return `
<div class="page-header">
  <div class="badge cyan">🤖 AIDAN's AI Finance Brain-Bot</div>
  <h1 class="page-title"><span class="hi">AI Finance Brain-Bot</span></h1>
  <p class="page-sub">Your personal doctoral-level quant finance tutor — from efficient frontiers to the factor zoo. Built for Aidan, powered by Purdue GenAI.</p>
</div>
<div class="page-content">

  <!-- Stats row -->
  <div class="g4 mb3">
    <div class="stat">
      <div class="stat-label">Core Modules</div>
      <div class="stat-val c">6</div>
      <div class="stat-change">Asset Alloc, Factors, Viz + more</div>
    </div>
    <div class="stat">
      <div class="stat-label">Quiz Questions</div>
      <div class="stat-val g">45+</div>
      <div class="stat-change">Across 5 topic categories</div>
    </div>
    <div class="stat">
      <div class="stat-label">AI Model</div>
      <div class="stat-val" style="font-size:12px;padding-top:6px;font-family:var(--fm)">gpt-oss:120b</div>
      <div class="stat-change">Purdue GenAI API</div>
    </div>
    <div class="stat">
      <div class="stat-label">Depth Level</div>
      <div class="stat-val gr">PhD</div>
      <div class="stat-change">Quant / CFA III equivalence</div>
    </div>
  </div>

  <!-- Module Cards -->
  <div class="g2 mb3">
    <a class="module-card cyan" href="#asset-allocation" onclick="navigate('asset-allocation');return false">
      <div class="mi cyan">◎</div>
      <div class="mc-title">Asset Allocation</div>
      <div class="mc-desc">Master the efficient frontier, mean-variance optimisation, Black-Litterman model, and risk parity strategies.</div>
      <div class="mc-tags">
        <span class="tag">MVO</span><span class="tag">Black-Litterman</span><span class="tag">Risk Parity</span><span class="tag">CAPM</span>
      </div>
    </a>

    <a class="module-card gold" href="#factor-design" onclick="navigate('factor-design');return false">
      <div class="mi gold">⬡</div>
      <div class="mc-title">Factor Design</div>
      <div class="mc-desc">Explore Fama-French five-factor models, factor construction methodology, smart beta, and multi-factor alpha generation.</div>
      <div class="mc-tags">
        <span class="tag">Fama-French</span><span class="tag">Momentum</span><span class="tag">Smart Beta</span><span class="tag">Alpha</span>
      </div>
    </a>

    <a class="module-card purple" href="#visualizations" onclick="navigate('visualizations');return false">
      <div class="mi purple">📈</div>
      <div class="mc-title">Interactive Visualizations</div>
      <div class="mc-desc">Hands-on efficient frontier explorer, factor heatmap, Monte Carlo simulation, and portfolio risk decomposition.</div>
      <div class="mc-tags">
        <span class="tag">Frontier</span><span class="tag">Monte Carlo</span><span class="tag">Heatmap</span><span class="tag">Risk Decomp</span>
      </div>
    </a>

    <a class="module-card cyan" href="#quiz" style="border-color:rgba(240,180,41,.15)" onclick="navigate('quiz');return false">
      <div class="mi gold">🎯</div>
      <div class="mc-title">Quiz Tutor</div>
      <div class="mc-desc">Test yourself with curated quizzes on asset allocation concepts. Get AI explanations for every answer.</div>
      <div class="mc-tags">
        <span class="tag">Portfolio Theory</span><span class="tag">Sharpe</span><span class="tag">Duration</span><span class="tag">Factors</span>
      </div>
    </a>
  </div>

  <div class="g2">
    <a class="module-card" href="#ai-tutor" style="border-color:rgba(139,92,246,.2)" onclick="navigate('ai-tutor');return false">
      <div class="mi purple">🤖</div>
      <div class="mc-title">AI Finance Tutor</div>
      <div class="mc-desc">Your personal Socratic quant tutor. Ask anything — from option pricing to macro regime detection. Powered by Purdue GenAI.</div>
      <div class="mc-tags">
        <span class="tag">Socratic</span><span class="tag">Open Chat</span><span class="tag">Deep Dives</span>
      </div>
    </a>

    <div class="card">
      <div class="card-title">💡 Suggested Explorations</div>
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
        ${[
          ['Why does the tangency portfolio maximise the Sharpe ratio?', 'ai-tutor'],
          ['Derive the Black-Litterman posterior analytically', 'ai-tutor'],
          ['How is the SMB factor constructed step-by-step?', 'factor-design'],
          ['Show the efficient frontier for a 6-asset portfolio', 'visualizations'],
          ['Quiz me on duration and convexity', 'quiz'],
        ].map(([q, page]) => `
          <button class="btn btn-ghost" style="justify-content:flex-start;font-size:12.5px;text-align:left;padding:8px 12px" 
            onclick="if('${page}'==='ai-tutor'){window._primeQuestion='${q.replace(/'/g,"\\'")}';} navigate('${page}')">
            <span style="color:var(--cyan);margin-right:4px">›</span> ${q}
          </button>`).join('')}
      </div>
    </div>
  </div>
</div>`;
  }

  window.PageDashboard = { render };
})();
