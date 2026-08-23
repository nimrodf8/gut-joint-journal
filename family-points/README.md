# Family Points

Chores, points and family rewards for the kids at home — a single static web app
with no build step, no server and no account anywhere. Everything lives in the
browser of the device the family uses.

Available in **English** (default), **Nederlands** and **עברית** (right-to-left).

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

## What each role sees

**Parents** (username + password, full admin)

- Home — group bank and progress to the goal, standings, birthday countdowns,
  movie night, pending approvals, recent activity
- Tasks — create/edit tasks, and award ✓ *done* or ✗ *not done* to a child
- Kids — a page per child: balance, manual +/− adjustments with a reason,
  wish list, outing wishes, notes, and the full points history
- Approvals — the "I did it" reports the children send, approved or rejected
- Family — language, group goal, week start, movie night day, parent accounts,
  categories, backup export/import

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
device. Nothing is sent anywhere — there is no network call in the whole app.

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
    ├── i18n.js         240 strings × en / nl / he
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
- שלוש שפות: אנגלית (ברירת מחדל), הולנדית ועברית עם פריסה מימין לשמאל.
