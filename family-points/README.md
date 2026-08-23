# Family Points

Chores, points and family rewards for the kids at home — a single static web app
with no build step, no server and no account anywhere. Everything lives in the
browser of the device the family uses.

Available in **English**, **Nederlands** and **עברית** (right-to-left). Every
account picks its own language, and what one person writes is translated into
the language of whoever reads it.

## Running it

Open `index.html` in a browser, or serve the folder:

```sh
cd family-points
python3 -m http.server 8080     # then open http://127.0.0.1:8080
```

Any static host works too (GitHub Pages, Cloudflare Pages, a shared tablet's
home screen). The first visit walks a parent through a four-step setup:

1. Family name and language
2. The first parent account (username + password)
3. The children — name, character, birthday and an optional 4-digit PIN
4. Confirm; each child starts with **500 points** and a starter set of tasks

## How the points work

Every task carries the point change itself, so one shape covers all three cases
the family asked for:

| Task | When done | When not done |
|---|---|---|
| Rewarding | `+20` | `0` |
| Rewarding with a penalty | `+10` | `-5` |
| Neutral — only deducts | `0` | `-10` |

Each task also chooses who the points land on:

- **The child** — personal balance only
- **The group** — the shared family bank only
- **Both** — a personal amount *and* a group amount, configured separately

Tasks are grouped by subject (Cleaning, Tidiness, Schoolwork, Play, Dutch
practice, plus any category the parents add) and are assigned either to all
children or to specific ones.

**Balances are never stored.** Every award, penalty, manual adjustment and
starting balance is a ledger entry, and a balance is replayed from the ledger.
A mistaken award can be traced in the child's history instead of quietly
drifting.

## Languages and simultaneous translation

Language is a personal setting, not a family-wide one: a parent can read the app
in Dutch while a child reads the same family in Hebrew. Each account stores its
own choice, so signing in switches the whole interface — including the
right-to-left layout for Hebrew — to that person's language. The family default
in settings only decides what a newly created account starts with.

Free text follows the reader. A note a child types in Hebrew shows up in Dutch
for the parent who reads Dutch, and a task a parent names in Dutch shows up in
Hebrew for the child who reads Hebrew. This covers notes, birthday wishes,
outing wishes, task names, custom category names and the reasons written on
manual point adjustments. Names and film titles are left exactly as they were
entered.

- Translated text carries a 🌐 badge; tapping it shows the original words and
  the language they were written in. Nothing is ever silently rewritten.
- The translation runs **inside the browser**, through Chrome's on-device
  Translator API. A child's notebook never leaves the device to be readable.
  The browser downloads a language pack the first time a pair is used —
  *Family → Simultaneous translation → Download the language packs* does it in
  one go, and after that it works offline.
- Each result is cached on the record, so a translated note renders instantly
  ever after and is not re-translated on every visit.
- If the browser cannot translate (anything older than Chrome 138, or a missing
  language pair), the text is shown exactly as written and tagged with its
  language, and settings says plainly why. Translation can also be switched off.
- The quality is whatever the on-device model gives you — good enough to
  understand a note, not a human translator.

## What each role sees

**Parents** (username + password, full admin)

- Home — group bank and progress to the goal, standings, birthday countdowns,
  movie night, pending approvals, recent activity
- Tasks — create/edit tasks, and award ✓ *done* or ✗ *not done* to a child
- Kids — a page per child: balance, manual +/− adjustments with a reason,
  wish list, outing wishes, notes, and the full points history
- Approvals — the "I did it" reports the children send, approved or rejected
- Family — own language, default language for new accounts, translation,
  group goal, week start, movie night day, parent accounts, categories,
  backup export/import

**Children** (tap their character, plus a PIN if one was set)

- Me — their points, rank, birthday countdown and recent movement
- Tasks — everything assigned to them, with an **I did it** button that sends a
  report to the parents rather than awarding points directly
- Group — the shared bank, the standings and the history of movie nights and
  outings
- Notes — their own notebook, birthday wish list and outing wishes

## The weekly rewards

- **Movie night.** The child who earned the most points *this week* wins the
  week. On the movie night day (Saturday by default) the app names the winner
  and a parent records the film they picked; every pick is kept in the history.
- **Family outing.** Group points accumulate in the shared bank. When the bank
  reaches the goal, the outing unlocks and the child with the **highest total
  balance** chooses — from the outing wishes they saved on their own page.
  Redeeming spends the goal amount out of the bank.

Ties are broken by total balance and then by name, so the winner is always
stable rather than random.

## Data, privacy and backups

Everything is stored in `localStorage` under `familyPoints.v1` on that one
device. The app itself makes no network calls: the only thing that ever goes
over the wire is the browser's own download of a translation language pack, and
the text being translated stays on the device.

- Parent passwords and children's PINs are stored as salted SHA-256 hashes
  (15,000 rounds), never as plain text. This keeps a curious sibling out; it is
  not protection against someone with the device and real intent.
- **Family → Data → Export backup** writes a JSON file. Import the same file on
  another device (or after clearing the browser) to restore the family.
- Clearing the browser's site data erases the family. Export first.

## Layout

```
family-points/
├── index.html          page shell — the screens are rendered from JS
├── assets/styles.css   one stylesheet: light + dark, LTR + RTL
└── js/
    ├── i18n.js         261 interface strings × en / nl / he
    ├── translate.js    on-device translation of what the family writes
    ├── avatars.js      emoji characters on coloured discs (no image files)
    ├── sha256.js       hashing for passwords and PINs
    ├── store.js        data model, ledger, balances, weeks, birthdays
    ├── ui.js           shared rendering helpers and the delegated click router
    ├── setup.js        first-run wizard and sign-in
    ├── parent.js       the admin screens
    ├── child.js        the children's screens
    └── app.js          routing, header, tabs, boot
```

Scripts are plain classic `<script>` tags in dependency order, so the app also
runs straight from `file://` without a server.

---

## בעברית

אפליקציית מטלות ונקודות למשפחה. הכול נשמר בדפדפן של המכשיר המשפחתי — אין שרת,
אין חשבון ואין שליחת מידע החוצה.

- **הורים** נכנסים עם שם משתמש וסיסמה ומקבלים גישת אדמין: הקמת משימות לפי נושא,
  שיוך לכל הילדים או לילד מסוים, זיכוי וקיזוז נקודות, ואישור דיווחים.
- **ילדים** נכנסים בלחיצה על הדמות שלהם (ועם קוד סודי אם הוגדר), רואים את החשבון
  האישי ואת החשבון הקבוצתי, מדווחים "עשיתי!" לאישור הורה, וכותבים הערות,
  רעיונות למתנות יום הולדת והעדפות לבילוי.
- כל ילד מתחיל עם **500 נקודות**. לכל משימה מוגדר ניקוד כשמבוצעת וניקוד כשלא
  מבוצעת — כך שאפשר גם משימה ניטרלית שנותנת 0 בביצוע ומקזזת כשלא בוצעה.
- **ערב סרט**: מי שצבר הכי הרבה נקודות במהלך השבוע זוכה, וביום שבת (ניתן לשינוי)
  בוחר את הסרט — והבחירה מתועדת.
- **בילוי משפחתי**: כשהקופה הקבוצתית מגיעה ליעד, הילד עם היתרה הגבוהה ביותר בוחר
  מתוך העדפות הבילוי שרשם.
- **שפה אישית לכל משתמש**: כל הורה וכל ילד בוחרים את השפה שלהם, והכניסה לחשבון
  מחליפה את כל הממשק (כולל פריסת RTL לעברית) לשפה של אותו אדם.
- **תרגום סימולטני**: הערה שילד כותב בעברית מוצגת בהולנדית להורה שקורא הולנדית,
  ומשימה שהורה כתב בהולנדית מוצגת בעברית לילד שקורא עברית. התרגום מתבצע בתוך
  הדפדפן (Translator API של כרום) — הטקסט לא יוצא מהמכשיר. לצד כל טקסט מתורגם
  יש תג 🌐 שמציג את המקור בדיוק כפי שנכתב. שמות וכותרות סרטים לא מתורגמים.
