---
title: "QuickQuill — Technical Documentation"
description: "Architecture, data model, and design decisions behind QuickQuill's dictionary lookup, spellchecker, and writing environment."
project: "quickquill"
stack: ["TypeScript / Angular 21", "Java / Spring Boot", "PostgreSQL", "C++17 / Trie Tree", "Docker"]
updated: "08.30.2026"
---

## Architecture Overview

QuickQuill is split into three cooperating layers.

```text
┌────────────────────────────────────────────┐
│ ANGULAR 21  frontend (web/)                │
│ writing environment                        │
│ dictionary lookup · spellchecker           │
│ synonyms · autocomplete                    │
│ account surfaces                           │
│ GitHub Pages · quickquill.ink              │
└──────────────────────┬─────────────────────┘
                       │   HTTPS · REST (api.quickquill.ink)
                       │
┌──────────────────────┯─────────────────────┐
│ SPRING BOOT  service (studio/)             │
│ REST controllers · services                │
│ Spring Data JPA repositories               │
│ BCrypt · UUID session tokens               │
│ thread-safe LRU cache (10k words)          │
│ Render · Docker · CI                       │
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

**C++17 engine** — owns the CPU-bound dictionary and spellchecking logic: the Trie tree, the "Did you mean...?" suggestion algorithm, and similar-word search.

**Java / Spring Boot service** — exposes a REST API, handles authentication, and mediates between the client and the C++ engine.

**Angular 21 frontend** — provides the writing environment, quick-search dictionary, and account surfaces.

The C++ engine is compiled to a native shared library (`libquickquill_engine.so`) and called by the Java service through the Panama Foreign Function & Memory API — no JNI or glue code. This keeps the coupling loose so either half can be replaced and tested independently.

## Data Model

Dictionary data lives in SQLite (`dictionary.db`, ~1.3M words from the [kaikki.org](https://kaikki.org/) Wiktionary JSONL extract) and is served directly by the C++ engine over thread-local connections. A Trie lookup returns a word ID, then definition, pronunciation, and example sentence data are pulled for it; user-facing data lives in PostgreSQL.

User data is stored separately. Accounts keep search history and saved/suggested words.

A thread-safe LRU cache of 10,000 words sits in front of the engine so hot lookups never touch disk.

## The Trie Engine

The core structure is a Trie, loaded once at startup from the database. Lookup runs in **O(L)** where L is the word length.

Spellchecking uses the standard edit-distance approach: when a lookup fails, candidate corrections are generated and ranked, then surfaced as "Did you mean...?".

The C++ threading model allows multiple requests to hit the engine concurrently — a deliberate challenge I took on early.

## API Design

The Java service exposes endpoints for:

- Dictionary lookup
- Spellcheck suggestions
- Synonym / autocomplete queries
- User account operations

Authentication uses simple UUID token sessions with BCrypt password hashing. This was an intentional minimal start — scoped so it can grow into a more complete auth system without re-architecting.

## Deployment

The full stack is containerized with Docker and deployed to a cheap Google Cloud VPS. GitHub Actions holds the VPS SSH credentials, builds a fresh Docker image on push, and deploys automatically.

This is my first web-hosted project maintained in a public repo, so deployment taught me more than almost anything else in the stack.

## Design Rationale

The biggest decision was keeping the dictionary and spellcheck logic in C++ while moving everything else to Java.

Why not JNI or a pure-Java rewrite? A native engine removes garbage-collection pauses for latency-sensitive lookups and keeps the Trie implementation untouched and independently testable.

The Angular rewrite came from work experience — I needed to keep practicing it, and the opinionated structure pays off if this grows into a full writing platform.
