/* ================================================================
   ai-tutor.js — AI Finance Tutor (Purdue GenAI streaming chat)
   ================================================================ */
(function () {
  const SYSTEM_PROMPT = `You are AIDAN's AI Finance Brain-Bot — an elite quantitative finance tutor with expertise equivalent to a CFA Charterholder, PhD in Financial Economics, and 20+ years at a top hedge fund. Your teaching style is Socratic and precise.

You specialize in:
- Portfolio theory (Markowitz, Black-Litterman, Risk Parity, Factor Models)
- Asset pricing (CAPM, APT, Fama-French, conditional models)
- Derivatives (Options pricing, Greeks, structured products)
- Fixed income (Duration, convexity, yield curve models, credit)
- Risk management (VaR, CVaR, stress testing, drawdown analysis)
- Quantitative factor investing (signal construction, backtesting, IC/IR analysis)
- Macro & regime analysis

Rules:
- Never oversimplify. Treat the user as highly intelligent (assume PhD-level interest).
- Show mathematical derivations when relevant. Use clear notation.
- Reference key papers and researchers (Fama, French, Black, Litterman, Markowitz, Sharpe, Merton, etc.)
- Use the Socratic method — occasionally ask follow-up questions to deepen understanding.
- Format responses with clear headers (##), bullet points, and formulas displayed with plain-text math notation.
- Be direct and intellectually rigorous. Do not pad responses with fluff.`;

  const CONTEXT_PROMPTS = {
    'asset-allocation': 'The user is currently studying Asset Allocation. Focus your expertise on portfolio construction, efficient frontier, MVO, Black-Litterman, and risk parity concepts.',
    'factor-design': 'The user is currently studying Factor Design. Focus on Fama-French factors, factor construction methodology, signal processing, and multi-factor alpha generation.',
    'visualizations': 'The user was using the Interactive Visualizations tool. Help them interpret quantitative results and connect visualizations to theory.',
    'quiz': 'The user was just taking a finance quiz. Help them understand conceptual gaps and reinforce correct answers.',
  };

  let messages = [];
  let isStreaming = false;
  let context = null;

  function render(ctx) {
    context = ctx || null;
    messages = [];
    isStreaming = false;

    const contextPill = context && CONTEXT_PROMPTS[context]
      ? `<div style="padding:12px 20px;border-bottom:1px solid var(--border)">
           <div class="chat-context-pill">📍 Context: ${context.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
         </div>` : '';

    return `
<div class="page-header" style="padding-bottom:0">
  <div class="badge purple">🤖 AI Finance Tutor</div>
  <h1 class="page-title">AIDAN's <span class="hi">Brain-Bot</span></h1>
  <p class="page-sub" style="margin-bottom:0">Doctoral-level Socratic finance tutor. Ask anything — from Lagrangian portfolio derivations to macro regime models.</p>
</div>

<div class="chat-shell" style="margin-top:0">
  ${contextPill}
  <div class="chat-messages" id="chatMessages">
    <div class="msg ai">
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">
        <h3>Welcome to AIDAN's AI Finance Brain-Bot</h3>
        <p>I'm your elite quantitative finance tutor — PhD-level depth, Socratic method, zero hand-holding. I'll show you derivations, cite key papers, and challenge your thinking.</p>
        <p style="margin-top:10px"><strong>Suggested questions to start:</strong></p>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
          ${[
        'Derive the Black-Litterman posterior expected returns from first principles',
        'Why does a 60/40 portfolio have ~90% equity risk despite 40% bond allocation?',
        'Explain the Fama-French 5-factor model and its relation to the dividend discount model',
        'Walk me through Merton continuous-time portfolio theory',
        'How does the Fundamental Law of Active Management guide factor portfolio construction?',
      ].map(q => `<button class="btn btn-ghost" style="font-size:12px;text-align:left;justify-content:flex-start;padding:6px 12px"
            onclick="document.getElementById('chatInput').value='${q.replace(/'/g, "\\'")}';document.getElementById('chatInput').focus()">
            <span style="color:var(--cyan);margin-right:6px">›</span>${q}
          </button>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <div class="chat-input-area">
    <div id="chatContextIndicator" style="display:none;margin-bottom:8px">
      <div class="chat-context-pill" id="contextPillEl"></div>
    </div>
    <div class="chat-input-row">
      <textarea class="chat-textarea" id="chatInput" rows="1"
        placeholder="Ask anything about finance — I'll go as deep as you want…"></textarea>
      <button class="chat-send" id="chatSendBtn" title="Send">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="10" y1="17" x2="10" y2="3"/><polyline points="4,9 10,3 16,9"/>
        </svg>
      </button>
    </div>
    <div style="font-size:10.5px;color:var(--t3);margin-top:6px;text-align:center">
      AIDAN's Brain-Bot · Purdue GenAI (gpt-oss:120b) · Enter or click ↑ to send
    </div>
  </div>
</div>`;
  }

  function init() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');

    // Auto-resize textarea
    input?.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 140) + 'px';
    });

    // Send on Enter (Shift+Enter for newline)
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    sendBtn?.addEventListener('click', sendMessage);

    // Pre-primed question from dashboard or other pages
    if (window._primeQuestion) {
      input.value = window._primeQuestion;
      input.style.height = Math.min(input.scrollHeight, 140) + 'px';
      window._primeQuestion = null;
    }

    // Context pill from module navigation
    if (context && CONTEXT_PROMPTS[context]) {
      const pill = document.getElementById('contextPillEl');
      const ind = document.getElementById('chatContextIndicator');
      if (pill && ind) {
        pill.textContent = '📍 Context loaded: ' + context.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        ind.style.display = 'block';
      }
    }
  }

  function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input || isStreaming) return;
    const content = input.value.trim();
    if (!content) return;

    input.value = '';
    input.style.height = 'auto';

    // Append user message
    messages.push({ role: 'user', content });
    appendMessage('user', content);

    // Append AI placeholder
    const aiId = 'ai-msg-' + Date.now();
    appendMessage('ai', '', aiId);
    isStreaming = true;

    // Build system prompt with optional context
    let sys = SYSTEM_PROMPT;
    if (context && CONTEXT_PROMPTS[context]) sys += '\n\n' + CONTEXT_PROMPTS[context];

    let fullResponse = '';

    window.InvestAPI.chat(messages, chunk => {
      fullResponse += chunk;
      const bubble = document.getElementById(aiId);
      if (bubble) bubble.innerHTML = formatMarkdown(fullResponse) + '<span class="typing-cursor"></span>';
      scrollChat();
    }, sys)
      .then(() => {
        isStreaming = false;
        messages.push({ role: 'assistant', content: fullResponse });
        const bubble = document.getElementById(aiId);
        if (bubble) bubble.innerHTML = formatMarkdown(fullResponse);
      })
      .catch(err => {
        isStreaming = false;
        const bubble = document.getElementById(aiId);
        if (bubble) {
          bubble.innerHTML = `<span style="color:var(--red)">⚠ API error: ${err.message}</span>
          <br><small style="color:var(--t2)">Check your API key in Settings, or ensure you are on the Purdue network/VPN.</small>`;
        }
      });
  }

  function appendMessage(role, content, id) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = 'msg ' + role;
    div.innerHTML = `
      <div class="msg-avatar">${isUser ? '👤' : '🤖'}</div>
      <div class="msg-bubble" ${id ? `id="${id}"` : ''}>${isUser
        ? `<span style="color:var(--t1)">${escapeHtml(content)}</span>`
        : content
          ? formatMarkdown(content)
          : '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>'
      }</div>`;
    container.appendChild(div);
    scrollChat();
  }

  function scrollChat() {
    const el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatMarkdown(text) {
    return text
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,.4);padding:2px 6px;border-radius:4px;font-family:var(--fm);color:var(--cyan);font-size:12.5px">$1</code>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h3 style="font-size:15px;margin:14px 0 6px;color:var(--cyan)">$1</h3>')
      .replace(/^# (.+)$/gm, '<h3 style="font-size:17px;margin:14px 0 8px;color:var(--t1)">$1</h3>')
      // Bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:var(--gold)">$1</em>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:12px 0">')
      // Bullet points
      .replace(/^[•\-\*] (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:20px;margin:8px 0">$&</ul>')
      // Numbered list
      .replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p style="margin-top:10px">')
      .replace(/\n/g, '<br>');
  }

  window.PageAITutor = {
    render: (ctx) => render(ctx)
  };
  window.init_ai_tutor = init;
})();
