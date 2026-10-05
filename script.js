:root {
    --bg: #f7f8fb;
    --surface: #ffffff;
    --surface-2: #f3f5f8;
    --border: #e5e7eb;
    --text: #17191f;
    --muted: #737985;
    --primary: #635bff;
    --primary-dark: #5048e5;
    --shadow: 0 10px 35px rgba(20, 25, 40, .07);
    --radius: 14px;
}

* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    width: 100%;
    height: 100%;
    font-family: "Inter", sans-serif;
    color: var(--text);
    background: var(--bg);
}

button,
input,
textarea {
    font: inherit;
}

button {
    cursor: pointer;
}

.app {
    display: flex;
    min-height: 100vh;
}


/* =========================
   SIDEBAR
========================= */

.sidebar {
    width: 250px;
    background: #fff;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 22px 16px;
    flex-shrink: 0;
}

.brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 8px 24px;
}

.brand-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--primary);
    color: white;
    font-weight: 800;
    font-size: 18px;
    box-shadow: 0 7px 18px rgba(99, 91, 255, .24);
}

.brand strong {
    display: block;
    font-size: 16px;
    letter-spacing: -.3px;
}

.brand span {
    display: block;
    color: #9aa0aa;
    font-size: 10px;
    margin-top: 2px;
}

.new-project {
    height: 44px;
    border: 1px solid #ddd9ff;
    background: #f7f6ff;
    color: var(--primary);
    border-radius: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 28px;
    transition: .2s;
}

.new-project:hover {
    background: #efedff;
    transform: translateY(-1px);
}

.sidebar-section {
    margin-bottom: 28px;
}

.sidebar-label {
    font-size: 10px;
    font-weight: 800;
    color: #a1a6b0;
    letter-spacing: .9px;
    padding: 0 8px 10px;
}

.project-card {
    border: 1px solid var(--border);
    border-radius: 11px;
    padding: 11px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.project-icon {
    width: 33px;
    height: 33px;
    border-radius: 9px;
    background: #f0efff;
    color: var(--primary);
    display: grid;
    place-items: center;
}

.project-info {
    min-width: 0;
}

.project-info strong {
    display: block;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.project-info span {
    color: #9a9faa;
    font-size: 10px;
}

.side-button {
    width: 100%;
    height: 38px;
    border: 0;
    background: transparent;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 9px;
    color: #656b76;
    font-size: 12px;
    text-align: left;
}

.side-button:hover {
    background: #f5f6f8;
    color: var(--text);
}

.side-button span {
    width: 18px;
    font-size: 15px;
}

.side-button kbd {
    margin-left: auto;
    font-size: 9px;
    color: #b0b4bb;
}

.sidebar-bottom {
    margin-top: auto;
}

.connection {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    color: #8d929d;
    padding: 10px 8px;
}

.connection-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #f0ad36;
}

.settings-button {
    width: 100%;
    height: 38px;
    border: 0;
    background: transparent;
    color: #737985;
    text-align: left;
    padding: 0 8px;
    border-radius: 8px;
    font-size: 12px;
}

.settings-button:hover {
    background: #f5f6f8;
}


/* =========================
   MAIN
========================= */

.main {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.topbar {
    height: 66px;
    background: rgba(255,255,255,.92);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 26px;
}

.breadcrumbs {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 12px;
}

.breadcrumbs span {
    color: #a0a4ad;
}

.breadcrumbs b {
    color: #c8cbd0;
}

.breadcrumbs strong {
    color: #3d414a;
}

.top-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.top-button,
.primary-button {
    height: 35px;
    padding: 0 15px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: #fff;
    color: #555b66;
    font-size: 11px;
    font-weight: 600;
}

.top-button:hover {
    background: #f7f7f8;
}

.primary-button {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    box-shadow: 0 4px 13px rgba(99, 91, 255, .2);
}

.primary-button:hover {
    background: var(--primary-dark);
}


/* =========================
   WORKSPACE
========================= */

.workspace {
    display: grid;
    grid-template-columns: 390px minmax(0, 1fr);
    min-height: 590px;
    flex: 1;
}


/* CHAT */

.chat-panel {
    background: #fff;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.panel-header {
    padding: 22px 22px 17px;
    border-bottom: 1px solid #eef0f2;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.panel-header h1 {
    font-family: "Plus Jakarta Sans", sans-serif;
    margin: 0;
    font-size: 17px;
    letter-spacing: -.4px;
}

.panel-header p {
    margin: 5px 0 0;
    color: #969ba5;
    font-size: 10px;
    line-height: 1.5;
}

.ai-status {
    white-space: nowrap;
    font-size: 9px;
    color: #6d737d;
    display: flex;
    align-items: center;
    gap: 5px;
    padding-top: 4px;
}

.ai-status span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #32c77b;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 22px;
}

.welcome-card {
    padding-top: 28px;
}

.welcome-icon {
    width: 46px;
    height: 46px;
    border-radius: 13px;
    background: #f0efff;
    color: var(--primary);
    display: grid;
    place-items: center;
    font-size: 21px;
    margin-bottom: 17px;
}

.welcome-card h2 {
    font-family: "Plus Jakarta Sans", sans-serif;
    font-size: 20px;
    margin: 0 0 7px;
    letter-spacing: -.6px;
}

.welcome-card > p {
    color: #858a94;
    font-size: 11px;
    line-height: 1.6;
    margin: 0 0 22px;
}

.suggestions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.suggestion {
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 10px;
    padding: 11px;
    display: flex;
    align-items: center;
    gap: 11px;
    text-align: left;
    transition: .2s;
}

.suggestion:hover {
    border-color: #c9c5ff;
    background: #fafaff;
    transform: translateY(-1px);
}

.suggestion > span {
    width: 32px;
    height: 32px;
    background: #f5f5f7;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 15px;
}

.suggestion strong {
    display: block;
    font-size: 11px;
    color: #353942;
}

.suggestion small {
    display: block;
    color: #999ea8;
    font-size: 9px;
    margin-top: 3px;
}


/* CHAT MESSAGES */

.message {
    display: flex;
    gap: 9px;
    margin-bottom: 18px;
}

.message.user {
    justify-content: flex-end;
}

.message-avatar {
    width: 27px;
    height: 27px;
    flex: 0 0 27px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 800;
}

.message.ai .message-avatar {
    background: #f0efff;
    color: var(--primary);
}

.message.user .message-avatar {
    background: #1d2027;
    color: #fff;
    order: 2;
}

.message-bubble {
    max-width: 285px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 11px;
    line-height: 1.55;
}

.message.ai .message-bubble {
    background: #f5f6f8;
    color: #565b64;
}

.message.user .message-bubble {
    background: var(--primary);
    color: white;
}


/* COMPOSER */

.composer {
    padding: 13px 17px 17px;
    border-top: 1px solid #eef0f2;
}

.composer-box {
    border: 1px solid #dfe2e7;
    border-radius: 12px;
    padding: 9px;
    background: #fff;
    transition: .2s;
}

.composer-box:focus-within {
    border-color: #aaa5ff;
    box-shadow: 0 0 0 3px rgba(99,91,255,.07);
}

.composer textarea {
    width: 100%;
    border: 0;
    outline: 0;
    resize: none;
    color: var(--text);
    font-size: 11px;
    min-height: 38px;
    max-height: 120px;
    padding: 5px 5px 4px;
    line-height: 1.5;
}

.composer textarea::placeholder {
    color: #afb3bb;
}

.composer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.composer-hints {
    color: #b0b4bb;
    font-size: 8px;
    padding-left: 4px;
}

.composer-hints span {
    margin-right: 4px;
}

.send-button {
    border: 0;
    height: 30px;
    border-radius: 8px;
    background: var(--primary);
    color: white;
    padding: 0 9px 0 12px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
    font-weight: 700;
}

.send-button b {
    font-size: 15px;
}

.send-button:hover {
    background: var(--primary-dark);
}

.send-button:disabled {
    opacity: .5;
    cursor: wait;
}


/* =========================
   PREVIEW
========================= */

.preview-panel {
    background: #f5f6f8;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.preview-toolbar {
    height: 51px;
    background: white;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 15px;
}

.preview-title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10px;
}

.live-dot {
    width: 6px;
    height: 6px;
    background: #36c985;
    border-radius: 50%;
}

.device-buttons {
    margin: auto;
    display: flex;
    gap: 3px;
    padding: 3px;
    background: #f3f4f6;
    border-radius: 7px;
}

.device-button {
    width: 30px;
    height: 25px;
    border: 0;
    background: transparent;
    border-radius: 5px;
    color: #8f949d;
}

.device-button.active {
    background: white;
    color: #383c44;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

.preview-actions {
    display: flex;
    gap: 4px;
}

.preview-actions button {
    border: 0;
    background: transparent;
    color: #888e98;
    width: 27px;
    height: 27px;
    border-radius: 6px;
}

.preview-actions button:hover {
    background: #f3f4f6;
    color: #333;
}

.preview-area {
    flex: 1;
    display: grid;
    place-items: center;
    padding: 25px;
    min-height: 0;
    overflow: auto;
}

.browser-frame {
    width: 100%;
    height: 100%;
    max-width: 1200px;
    background: white;
    border-radius: 11px;
    overflow: hidden;
    box-shadow: 0 15px 45px rgba(30,35,45,.11);
    transition: width .3s, height .3s;
    display: flex;
    flex-direction: column;
}

.browser-frame.tablet {
    width: 768px;
    max-width: 768px;
}

.browser-frame.mobile {
    width: 390px;
    max-width: 390px;
}

.browser-bar {
    height: 29px;
    background: #f9fafb;
    border-bottom: 1px solid #e7e8eb;
    display: grid;
    grid-template-columns: 100px 1fr 100px;
    align-items: center;
    padding: 0 10px;
    flex-shrink: 0;
}

.browser-dots {
    display: flex;
    gap: 4px;
}

.browser-dots i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #d5d8dd;
}

.browser-address {
    height: 17px;
    border-radius: 4px;
    background: #f0f1f3;
    color: #a3a7ae;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
}

.iframe-wrapper {
    flex: 1;
    min-height: 0;
    background: white;
}

#preview {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
}


/* =========================
   CODE
========================= */

.code-section {
    height: 255px;
    background: white;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
}

.code-header {
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
}

.code-header strong {
    font-size: 11px;
}

.code-header span {
    color: #a1a5ae;
    font-size: 9px;
    margin-left: 8px;
}

.code-actions button {
    height: 27px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 6px;
    padding: 0 9px;
    font-size: 9px;
    color: #777c85;
}

.code-tabs {
    height: 34px;
    border-bottom: 1px solid #e8e9ec;
    display: flex;
    padding: 0 15px;
    gap: 4px;
}

.code-tab {
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    padding: 0 9px;
    font-size: 9px;
    color: #999da5;
}

.code-tab.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}

#codeEditor {
    flex: 1;
    width: 100%;
    resize: none;
    border: 0;
    outline: 0;
    padding: 13px 17px;
    font-family: Consolas, Monaco, monospace;
    font-size: 10px;
    line-height: 1.6;
    color: #343840;
    background: #fbfbfc;
}


/* =========================
   MODAL
========================= */

.modal {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
}

.modal.hidden {
    display: none;
}

.modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(20,25,35,.25);
    backdrop-filter: blur(4px);
}

.modal-card {
    width: 410px;
    background: white;
    border-radius: 16px;
    padding: 27px;
    position: relative;
    z-index: 1;
    box-shadow: 0 25px 80px rgba(20,25,40,.18);
}

.modal-close {
    position: absolute;
    right: 15px;
    top: 13px;
    border: 0;
    background: transparent;
    font-size: 22px;
    color: #a1a5ac;
}

.modal-icon {
    width: 39px;
    height: 39px;
    border-radius: 10px;
    background: #f0efff;
    color: var(--primary);
    display: grid;
    place-items: center;
    margin-bottom: 14px;
}

.modal-card h2 {
    font-family: "Plus Jakarta Sans", sans-serif;
    margin: 0;
    font-size: 19px;
}

.modal-card > p {
    font-size: 10px;
    line-height: 1.6;
    color: #898e97;
    margin: 7px 0 20px;
}

.modal-card label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: #555a63;
    margin-bottom: 14px;
}

.modal-card input {
    width: 100%;
    height: 38px;
    margin-top: 6px;
    border: 1px solid var(--border);
    border-radius: 8px;
    outline: 0;
    padding: 0 10px;
    font-size: 11px;
}

.modal-card input:focus {
    border-color: #aaa5ff;
}

.full {
    width: 100%;
    margin-top: 3px;
}

.modal-card small {
    display: block;
    color: #a2a6ae;
    font-size: 8px;
    line-height: 1.5;
    margin-top: 14px;
}


/* =========================
   TOAST
========================= */

.toast {
    position: fixed;
    bottom: 22px;
    right: 22px;
    background: #1d2027;
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,.16);
    transform: translateY(20px);
    opacity: 0;
    pointer-events: none;
    transition: .25s;
    z-index: 200;
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1050px) {

    .sidebar {
        width: 210px;
    }

    .workspace {
        grid-template-columns: 330px minmax(0, 1fr);
    }

}

@media (max-width: 850px) {

    .sidebar {
        display: none;
    }

    .workspace {
        grid-template-columns: 1fr;
    }

    .chat-panel {
        min-height: 500px;
        border-right: 0;
    }

    .preview-panel {
        min-height: 600px;
    }

}

@media (max-width: 600px) {

    .topbar {
        padding: 0 13px;
    }

    .workspace {
        display: block;
    }

    .preview-area {
        padding: 10px;
    }

    .browser-frame {
        min-height: 500px;
    }

    .code-section {
        display: none;
    }

}
