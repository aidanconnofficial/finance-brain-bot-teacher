/* ================================================================
   quiz.js — AI Quiz Tutor with pre-created quizzes
   ================================================================ */
(function () {
  const QUIZZES = {
    'portfolio-theory': {
      title: 'Modern Portfolio Theory',
      color: '#00d4ff',
      questions: [
        {
          q: 'In the Markowitz framework, what does the efficient frontier represent?',
          options: [
            'The set of portfolios with the highest return for a given level of risk',
            'The portfolio with the absolute maximum return',
            'The set of portfolios with equal Sharpe ratios',
            'The minimum variance portfolio only'
          ],
          answer: 0,
          explain: 'The efficient frontier is the set of portfolios that maximise expected return for every level of volatility (or equivalently, minimise volatility for every level of expected return). All other portfolios are dominated (sub-optimal).'
        },
        {
          q: 'What does the two-fund separation theorem state?',
          options: [
            'Every investor holds two funds: one domestic, one international',
            'Every efficient portfolio is a linear combination of any two efficient portfolios',
            'The tangency portfolio and MVP always have different weights',
            'Risk and return can be separated into two independent components'
          ],
          answer: 1,
          explain: 'The two-fund separation theorem (Tobin, 1958) states that all efficient portfolios can be constructed as convex combinations of any two distinct efficient portfolios. In practice, this means investors combine the risk-free asset with the tangency portfolio.'
        },
        {
          q: 'The Sharpe ratio is maximised by which portfolio on the efficient frontier?',
          options: [
            'The minimum variance portfolio',
            'The maximum return portfolio',
            'The tangency portfolio',
            'The equal-weight portfolio'
          ],
          answer: 2,
          explain: 'The tangency portfolio is the point where the Capital Market Line (CML) is tangent to the efficient frontier. It maximises the Sharpe ratio: (μ_p − r_f) / σ_p. All rational investors with access to a risk-free asset hold a combination of this portfolio and the risk-free asset.'
        },
        {
          q: 'In MVO, why does estimation error in expected returns cause dramatic portfolio instability?',
          options: [
            'Because covariance matrices are singular',
            'Because the optimiser amplifies small input errors into large weight changes (error maximisation)',
            'Because expected returns are always negative',
            'Because the efficient frontier is linear'
          ],
          answer: 1,
          explain: 'Michaud (1989) showed that MVO effectively "maximises estimation error" — small errors in μ can produce wildly different optimal weights. This is because the optimiser exploits uncertainty. Solutions include: Black-Litterman (Bayesian prior), resampling (Michaud), robust optimisation, or regularisation (L2 shrinkage).'
        },
        {
          q: 'What is the CAPM Security Market Line (SML)?',
          options: [
            'A curve showing portfolios on the efficient frontier',
            'A line relating expected return to beta: E[r] = r_f + β(E[r_M] − r_f)',
            'The line connecting the risk-free rate to the MVP',
            'A line relating alpha to tracking error'
          ],
          answer: 1,
          explain: 'The SML is E[r_i] = r_f + β_i·(E[r_M] − r_f). Beta measures systematic (non-diversifiable) risk — the covariance with the market divided by market variance: β_i = Cov(r_i, r_M) / Var(r_M). Only systematic risk is priced in equilibrium; idiosyncratic risk earns no premium.'
        },
        {
          q: 'What is the "curse of dimensionality" in portfolio optimisation?',
          options: [
            'Too many assets make the UI slow',
            'With N assets you need N(N+1)/2 covariance estimates, which are noisy and unreliable in small samples',
            'The efficient frontier becomes a cube in 3D',
            'Returns are only observable in 2 dimensions'
          ],
          answer: 1,
          explain: 'A covariance matrix for N assets requires N(N+1)/2 unique parameters. For N=500 stocks, that is 125,250 estimates from limited data — causing severe estimation error. This motivates factor models (K factors need only NK + K(K+1)/2 parameters) and shrinkage estimators (Ledoit-Wolf).'
        },
        {
          q: 'Risk parity allocates capital by:',
          options: [
            'Maximising the Sharpe ratio of each asset',
            'Ensuring each asset contributes equally to total portfolio volatility',
            'Equal dollar weighting across all assets',
            'Weighting by market capitalisation'
          ],
          answer: 1,
          explain: 'Risk parity (Qian, 2005) requires equal marginal risk contributions: RC_i = w_i·(Σw)_i/σ_p = σ_p/N. Since equities are much more volatile than bonds, risk parity underweights equities relative to 60/40. Bridgewater\'s All Weather fund pioneered this approach; it often uses leverage on bonds to achieve equity-like return targets.'
        },
        {
          q: 'The Black-Litterman model improves on MVO by:',
          options: [
            'Using past returns as inputs',
            'Combining equilibrium returns (CAPM prior) with investor views via Bayesian updating',
            'Eliminating the need for a covariance matrix',
            'Using market cap weights as fixed constraints'
          ],
          answer: 1,
          explain: 'Black-Litterman (1990) starts with the CAPM-implied equilibrium returns (Π = λΣw_mkt) as a prior, then blends with K investor views (PQ with confidence Ω) to form posterior expected returns. The result is intuitive, diversified portfolios without extreme corner solutions — now industry standard at major asset managers.'
        }
      ]
    },
    'factor-investing': {
      title: 'Factor Investing',
      color: '#f0b429',
      questions: [
        {
          q: 'The Fama-French SMB factor is long:',
          options: ['Large-cap, short small-cap', 'Small-cap, short large-cap', 'High momentum, short low momentum', 'High quality, short low quality'],
          answer: 1,
          explain: 'SMB (Small Minus Big) is long small-capitalisation stocks and short large-cap stocks, capturing the size premium. Fama & French (1993) documented that small caps have historically outperformed large caps, even after controlling for market beta. The premium is partly explained by liquidity risk and distress risk, but also persists across markets.'
        },
        {
          q: 'The value factor (HML) is constructed by going long:',
          options: ['High price-to-book stocks', 'Low price-to-book stocks', 'High momentum stocks', 'Large dividend yield stocks'],
          answer: 1,
          explain: 'HML (High Minus Low) goes long stocks with high book-to-market ratios (value stocks) and short stocks with low B/M ratios (growth stocks). High B/M means the market prices the stock cheaply relative to book value. The value premium (≈3–5% historically) is explained by: risk compensation for financial distress, and behavioural over-extrapolation of growth.'
        },
        {
          q: 'The Fundamental Law of Active Management states: IR = IC × √BR. What does "BR" represent?',
          options: ['Beta Ratio', 'Breadth — the number of independent forecasts per year', 'Benchmark Return', 'Basis Risk'],
          answer: 1,
          explain: 'Grinold (1989): IR = IC·√BR, where IC (Information Coefficient) is the correlation of predictions with outcomes, and BR (Breadth) is the number of independent bets annually. This motivates diversifying across many stocks AND factors simultaneously — a quant with IC=0.05 needs BR=100 bets for IR=0.5.'
        },
        {
          q: 'Momentum factor (WML) is most vulnerable to:',
          options: ['Low volatility environments', 'Sharp market reversals (momentum crashes)', 'High interest rate environments', 'Value rotations'],
          answer: 1,
          explain: 'Momentum strategies (long recent winners, short recent losers) crash during sharp reversals — when beaten-down stocks spike and winners fall. Daniel & Moskowitz (2016) document momentum crashes particularly at bear market troughs. Portfolio conditioning on vol and market state helps — reduce momentum exposure when σ_market is high.'
        },
        {
          q: 'What does "factor crowding" mean for expected returns?',
          options: ['More investors = higher factor premium', 'Too many investors in the same factor lead to stretched valuations and higher crash risk', 'Factors become uncorrelated when crowded', 'Crowding has no effect on returns'],
          answer: 1,
          explain: 'Arnott et al. (2016) argue popular factor strategies can become crowded, inflating factor P/E ratios and reducing future premia. When crowded factors unwind (investor redemptions or risk-off), returns can be severely negative. Monitoring factor valuation spreads and crowding proxies (short interest, ownership concentration) is essential risk management.'
        }
      ]
    },
    'fixed-income': {
      title: 'Fixed Income & Duration',
      color: '#10b981',
      questions: [
        {
          q: 'Modified Duration measures:',
          options: [
            'The weighted average maturity of cash flows',
            'The percentage price change of a bond for a 1% change in yield',
            'The convexity adjustment for large rate moves',
            'The credit spread sensitivity'
          ],
          answer: 1,
          explain: 'Modified Duration = Macaulay Duration / (1 + y/n) ≈ −(1/P)·(dP/dy). For a bond with D_mod = 7, a 100bps rise in yield → approximately −7% price change. Duration is additive across a portfolio (dollar-duration weighted). DV01 = Duration × P / 10,000.'
        },
        {
          q: 'Convexity matters because:',
          options: [
            'It measures credit risk',
            'It captures the curvature of the price-yield relationship, meaning actual gains exceed predicted for rate falls',
            'It equals Duration squared',
            'It is always negative for callable bonds'
          ],
          answer: 1,
          explain: 'The price-yield relationship is convex (curved), not linear. For large yield moves: ΔP/P ≈ −D_mod·Δy + ½·C·(Δy)². Positive convexity means the bond gains more than Duration predicts when yields fall, and loses less than predicted when yields rise. Callable bonds have negative convexity at low yields (call option limits upside).'
        },
        {
          q: 'The yield curve normally slopes upward because:',
          options: [
            'Central banks control long rates',
            'Liquidity preference — investors demand a term premium for holding longer maturities',
            'Short-term bonds have higher credit risk',
            'Inflation is always higher in the short run'
          ],
          answer: 1,
          explain: 'The expectations hypothesis says the yield curve reflects expected future short rates. But empirically, a term premium (risk premium for duration) is required to explain an upward-sloping curve even when short rates are expected to be stable. The ACM model estimates the US 10Y term premium ≈ 100bps historically, though it compressed post-GFC.'
        }
      ]
    },
    'risk-management': {
      title: 'Risk Management',
      color: '#8b5cf6',
      questions: [
        {
          q: 'Value at Risk (VaR) at 95% confidence, 1-day horizon means:',
          options: [
            'You will lose exactly this amount on 95% of days',
            'You expect to lose more than this amount on 5% of days (1 in 20)',
            'Your maximum possible loss',
            'The expected loss in a stress scenario'
          ],
          answer: 1,
          explain: 'VaR(95%, 1d) = −q_{0.05}(ΔP) — the 5th percentile of the daily P&L distribution. On about 5% of trading days (≈1 in 20), losses will exceed this amount. Key limitations: VaR ignores tail shape beyond the threshold (CVaR/ES is better), assumes stable distributions, and is not sub-additive (violates coherent risk measure axiom).'
        },
        {
          q: 'Conditional Value at Risk (CVaR / Expected Shortfall) is preferred to VaR because:',
          options: [
            'It is easier to compute',
            'It measures the expected loss GIVEN that losses exceed VaR — capturing tail severity',
            'It is always smaller than VaR',
            'It is required by Basel regulations'
          ],
          answer: 1,
          explain: 'CVaR = E[L | L > VaR] — the expected tail loss. Unlike VaR, CVaR: (1) is a coherent risk measure (sub-additive), (2) captures tail severity not just frequency, (3) is convex — can be minimised with linear programming (Rockafellar & Uryasev, 2000). Basel IV replaced VaR with Expected Shortfall for regulatory capital.'
        },
        {
          q: 'Maximum Drawdown is best described as:',
          options: [
            'The single largest 1-day loss',
            'The peak-to-trough decline of portfolio value over a period',
            'The average loss during bear markets',
            'VaR at 99% confidence'
          ],
          answer: 1,
          explain: 'Maximum Drawdown = max_{t}(Peak_t − Trough_t) / Peak_t. It measures the worst realised loss from peak to subsequent trough. Critically it captures: (1) magnitude of loss and (2) persistence — a 40% drawdown that lasts 3 years is psychologically and operationally more damaging than a brief 40% crash. Calmar ratio = CAGR / MaxDrawdown.'
        }
      ]
    },
    'derivatives': {
      title: 'Derivatives & Options',
      color: '#f43f5e',
      questions: [
        {
          q: 'Put-Call Parity states:',
          options: [
            'P = C always',
            'C − P = S − Ke^{−rT} (for European options on non-dividend-paying stocks)',
            'Calls are always more expensive than puts',
            'The delta of a call equals 1 minus the delta of a put'
          ],
          answer: 1,
          explain: 'Put-Call Parity: C − P = S − Ke^{−rT}. Proof by no-arbitrage: a portfolio of (long call + short put + long PV(K)) must equal the stock. Violations imply riskless arbitrage. Consequence: knowing any three of {C, P, S, K, r, T} determines the fourth. Delta consequence: Δ_call − Δ_put = 1.'
        },
        {
          q: 'Option delta (Δ) represents:',
          options: [
            'The sensitivity of option price to time decay',
            'The rate of change of option price with respect to the underlying price',
            'The implied volatility of the option',
            'The probability of expiring in-the-money under real-world measure'
          ],
          answer: 1,
          explain: 'Delta (Δ = ∂C/∂S) is the hedge ratio — you need to short Δ shares to delta-hedge a long call. For a call: 0 ≤ Δ ≤ 1 (ATM Δ ≈ 0.5); for a put: −1 ≤ Δ ≤ 0. Under risk-neutral measure, Δ_call = N(d₁) ≈ probability of expiring ITM. Delta-hedging eliminates first-order price risk but leaves gamma and vega exposure.'
        },
        {
          q: 'Implied volatility "smile" or "skew" refers to:',
          options: [
            'Options with longer maturity having higher IV',
            'OTM puts having higher IV than ATM options — contradicting Black-Scholes constant-σ assumption',
            'Positive correlation between IV and market returns',
            'At-the-money options always having the lowest IV'
          ],
          answer: 1,
          explain: 'Black-Scholes assumes constant σ, but empirically OTM puts trade at higher IV than ATM (negative skew for equities), reflecting: (1) crash risk / left-tail demand (portfolio insurance), (2) jump-diffusion dynamics, (3) stochastic volatility (Heston model). The full surface across strikes and maturities is the "vol surface" — basis of exotic pricing and risk management.'
        }
      ]
    }
  };

  let currentQuiz = null;
  let currentQ    = 0;
  let score       = 0;
  let answered    = false;
  let userAnswers = [];

  function render() {
    return `
<div class="page-header">
  <div class="badge gold">🎯 Quiz Tutor</div>
  <h1 class="page-title">Test Your <span class="hi">Knowledge</span></h1>
  <p class="page-sub">Curated expert-level quizzes on core finance concepts. Get AI-powered explanations for every answer.</p>
</div>
<div class="page-content">
  <div id="quizShell"></div>
</div>`;
  }

  function renderHome() {
    const shell = document.getElementById('quizShell');
    if (!shell) return;
    shell.innerHTML = `
<div class="g3 mb3">
  ${Object.entries(QUIZZES).map(([id, quiz]) => `
  <div class="card" style="cursor:pointer;border-color:${quiz.color}22" onclick="window.QuizStart('${id}')">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="width:36px;height:36px;border-radius:10px;background:${quiz.color}18;border:1px solid ${quiz.color}44;display:flex;align-items:center;justify-content:center;font-size:18px">🎯</div>
      <div>
        <div style="font-family:var(--fd);font-size:14px;font-weight:600;color:var(--t1)">${quiz.title}</div>
        <div style="font-size:11.5px;color:var(--t2)">${quiz.questions.length} questions</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;gap:4px">${Array(quiz.questions.length).fill(0).map(() => `<div style="width:8px;height:8px;border-radius:50%;background:${quiz.color}33;border:1px solid ${quiz.color}55"></div>`).join('')}</div>
      <span style="font-size:12px;color:${quiz.color}">Start Quiz →</span>
    </div>
  </div>`).join('')}
</div>
<div class="insight"><strong>Tip:</strong> Each question includes a detailed AI-level explanation. After answering, click "Explain More" to ask the AI tutor for a deeper dive.</div>`;
  }

  function startQuiz(id) {
    currentQuiz = QUIZZES[id];
    currentQ    = 0;
    score       = 0;
    answered    = false;
    userAnswers = [];
    renderQuestion();
  }

  function renderQuestion() {
    const shell = document.getElementById('quizShell');
    if (!shell || !currentQuiz) return;
    const q   = currentQuiz.questions[currentQ];
    const tot = currentQuiz.questions.length;

    shell.innerHTML = `
<div style="max-width:720px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;gap:6px">${currentQuiz.questions.map((_, i) => `
      <div style="width:28px;height:5px;border-radius:3px;background:${
        i < currentQ ? 'var(--green)' : i === currentQ ? 'var(--cyan)' : 'var(--border)'
      }"></div>`).join('')}
    </div>
    <div style="font-size:13px;color:var(--t2)">Question ${currentQ + 1} of ${tot}</div>
  </div>

  <div class="card" style="margin-bottom:20px;border-color:${currentQuiz.color}33">
    <div style="font-family:var(--fd);font-size:16px;font-weight:600;color:var(--t1);line-height:1.5;margin-bottom:4px">${q.q}</div>
    <div style="font-size:11.5px;color:var(--t2)">${currentQuiz.title}</div>
  </div>

  <div id="optionsContainer" style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
    ${q.options.map((opt, i) => `
    <button class="quiz-option" data-i="${i}" onclick="window.QuizAnswer(${i})" style="
      text-align:left;padding:14px 18px;border-radius:var(--r2);
      background:var(--card);border:1px solid var(--border);
      color:var(--t1);font-size:13.5px;cursor:pointer;width:100%;
      font-family:var(--ff);transition:var(--tr);line-height:1.5
    ">
      <span style="display:inline-block;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--border);text-align:center;line-height:20px;font-size:11px;font-weight:700;margin-right:10px;color:var(--t2)">${String.fromCharCode(65+i)}</span>
      ${opt}
    </button>`).join('')}
  </div>

  <div id="explanationBox" style="display:none"></div>
  <div id="quizNav" style="display:none;gap:12px;flex-wrap:wrap">
    <button class="btn btn-ai" id="explainMoreBtn" style="display:none">Ask AI for deeper explanation ›</button>
    <button class="btn btn-primary" id="nextBtn">${currentQ < tot - 1 ? 'Next Question →' : 'See Results'}</button>
    <button class="btn btn-ghost" onclick="window.QuizHome()">← All Quizzes</button>
  </div>
</div>`;

    // Hover effects
    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('mouseenter', () => { if (!answered) btn.style.borderColor = currentQuiz.color; });
      btn.addEventListener('mouseleave', () => { if (!answered) btn.style.borderColor = 'var(--border)'; });
    });
  }

  function answerQuestion(selected) {
    if (answered) return;
    answered = true;
    const q = currentQuiz.questions[currentQ];
    userAnswers.push({ selected, correct: selected === q.answer });
    if (selected === q.answer) score++;

    // Highlight options
    document.querySelectorAll('.quiz-option').forEach(btn => {
      const i = parseInt(btn.dataset.i);
      btn.style.cursor = 'default';
      if (i === q.answer) {
        btn.style.background = 'rgba(16,185,129,.15)';
        btn.style.borderColor = 'var(--green)';
        btn.style.color = 'var(--green)';
      } else if (i === selected && selected !== q.answer) {
        btn.style.background = 'rgba(244,63,94,.15)';
        btn.style.borderColor = 'var(--red)';
        btn.style.color = 'var(--red)';
      }
      btn.onclick = null;
    });

    // Explanation
    const expBox = document.getElementById('explanationBox');
    const correct = selected === q.answer;
    expBox.style.display = 'block';
    expBox.innerHTML = `
<div style="background:${correct ? 'rgba(16,185,129,.08)' : 'rgba(244,63,94,.08)'};border:1px solid ${correct ? 'var(--green)' : 'var(--red)'};border-radius:var(--r2);padding:16px 20px;margin-bottom:16px">
  <div style="font-weight:700;color:${correct ? 'var(--green)' : 'var(--red)'};margin-bottom:8px;font-size:14px">${correct ? '✓ Correct!' : '✗ Incorrect'}</div>
  <div style="font-size:13.5px;color:var(--t1);line-height:1.75">${q.explain}</div>
</div>`;

    const nav = document.getElementById('quizNav');
    nav.style.display = 'flex';

    document.getElementById('explainMoreBtn').style.display = 'inline-flex';
    document.getElementById('explainMoreBtn').onclick = () => {
      window._primeQuestion = `Explain in more depth: ${q.q}\n\nThe correct answer is: "${q.options[q.answer]}"\n\nWhy is this correct and what are the key implications for portfolio management?`;
      navigate('ai-tutor');
    };

    document.getElementById('nextBtn').onclick = () => {
      currentQ++;
      answered = false;
      if (currentQ < currentQuiz.questions.length) {
        renderQuestion();
      } else {
        renderResults();
      }
    };
  }

  function renderResults() {
    const shell = document.getElementById('quizShell');
    const tot   = currentQuiz.questions.length;
    const pct   = Math.round(score / tot * 100);
    const grade = pct >= 90 ? { label: 'Exceptional', color: '#f0b429' }
                : pct >= 70 ? { label: 'Proficient',  color: '#10b981' }
                : pct >= 50 ? { label: 'Developing',  color: '#00d4ff' }
                : { label: 'Needs Review', color: '#f43f5e' };

    shell.innerHTML = `
<div style="max-width:640px">
  <div class="card" style="text-align:center;padding:40px;margin-bottom:24px;border-color:${grade.color}44">
    <div style="font-size:52px;font-weight:800;font-family:var(--fd);color:${grade.color};margin-bottom:8px">${pct}%</div>
    <div style="font-size:18px;font-weight:600;color:var(--t1);margin-bottom:4px">${grade.label}</div>
    <div style="font-size:14px;color:var(--t2)">${score} of ${tot} correct — ${currentQuiz.title}</div>
  </div>

  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
    ${currentQuiz.questions.map((q, i) => {
      const ua = userAnswers[i];
      return `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-radius:var(--r2);background:var(--card);border:1px solid ${ua.correct ? 'rgba(16,185,129,.2)' : 'rgba(244,63,94,.2)'}">
        <span style="color:${ua.correct ? 'var(--green)' : 'var(--red)'};margin-top:2px">${ua.correct ? '✓' : '✗'}</span>
        <div style="font-size:13px;color:var(--t1)">${q.q}</div>
      </div>`;
    }).join('')}
  </div>

  <div style="display:flex;gap:12px;flex-wrap:wrap">
    <button class="btn btn-primary" onclick="window.QuizStart('${Object.keys(QUIZZES).find(k => QUIZZES[k] === currentQuiz)}')">Retry Quiz</button>
    <button class="btn btn-ghost" onclick="window.QuizHome()">← All Quizzes</button>
    <button class="btn btn-ai" onclick="window._primeQuestion='I just scored ${pct}% on a quiz about ${currentQuiz.title}. Can you identify my conceptual gaps and recommend a focused study plan on the hardest topics?';navigate('ai-tutor')">Ask AI to Review My Gaps ›</button>
  </div>
</div>`;
  }

  // Expose to global scope for inline onclick
  window.QuizStart  = startQuiz;
  window.QuizAnswer = answerQuestion;
  window.QuizHome   = () => { currentQuiz = null; renderHome(); };

  window.PageQuiz = { render };
  window.init_quiz = renderHome;
})();
