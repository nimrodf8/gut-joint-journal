/* Parent (admin) screens: dashboard, tasks, kids, approvals, settings. */
(function (global) {
  "use strict";

  var t = function (k, p) { return global.I18N.t(k, p); };
  var esc = function (s) { return global.UI.esc(s); };
  var U = global.UI, S = global.Store;

  var showInactive = false;
  var taskDraft = null;
  var awardCtx = null;

  function me() { return S.parent(global.App.session().id); }

  function render(tab, params) {
    if (tab === "dashboard") return dashboard();
    if (tab === "tasks") return tasksTab();
    if (tab === "kids") return params && params.childId ? childDetail(params.childId) : kidsTab();
    if (tab === "approvals") return approvalsTab();
    return familyTab();
  }

  /* ================= dashboard ================= */

  function dashboard() {
    var s = S.get();
    var gp = S.goalProgress();
    var rows = S.standings();
    var pending = S.pendingClaims();

    var html = '<div class="wrap">';

    html += '<div class="card hero">' +
      '<div class="eyebrow">' + esc(t("dash.groupBank")) + "</div>" +
      '<div class="row between nowrap"><div class="score">' + gp.total + "</div>" +
      '<div class="tag" style="background:rgba(255,255,255,.2);color:#fff">' + esc(t("dash.goal", { n: U.iso(gp.goal) })) + "</div></div>" +
      U.progressBar(gp.pct) +
      (gp.reached
        ? '<p style="margin-top:6px">🎉 ' + esc(t("dash.goalReached")) + "</p>" +
          '<button class="btn ghost block mt" data-act="p.redeem">' + esc(t("dash.redeem")) + "</button>"
        : '<small>' + esc(t("outing.needMore", { n: U.iso(gp.missing) })) + "</small>") +
    "</div>";

    if (pending.length) {
      html += '<div class="card tappable" data-act="p.goApprovals">' +
        '<div class="row between"><strong>🔔 ' + esc(t("dash.pending", { n: U.iso(pending.length) })) + "</strong><span>→</span></div></div>";
    }

    html += movieCard();

    html += '<div class="section-title">' + esc(t("dash.standings")) + "</div>";
    html += '<div class="card flush">' + (rows.length
      ? '<ul class="list">' + rows.map(function (r, i) {
          return '<li class="tappable" data-act="p.openChild" data-id="' + r.child.id + '">' +
            '<span class="rank-badge' + (i === 0 && r.earned > 0 ? " gold" : "") + '">' + (i + 1) + "</span>" +
            U.avatar(r.child.avatar, 40) +
            '<div class="grow"><div class="title">' + esc(r.child.name) + "</div>" +
            '<div class="sub">' + esc(t("dash.earnedThisWeek", { n: U.signed(r.earned) })) + "</div></div>" +
            '<strong class="score" style="font-size:1.15rem">' + r.balance + "</strong></li>";
        }).join("") + "</ul>"
      : U.emptyState(t("common.empty"), "🧒")) + "</div>";

    html += birthdaysCard();
    html += activityCard();
    html += "</div>";
    return html;
  }

  function movieCard() {
    var s = S.get();
    var winner = S.weekWinner();
    var todays = S.movieNightToday();
    var isDay = S.isMovieDay();
    // whatever is already shown as tonight's pick should not repeat in history
    var history = s.movieNights.filter(function (m) {
      return !todays || m.id !== todays.id;
    }).slice(0, 3);

    if (!isDay && !history.length && !todays) return "";

    var body = "";
    if (todays) {
      body = "<p><strong>🍿 " + esc(todays.movie) + "</strong><br><small>" +
        esc(t("movie.pickedBy", { name: nameOf(todays.winnerId) })) + "</small></p>";
    } else if (isDay && winner) {
      body = "<p>" + esc(t("movie.winner", { name: winner.child.name })) + "</p>" +
        '<button class="btn block" data-act="p.movie">' + esc(t("movie.record")) + "</button>";
    } else if (isDay) {
      body = '<p class="lead">' + esc(t("movie.noWinner")) + "</p>";
    }

    var past = history.length
      ? '<div class="section-title" style="margin-top:14px">' + esc(t("movie.history")) + "</div>" +
        history.map(function (m) {
          return '<div class="kv"><span class="k">' + esc(U.fmtDate(m.ts)) + "</span><span>" +
            esc(m.movie) + " · " + esc(nameOf(m.winnerId)) + "</span></div>";
        }).join("")
      : "";

    return '<div class="card">' +
      '<div class="eyebrow">' + esc(t("movie.title")) + (isDay ? " · " + esc(t("movie.tonight")) : "") + "</div>" +
      body + past + "</div>";
  }

  function birthdaysCard() {
    var s = S.get();
    var rows = s.children.map(function (c) { return { child: c, bd: S.birthdayInfo(c) }; })
      .filter(function (r) { return r.bd; })
      .sort(function (a, b) { return a.bd.days - b.bd.days; });
    if (!rows.length) return "";
    return '<div class="section-title">' + esc(t("dash.birthdays")) + "</div>" +
      '<div class="card">' + rows.map(function (r) {
        var label = r.bd.days === 0 ? t("dash.birthdayToday")
                  : r.bd.days === 1 ? t("dash.tomorrow")
                  : t("dash.daysLeft", { n: r.bd.days });
        return '<div class="countdown' + (r.bd.days === 0 ? " today" : "") + '">' +
          '<span class="days">' + (r.bd.days === 0 ? "🎂" : r.bd.days) + "</span>" +
          U.avatar(r.child.avatar, 36) +
          '<div class="grow"><div class="title">' + esc(r.child.name) + "</div>" +
          '<div class="sub">' + esc(label) + " · " + esc(t("dash.turns", { n: r.bd.turning })) + "</div></div></div>";
      }).join("") + "</div>";
  }

  function activityCard() {
    var s = S.get();
    var rows = s.ledger.slice().reverse().filter(function (l) { return l.kind !== "start"; }).slice(0, 8);
    if (!rows.length) return "";
    return '<div class="section-title">' + esc(t("dash.activity")) + "</div>" +
      '<div class="card flush"><ul class="list">' + rows.map(function (l) {
        return "<li>" + (l.childId ? U.avatar((S.child(l.childId) || {}).avatar, 34) : '<span class="rank-badge">👨‍👩‍👧</span>') +
          '<div class="grow"><div class="title">' + ledgerLabelHtml(l) + "</div>" +
          '<div class="sub">' + esc(l.childId ? nameOf(l.childId) : t("outing.title")) + " · " + esc(U.relTime(l.ts)) + "</div></div>" +
          '<div class="pts-cell">' + (l.self ? U.points(l.self) : "") +
          (l.group ? '<small>' + esc(t("tasks.groupPts")) + " " + U.points(l.group) + "</small>" : "") + "</div></li>";
      }).join("") + "</ul></div>";
  }

  function ledgerLabel(l) {
    if (l.kind === "award" || l.kind === "penalty") {
      var task = S.task(l.taskId);
      return (task ? U.taskTitle(task) : t(l.kind === "award" ? "ledger.award" : "ledger.penalty"));
    }
    if (l.kind === "redeem") return t("ledger.redeem") + (l.note ? " · " + l.note : "");
    if (l.kind === "start") return t("ledger.start");
    return l.note || t("ledger.manual");
  }
  function ledgerLabelHtml(l) {
    if (l.kind === "award" || l.kind === "penalty") {
      var task = S.task(l.taskId);
      return task ? U.taskTitleHtml(task) : esc(t(l.kind === "award" ? "ledger.award" : "ledger.penalty"));
    }
    if (l.kind === "redeem") return esc(t("ledger.redeem")) + (l.note ? " · " + esc(l.note) : "");
    if (l.kind === "start") return esc(t("ledger.start"));
    return l.note ? U.trHtml(l, "note") : esc(t("ledger.manual"));
  }
  function nameOf(childId) { var c = S.child(childId); return c ? c.name : "—"; }

  /* ================= tasks ================= */

  function tasksTab() {
    var s = S.get();
    var html = '<div class="wrap">' +
      '<div class="row between"><h1>' + esc(t("tasks.title")) + "</h1>" +
      '<button class="btn small" data-act="p.taskNew">＋ ' + esc(t("tasks.add")) + "</button></div>" +
      '<label class="row tight" style="font-size:.85rem;color:var(--ink-soft)">' +
        '<input type="checkbox" style="width:auto" ' + (showInactive ? "checked" : "") +
        ' data-act="p.toggleInactive"> ' + esc(t("tasks.showInactive")) + "</label>";

    s.categories.forEach(function (cat) {
      var list = s.tasks.filter(function (t2) {
        return t2.categoryId === cat.id && (showInactive || t2.active);
      });
      if (!list.length) return;
      html += '<div class="section-title">' + cat.icon + " " + U.categoryNameHtml(cat) + "</div>" +
        '<div class="card flush">' + list.map(taskRow).join("") + "</div>";
    });

    var orphans = s.tasks.filter(function (t2) {
      return !S.category(t2.categoryId) && (showInactive || t2.active);
    });
    if (orphans.length) {
      html += '<div class="section-title">' + esc(t("cat.other")) + "</div>" +
        '<div class="card flush">' + orphans.map(taskRow).join("") + "</div>";
    }
    if (!s.tasks.length) html += U.emptyState(t("tasks.empty"), "📋");
    return html + "</div>";
  }

  function taskRow(task) {
    var scopeTag = task.scope === "both" ? t("tasks.scopeBoth")
                 : task.scope === "group" ? t("tasks.scopeGroup") : t("tasks.scopePersonal");
    var assignTag = task.assign === "all" ? t("tasks.assignAll")
      : (task.assignIds || []).map(nameOf).join(", ");
    var pts = "";
    if (task.scope !== "group") {
      pts += '<div class="sub">' + esc(t("tasks.selfPts")) + " " +
        U.points(task.onDoneSelf) + " / " + U.points(task.onMissSelf) + "</div>";
    }
    if (task.scope !== "personal") {
      pts += '<div class="sub">' + esc(t("tasks.groupPts")) + " " +
        U.points(task.onDoneGroup) + " / " + U.points(task.onMissGroup) + "</div>";
    }

    return '<div class="task-row' + (task.active ? "" : " paused") + '">' +
      '<div class="grow">' +
        '<div class="title">' + U.taskTitleHtml(task) + "</div>" +
        '<div class="sub">' + esc(scopeTag) + " · " + esc(assignTag) + " · " + esc(t("tasks.repeat" + cap(task.repeat))) +
        (task.active ? "" : " · " + esc(t("tasks.inactive"))) + "</div>" +
        pts +
      "</div>" +
      '<div class="row tight nowrap">' +
        '<button class="btn small good" data-act="p.award" data-id="' + task.id + '" data-outcome="done">✓</button>' +
        '<button class="btn small danger" data-act="p.award" data-id="' + task.id + '" data-outcome="missed">✗</button>' +
        '<button class="icon-btn" data-act="p.taskEdit" data-id="' + task.id + '">✏️</button>' +
      "</div></div>";
  }

  function cap(s) { return String(s || "once").charAt(0).toUpperCase() + String(s || "once").slice(1); }

  function taskEditor(task) {
    var s = S.get();
    taskDraft = task ? S.clone(task) : {
      id: "", title: "", titleKey: "", categoryId: s.categories[0] ? s.categories[0].id : "cat_other",
      scope: "personal", onDoneSelf: 10, onMissSelf: -5, onDoneGroup: 0, onMissGroup: 0,
      assign: "all", assignIds: [], repeat: "daily", active: true
    };
    U.modal(task ? t("tasks.edit") : t("tasks.add"), taskEditorBody());
  }

  function taskEditorBody() {
    var s = S.get();
    var d = taskDraft;
    var withSelf = d.scope !== "group";
    var withGroup = d.scope !== "personal";

    return '<form data-act="p.taskSave">' +
      '<div class="field"><label for="tTitle">' + esc(t("tasks.name")) + "</label>" +
        '<input id="tTitle" type="text" value="' + esc(d.titleKey ? t(d.titleKey) : d.title) + '"></div>' +
      '<div class="grid-2">' +
        '<div class="field"><label for="tCat">' + esc(t("tasks.category")) + "</label><select id=\"tCat\">" +
          s.categories.map(function (c) {
            return '<option value="' + c.id + '"' + (c.id === d.categoryId ? " selected" : "") + ">" +
              c.icon + " " + esc(U.categoryName(c)) + "</option>";
          }).join("") + "</select></div>" +
        '<div class="field"><label for="tRep">' + esc(t("tasks.repeat")) + "</label><select id=\"tRep\">" +
          ["daily", "weekly", "once"].map(function (r) {
            return '<option value="' + r + '"' + (r === d.repeat ? " selected" : "") + ">" + esc(t("tasks.repeat" + cap(r))) + "</option>";
          }).join("") + "</select></div>" +
      "</div>" +
      '<div class="field"><span class="field-label">' + esc(t("tasks.scope")) + "</span>" +
        '<div class="seg">' + ["personal", "group", "both"].map(function (sc) {
          return '<button type="button" class="' + (d.scope === sc ? "on" : "") + '" data-act="p.taskScope" data-scope="' + sc + '">' +
            esc(t("tasks.scope" + cap(sc))) + "</button>";
        }).join("") + "</div></div>" +
      (withSelf ? '<div class="field"><span class="field-label">' + esc(t("tasks.selfPts")) + "</span>" +
        '<div class="grid-2 keep">' +
          '<div><small>' + esc(t("tasks.onDone")) + '</small><input id="tDoneSelf" type="number" value="' + S.num(d.onDoneSelf) + '"></div>' +
          '<div><small>' + esc(t("tasks.onMiss")) + '</small><input id="tMissSelf" type="number" value="' + S.num(d.onMissSelf) + '"></div>' +
        '</div><div class="hint">' + esc(t("tasks.hint")) + "</div></div>" : "") +
      (withGroup ? '<div class="field"><span class="field-label">' + esc(t("tasks.groupPts")) + "</span>" +
        '<div class="grid-2 keep">' +
          '<div><small>' + esc(t("tasks.onDone")) + '</small><input id="tDoneGroup" type="number" value="' + S.num(d.onDoneGroup) + '"></div>' +
          '<div><small>' + esc(t("tasks.onMiss")) + '</small><input id="tMissGroup" type="number" value="' + S.num(d.onMissGroup) + '"></div>' +
        "</div></div>" : "") +
      '<div class="field"><span class="field-label">' + esc(t("tasks.assign")) + "</span>" +
        '<div class="seg mb">' +
          '<button type="button" class="' + (d.assign === "all" ? "on" : "") + '" data-act="p.taskAssign" data-mode="all">' + esc(t("tasks.assignAll")) + "</button>" +
          '<button type="button" class="' + (d.assign === "some" ? "on" : "") + '" data-act="p.taskAssign" data-mode="some">' + esc(t("tasks.assignSome")) + "</button>" +
        "</div>" +
        (d.assign === "some" ? '<div class="chips">' + s.children.map(function (c) {
          var on = (d.assignIds || []).indexOf(c.id) !== -1;
          return '<button type="button" class="chip' + (on ? " on" : "") + '" data-act="p.taskChild" data-id="' + c.id + '">' +
            esc(c.name) + "</button>";
        }).join("") + "</div>" : "") +
      "</div>" +
      '<label class="row tight"><input type="checkbox" id="tActive" style="width:auto" ' + (d.active ? "checked" : "") + "> " +
        esc(t("tasks.active")) + "</label>" +
      '<div class="row gap mt">' +
        (d.id ? '<button type="button" class="btn danger small" data-act="p.taskDelete" data-id="' + d.id + '">🗑️</button>' : "") +
        '<button class="btn grow" type="submit">' + esc(t("common.save")) + "</button>" +
      "</div></form>";
  }

  function captureTask() {
    var v = function (id) { var n = U.el("#" + id); return n ? n.value : null; };
    if (v("tTitle") !== null) taskDraft.title = v("tTitle").trim();
    if (v("tCat") !== null) taskDraft.categoryId = v("tCat");
    if (v("tRep") !== null) taskDraft.repeat = v("tRep");
    if (v("tDoneSelf") !== null) taskDraft.onDoneSelf = S.num(v("tDoneSelf"));
    if (v("tMissSelf") !== null) taskDraft.onMissSelf = S.num(v("tMissSelf"));
    if (v("tDoneGroup") !== null) taskDraft.onDoneGroup = S.num(v("tDoneGroup"));
    if (v("tMissGroup") !== null) taskDraft.onMissGroup = S.num(v("tMissGroup"));
    var a = U.el("#tActive");
    if (a) taskDraft.active = a.checked;
  }
  function redrawTaskEditor() {
    captureTask();
    var body = U.el(".modal-body");
    if (body) body.innerHTML = taskEditorBody();
  }

  /* ================= kids ================= */

  function kidsTab() {
    var s = S.get();
    var html = '<div class="wrap"><div class="row between"><h1>' + esc(t("kids.title")) + "</h1>" +
      '<button class="btn small" data-act="p.childNew">＋ ' + esc(t("kids.add")) + "</button></div>";
    html += s.children.length
      ? '<div class="card flush"><ul class="list">' + s.children.map(function (c) {
          return '<li class="tappable" data-act="p.openChild" data-id="' + c.id + '">' +
            U.avatar(c.avatar, 44) +
            '<div class="grow"><div class="title">' + esc(c.name) + "</div>" +
            '<div class="sub">' + esc(t("kids.week")) + " " + U.points(S.weekEarned(c.id)) +
            " · " + esc(t("lang." + (c.lang || S.get().settings.lang))) + "</div></div>" +
            '<strong class="score" style="font-size:1.15rem">' + S.balance(c.id) + "</strong></li>";
        }).join("") + "</ul></div>"
      : U.emptyState(t("common.empty"), "🧒");
    return html + "</div>";
  }

  function childDetail(childId) {
    var c = S.child(childId);
    if (!c) return kidsTab();
    var bd = S.birthdayInfo(c);
    var rank = S.standings().findIndex(function (r) { return r.child.id === c.id; }) + 1;

    var html = '<div class="wrap">' +
      '<button class="btn ghost small mb" data-act="p.backKids">← ' + esc(t("common.back")) + "</button>" +
      '<div class="card center">' + U.avatar(c.avatar, 76) +
        "<h1 style=\"margin-top:8px\">" + esc(c.name) + "</h1>" +
        '<div class="score" style="font-size:2.4rem">' + S.balance(c.id) + "</div>" +
        '<small>' + esc(t("kids.balance")) + " · " + esc(t("common.rank")) + " " + rank + "</small>" +
        '<div class="row gap mt" style="justify-content:center">' +
          '<button class="btn good small" data-act="p.adjust" data-id="' + c.id + '" data-sign="1">＋ ' + esc(t("common.points")) + "</button>" +
          '<button class="btn danger small" data-act="p.adjust" data-id="' + c.id + '" data-sign="-1">－ ' + esc(t("common.points")) + "</button>" +
          '<button class="btn ghost small" data-act="p.childEdit" data-id="' + c.id + '">✏️ ' + esc(t("kids.profile")) + "</button>" +
        "</div>" +
        '<div class="row gap mt" style="justify-content:center">' +
          '<span class="tag">' + esc(t("kids.week")) + " " + esc(U.signed(S.weekEarned(c.id))) + "</span>" +
          (bd ? '<span class="tag brand">🎂 ' + esc(bd.days === 0 ? t("dash.birthdayToday") : t("dash.daysLeft", { n: U.iso(bd.days) })) + "</span>" : "") +
          (bd ? '<span class="tag">' + esc(t("kids.age", { n: U.iso(bd.age) })) + "</span>" : "") +
        "</div>" +
      "</div>";

    html += listCard(c, "gifts", "🎁 " + t("kids.gifts"), t("kids.giftsHint"), t("kids.addGift"), false);
    html += listCard(c, "outings", "🎡 " + t("kids.outings"), t("kids.outingsHint"), t("kids.addOuting"), true);
    html += listCard(c, "notes", "📝 " + t("kids.notes"), t("kids.notesHint"), t("kids.addNote"), false);

    var entries = S.get().ledger.filter(function (l) { return l.childId === c.id; }).slice().reverse();
    html += '<div class="section-title">' + esc(t("kids.history")) + "</div>" +
      '<div class="card flush">' + (entries.length
        ? '<ul class="list">' + entries.slice(0, 40).map(function (l) {
            return "<li><div class=\"grow\"><div class=\"title\">" + ledgerLabelHtml(l) + "</div>" +
              '<div class="sub">' + esc(U.fmtDateTime(l.ts)) + (l.by && S.parent(l.by) ? " · " + esc(S.parent(l.by).name) : "") + "</div></div>" +
              '<div class="pts-cell">' + U.points(l.self) +
              (l.group ? "<small>" + esc(t("tasks.groupPts")) + " " + U.points(l.group) + "</small>" : "") + "</div></li>";
          }).join("") + "</ul>"
        : U.emptyState(t("kids.noHistory"), "📈")) + "</div>";

    html += '<button class="btn danger block mt" data-act="p.childDelete" data-id="' + c.id + '">' +
      esc(t("common.remove")) + " " + esc(c.name) + "</button>";
    return html + "</div>";
  }

  function listCard(child, field, title, hint, addLabel, ordered) {
    var items = child[field] || [];
    return '<div class="section-title">' + esc(title) + "</div>" +
      '<div class="card">' +
        '<small>' + esc(hint) + "</small>" +
        (items.length
          ? '<ul class="list" style="margin-top:8px">' + items.map(function (it, i) {
              return "<li>" + (ordered ? '<span class="rank-badge">' + (i + 1) + "</span>" : "") +
                '<div class="grow"><div class="title" style="white-space:pre-wrap">' + U.trHtml(it, "text") + "</div>" +
                '<div class="sub">' + esc(U.fmtDate(it.ts)) + "</div></div>" +
                (ordered ? '<button class="icon-btn" data-act="p.itemMove" data-id="' + child.id + '" data-field="' + field +
                  '" data-item="' + it.id + '" data-dir="-1" aria-label="' + esc(t("kids.moveUp")) + '">↑</button>' : "") +
                '<button class="icon-btn" data-act="p.itemRemove" data-id="' + child.id + '" data-field="' + field +
                  '" data-item="' + it.id + '">🗑️</button></li>';
            }).join("") + "</ul>"
          : '<p class="muted">' + esc(t("common.empty")) + "</p>") +
        '<form data-act="p.itemAdd" data-id="' + child.id + '" data-field="' + field + '" class="row tight nowrap mt">' +
          '<input type="text" class="grow" name="text" placeholder="' + esc(addLabel) + '">' +
          '<button class="btn small" type="submit">＋</button>' +
        "</form>" +
      "</div>";
  }

  function childEditor(child) {
    var isNew = !child;
    var c = child || { id: "", name: "", avatar: nextFreeAvatar(), birthday: "", pin: null };
    U.modal(isNew ? t("kids.add") : t("kids.profile"),
      '<form data-act="p.childSave" data-id="' + (c.id || "") + '">' +
        '<div class="field"><label for="cnName">' + esc(t("setup.childName")) + "</label>" +
          '<input id="cnName" type="text" value="' + esc(c.name) + '"></div>' +
        '<div class="grid-2">' +
          '<div class="field"><label for="cnBday">' + esc(t("setup.birthday")) + "</label>" +
            '<input id="cnBday" type="date" value="' + esc(c.birthday || "") + '"></div>' +
          '<div class="field"><label for="cnPin">' + esc(t("kids.pin")) + " <small>(" + esc(t("common.optional")) + ")</small></label>" +
            '<input id="cnPin" type="tel" inputmode="numeric" maxlength="4" class="pin-input" placeholder="' +
              (c.pin ? "••••" : "") + '"><div class="hint">' + esc(t("setup.pinHelp")) + "</div></div>" +
        "</div>" +
        '<div class="field"><span class="field-label">' + esc(t("tr.childLang")) + "</span>" +
          langChips(c.lang || S.get().settings.lang, "p.childLang") + "</div>" +
        '<div class="field"><span class="field-label">' + esc(t("common.avatar")) + "</span>" +
          U.avatarPicker(global.AVATARS.kids, c.avatar, "p.childAvatar") + "</div>" +
        '<button class="btn block" type="submit">' + esc(t("common.save")) + "</button>" +
      "</form>");
    editingAvatar = c.avatar;
    editingLang = c.lang || S.get().settings.lang;
  }
  var editingAvatar = "k1";
  var editingLang = "en";
  function nextFreeAvatar() {
    var used = S.get().children.map(function (c) { return c.avatar; });
    var free = global.AVATARS.kids.filter(function (a) { return used.indexOf(a.id) === -1; })[0];
    return free ? free.id : "k1";
  }

  /* ================= approvals ================= */

  function approvalsTab() {
    var pending = S.pendingClaims();
    var html = '<div class="wrap"><h1>' + esc(t("appr.title")) + "</h1>";
    if (!pending.length) return html + U.emptyState(t("appr.empty"), "✅") + "</div>";

    html += '<div class="card flush"><ul class="list">' + pending.map(function (cl) {
      var c = S.child(cl.childId), task = S.task(cl.taskId);
      if (!c || !task) return "";
      return "<li>" + U.avatar(c.avatar, 40) +
        '<div class="grow"><div class="title">' + U.taskTitleHtml(task) + "</div>" +
        '<div class="sub">' + esc(c.name) + " · " + esc(t("appr.claimedAt", { when: U.relTime(cl.ts) })) + "</div>" +
        '<div class="sub">' + (task.scope !== "group" ? U.points(task.onDoneSelf) : "") +
          (task.scope !== "personal" ? " <small>" + esc(t("tasks.groupPts")) + "</small> " + U.points(task.onDoneGroup) : "") + "</div></div>" +
        '<div class="row tight nowrap">' +
          '<button class="btn small good" data-act="p.claim" data-id="' + cl.id + '" data-ok="1">✓</button>' +
          '<button class="btn small ghost" data-act="p.claim" data-id="' + cl.id + '" data-ok="0">✗</button>' +
        "</div></li>";
    }).join("") + "</ul></div>";
    return html + "</div>";
  }

  /* ================= family settings ================= */

  function familyTab() {
    var s = S.get();
    var html = '<div class="wrap"><h1>' + esc(t("family.title")) + "</h1>";

    var mine = me();
    html += '<form data-act="p.settingsSave" class="card">' +
      '<div class="field"><label for="sName">' + esc(t("setup.familyName")) + "</label>" +
        '<input id="sName" type="text" value="' + esc(s.settings.familyName) + '"></div>' +
      '<div class="field"><span class="field-label">' + esc(t("tr.yourLang")) + "</span>" +
        langChips(mine.lang || s.settings.lang, "p.myLang") +
        '<div class="hint">' + esc(t("tr.userLangHint")) + "</div></div>" +
      '<div class="field"><span class="field-label">' + esc(t("tr.defaultLang")) + "</span>" +
        langChips(s.settings.lang, "p.lang") + "</div>" +
      '<div class="field"><label for="sGoal">' + esc(t("family.goal")) + "</label>" +
        '<input id="sGoal" type="number" min="1" value="' + S.num(s.settings.groupGoal) + '">' +
        '<div class="hint">' + esc(t("family.goalHint")) + "</div></div>" +
      '<div class="grid-2">' +
        '<div class="field"><label for="sWeek">' + esc(t("family.weekStart")) + "</label><select id=\"sWeek\">" +
          [0, 1, 2, 3, 4, 5, 6].map(function (d) {
            return '<option value="' + d + '"' + (d === S.num(s.settings.weekStart) ? " selected" : "") + ">" + esc(U.weekdayName(d)) + "</option>";
          }).join("") + "</select></div>" +
        '<div class="field"><label for="sMovie">' + esc(t("family.movieDay")) + "</label><select id=\"sMovie\">" +
          [0, 1, 2, 3, 4, 5, 6].map(function (d) {
            return '<option value="' + d + '"' + (d === S.num(s.settings.movieDay) ? " selected" : "") + ">" + esc(U.weekdayName(d)) + "</option>";
          }).join("") + '</select><div class="hint">' + esc(t("family.movieDayHint")) + "</div></div>" +
      "</div>" +
      '<button class="btn block" type="submit">' + esc(t("common.save")) + "</button></form>";

    html += '<div class="section-title">' + esc(t("family.parents")) +
      '<button class="btn small soft" data-act="p.parentNew">＋</button></div>' +
      '<div class="card flush"><ul class="list">' + s.parents.map(function (p) {
        return "<li>" + U.avatar(p.avatar, 40) +
          '<div class="grow"><div class="title">' + esc(p.name) + "</div>" +
          '<div class="sub">' + esc(p.username) + " · " + esc(t("lang." + (p.lang || s.settings.lang))) + "</div></div>" +
          '<button class="icon-btn" data-act="p.parentPass" data-id="' + p.id + '">🔑</button>' +
          (s.parents.length > 1 ? '<button class="icon-btn" data-act="p.parentDelete" data-id="' + p.id + '">🗑️</button>' : "") +
          "</li>";
      }).join("") + "</ul></div>";

    html += '<div class="section-title">' + esc(t("family.categories")) +
      '<button class="btn small soft" data-act="p.catNew">＋</button></div>' +
      '<div class="card flush"><ul class="list">' + s.categories.map(function (c) {
        return "<li><span class=\"rank-badge\">" + c.icon + "</span>" +
          '<div class="grow"><div class="title">' + U.categoryNameHtml(c) + "</div>" +
          '<div class="sub">' + s.tasks.filter(function (t2) { return t2.categoryId === c.id; }).length + " " + esc(t("tasks.title")) + "</div></div>" +
          '<button class="icon-btn" data-act="p.catDelete" data-id="' + c.id + '">🗑️</button></li>';
      }).join("") + "</ul></div>";

    html += '<div class="section-title">' + esc(t("outing.history")) + "</div>" +
      '<div class="card">' + (s.outings.length
        ? s.outings.map(function (o) {
            return '<div class="kv"><span class="k">' + esc(U.fmtDate(o.ts)) + "</span><span>" +
              U.trHtml(o, "label") + " · " + esc(nameOf(o.chooserId)) + "</span></div>";
          }).join("")
        : '<p class="muted">' + esc(t("outing.empty")) + "</p>") + "</div>";

    html += translationCard();

    html += '<div class="section-title">' + esc(t("family.data")) + "</div>" +
      '<div class="card stack">' +
        '<button class="btn ghost block" data-act="p.export">⬇️ ' + esc(t("family.export")) + "</button>" +
        '<label class="btn ghost block" style="cursor:pointer">⬆️ ' + esc(t("family.import")) +
          '<input type="file" accept="application/json,.json" id="importFile" style="display:none"></label>' +
        '<button class="btn danger block" data-act="p.reset">🗑️ ' + esc(t("family.reset")) + "</button>" +
        '<small>' + esc(t("family.aboutText")) + "</small>" +
      "</div>";

    return html + "</div>";
  }

  function langChips(active, action, extra) {
    return '<div class="chips">' + global.I18N.langs.map(function (l) {
      return '<button type="button" class="chip' + (l.code === active ? " on" : "") +
        '" data-act="' + action + '" data-lang="' + l.code + '"' + (extra || "") + ">" +
        l.flag + " " + esc(l.label) + "</button>";
    }).join("") + "</div>";
  }

  function translationCard() {
    var s = S.get();
    var on = s.settings.translate !== false;
    var st = global.Translate.status();
    var line = !st.supported ? t("tr.unsupported")
             : st.state === "working" ? t("tr.working")
             : st.state === "needs-download" ? t("tr.prepare")
             : t("tr.ready");

    return '<div class="section-title">' + esc(t("tr.title")) + "</div>" +
      '<div class="card">' +
        '<small>' + esc(t("tr.hint")) + "</small>" +
        '<label class="row tight mt"><input type="checkbox" style="width:auto"' + (on ? " checked" : "") +
          ' data-act="p.trToggle"> ' + esc(t("tr.enabled")) + "</label>" +
        '<div class="kv"><span class="k">' + esc(t("common.status")) + "</span><span>" +
          (st.supported ? "" : "⚠️ ") + esc(line) + "</span></div>" +
        (st.supported && on
          ? '<button class="btn ghost block mt" data-act="p.trPrepare">⬇️ ' + esc(t("tr.prepare")) + "</button>"
          : "") +
        '<div class="hint">' + esc(t("tr.privacy")) + "</div>" +
      "</div>";
  }

  /* ================= actions ================= */

  U.on("p.goApprovals", function () { global.App.go({ tab: "approvals" }); });
  U.on("p.openChild", function (d) { global.App.go({ tab: "kids", params: { childId: d.id } }); });
  U.on("p.backKids", function () { global.App.go({ tab: "kids", params: {} }); });
  U.on("p.toggleInactive", function (d, node) { showInactive = node.checked; global.App.refresh(); });

  U.on("p.taskNew", function () { taskEditor(null); });
  U.on("p.taskEdit", function (d) { taskEditor(S.task(d.id)); });
  U.on("p.taskScope", function (d) { taskDraft.scope = d.scope; redrawTaskEditor(); });
  U.on("p.taskAssign", function (d) { taskDraft.assign = d.mode; redrawTaskEditor(); });
  U.on("p.taskChild", function (d) {
    captureTask();
    var ids = taskDraft.assignIds || [];
    var i = ids.indexOf(d.id);
    if (i === -1) ids.push(d.id); else ids.splice(i, 1);
    taskDraft.assignIds = ids;
    redrawTaskEditor();
  });
  U.on("p.taskSave", function () {
    captureTask();
    if (!taskDraft.title) { U.toast(t("common.required"), "bad"); return; }
    if (taskDraft.assign === "some" && !(taskDraft.assignIds || []).length) taskDraft.assign = "all";
    // A renamed seed task keeps the literal title instead of the translation key.
    if (taskDraft.titleKey && taskDraft.title !== t(taskDraft.titleKey)) taskDraft.titleKey = "";
    if (taskDraft.titleKey) taskDraft.title = "";
    S.saveTask(taskDraft);
    U.closeModal();
    U.toast(t("common.saved"), "good");
    global.App.refresh();
  });
  U.on("p.taskDelete", function (d) {
    U.confirmDialog(t("tasks.deleteConfirm"), function () {
      S.deleteTask(d.id);
      U.toast(t("common.saved"), "good");
      global.App.refresh();
    });
  });

  U.on("p.award", function (d) {
    var task = S.task(d.id);
    if (!task) return;
    var kids = S.get().children.filter(function (c) {
      return task.assign === "all" || (task.assignIds || []).indexOf(c.id) !== -1;
    });
    if (!kids.length) return U.toast(t("common.empty"), "bad");
    if (kids.length === 1) return applyAward(kids[0].id, task, d.outcome);
    awardCtx = { taskId: task.id, outcome: d.outcome };
    U.modal(t("tasks.pickChild"),
      '<p class="lead">' + esc(U.taskTitle(task)) + " · " +
        esc(d.outcome === "done" ? t("tasks.markDone") : t("tasks.markMissed")) + "</p>" +
      '<div class="kid-grid">' + kids.map(function (c) {
        return '<button class="kid-card" data-act="p.awardPick" data-id="' + c.id + '">' +
          U.avatar(c.avatar, 52) + '<span class="nm">' + esc(c.name) + "</span></button>";
      }).join("") + "</div>");
  });
  U.on("p.awardPick", function (d) {
    var task = S.task(awardCtx.taskId);
    U.closeModal();
    applyAward(d.id, task, awardCtx.outcome);
  });
  function applyAward(childId, task, outcome) {
    var entry = S.awardTask(childId, task.id, outcome, me().id);
    var c = S.child(childId);
    U.toast(t("tasks.awarded", { name: c.name, sign: "", n: U.signed(entry.self) }),
      entry.self >= 0 ? "good" : "bad");
    global.App.refresh();
  }

  U.on("p.adjust", function (d) {
    var c = S.child(d.id);
    var sign = S.num(d.sign) < 0 ? -1 : 1;
    U.modal(t("kids.adjust") + " · " + c.name,
      '<form data-act="p.adjustSave" data-id="' + c.id + '" data-sign="' + sign + '">' +
        '<div class="field"><label for="aAmount">' + esc(t("kids.amount")) + "</label>" +
          '<input id="aAmount" type="number" min="1" value="10"></div>' +
        '<div class="field"><label for="aReason">' + esc(t("kids.reason")) + "</label>" +
          '<input id="aReason" type="text"></div>' +
        '<label class="row tight"><input id="aGroup" type="checkbox" style="width:auto"> ' +
          esc(t("tasks.groupPts")) + "</label>" +
        '<button class="btn block mt" type="submit">' + esc(t("common.save")) + "</button>" +
      "</form>");
  });
  U.on("p.adjustSave", function (d, form) {
    var amount = Math.abs(S.num(U.el("#aAmount", form).value)) * S.num(d.sign);
    var reason = U.el("#aReason", form).value.trim();
    var toGroup = U.el("#aGroup", form).checked;
    S.adjust(d.id, toGroup ? 0 : amount, toGroup ? amount : 0, reason, me().id);
    U.closeModal();
    U.toast(t("common.saved"), "good");
    global.App.refresh();
  });

  U.on("p.childNew", function () { childEditor(null); });
  U.on("p.childEdit", function (d) { childEditor(S.child(d.id)); });
  U.on("p.childAvatar", function (d) {
    editingAvatar = d.avatar;
    U.els(".modal-body .avatar-pick").forEach(function (b) {
      b.classList.toggle("sel", b.dataset.avatar === d.avatar);
    });
  });
  U.on("p.childSave", function (d, form) {
    var name = U.el("#cnName", form).value.trim();
    if (!name) return U.toast(t("setup.errChildName"), "bad");
    var birthday = U.el("#cnBday", form).value;
    var pin = U.el("#cnPin", form).value.replace(/\D/g, "");
    if (pin && pin.length !== 4) return U.toast(t("setup.errPin"), "bad");
    if (d.id) {
      S.updateChild(d.id, { name: name, birthday: birthday, avatar: editingAvatar, lang: editingLang });
      if (pin) S.setChildPin(d.id, pin);
    } else {
      S.addChild({ name: name, birthday: birthday, avatar: editingAvatar, pin: pin, lang: editingLang }, me().id);
    }
    U.closeModal();
    U.toast(t("common.saved"), "good");
    global.App.refresh();
  });
  U.on("p.childDelete", function (d) {
    var c = S.child(d.id);
    U.confirmDialog(t("kids.deleteConfirm", { name: c.name }), function () {
      S.removeChild(d.id);
      global.App.go({ tab: "kids", params: {} });
    });
  });

  U.on("p.itemAdd", function (d, form) {
    var input = form.querySelector('input[name="text"]');
    var text = input.value.trim();
    if (!text) return;
    S.addListItem(d.id, d.field, text);
    input.value = "";
    global.App.refresh();
  });
  U.on("p.itemRemove", function (d) {
    S.removeListItem(d.id, d.field, d.item);
    global.App.refresh();
  });
  U.on("p.itemMove", function (d) {
    S.moveListItem(d.id, d.field, d.item, S.num(d.dir));
    global.App.refresh();
  });

  U.on("p.claim", function (d) {
    S.decideClaim(d.id, d.ok === "1", me().id);
    U.toast(d.ok === "1" ? t("appr.approved") : t("appr.rejected"), d.ok === "1" ? "good" : "");
    global.App.refresh();
  });

  U.on("p.movie", function () {
    var winner = S.weekWinner();
    if (!winner) return U.toast(t("movie.noWinner"), "bad");
    U.modal(t("movie.title"),
      '<div class="center">' + U.avatar(winner.child.avatar, 64) + "</div>" +
      '<p class="lead center">' + esc(t("movie.winner", { name: winner.child.name })) + "</p>" +
      '<form data-act="p.movieSave" data-id="' + winner.child.id + '">' +
        '<div class="field"><label for="mvName">' + esc(t("movie.movieName")) + "</label>" +
          '<input id="mvName" type="text"></div>' +
        '<div class="field"><label for="mvNote">' + esc(t("common.note")) + "</label>" +
          '<input id="mvNote" type="text"></div>' +
        '<button class="btn block" type="submit">' + esc(t("common.save")) + "</button>" +
      "</form>");
  });
  U.on("p.movieSave", function (d, form) {
    var movie = U.el("#mvName", form).value.trim();
    if (!movie) return U.toast(t("common.required"), "bad");
    S.recordMovieNight(d.id, movie, U.el("#mvNote", form).value.trim(), me().id);
    U.closeModal();
    U.toast(t("movie.recorded"), "good");
    global.App.refresh();
  });

  U.on("p.redeem", function () {
    var gp = S.goalProgress();
    if (!gp.reached) return U.toast(t("outing.needMore", { n: U.iso(gp.missing) }), "bad");
    var top = S.topScorer();
    if (!top) return;
    var wishes = top.child.outings || [];
    U.modal(t("outing.title"),
      '<div class="center">' + U.avatar(top.child.avatar, 64) + "</div>" +
      '<p class="lead center">' + esc(t("outing.chooser", { name: top.child.name })) + "</p>" +
      '<form data-act="p.redeemSave" data-id="' + top.child.id + '">' +
        (wishes.length
          ? '<div class="field"><span class="field-label">' + esc(t("kids.outings")) + "</span>" +
            '<div class="chips">' + wishes.map(function (w) {
              return '<button type="button" class="chip" data-act="p.pickWish" data-text="' + esc(w.text) + '">' + esc(w.text) + "</button>";
            }).join("") + "</div></div>"
          : '<p class="muted">' + esc(t("outing.noWishes")) + "</p>") +
        '<div class="field"><label for="ouName">' + esc(t("outing.pick")) + "</label>" +
          '<input id="ouName" type="text"></div>' +
        '<button class="btn block" type="submit">' + esc(t("dash.redeem")) + "</button>" +
      "</form>");
  });
  U.on("p.pickWish", function (d) { U.el("#ouName").value = d.text; });
  U.on("p.redeemSave", function (d, form) {
    var label = U.el("#ouName", form).value.trim();
    if (!label) return U.toast(t("common.required"), "bad");
    var goal = S.goalProgress().goal;
    if (!S.redeemOuting(d.id, label, "", me().id)) return U.toast(t("outing.needMore", { n: U.iso(S.goalProgress().missing) }), "bad");
    U.closeModal();
    U.toast(t("outing.redeemed", { n: U.iso(goal) }), "good");
    global.App.refresh();
  });

  U.on("p.lang", function (d) {
    S.get().settings.lang = d.lang;   // only the default for accounts made later
    S.save();
    global.App.refresh();
  });
  U.on("p.myLang", function (d) {
    S.setUserLang("parent", me().id, d.lang);
    global.I18N.setLang(d.lang);
    global.App.refresh();
  });
  U.on("p.childLang", function (d, node) {
    editingLang = d.lang;
    U.els(".modal-body [data-act='p.childLang']").forEach(function (b) { b.classList.remove("on"); });
    node.classList.add("on");
  });
  U.on("p.trToggle", function (d, node) {
    S.get().settings.translate = node.checked;
    S.save();
    global.App.refresh();
  });
  U.on("p.trPrepare", function () {
    U.toast(t("tr.working"));
    global.Translate.prepare(function () {
      var st = global.Translate.status();
      U.toast(st.state === "ready" ? t("tr.ready") : t("tr.unsupported"), st.state === "ready" ? "good" : "bad");
      global.App.refresh();
    });
  });
  U.on("p.settingsSave", function (d, form) {
    var s = S.get();
    s.settings.familyName = U.el("#sName", form).value.trim();
    s.settings.groupGoal = Math.max(1, S.num(U.el("#sGoal", form).value));
    s.settings.weekStart = S.num(U.el("#sWeek", form).value);
    s.settings.movieDay = S.num(U.el("#sMovie", form).value);
    S.save();
    U.toast(t("common.saved"), "good");
    global.App.refresh();
  });

  U.on("p.parentNew", function () {
    U.modal(t("family.addParent"),
      '<form data-act="p.parentSave">' +
        '<div class="field"><label for="npName">' + esc(t("setup.displayName")) + "</label><input id=\"npName\" type=\"text\"></div>" +
        '<div class="field"><label for="npUser">' + esc(t("setup.username")) + "</label><input id=\"npUser\" type=\"text\" autocapitalize=\"none\"></div>" +
        '<div class="field"><label for="npPass">' + esc(t("setup.password")) + "</label><input id=\"npPass\" type=\"password\"></div>" +
        '<div class="field"><span class="field-label">' + esc(t("common.avatar")) + "</span>" +
          U.avatarPicker(global.AVATARS.parents, "p2", "p.parentAvatar") + "</div>" +
        '<button class="btn block" type="submit">' + esc(t("common.save")) + "</button>" +
      "</form>");
    parentAvatar = "p2";
  });
  var parentAvatar = "p2";
  U.on("p.parentAvatar", function (d) {
    parentAvatar = d.avatar;
    U.els(".modal-body .avatar-pick").forEach(function (b) {
      b.classList.toggle("sel", b.dataset.avatar === d.avatar);
    });
  });
  U.on("p.parentSave", function (d, form) {
    var name = U.el("#npName", form).value.trim();
    var user = U.el("#npUser", form).value.trim();
    var pass = U.el("#npPass", form).value;
    if (!name || !user || pass.length < 4) return U.toast(t("setup.errParent"), "bad");
    if (!S.addParent(name, user, pass, parentAvatar)) return U.toast(t("auth.badLogin"), "bad");
    U.closeModal();
    U.toast(t("common.saved"), "good");
    global.App.refresh();
  });
  U.on("p.parentPass", function (d) {
    U.modal(t("family.changePass"),
      '<form data-act="p.parentPassSave" data-id="' + d.id + '">' +
        '<div class="field"><label for="cpPass">' + esc(t("family.newPass")) + "</label><input id=\"cpPass\" type=\"password\"></div>" +
        '<button class="btn block" type="submit">' + esc(t("common.save")) + "</button></form>");
  });
  U.on("p.parentPassSave", function (d, form) {
    var pass = U.el("#cpPass", form).value;
    if (pass.length < 4) return U.toast(t("setup.errPassShort"), "bad");
    S.setParentPassword(d.id, pass);
    U.closeModal();
    U.toast(t("common.saved"), "good");
  });
  U.on("p.parentDelete", function (d) {
    if (d.id === me().id) return U.toast(t("family.lastParent"), "bad");
    U.confirmDialog(t("family.deleteParentConfirm"), function () {
      if (!S.removeParent(d.id)) return U.toast(t("family.lastParent"), "bad");
      global.App.refresh();
    });
  });

  U.on("p.catNew", function () {
    U.modal(t("family.addCategory"),
      '<form data-act="p.catSave">' +
        '<div class="field"><label for="ncName">' + esc(t("family.categoryName")) + "</label><input id=\"ncName\" type=\"text\"></div>" +
        '<div class="field"><span class="field-label">' + esc(t("family.icon")) + "</span>" +
          '<div class="chips">' + global.AVATARS.icons.map(function (ic, i) {
            return '<button type="button" class="chip' + (i === 0 ? " on" : "") + '" data-act="p.catIcon" data-icon="' + ic + '">' + ic + "</button>";
          }).join("") + "</div></div>" +
        '<button class="btn block" type="submit">' + esc(t("common.save")) + "</button></form>");
    catIcon = global.AVATARS.icons[0];
  });
  var catIcon = "⭐";
  U.on("p.catIcon", function (d, node) {
    catIcon = d.icon;
    U.els(".modal-body .chips .chip").forEach(function (b) { b.classList.remove("on"); });
    node.classList.add("on");
  });
  U.on("p.catSave", function (d, form) {
    var name = U.el("#ncName", form).value.trim();
    if (!name) return U.toast(t("common.required"), "bad");
    S.addCategory(name, catIcon);
    U.closeModal();
    global.App.refresh();
  });
  U.on("p.catDelete", function (d) {
    var used = S.get().tasks.some(function (t2) { return t2.categoryId === d.id; });
    if (used) return U.toast(t("family.categoryInUse"), "bad");
    S.get().categories = S.get().categories.filter(function (c) { return c.id !== d.id; });
    S.save();
    global.App.refresh();
  });

  U.on("p.export", function () {
    var data = JSON.stringify(S.get(), null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "family-points-" + S.dayKey() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  U.on("p.reset", function () {
    U.confirmDialog(t("family.resetWarn"), function () {
      S.wipe();
      global.Setup.reset();
      global.App.go({ screen: "setup" });
    });
  });

  /* The file input lives inside a <label>, so it is wired on every render. */
  function bindImport() {
    var input = U.el("#importFile");
    if (!input || input._bound) return;
    input._bound = true;
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          if (!parsed || !parsed.settings || !parsed.children) throw new Error("bad");
          S.replace(parsed);
          global.I18N.setLang(parsed.settings.lang || "en");
          U.toast(t("family.importOk"), "good");
          global.App.refresh();
        } catch (e) {
          U.toast(t("family.importBad"), "bad");
        }
      };
      reader.readAsText(file);
    });
  }

  global.ParentView = { render: render, afterRender: bindImport };
})(window);
