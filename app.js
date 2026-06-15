/* ---- Palette: calm seafoam + warm coral, deliberately non-clinical ---- */
  :root{
    --bg:#f3f7f6; --ink:#1f3b3a; --muted:#5d7a78;
    --paper:#ffffff; --line:#dde9e7;
    --teal:#0f9d8f; --teal-soft:#d6efec; --teal-deep:#0a6f66;
    --coral:#f08a5d; --coral-soft:#fbe2d5;
    --sun:#f4c95d; --plum:#7a5c8e; --sky:#5aa9e6;
    --good:#2f9e6f; --warn:#e3a008; --bad:#d9534f;
    --radius:18px; --shadow:0 6px 24px rgba(15,61,58,.08);
    --font:"Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:var(--font);-webkit-text-size-adjust:100%}
  body{padding-bottom:96px}
  h1,h2,h3{margin:0 0 .4em;line-height:1.15}
  h1{font-size:1.5rem;letter-spacing:-.01em}
  h2{font-size:1.18rem}
  h3{font-size:1rem}
  p{line-height:1.55;margin:.4em 0}
  small{color:var(--muted)}
  a{color:var(--teal-deep)}
  .wrap{max-width:680px;margin:0 auto;padding:18px 16px}
  .card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:18px;margin:14px 0;box-shadow:var(--shadow)}
  .card.tight{padding:14px}
  .eyebrow{font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--teal);font-weight:700;margin-bottom:6px}
  .muted{color:var(--muted)}
  .pill{display:inline-block;background:var(--teal-soft);color:var(--teal-deep);border-radius:999px;padding:3px 11px;font-size:.78rem;font-weight:600}
  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .spread{display:flex;justify-content:space-between;align-items:center;gap:10px}
  hr{border:none;border-top:1px solid var(--line);margin:16px 0}

  /* header */
  header.app{position:sticky;top:0;z-index:30;background:linear-gradient(180deg,#ffffff,#ffffffee);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
  header.app .wrap{padding:12px 16px;display:flex;align-items:center;gap:10px}
  .logo{width:38px;height:38px;border-radius:12px;background:radial-gradient(circle at 30% 30%,var(--teal),var(--teal-deep));display:grid;place-items:center;color:#fff;font-size:1.2rem;flex:0 0 auto}
  .title-block strong{display:block;font-size:1.02rem}
  .title-block small{font-size:.74rem}

  /* bottom nav */
  nav.tabs{position:fixed;bottom:0;left:0;right:0;z-index:40;background:#fff;border-top:1px solid var(--line);display:flex;padding:6px max(6px,env(safe-area-inset-left)) calc(6px + env(safe-area-inset-bottom))}
  nav.tabs button{flex:1;border:none;background:none;padding:8px 2px;font-family:var(--font);color:var(--muted);font-size:.66rem;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;border-radius:12px}
  nav.tabs button .ic{font-size:1.25rem;line-height:1}
  nav.tabs button.active{color:var(--teal-deep);font-weight:700;background:var(--teal-soft)}

  /* buttons */
  .btn{display:inline-flex;align-items:center;gap:8px;justify-content:center;border:none;border-radius:14px;padding:13px 18px;font-family:var(--font);font-size:1rem;font-weight:700;cursor:pointer;background:var(--teal);color:#fff;transition:transform .05s ease,filter .15s}
  .btn:active{transform:translateY(1px)}
  .btn.block{width:100%}
  .btn.ghost{background:#fff;color:var(--teal-deep);border:1.5px solid var(--teal)}
  .btn.coral{background:var(--coral)}
  .btn.danger{background:var(--bad)}
  .btn.small{padding:8px 13px;font-size:.85rem;border-radius:11px}
  .btn:disabled{filter:grayscale(.6);opacity:.55;cursor:not-allowed}

  /* option chips */
  .opts{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 4px}
  .opt{border:1.5px solid var(--line);background:#fff;border-radius:13px;padding:10px 12px;font-size:.92rem;cursor:pointer;display:flex;align-items:center;gap:7px;font-family:var(--font);color:var(--ink);transition:all .12s;min-height:44px}
  .opt .em{font-size:1.15rem}
  .opt.sel{border-color:var(--teal);background:var(--teal-soft);color:var(--teal-deep);font-weight:700;box-shadow:0 0 0 2px var(--teal-soft)}
  .opt.kid{font-size:1rem;padding:12px 14px}
  .opt.kid .em{font-size:1.6rem}

  .field{margin:16px 0}
  .field .label{font-weight:700;font-size:.95rem;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .field .scalename{font-size:.72rem;color:var(--muted);font-weight:600}
  .reflink{font-size:.72rem;color:var(--teal-deep);text-decoration:none;border-bottom:1px dotted var(--teal);padding-bottom:1px}

  /* slider */
  .slider-wrap{margin-top:10px}
  input[type=range]{width:100%;accent-color:var(--coral);height:34px}
  .pain-readout{display:flex;align-items:center;justify-content:center;gap:12px;margin:6px 0}
  .pain-face{font-size:2.6rem}
  .pain-num{font-size:2rem;font-weight:800}
  textarea,input[type=text],input[type=date],input[type=password]{width:100%;border:1.5px solid var(--line);border-radius:12px;padding:11px;font-family:var(--font);font-size:1rem;background:#fff;color:var(--ink)}
  textarea{min-height:90px;resize:vertical}

  label.check{display:flex;gap:11px;align-items:flex-start;padding:12px;border:1.5px solid var(--line);border-radius:13px;cursor:pointer;margin:10px 0}
  label.check input{margin-top:3px;width:20px;height:20px;accent-color:var(--teal);flex:0 0 auto}
  label.check.done{border-color:var(--good);background:#effaf3}

  .banner{border-radius:13px;padding:12px 14px;font-size:.9rem;margin:10px 0;display:flex;gap:9px;align-items:flex-start}
  .banner.info{background:var(--teal-soft);color:var(--teal-deep)}
  .banner.note{background:#fff7e6;color:#7a5a00;border:1px solid #f3dca0}
  .banner.lock{background:#f1f4f3;color:var(--muted);border:1px dashed var(--line)}

  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px}
  .stat .big{font-size:1.7rem;font-weight:800;line-height:1}
  .stat .lab{font-size:.74rem;color:var(--muted);margin-top:4px}

  .insight{border-left:4px solid var(--teal);background:#fff;border:1px solid var(--line);border-left-width:4px;border-radius:10px;padding:11px 13px;margin:9px 0;font-size:.9rem}
  .insight.warn{border-left-color:var(--warn)}
  .insight.bad{border-left-color:var(--bad)}
  .insight.good{border-left-color:var(--good)}

  .bar-row{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:.8rem}
  .bar-row .lab{width:84px;flex:0 0 auto;color:var(--muted)}
  .bar-track{flex:1;background:#eef3f2;border-radius:8px;height:16px;overflow:hidden}
  .bar-fill{height:100%;background:var(--teal);border-radius:8px}

  .hide{display:none!important}
  .center{text-align:center}
  .saved-flash{position:fixed;left:50%;bottom:108px;transform:translateX(-50%);background:var(--ink);color:#fff;padding:11px 20px;border-radius:999px;font-weight:700;font-size:.9rem;opacity:0;transition:opacity .25s;z-index:60;pointer-events:none}
  .saved-flash.show{opacity:1}
  .seg{display:flex;border:1.5px solid var(--line);border-radius:12px;overflow:hidden}
  .seg button{flex:1;border:none;background:#fff;padding:9px;font-family:var(--font);font-weight:700;color:var(--muted);cursor:pointer;font-size:.85rem}
  .seg button.active{background:var(--teal);color:#fff}
  .kidwrap{background:linear-gradient(160deg,#fff,#fef6f1)}
  .footnote{font-size:.72rem;color:var(--muted);margin-top:18px;line-height:1.5}
  .entry-chip{display:inline-flex;gap:5px;align-items:center;background:#f1f4f3;border-radius:8px;padding:4px 9px;font-size:.78rem;margin:3px 4px 0 0}
