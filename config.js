<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Gut &amp; Joint Journal</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<!-- ================= CONNECT / CONSENT GATE ================= -->
<div id="gate" class="wrap">
  <div class="card">
    <div class="logo" style="margin-bottom:10px">🌱</div>
    <div class="eyebrow">Set up this device</div>
    <h1>Gut &amp; Joint Journal</h1>
    <p class="muted">A shared journal for tracking a child's tummy and joint symptoms over time, so both parents can add observations from their own devices and bring real patterns to the doctors.</p>

    <div class="banner info">
      <span>☁️</span>
      <div><strong>How your data is stored.</strong> Entries sync through your own private family database (Cloudflare D1) so Mother and Father see the same record across devices. It is reachable only with your family code, and it is never shared with Anthropic except the moment you tap "Analyse with AI". This is different from a device-only notebook — please make sure both parents understand and agree.</div>
    </div>

    <div class="banner note">
      <span>🧭</span>
      <div><strong>This is a journal, not a diagnosis.</strong> It does not replace medical care. The summary describes a <em>hypothesis to explore with qualified clinicians</em>, not a confirmed cause.</div>
    </div>

    <h3 style="margin-top:18px">Who is using this device?</h3>
    <div class="opts" id="whoami">
      <div class="opt" data-v="Mother"><span class="em">👩</span>Mother</div>
      <div class="opt" data-v="Father"><span class="em">👨</span>Father</div>
    </div>
    <small class="muted">Everything you enter here is tagged with this name.</small>

    <h3 style="margin-top:18px">Family code</h3>
    <p class="muted" style="margin-top:2px">The shared password both parents use to reach your family database. Set it once on the Worker, then enter the same code on each device.</p>
    <input type="password" id="familyToken" placeholder="Family code">

    <details style="margin-top:10px"><summary style="cursor:pointer;color:var(--teal-deep);font-weight:700">Advanced: database URL</summary>
      <p class="muted" style="margin:8px 0 4px"><small>Pre-filled from config.js. Only change it if you deployed your Worker somewhere else.</small></p>
      <input type="text" id="apiBase" placeholder="https://gjj-api.your-name.workers.dev">
    </details>

    <h3 style="margin-top:18px">Child's initials</h3>
    <p class="muted" style="margin-top:2px">Use initials or a nickname rather than a full name. Optional.</p>
    <input type="text" id="childCode" placeholder="Child's initials or nickname (optional)">

    <hr>
    <h3>Both parents acknowledge</h3>
    <p class="muted" style="margin-top:2px">You can start once <strong>one</strong> parent has checked the box. This notice clears only after <strong>both</strong> have, on this device.</p>

    <label class="check" id="p1lab">
      <input type="checkbox" id="parent1">
      <div><strong>Mother</strong><br><small>I understand this is not a diagnosis and that our entries are stored in our private family database.</small></div>
    </label>
    <label class="check" id="p2lab">
      <input type="checkbox" id="parent2">
      <div><strong>Father</strong><br><small>I understand this is not a diagnosis and that our entries are stored in our private family database.</small></div>
    </label>

    <button class="btn block" id="startBtn" disabled>Connect &amp; start →</button>
    <p class="center" style="margin-top:10px"><small id="gateHint">Choose who you are, enter the family code, and check at least one box.</small></p>
  </div>
</div>

<!-- ================= APP ================= -->
<div id="app" class="hide">
  <header class="app">
    <div class="wrap">
      <div class="logo">🌱</div>
      <div class="title-block">
        <strong>Gut &amp; Joint Journal</strong>
        <small id="hdrSub">—</small>
      </div>
      <span class="pill" id="userBadge" style="margin-left:auto">—</span>
    </div>
  </header>

  <div class="wrap">
    <!-- date picker -->
    <div class="card tight spread">
      <div>
        <div class="eyebrow">Logging for</div>
        <input type="date" id="theDate" style="margin-top:4px">
      </div>
      <button class="btn ghost small" id="todayBtn">Today</button>
    </div>

    <!-- ===== PAGE: SUMMARY ===== -->
    <section id="page-summary">
      <div class="card">
        <div class="spread">
          <span class="pill" id="dayCount">Day 1</span>
          <small class="muted" id="startedOn">Started —</small>
        </div>
        <h1 style="margin-top:10px">What we're watching, and why</h1>
        <p>This child had necrotising enterocolitis as a newborn and, at three months, surgery that removed a large part of the bowel (short bowel syndrome), followed by treated neonatal sepsis. Since toddlerhood there has been recurring night-time joint pain in the legs, knees and feet, plus ongoing trouble with stool consistency and control.</p>

        <h3 style="margin-top:16px">The pattern the family has noticed</h3>
        <p>Joint-pain days seem to line up with harder tummy days, and both appear to worsen after high-sugar days. Acknowledging the pain (warmth, a hot-water bottle, comfort) seems to ease it.</p>

        <div class="banner info"><span>🧪</span><div><strong>The hypothesis to test:</strong> that an imbalanced gut microbiome after the surgery (dysbiosis) may drive low-grade, body-wide inflammation that shows up <em>both</em> as gut symptoms and as joint pain — connected through the gut–immune–nervous-system "axis." This is a reasonable, research-supported <em>idea</em>, not a settled fact for this child.</div></div>

        <h3 style="margin-top:16px">Honest caveats worth keeping in mind</h3>
        <p style="margin-bottom:6px">A balanced log is far more persuasive to doctors than a confident theory, so it helps to hold these in view:</p>
        <ul class="muted" style="line-height:1.6;margin-top:4px">
          <li>Night-time leg pain in the knees/feet that eases with warmth and comfort is <strong>very common in healthy children</strong> ("benign nocturnal limb pains of childhood"). It may coexist with, or partly explain, what's seen here.</li>
          <li>Two things happening on the same days shows <strong>correlation, not proof of cause</strong>. Tracking is how you tell a real link from a coincidence.</li>
          <li>Physical activity, weather, sleep and stress can each move joint pain on their own — which is exactly why we log them.</li>
        </ul>

        <h3 style="margin-top:16px">What to do with this journal</h3>
        <p>Log daily (the child's page is optional and kept light on purpose). Add a monthly stool/lab result when you have one. Watch the Insights page for patterns — then take the printout to a paediatric gastroenterologist and, if pain persists, a paediatric rheumatologist. Centres worth approaching in Israel include the paediatric GI units at Schneider Children's, Sheba (Tel Hashomer) and Hadassah.</p>

        <div class="banner note"><span>⚠️</span><div>If there is blood in the stool, a swollen/red/hot joint, fever with joint pain, weight loss, or pain that wakes the child and won't settle — contact a doctor promptly. Those are not "track and wait" signs.</div></div>

        <details style="margin-top:12px">
          <summary style="cursor:pointer;font-weight:700;color:var(--teal-deep)">Background reading (opens in browser)</summary>
          <p style="margin-top:8px"><small>
            • Dysbiosis in paediatric short bowel syndrome — <a href="https://pubmed.ncbi.nlm.nih.gov/?term=intestinal+dysbiosis+children+short+bowel+syndrome" target="_blank" rel="noopener">PubMed</a><br>
            • Gut–brain–immune axis overview — <a href="https://www.ncbi.nlm.nih.gov/pmc/?term=gut+brain+axis+inflammation" target="_blank" rel="noopener">PMC</a><br>
            • Benign nocturnal limb pains of childhood ("growing pains") — <a href="https://pubmed.ncbi.nlm.nih.gov/?term=growing+pains+children+nocturnal+limb" target="_blank" rel="noopener">PubMed</a><br>
            • Faecal calprotectin (gut inflammation marker) — <a href="https://pubmed.ncbi.nlm.nih.gov/?term=fecal+calprotectin+children" target="_blank" rel="noopener">PubMed</a>
          </small></p>
        </details>
      </div>
    </section>

    <!-- ===== PAGE: CHILD ===== -->
    <section id="page-child" class="hide">
      <div class="card kidwrap">
        <div class="eyebrow">Just for you 🌟</div>
        <h1>How are you feeling today?</h1>
        <p class="muted">You don't have to answer everything. Only what you want! 🫶</p>

        <div class="field">
          <div class="label">😣 How much does your body hurt? <span class="scalename">· 0–10 pain scale</span></div>
          <div class="pain-readout"><span class="pain-face" id="kidFace">😀</span><span class="pain-num" id="kidPainNum">0</span></div>
          <input type="range" min="0" max="10" value="0" id="kidPain">
          <div class="spread"><small>0 — none 😀</small><small>10 — really bad 😭</small></div>
        </div>

        <div class="field">
          <div class="label">📍 Where does it hurt? <small class="muted">(tap any)</small></div>
          <div class="opts" id="kidWhere">
            <div class="opt kid" data-v="knees"><span class="em">🦵</span>Knees</div>
            <div class="opt kid" data-v="feet"><span class="em">🦶</span>Feet</div>
            <div class="opt kid" data-v="legs"><span class="em">🦴</span>Legs</div>
            <div class="opt kid" data-v="tummy"><span class="em">🤰</span>Tummy</div>
            <div class="opt kid" data-v="nowhere"><span class="em">✨</span>Nowhere!</div>
          </div>
        </div>

        <div class="field">
          <div class="label">😊 How do you feel overall?</div>
          <div class="opts" id="kidMood">
            <div class="opt kid" data-v="great"><span class="em">🤩</span>Great</div>
            <div class="opt kid" data-v="ok"><span class="em">🙂</span>Okay</div>
            <div class="opt kid" data-v="meh"><span class="em">😕</span>Meh</div>
            <div class="opt kid" data-v="bad"><span class="em">😢</span>Bad</div>
          </div>
        </div>

        <div class="field">
          <div class="label">💧 Did you drink enough water?</div>
          <div class="opts" id="kidDrink">
            <div class="opt kid" data-v="lots"><span class="em">💦</span>Lots</div>
            <div class="opt kid" data-v="some"><span class="em">💧</span>Some</div>
            <div class="opt kid" data-v="little"><span class="em">🏜️</span>Not much</div>
          </div>
        </div>

        <div class="field">
          <div class="label">🍽️ Did you eat enough?</div>
          <div class="opts" id="kidEat">
            <div class="opt kid" data-v="lots"><span class="em">😋</span>Lots</div>
            <div class="opt kid" data-v="normal"><span class="em">🍽️</span>Normal</div>
            <div class="opt kid" data-v="little"><span class="em">🥄</span>A little</div>
          </div>
        </div>

        <div class="field">
          <div class="label">🏃 Did you run and play a lot?</div>
          <div class="opts" id="kidPlay">
            <div class="opt kid" data-v="lots"><span class="em">⚡</span>Tons</div>
            <div class="opt kid" data-v="some"><span class="em">🤸</span>Some</div>
            <div class="opt kid" data-v="rest"><span class="em">😴</span>Rest day</div>
          </div>
        </div>

        <small class="muted" id="kidAuthorNote">Recorded by —</small>
        <button class="btn coral block" id="kidSave" style="margin-top:6px">Save my day 🎉</button>
      </div>
    </section>

    <!-- ===== PAGE: PARENT ===== -->
    <section id="page-parent" class="hide">
      <div class="card">
        <div class="eyebrow">Parent observations</div>
        <h1>Today's record</h1>

        <div class="field">
          <div class="label">Joint pain seen
            <span class="scalename">· Numeric Rating Scale 0–10</span>
            <a class="reflink" href="https://pubmed.ncbi.nlm.nih.gov/?term=numeric+pain+rating+scale+children" target="_blank" rel="noopener">why ↗</a>
          </div>
          <div class="pain-readout"><span class="pain-num" id="parPainNum">0</span></div>
          <input type="range" min="0" max="10" value="0" id="parPain">
          <div class="field" style="margin-top:6px">
            <div class="label" style="font-size:.85rem">Pain timing</div>
            <div class="opts" id="parPainTime">
              <div class="opt" data-v="none">None</div>
              <div class="opt" data-v="day">Daytime</div>
              <div class="opt" data-v="evening">Evening</div>
              <div class="opt" data-v="night">Night (woke up)</div>
            </div>
          </div>
        </div>

        <hr>

        <div class="field">
          <div class="label">Stool form
            <span class="scalename">· Bristol Stool Form Scale</span>
            <a class="reflink" href="https://en.wikipedia.org/wiki/Bristol_stool_scale" target="_blank" rel="noopener">scale ↗</a>
          </div>
          <small class="muted">Includes "nothing came out" for complete constipation days.</small>
          <div class="opts" id="parBristol">
            <div class="opt" data-v="0"><span class="em">🚫</span>0 · Nothing came out</div>
            <div class="opt" data-v="1"><span class="em">🟤</span>1 · Hard lumps</div>
            <div class="opt" data-v="2"><span class="em">🟫</span>2 · Lumpy sausage</div>
            <div class="opt" data-v="3"><span class="em">🥖</span>3 · Cracked sausage</div>
            <div class="opt" data-v="4"><span class="em">✅</span>4 · Smooth (ideal)</div>
            <div class="opt" data-v="5"><span class="em">🟡</span>5 · Soft blobs</div>
            <div class="opt" data-v="6"><span class="em">💧</span>6 · Mushy</div>
            <div class="opt" data-v="7"><span class="em">🌊</span>7 · Watery (diarrhoea)</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Stool colour</div>
          <div class="opts" id="parColor">
            <div class="opt" data-v="pale"><span class="em">⬜</span>Pale</div>
            <div class="opt" data-v="yellow"><span class="em">🟨</span>Yellow</div>
            <div class="opt" data-v="green"><span class="em">🟩</span>Green</div>
            <div class="opt" data-v="brown"><span class="em">🟫</span>Brown</div>
            <div class="opt" data-v="dark"><span class="em">⬛</span>Dark / black</div>
          </div>
          <small class="muted">Note: black or red stool warrants a call to the doctor.</small>
        </div>

        <div class="field">
          <div class="label">Smell intensity</div>
          <div class="opts" id="parSmell">
            <div class="opt" data-v="none">None</div>
            <div class="opt" data-v="mild">Mild</div>
            <div class="opt" data-v="moderate">Moderate</div>
            <div class="opt" data-v="strong">Strong / unusual</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Soiling / accidents</div>
          <div class="opts" id="parSoil">
            <div class="opt" data-v="none">None</div>
            <div class="opt" data-v="smudge">Light smudge</div>
            <div class="opt" data-v="moderate">Moderate</div>
            <div class="opt" data-v="heavy">Heavy</div>
          </div>
        </div>

        <hr>

        <div class="field">
          <div class="label">Sugar / treats today</div>
          <div class="opts" id="parSugar">
            <div class="opt" data-v="none"><span class="em">🚫</span>None</div>
            <div class="opt" data-v="some"><span class="em">🍪</span>Some</div>
            <div class="opt" data-v="lots"><span class="em">🍭</span>A lot</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Physical activity</div>
          <div class="opts" id="parActivity">
            <div class="opt" data-v="rest">Rest</div>
            <div class="opt" data-v="light">Light</div>
            <div class="opt" data-v="moderate">Moderate</div>
            <div class="opt" data-v="heavy">Heavy</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Probiotics taken?</div>
          <div class="opts" id="parProbiotic">
            <div class="opt" data-v="yes"><span class="em">✅</span>Yes</div>
            <div class="opt" data-v="no"><span class="em">❌</span>No</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Other supplements taken?</div>
          <div class="opts" id="parSupp">
            <div class="opt" data-v="yes"><span class="em">✅</span>Yes</div>
            <div class="opt" data-v="partial"><span class="em">➗</span>Some</div>
            <div class="opt" data-v="no"><span class="em">❌</span>No</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Sleep quality last night</div>
          <div class="opts" id="parSleep">
            <div class="opt" data-v="good"><span class="em">😴</span>Good</div>
            <div class="opt" data-v="ok"><span class="em">🛌</span>Okay</div>
            <div class="opt" data-v="poor"><span class="em">🥱</span>Poor</div>
          </div>
        </div>

        <div class="field">
          <div class="label">Notes (food triggers, weather, mood…)</div>
          <textarea id="parNotes" placeholder="Anything notable today"></textarea>
        </div>

        <div id="otherParent"></div>
        <small class="muted" id="parAuthorNote">Saving as —</small>
        <button class="btn block" id="parSave" style="margin-top:8px">Save my record</button>
      </div>
    </section>

    <!-- ===== PAGE: LABS ===== -->
    <section id="page-labs" class="hide">
      <div class="card">
        <div class="eyebrow">Monthly results</div>
        <h1>Stool &amp; lab uploads</h1>
        <p class="muted">Add a result roughly once a month. When you request the test, ask specifically for a <strong>gut microbiome analysis</strong> (metagenomic sequencing or 16S rRNA) plus <strong>faecal calprotectin</strong> for inflammation — a routine culture won't show dysbiosis.</p>

        <div class="field">
          <div class="label">Result date</div>
          <input type="date" id="labDate">
        </div>
        <div class="field">
          <div class="label">Calprotectin (µg/g, if known)</div>
          <input type="text" id="labCalpro" placeholder="e.g. 120">
        </div>
        <div class="field">
          <div class="label">Paste / type the result summary</div>
          <textarea id="labText" placeholder="Microbiome diversity, notable bacteria, doctor's comments…"></textarea>
        </div>
        <button class="btn block" id="labSave">Save result</button>

        <div class="banner info" style="margin-top:16px"><span>🤖</span><div><strong>AI review:</strong> with your family database connected, tap below to have Claude read this period's combined Mother + Father entries and summarise patterns. Your API key stays on your Worker, never in the app.</div></div>

        <div class="seg" id="aiRangeSeg" style="margin:10px 0 8px">
          <button data-r="30" class="active">Month</button>
          <button data-r="90">Quarter</button>
          <button data-r="365">Year</button>
        </div>
        <button class="btn coral block" id="aiBtn">Analyse this period with AI 🤖</button>
        <div id="aiOut" style="margin-top:12px"></div>

        <h3 style="margin-top:18px">Saved results</h3>
        <div id="labList"><small class="muted">No results yet.</small></div>
      </div>
    </section>

    <!-- ===== PAGE: INSIGHTS ===== -->
    <section id="page-stats" class="hide">
      <div class="card">
        <div class="eyebrow">Patterns &amp; anomalies</div>
        <h1>Insights</h1>
        <div class="seg" id="rangeSeg" style="margin:8px 0 4px">
          <button data-r="30" class="active">Month</button>
          <button data-r="90">Quarter</button>
          <button data-r="365">Year</button>
        </div>
        <small class="muted" id="rangeNote">Last 30 days</small>

        <div class="stat-grid" style="margin-top:14px">
          <div class="stat"><div class="big" id="sDays">0</div><div class="lab">days logged</div></div>
          <div class="stat"><div class="big" id="sAvgPain">–</div><div class="lab">avg joint pain</div></div>
          <div class="stat"><div class="big" id="sPainDays">0</div><div class="lab">pain days (≥3)</div></div>
          <div class="stat"><div class="big" id="sHardGut">0</div><div class="lab">hard gut days</div></div>
        </div>

        <h3 style="margin-top:18px">What the data is hinting at</h3>
        <div id="insights"><small class="muted">Log a few days to see patterns appear here.</small></div>

        <h3 style="margin-top:18px">Pain by sugar level</h3>
        <div id="sugarBars"></div>

        <h3 style="margin-top:18px">Gut ↔ joint days that line up</h3>
        <div id="overlapBox"><small class="muted">—</small></div>

        <h3 style="margin-top:18px">Anomaly days</h3>
        <p class="muted" style="margin-top:0"><small>Days that break the usual pattern — worth a closer look.</small></p>
        <div id="anomalies"><small class="muted">—</small></div>
      </div>
    </section>

    <!-- ===== PAGE: SETTINGS ===== -->
    <section id="page-settings" class="hide">
      <div class="card">
        <div class="eyebrow">Settings</div>
        <h1>Settings &amp; data</h1>

        <h3 style="margin-top:14px">Child's theme song 🎵</h3>
        <p class="muted" style="margin-top:2px">Paste a Spotify track link to show a play button on the child's page (works when online).</p>
        <input type="text" id="spotifyUrl" placeholder="https://open.spotify.com/track/...">
        <button class="btn ghost small" id="spotifySave" style="margin-top:8px">Save song</button>

        <hr>
        <h3>This device</h3>
        <p class="muted" style="margin-top:2px">You are signed in as <strong id="meName">—</strong>. Switch if someone else uses this device.</p>
        <div class="opts" id="switchWho">
          <div class="opt" data-v="Mother"><span class="em">👩</span>Mother</div>
          <div class="opt" data-v="Father"><span class="em">👨</span>Father</div>
        </div>
        <button class="btn ghost small" id="switchSave" style="margin-top:6px">Save</button>

        <hr>
        <h3>Export data</h3>
        <p class="muted" style="margin-top:2px">Download everything as a file (for backup, or to paste into a Claude chat for the monthly review).</p>
        <button class="btn ghost" id="exportBtn">Export all data</button>

        <hr>
        <h3>Privacy</h3>
        <p class="muted" style="margin-top:2px">All data lives only in this browser, on this device. Clearing your browser's site data, or using a different device/browser, means it won't be here.</p>

        <hr>
        <h3 style="color:var(--bad)">Complete reset</h3>
        <p class="muted" style="margin-top:2px">Erases all entries and consent so the journal can be handed to another family for a fresh start. Enter the reset code to confirm.</p>
        <input type="password" id="resetCode" placeholder="Reset code" style="margin-bottom:10px">
        <button class="btn danger block" id="resetBtn">Erase everything</button>
      </div>
      <p class="footnote">Gut &amp; Joint Journal · a private at-home tracking tool. Not a medical device and not a substitute for professional care. If you're worried about your child, contact a doctor.</p>
    </section>
  </div>

  <nav class="tabs">
    <button data-p="summary" class="active"><span class="ic">📋</span>Summary</button>
    <button data-p="child"><span class="ic">🧒</span>Child</button>
    <button data-p="parent"><span class="ic">👪</span>Parent</button>
    <button data-p="labs"><span class="ic">🧪</span>Labs</button>
    <button data-p="stats"><span class="ic">📊</span>Insights</button>
    <button data-p="settings"><span class="ic">⚙️</span>More</button>
  </nav>
</div>

<div class="saved-flash" id="flash">Saved ✓</div>
<script src="config.js"></script>
<script src="app.js"></script>
</body>
</html>
