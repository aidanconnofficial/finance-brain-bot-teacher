/* ================================================================
   settings.js
   ================================================================ */
(function () {
  function render() {
    const key   = window.InvestAPI.getKey();
    const url   = window.InvestAPI.getUrl();
    const model = window.InvestAPI.getModel();
    const masked = key ? key.slice(0,8) + '••••••••••••••••' + key.slice(-4) : '';

    return `
<div class="page-header">
  <div class="badge cyan">⚙ Settings</div>
  <h1 class="page-title">Configuration</h1>
  <p class="page-sub">Manage your Purdue GenAI API credentials and model preferences.</p>
</div>
<div class="page-content">
  <div class="settings-form">
    <div class="form-group">
      <label class="label">API Key</label>
      <div class="input-group">
        <input class="input" id="settingsKey" type="password" placeholder="sk-…" value="${key}" style="flex:1" />
      </div>
      <div style="font-size:11.5px;color:var(--t2);margin-top:6px">Stored locally in your browser — never sent anywhere except Purdue GenAI.</div>
    </div>

    <div class="form-group">
      <label class="label">API Base URL</label>
      <input class="input" id="settingsUrl" type="text" value="${url}" />
    </div>

    <div class="form-group">
      <label class="label">Model Name</label>
      <input class="input" id="settingsModel" type="text" value="${model}" />
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-primary" id="saveSettingsBtn">Save Settings</button>
      <button class="btn btn-ghost" id="testApiBtn">Test Connection</button>
    </div>

    <div id="settingsMsg" style="font-size:13px;display:none;padding:10px 14px;border-radius:8px"></div>
  </div>
</div>`;
  }

  function init() {
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
      const key   = document.getElementById('settingsKey').value.trim();
      const url   = document.getElementById('settingsUrl').value.trim();
      const model = document.getElementById('settingsModel').value.trim();
      if (key)   window.InvestAPI.setKey(key);
      if (url)   window.InvestAPI.setUrl(url);
      if (model) window.InvestAPI.setModel(model);
      showMsg('Settings saved! ✓', 'green');
    });

    document.getElementById('testApiBtn')?.addEventListener('click', async () => {
      showMsg('Testing connection…', 'blue');
      try {
        const ok = await window.InvestAPI.testConnection();
        showMsg(ok ? '✓ Connection successful!' : '✗ Connection failed — check your key and URL.', ok ? 'green' : 'red');
        const dot  = document.getElementById('apiDot');
        const text = document.getElementById('apiStatusText');
        if (dot) dot.className = 'api-dot ' + (ok ? 'ok' : 'error');
        if (text) text.textContent = ok ? 'API Connected' : 'API Error';
      } catch(e) {
        showMsg('✗ Error: ' + e.message, 'red');
      }
    });
  }

  function showMsg(msg, color) {
    const el = document.getElementById('settingsMsg');
    if (!el) return;
    const colors = { green:'rgba(16,185,129,.12)', red:'rgba(244,63,94,.12)', blue:'rgba(0,212,255,.12)' };
    const textColors = { green:'var(--green)', red:'var(--red)', blue:'var(--cyan)' };
    el.style.display = 'block';
    el.style.background = colors[color] || colors.blue;
    el.style.color = textColors[color] || textColors.blue;
    el.style.border = `1px solid ${textColors[color] || textColors.blue}`;
    el.textContent = msg;
  }

  window.PageSettings = { render };
  window.init_settings = init;
})();
