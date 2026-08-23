/* Child screens: own account, own tasks, the group account, own notebook. */
(function (global) {
  "use strict";

  var t = function (k, p) { return global.I18N.t(k, p); };
  var esc = function (s) { return global.UI.esc(s); };
  var U = global.UI, S = global.Store;

  function me() { return S.child(global.App.session().id); }

  function render(tab) {
    var c = me();
    if (!c) { S.clearSession(); return ""; }
    if (tab === "tasks") return tasksTab(c);
    if (tab === "group") return groupTab(c);
    if (tab === "notes") return notesTab(c);
    return meTab(c);
  }

  /* ================= me ================= */

  function meTab(c) {
    var bd = S.birthdayInfo(c);
    var rank = S.standings().findIndex(function (r) { return r.child.id === c.id; }) + 1;
    var recent = S.get().ledger.filter(function (l) { return l.childId === c.id; }).slice().reverse().slice(0, 8);

    var html = '<div class="wrap">' +
      '<div class="card hero center">' +
        U.avatar(c.avatar, 84) +
        "<h1 style=\"margin-top:10px\">" + esc(c.name) + "</h1>" +
        '<div class="score" style="font-size:2.8rem">' + S.balance(c.id) + "</div>" +
        '<small>' + esc(t("common.points")) + "</small>" +
        '<div class="row gap mt" style="justify-content:center">' +
          '<span class="tag" style="background:rgba(255,255,255,.22);color:#fff">' + esc(t("common.rank")) + " " + rank + "</span>" +
          '<span class="tag" style="background:rgba(255,255,255,.22);color:#fff">' +
            esc(t("dash.earnedThisWeek", { n: U.signed(S.weekEarned(c.id)) })) + "</span>" +
        "</div>" +
      "</div>";

    if (bd) {
      var label = bd.days === 0 ? t("dash.birthdayToday")
                : bd.days === 1 ? t("dash.tomorrow")
                : t("dash.daysLeft", { n: U.iso(bd.days) });
      html += '<div class="card"><div class="eyebrow">' + esc(t("dash.birthdays")) + "</div>" +
        '<div class="row between"><strong style="font-size:1.1rem">🎂 ' + esc(label) + "</strong>" +
        '<span class="tag brand">' + esc(t("dash.turns", { n: U.iso(bd.turning) })) + "</span></div></div>";
    }

    var winner = S.weekWinner();
    if (winner && winner.child.id === c.id && S.isMovieDay()) {
      var todays = S.movieNightToday();
      html += '<div class="card good"><div class="eyebrow">' + esc(t("movie.title")) + "</div>" +
        "<p><strong>🍿 " + esc(todays ? todays.movie : t("movie.winner", { name: c.name })) + "</strong></p></div>";
    }

    html += '<div class="section-title">' + esc(t("dash.activity")) + "</div>" +
      '<div class="card flush">' + (recent.length
        ? '<ul class="list">' + recent.map(function (l) {
            var task = S.task(l.taskId);
            var label2 = task ? U.taskTitleHtml(task)
              : l.kind === "start" ? esc(t("ledger.start"))
              : l.note ? U.trHtml(l, "note") : esc(t("ledger.manual"));
            return "<li><div class=\"grow\"><div class=\"title\">" + label2 + "</div>" +
              '<div class="sub">' + esc(U.fmtDateTime(l.ts)) + "</div></div>" +
              U.points(l.self) + "</li>";
          }).join("") + "</ul>"
        : U.emptyState(t("kids.noHistory"), "📈")) + "</div>";

    return html + "</div>";
  }

  /* ================= my tasks ================= */

  function tasksTab(c) {
    var s = S.get();
    var mine = S.tasksForChild(c.id);
    var html = '<div class="wrap"><h1>' + esc(t("tasks.mine")) + "</h1>";
    if (!mine.length) return html + U.emptyState(t("tasks.noneForChild"), "📋") + "</div>";

    s.categories.forEach(function (cat) {
      var list = mine.filter(function (task) { return task.categoryId === cat.id; });
      if (!list.length) return;
      html += '<div class="section-title">' + cat.icon + " " + U.categoryNameHtml(cat) + "</div>" +
        '<div class="card flush">' + list.map(function (task) { return taskRow(c, task); }).join("") + "</div>";
    });
    var orphans = mine.filter(function (task) { return !S.category(task.categoryId); });
    if (orphans.length) {
      html += '<div class="section-title">' + esc(t("cat.other")) + "</div>" +
        '<div class="card flush">' + orphans.map(function (task) { return taskRow(c, task); }).join("") + "</div>";
    }
    return html + "</div>";
  }

  function taskRow(c, task) {
    var claim = S.claimFor(c.id, task.id);
    var status = "";
    if (claim && claim.status === "pending") status = '<span class="tag">⏳ ' + esc(t("tasks.claimed")) + "</span>";
    else if (claim && claim.status === "approved") status = '<span class="tag good">✓ ' + esc(t("tasks.doneToday")) + "</span>";
    else if (claim && claim.status === "rejected") status = '<span class="tag bad">✗ ' + esc(t("appr.rejected")) + "</span>";

    var reward = [];
    if (task.scope !== "group") reward.push(U.points(task.onDoneSelf));
    if (task.scope !== "personal") reward.push('<small>' + esc(t("nav.group")) + "</small> " + U.points(task.onDoneGroup));

    return '<div class="task-row">' +
      '<div class="grow"><div class="title">' + U.taskTitleHtml(task) + "</div>" +
        '<div class="sub">' + reward.join(" · ") +
        (S.num(task.onMissSelf) < 0 ? " · <small>" + esc(t("tasks.onMiss")) + " " + U.points(task.onMissSelf) + "</small>" : "") +
        "</div>" + (status ? '<div class="sub">' + status + "</div>" : "") + "</div>" +
      (claim && claim.status === "pending"
        ? '<button class="btn small ghost" disabled>⏳</button>'
        : '<button class="btn small good" data-act="c.claim" data-id="' + task.id + '">' + esc(t("tasks.iDidIt")) + "</button>") +
      "</div>";
  }

  /* ================= group ================= */

  function groupTab(c) {
    var s = S.get();
    var gp = S.goalProgress();
    var rows = S.standings();
    var top = S.topScorer();

    var html = '<div class="wrap">' +
      '<div class="card hero">' +
        '<div class="eyebrow">' + esc(t("dash.groupBank")) + "</div>" +
        '<div class="row between nowrap"><div class="score">' + gp.total + "</div>" +
        '<div class="tag" style="background:rgba(255,255,255,.2);color:#fff">' + esc(t("dash.goal", { n: U.iso(gp.goal) })) + "</div></div>" +
        U.progressBar(gp.pct) +
        (gp.reached
          ? "<p>🎉 " + esc(t("dash.goalReached")) + "</p>" +
            (top ? "<small>" + esc(t("outing.chooser", { name: top.child.id === c.id ? t("common.you") : top.child.name })) + "</small>" : "")
          : "<small>" + esc(t("outing.needMore", { n: U.iso(gp.missing) })) + "</small>") +
      "</div>";

    html += '<div class="section-title">' + esc(t("dash.standings")) + "</div>" +
      '<div class="card flush"><ul class="list">' + rows.map(function (r, i) {
        return '<li' + (r.child.id === c.id ? ' style="background:var(--brand-soft)"' : "") + ">" +
          '<span class="rank-badge' + (i === 0 && r.earned > 0 ? " gold" : "") + '">' + (i + 1) + "</span>" +
          U.avatar(r.child.avatar, 38) +
          '<div class="grow"><div class="title">' + esc(r.child.name) + "</div>" +
          '<div class="sub">' + esc(t("dash.earnedThisWeek", { n: U.signed(r.earned) })) + "</div></div>" +
          '<strong class="score" style="font-size:1.1rem">' + r.balance + "</strong></li>";
      }).join("") + "</ul></div>";

    html += '<div class="section-title">' + esc(t("movie.history")) + "</div>" +
      '<div class="card">' + (s.movieNights.length
        ? s.movieNights.slice(0, 8).map(function (m) {
            return '<div class="kv"><span class="k">' + esc(U.fmtDate(m.ts)) + "</span><span>🍿 " +
              esc(m.movie) + " · " + esc(nameOf(m.winnerId)) + "</span></div>";
          }).join("")
        : '<p class="muted">' + esc(t("movie.empty")) + "</p>") + "</div>";

    html += '<div class="section-title">' + esc(t("outing.history")) + "</div>" +
      '<div class="card">' + (s.outings.length
        ? s.outings.slice(0, 8).map(function (o) {
            return '<div class="kv"><span class="k">' + esc(U.fmtDate(o.ts)) + "</span><span>🎡 " +
              U.trHtml(o, "label") + " · " + esc(nameOf(o.chooserId)) + "</span></div>";
          }).join("")
        : '<p class="muted">' + esc(t("outing.empty")) + "</p>") + "</div>";

    return html + "</div>";
  }

  function nameOf(id) { var c = S.child(id); return c ? c.name : "—"; }

  /* ================= notes ================= */

  function notesTab(c) {
    return '<div class="wrap"><h1>' + esc(t("nav.notes")) + "</h1>" +
      listCard(c, "notes", "📝 " + t("kids.notes"), t("kids.notesHint"), t("kids.addNote"), false, true) +
      listCard(c, "gifts", "🎁 " + t("kids.gifts"), t("kids.giftsHint"), t("kids.addGift"), false, false) +
      listCard(c, "outings", "🎡 " + t("kids.outings"), t("kids.outingsHint"), t("kids.addOuting"), true, false) +
      "</div>";
  }

  function listCard(child, field, title, hint, addLabel, ordered, multiline) {
    var items = child[field] || [];
    return '<div class="section-title">' + esc(title) + "</div>" +
      '<div class="card">' +
        '<small>' + esc(hint) + "</small>" +
        '<form data-act="c.itemAdd" data-field="' + field + '" class="row tight nowrap mt">' +
          (multiline
            ? '<textarea name="text" class="grow" placeholder="' + esc(addLabel) + '" style="min-height:64px"></textarea>'
            : '<input type="text" name="text" class="grow" placeholder="' + esc(addLabel) + '">') +
          '<button class="btn small" type="submit">＋</button>' +
        "</form>" +
        (items.length
          ? '<ul class="list" style="margin-top:10px">' + items.map(function (it, i) {
              return "<li>" + (ordered ? '<span class="rank-badge">' + (i + 1) + "</span>" : "") +
                '<div class="grow"><div class="title" style="white-space:pre-wrap">' + U.trHtml(it, "text") + "</div>" +
                '<div class="sub">' + esc(U.fmtDate(it.ts)) + "</div></div>" +
                (ordered && i > 0 ? '<button class="icon-btn" data-act="c.itemMove" data-field="' + field +
                  '" data-item="' + it.id + '" data-dir="-1" aria-label="' + esc(t("kids.moveUp")) + '">↑</button>' : "") +
                '<button class="icon-btn" data-act="c.itemRemove" data-field="' + field +
                  '" data-item="' + it.id + '">🗑️</button></li>';
            }).join("") + "</ul>"
          : '<p class="muted">' + esc(t("common.empty")) + "</p>") +
      "</div>";
  }

  /* ================= actions ================= */

  U.on("c.claim", function (d) {
    var c = me();
    S.claimTask(c.id, d.id);
    U.toast(t("tasks.claimSent"), "good");
    global.App.refresh();
  });
  U.on("c.itemAdd", function (d, form) {
    var input = form.querySelector('[name="text"]');
    var text = input.value.trim();
    if (!text) return;
    S.addListItem(me().id, d.field, text);
    input.value = "";
    global.App.refresh();
  });
  U.on("c.itemRemove", function (d) {
    S.removeListItem(me().id, d.field, d.item);
    global.App.refresh();
  });
  U.on("c.itemMove", function (d) {
    S.moveListItem(me().id, d.field, d.item, S.num(d.dir));
    global.App.refresh();
  });

  global.ChildView = { render: render };
})(window);
