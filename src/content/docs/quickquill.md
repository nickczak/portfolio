---
title: "QuickQuill — Technical Documentation"
description: "Architecture, data model, and design decisions behind QuickQuill's dictionary lookup, spellchecker, and writing environment."
project: "quickquill"
stack: ["TypeScript / Angular 21", "Java / Spring Boot", "PostgreSQL", "C++17 / Trie Tree", "Docker"]
updated: "08.30.2026"
---

## Architecture Overview

QuickQuill is split into three cooperating layers.

**C++17 engine** — owns the CPU-bound dictionary and spellchecking logic: the Trie tree, the "Did you mean...?" suggestion algorithm, and similar-word search.

**Java / Spring Boot service** — exposes a REST API, handles authentication, and mediates between the client and the C++ engine.

**Angular 21 frontend** — provides the writing environment, quick-search dictionary, and account surfaces.

The C++ engine and the Java service communicate over OS pipes using JSON. This keeps the coupling loose so either half can be replaced independently.

## Data Model

Dictionary data lives in PostgreSQL. A `words` table holds ~1.2M+ entries from the [kaikki.org](https://kaikki.org/) Wiktionary JSONL extract, keyed by a word ID. Definition, pronunciation, and example sentence data are stored relationally and fetched after a Trie lookup returns the word ID.

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
