---
title: "QuickQuill — Technical Documentation"
description: "Architecture, the C++17 Trie engine, the Panama FFM bridge, the SQLite + PostgreSQL data model, authentication, and frontend design behind QuickQuill's dictionary and writing environment."
project: "quickquill"
stack: ["C++17 / Trie Engine", "Java / Spring Boot", "TypeScript / Angular 21", "PostgreSQL / SQLite", "Docker"]
updated: "09.21.2026"
---

## Architecture Overview

QuickQuill is split into three cooperating layers, glued by a single native seam.

```text
┌────────────────────────────────────────────┐
│ ANGULAR 21  frontend (web/)                │
│ writing environment                        │
│ dictionary lookup · spellchecker           │
│ synonyms · autocomplete                    │
│ account surfaces                           │
│ Vercel · quickquill.ink                    │
└──────────────────────┬─────────────────────┘
                       │   HTTPS · REST (api.quickquill.ink)
                       │
┌──────────────────────┯─────────────────────┐
│ SPRING BOOT  service (studio/)             │
│ REST controllers · services                │
│ Spring Data JPA repositories               │
│ BCrypt · UUID session tokens               │
│ thread-safe LRU cache (10k words)          │
│ Render · Docker · PostgreSQL               │
└──────────┬───────────────────────┬─────────┘
           │                       │   Panama FFM (native .so, no JNI)
           │                       │   Spring Data JPA
           │                       │
┌──────────┯─────────┐            ┌──────────┯─────────┐
│ C++17 ENGINE       │            │ POSTGRESQL         │
│ Trie lookup · O(L) │            │ accounts · sessions │
│ “Did you mean…?”   │            │ documents · history │
│ autocomplete       │            │ suggested words    │
│ similar-word search │            └────────────────────┘
│ SQLite connections │
└──────────┬─────────┘
           │   thread-local SQLite connections
           │
 ┌─────────┯────────┐
 │ SQLITE           │
 │ dictionary.db    │
 │ ~1.3M words      │
 │ kaikki.org       │
 │ Wiktionary data  │
 └──────────────────┘
```

**C++17 engine** — owns the CPU-bound dictionary and spellchecking logic: the Trie tree, the "Did you mean...?" suggestion algorithm, and similar-word search. It reads the dictionary directly from SQLite over thread-local connections, so lookups never cross a process boundary for the *data*.

**Java / Spring Boot service** — exposes a REST API, handles authentication, and mediates between the client and the C++ engine.

**Angular 21 frontend** — provides the writing environment, quick-search dictionary, and account surfaces.

The C++ engine is compiled to a native shared library (`libquickquill_engine.so`) and called by the Java service through the Panama Foreign Function & Memory API — no JNI or glue code. This keeps the coupling loose so either half can be replaced and tested independently. The only thing that crosses the seam is a word or prefix going in and a JSON document coming out.

## The Trie Engine

The core structure is a Trie, loaded once at startup from the database. Lookup runs in **O(L)** where L is the word length.

A small slice of the tree reads like a word ladder — every edge is a single character, and shared prefixes branch only once:

```
root
└── d
    └── a
        └── r
            └── k          "dark"
                ├── e
                │   └── n  "darken"
                └── n
                    └── e
                        └── s
                            └── s    "darkness"
```

Each node is a fixed **36-wide array of child pointers** — the 26 letters plus `0`–`9` — so descending one character is an array index, not a hash probe or a scan. Terminal nodes carry a word ID and a frequency; the word ID is the join key back into SQLite for definitions, examples, and etymology. Words are sanitized on insert (lowercase, punctuation stripped) so lookup is case-insensitive and punctuation-insensitive for free.

### "Did you mean...?"

Spellchecking is classic **edit distance** through a single-edit neighborhood of the input:

1. Generate every candidate that is one edit away — deletion, transposition, substitution, insertion — and keep only the ones that actually exist in the Trie.
2. Rank survivors by **Levenshtein distance** ascending; the closest correction is surfaced as "Did you mean...?".
3. Cap results at 30 suggestions.

The engine deliberately never echoes an unknown word back as its own "suggestion" — a regression guard so a typo never looks like a correction. Levenshtein uses two rolling rows (`col` / `prev_col` swapped) rather than a full DP matrix.

### Synonyms & ghost-text autofill

Synonyms are gathered from every sense of the entry, deduped, and then **randomly sampled** — the feature is a brainstorm of alternatives, so it trades determinism for variety.

Autofill (the ghost text) is where personalization lives. Every completion scores `0–3`:

| Score | Completion source |
|---|---|
| 0 | in the user's search history |
| 1 | in the user's saved words |
| 2 | recently looked up (sits in the LRU cache) |
| 3 | otherwise known (present in the dictionary, not on disk since last boot) |

The best candidate wins; ties break by word frequency. So type-ahead prefers *your* words first, then the ones you have been reading, then sheer commonness.

### Concurrency & caching

The C++ threading model allows multiple requests to hit the engine concurrently — a deliberate challenge I took on early. Two mechanisms make it safe:

- **Thread-local SQLite connections.** Each request thread lazily owns its own `sqlite3` handle (busy timeout 2 s, foreign keys enforced), so there is no shared socket to serialize on.
- **One global LRU.** A process-wide, mutex-guarded cache keyed by word ID sits in front of the SQLite fetch path (`kMaxCacheSize = 10,000`), so hot words never touch disk. The cache is also consulted *by autofill scoring*, which is how "recently viewed" words rise above strangers.

A dedicated concurrency test drives two async workers through 400 mixed operations against a shared engine and asserts the whole run completes fast — verifying the thread-local + LRU design under contention.

## The Panama FFM Bridge

The engine exposes a **flat C ABI** — seven functions, no JNI, no glue code:

```c
int  qq_init(const char *db_path);
void qq_shutdown(void);
int  qq_lookup (const char *word, char *buf, int buf_size);
int  qq_suggest(const char *word, char *buf, int buf_size);
int  qq_synonym(const char *word, char *buf, int buf_size);
int  qq_autofill(const char *prefix, const char *history_json,
                 const char *suggested_json, char *buf, int buf_size);
```

Each call writes a JSON document into a caller-owned buffer and returns the byte length. On the Java side (`WordEngine`):

- **Downcall handles are resolved once** at startup via `SymbolLookup.loaderLookup()`, then reused for every request.
- Each call opens its own **confined Arena**, marshals the input to a NUL-terminated C string, and reads into a fixed 128 KB buffer. A response that would truncate throws instead of silently parsing garbage.
- `qq_init` happens in a `@PostConstruct`, `qq_shutdown` in `@PreDestroy`, and init is idempotent — so a restart won't double-load the 1.28M-word tree.

Steady-state calls allocate no shared mutable state, so the bridge is concurrency-safe by construction — and correctness underneath relies on the engine's thread-local connections and mutexed LRU. The native library loads through `System.loadLibrary` on `java.library.path`, and the Java runtime needs `--enable-native-access=ALL-UNNAMED` for the restricted API.

## Data Model

Two stores, deliberately split by who reads them:

- **SQLite — the dictionary** (read-only, owned by the C++ engine). Words, forms, senses, and the adjacency tables around them.
- **PostgreSQL — the users** (Spring Data JPA). Accounts and everything they save.

### SQLite dictionary

Imported from the [kaikki.org](https://kaikki.org/) Wiktionary JSONL extract, the production build holds **1.28M+ words**; the import counts:

```text
Words       : 1,277,185
Senses      : 1,761,078
Forms       : 973,401
Examples    : 745,823
Synonyms    : 655,080
Antonyms    : 33,768
Etymologies : 1,349,364
```

```text
words(id, lemma UNIQUE, display_lemma, frequency)
  └─ etymologies(word_id, etymology)
  └─ forms(word_id, form, tag)
  └─ senses(word_id, pos, definition)
       ├─ examples(sense_id, example)
       ├─ synonyms(sense_id, synonym)
       └─ antonyms(sense_id, antonym)
```

`lemma` is the canonical headword, `display_lemma` is how it renders, and `forms` captures inflections like `cats` (plural) or `darkened` (past). Every table is indexed on its foreign key; cascading deletes and `INSERT OR IGNORE` keep the import idempotent. At load time the engine streams lemmas *and* forms into the Trie, ordering lemmas ahead of colliding form strings so a word that is also another word's inflection resolves to the word.

### PostgreSQL entities

```text
users ─┬─ sessions          (one session token per login)
       ├─ documents         (the writing environment)
       ├─ search_history    (words you've looked up)
       └─ suggested_words   (synonyms you've saved)
```

- **users** (`UserEntity`) — id, unique email, BCrypt-hashed password, displayName, createdAt. No child collections; every table holds a `user_id` foreign key instead.
- **sessions** (`SessionEntity`) — the auth mechanism: a random UUID token per login, expiring **30 days out**. Expired sessions are deleted the moment they're touched.
- **documents** (`DocumentEntity`) — the "Lettre" writing files: title (defaults to `Untitled`), content as a single `TEXT` blob, plus `createdAt`/`updatedAt`; any save or rename bumps `updatedAt`, which is what reorders the file list.
- **search_history** (`SearchHistoryEntity`) — unique on `(user_id, word)`, capped at 500; re-recording moves a word to the front.
- **suggested_words** (`SuggestedWordEntity`) — the same de-duplicated, move-to-front shape, capped at 1,000.

Because the dictionary is served straight from SQLite by the engine, PostgreSQL only ever holds user data — a 1.28M-row dictionary never moves through the ORM.

## API Design

The API splits cleanly into a **public, stateless dictionary** and **account-scoped resources** behind a Bearer token.

### Dictionary (public)

| Endpoint | Behavior |
|---|---|
| `GET /api/word/{word}` | Full entry: senses with definitions, examples, synonyms/antonyms per sense, forms, etymology. Includes alternates when the word is also another lemma's form; attaches a `suggestion` on a near-miss. 200 / 400 invalid input / 404 `{found:false}` |
| `GET /api/suggest/{word}` | Up to 30 "Did you mean…?" candidates judged by edit distance |
| `GET /api/synonym/{word}` | A randomized sample of synonyms gathered across senses |
| `GET /api/autofill/{word}?history=&suggested=` | The single best ghost-text completion, personalized by the user's history and saved words |
| `GET /api/health` | Liveness probe for the Render deploy |

### Authentication

| Endpoint | Success |
|---|---|
| `POST /api/auth/signup` | 201 `{token, user}` — opens a session immediately, no second login |
| `POST /api/auth/login` | 200 `{token, user}` |
| `POST /api/auth/logout` | 200 — idempotent, always succeeds |
| `POST /api/auth/refresh` | New token window, expiry reset to now + 7 days |
| `POST /api/auth/change-password` | 200 — old password must match |
| `POST /api/auth/delete-account` | 200 — cascades across all dependent rows |
| `POST /api/auth/update` | 200 — display name or email, rejects a taken email |
| `GET /api/auth/me` | 200 — current user |

### Writing environment & word lists (per-user)

| Endpoint | Behavior |
|---|---|
| `GET/POST /api/documents` | List (summaries only, never content) or create (`Untitled` default) |
| `GET/PUT/DELETE /api/documents/{id}` | Fetch with content, overwrite content, delete — all scoped to the owner |
| `POST /api/documents/{id}/rename` | Rename; bumps `updatedAt` |
| `GET/POST/DELETE /api/search-history` | Record, list, clear — move-to-front dedup, cap 500 |
| `GET/DELETE /api/suggested-words` · `POST /api/suggested-words/sync` | Save, list, clear, or bulk-sync synonyms — dedup, cap 1,000 |

## User Authentication

Authentication is DIY rather than Spring Security: **BCrypt hashing + opaque UUID session tokens**, deliberately simple, with a clear path to a fuller auth system without re-architecting.

Sessions are **30-day UUID tokens** carried in the `Authorization: Bearer <token>` header — explicitly not a query parameter, which keeps tokens out of URLs, server logs, browser history, and the Referer header. Every protected endpoint manually resolves the token to a user:

```java
public User validateSession(String token) {
  Session session = sessionRepo.findByToken(token)
      .orElseThrow(() -> new IllegalArgumentException("Invalid session."));
  if (session.isExpired()) {
    sessionRepo.delete(session);
    throw new IllegalArgumentException("Session expired.");
  }
  return session.getUser();
}
```

`refresh` resets the window to **7 days from now** rather than extending it, and a refresh on the web app restores a session on page load. One `@RestControllerAdvice` maps every auth failure to a status by message keyword — `"registered"` → 409, `"password"`/`"session"`/`"login"`/`"token"` → 401, anything else → 400 — so services can throw plain `IllegalArgumentException`s and let HTTP semantics live in one place.

Two details I'm proud of:

- **No IDOR.** Every user-scoped query ships with the owning user (`findByIdAndUser`, `findByUser*`), so a foreign record and a missing record both 404. You cannot enumerate another user's documents by guessing an id.
- **Signup logs you in.** The register endpoint returns a session in the same call, removing the classic second round-trip.

## Frontend Design

The frontend is an Angular 21 single-page app — standalone components, signal-based state, and **zero zone.js** (zoneless by default). No external UI library; the whole look and feel is hand-rolled CSS.

### The search experience

The dictionary page runs three independent RxJS pipelines:

- **Similar searches** debounce at **300 ms** and surface live "Did you mean…?" chips as you type.
- **Ghost-text autofill** debounces at **50 ms** and `switchMap`s to `/api/autofill`, feeding the input's history and saved words into the request. A **epoch counter** discards stale responses so an out-of-order reply can never clobber newer keystrokes. The completion renders as a two-layer input — transparent user text with a `rgba` ghost suffix behind it — and `Tab` accepts it.
- **Lookup** `switchMap`s on submit/Enter, and turns error responses into status-coded successes so 404 ("not found, did you mean…") and 400 render as first-class UI states rather than exceptions.

Synonyms and saved words sync to the backend through the move-to-front endpoints, so a logged-in user's autofill is *their own* vocabulary.

### The Lettre writing environment

The writing environment autocreates documents, autosaves with a **1-second debounce** on a plain `TEXT` blob, and shows live `Saving…` / `Saved` status. Renames commit on Enter *and* blur; deletes ask twice via the browser confirm before touching the owner-scoped endpoint. A single `<textarea>` with `spellcheck="false"` keeps the focus on sustained writing over toolbar sprawl.

### The Dark Academia aesthetic

Visually QuickQuill is pure **Dark Academia**: Times New Roman throughout, a black page with a vignette-lit center, engraved box-corner PNGs instead of rounded cards, uppercase letterspaced labels, and a quill as the app's mark. Chips, expandable lists, and the shell (page header + footer) are the whole component kit — everything else is type and texture.

## Deployment

The app runs on Render and Vercel. The Angular frontend ships as a static build to Vercel at quickquill.ink, and the Spring Boot backend — containerized with Docker, backed by managed PostgreSQL — runs on Render. A Render Blueprint (`render.yaml`) defines the services, and GitHub Actions triggers builds and deploys on push.

This is my first web-hosted project maintained in a public repo, so deployment taught me more than almost anything else in the stack.

## Key Takeaways

- **A native engine where speed lives.** A bounded 36-way trie means a 1.28M-word dictionary answers in **O(L)** with constant fan-out; the CJK-style array indexing beats any map lookup. C++ earns its keep precisely where lookups are latency-sensitive.
- **Thread-local reads, one global cache.** Every request thread owns its own SQLite connection while a 10,000-entry mutexed LRU absorbs hot words — the two easiest concurrency wins in the whole codebase, proven by an async stress test.
- **No JNI, no glue code.** A flat `extern "C"` ABI plus Panama FFM kept the Java↔C++ seam buildable and testable on both sides. Resolve the downcall handles once; confine per-call arenas; fail loudly on truncation.
- **Data engineering is a project too.** The kaikki.org Wiktionary JSONL extract became a reproducible import pipeline with idempotent `INSERT OR IGNORE` and an ordered lemma-over-form load — 1.28M words in, and lookup speed never moved.
- **Put the dictionary and the users in different stores.** The dictionary never touches the ORM, and user data never bloats the dictionary. Each store is shaped by exactly who reads it.
- **Auth that ships today, grows tomorrow.** BCrypt plus opaque UUID sessions covers the product, keeps tokens out of URLs via the Bearer header, and leaves room for a fuller system without re-architecting.
- **IDOR-proof by construction.** Owner-scoped queries (`findByIdAndUser`) mean foreign and missing both 404 — authorization is baked into the query, not bolted on afterward.
- **A signal-driven, zoneless frontend.** Angular 21's signals + standalone components, no `zone.js`, and three debounced RxJS pipelines (300 ms similar-search, 50 ms ghost text, 1 s autosave with an epoch guard) keep the UI honest and fast without a state library.
- **Personalization is a first-class signal.** Autofill prefers your history, then your saved words, then recently read words, then frequency — a 4-tier scoring cascade that makes the type-ahead feel like it knows you.
- **A small design system is a product feature.** Serif type, engraved corners, and a chip/expandable-list kit make the Dark Academia look coherent across every screen without a framework.