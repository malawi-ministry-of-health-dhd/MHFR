"use strict";

module.exports = function(app) {
  app.get("/", function(req, res) {
    const baseUrl = req.protocol + "://" + req.get("host");
    const docsUrl = "/explorer";

    res.status(200).type("html").send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Master Health Registry API</title>
    <style>
      :root {
        --bg: #f5efe2;
        --paper: rgba(255, 252, 245, 0.88);
        --ink: #1f2a1f;
        --muted: #526157;
        --line: rgba(31, 42, 31, 0.12);
        --accent: #136f63;
        --accent-dark: #0f574e;
        --highlight: #e7c66a;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(231, 198, 106, 0.45), transparent 34%),
          radial-gradient(circle at bottom right, rgba(19, 111, 99, 0.24), transparent 32%),
          linear-gradient(135deg, #f7f1e5 0%, #efe6d2 48%, #e6ddc8 100%);
      }

      .shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
      }

      .card {
        width: min(960px, 100%);
        border: 1px solid var(--line);
        border-radius: 28px;
        overflow: hidden;
        background: var(--paper);
        box-shadow: 0 28px 80px rgba(35, 42, 29, 0.16);
        backdrop-filter: blur(12px);
      }

      .grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
      }

      .hero {
        padding: 56px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(19, 111, 99, 0.09);
        color: var(--accent-dark);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      h1 {
        margin: 22px 0 16px;
        font-size: clamp(2.6rem, 6vw, 4.8rem);
        line-height: 0.95;
        letter-spacing: -0.05em;
      }

      p {
        margin: 0;
        max-width: 38rem;
        font-family: "Helvetica Neue", Arial, sans-serif;
        font-size: 1.05rem;
        line-height: 1.8;
        color: var(--muted);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 30px;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 170px;
        padding: 15px 22px;
        border-radius: 999px;
        text-decoration: none;
        font-family: "Helvetica Neue", Arial, sans-serif;
        font-size: 0.95rem;
        font-weight: 700;
        transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
      }

      .button-primary {
        color: #fff;
        background: linear-gradient(135deg, var(--accent) 0%, #1b8d7f 100%);
        box-shadow: 0 16px 36px rgba(19, 111, 99, 0.24);
      }

      .button:hover {
        transform: translateY(-2px);
      }

      .panel {
        position: relative;
        min-height: 100%;
        padding: 40px 34px;
        background:
          linear-gradient(180deg, rgba(19, 111, 99, 0.92) 0%, rgba(12, 72, 64, 0.96) 100%);
        color: #eef7f4;
      }

      .panel::before {
        content: "";
        position: absolute;
        inset: 22px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 22px;
      }

      .stack {
        position: relative;
        display: grid;
        gap: 16px;
      }

      .stat {
        padding: 18px 20px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: "Helvetica Neue", Arial, sans-serif;
      }

      .stat strong {
        display: block;
        margin-bottom: 8px;
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.74);
      }

      .stat span {
        font-size: 1rem;
        line-height: 1.6;
      }

      .accent-line {
        width: 92px;
        height: 6px;
        margin: 26px 0;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--highlight) 0%, rgba(231, 198, 106, 0.15) 100%);
      }

      @media (max-width: 860px) {
        .grid {
          grid-template-columns: 1fr;
        }

        .hero,
        .panel {
          padding: 32px 24px;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="card">
        <div class="grid">
          <div class="hero">
            <span class="eyebrow">Master Health Registry API</span>
            <h1>Welcome to Master Health Registry API.</h1>
            <p>
              Health facility registry services, data access, and integration endpoints are available here.
              To get started, open the interactive API documentation and explore the available resources.
            </p>
            <div class="accent-line"></div>
            <div class="actions">
              <a class="button button-primary" href="${docsUrl}">Open Docs</a>
            </div>
          </div>
          <aside class="panel">
            <div class="stack">
              <div class="stat">
                <strong>Get Started</strong>
                <span>Click <em>Open Docs</em> to jump straight to the Swagger explorer.</span>
              </div>
              <div class="stat">
                <strong>Documentation</strong>
                <span>The explorer provides request schemas, example payloads, and live endpoint testing.</span>
              </div>
              <div class="stat">
                <strong>Base URL</strong>
                <span>${baseUrl}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  </body>
</html>`);
  });
};
