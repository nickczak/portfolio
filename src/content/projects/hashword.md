---
name: "Hashword"
title: "Hashword: A Wallet and Password Manager in the Terminal"
description: "Hashword is a keyboard-driven terminal UI prototype for a wallet and password manager, built with TypeScript, React, and Ink. Its next phase will add account authentication and locally encrypted vault storage in Neon, with a separate master key that stays on the user's machine."
status: "Terminal Application · In Progress"
stack: ["TypeScript", "React / Ink", "Node.js 22+"]
href: "https://github.com/nickczak/Hashword-Wallet-Password-Manager"
gif: "hashword-demo.gif"
readingTime: 5
date: "10.27.2026"
---

## Overview

Hashword explores a wallet and password manager that runs entirely in the terminal. The current project is an interactive UI preview, with sample entries organized into password, wallet, and account sections.

## The Terminal Interface

The interface uses React and Ink to render a two-column vault: entries on the left and their fields on the right. Arrow keys or Vim-style `j` and `k` controls move through entries and fields, while single-key shortcuts switch between sections. The layout responds to the terminal's dimensions, adjusting spacing and the number of visible detail fields.

Sensitive fields are masked by default. Revealing or editing one opens a master-key prompt, and inline editing supports saving or canceling a change. A lock shortcut returns to the login screen, keeping the main navigation accessible from the keyboard.

## Built with TypeScript, React, and Ink

React components manage the login screen, vault navigation, field selection, and editing states. Ink brings those components into a Node.js terminal application, packaged with a `hashword` command that can be launched from any directory after building and linking the package.

## Current Status

Hashword is a UI prototype using in-memory sample data and a fixed demonstration password. Changes last only for the current session. The preview demonstrates the interaction design; encrypted storage and production authentication are not implemented in the current source.

## Next Phase: Encrypted Vaults in Neon

The next implementation is planned around a simple flow: register an account, log in with a username and account password, then unlock the vault with a separate master key. An encrypted copy of the vault will live in Neon so it can be downloaded on another machine. Encryption and decryption will happen locally in the installed CLI; the backend will never receive the master key or decrypted vault contents.

This is an implementation proposal. No database resources have been provisioned or application behavior changed as part of this plan.

### Proposed Architecture

The React/Ink CLI will communicate over HTTPS with a separate Node.js and TypeScript API built with Fastify. Self-hosted Better Auth will handle account credentials and sessions, backed by PostgreSQL in Neon. Versioned SQL migrations will manage the database schema, with separate runtime and migration roles. The API can be hosted independently, in a region near the database.

An early integration spike will validate Better Auth's username login and bearer-session plugins from a Node CLI before package versions are committed. The first release will keep session tokens in memory. Database credentials and authentication secrets will remain on the server; the CLI will receive only the API base URL.

### Local Encryption and Separate Credentials

Each vault will use a randomly generated 256-bit data key. Argon2id will derive a wrapping key from the user's master key and a random per-vault salt. Authenticated encryption will wrap the data key, and AES-256-GCM will encrypt the entire versioned vault document with a fresh nonce for each encryption. Entry names, sections, labels, and values will all be encrypted, regardless of their UI masking settings.

The encrypted envelope will carry versioned, bounded key-derivation parameters, ciphertext, wrapped-key metadata, nonces, and authentication tags. Envelope version and stable vault and owner identifiers will be authenticated as associated data. A maintained cryptographic implementation and known-answer tests will underpin this work.

Master-key prompts will verify locally by unwrapping the data key. Locking, logging out, and exiting will clear decrypted UI state, drafts, revealed fields, and key references, with mutable key buffers overwritten where feasible. JavaScript cannot guarantee complete memory erasure. Re-entering the master key is a local confirmation step, not protection against a compromised running machine.

The account password and vault master key will stay independent. Account settings will show the authenticated username and provide a dedicated password-change action without retrieving or displaying the login password. An account-password reset will restore authentication only; it will not recover a forgotten vault master key.

### Ownership and Conflict Detection

Initially, each user will have one vault row containing an opaque encrypted envelope, a revision number, and server-managed timestamps. Every query will use the owner ID from a verified session. The server will validate envelope structure, supported versions, encoding, and size without inspecting the encrypted document.

Authenticated create, download, and save routes will live at `/v1/vault`. Creation retries must never replace an existing vault. Saves will atomically check the expected revision and increment it on success. A stale revision will return a conflict instead of silently overwriting another device's changes. The encrypted document and its key metadata will always update together, including when a master-key change rewraps the data key.

### Connecting the Existing UI

Registration will create the account and initialize an empty encrypted vault after master-key confirmation. If initialization fails, the user will be able to log in and resume it. Login will download the encrypted envelope before presenting a separate unlock screen. Sample records will move to an explicit demo fixture, while real entries and fields gain stable IDs and a versioned document schema.

Navigation, masking, and the moving block cursor will remain. Verification and saving will become asynchronous, with duplicate submissions disabled. The first release will serialize explicit saves and show saving, saved, or failed status. An editor will close only after a successful save; failures will preserve the draft for retry or cancellation. Conflicts will require an explicit reload and reapply action. Automatic multi-device merging is outside the initial scope.

### Delivery and Verification

The planned delivery order is:

1. Set up the API and Neon development environment, validate migrations from a clean database, and prove CLI authentication works.
2. Build and test local encryption, including wrong-key, modified-ciphertext, Unicode, and empty-field cases.
3. Implement owner-scoped vault operations and test concurrent saves, revision conflicts, and ambiguous network failures.
4. Replace demo login and state with registration, unlock, load, and explicit save flows.
5. Add account settings and verify persistence and isolation with two users and two app instances.
6. Add encrypted caching, export/import, restore procedures, and production deployment, followed by a security review before inviting storage of real wallet keys or recovery phrases.

The first milestone is two registered users independently saving encrypted vaults, quitting, and restoring their data after login. Neither user should be able to read or overwrite the other's vault, and neither database contents nor request logs should expose vault plaintext. Authentication tests will also cover expired and revoked sessions, request redaction, and typing navigation shortcuts inside credential inputs.

Encrypted offline caching will follow the tested online flow. It will store only the envelope and revision, scoped by account, using atomic replacement and restrictive file permissions. Initial offline access will be read-only. Backup retention and restore behavior will be verified against the chosen Neon plan, and a recovery-key mechanism will need its own design and tests before being offered.

The source code and installation instructions are available on [GitHub](https://github.com/nickczak/Hashword-Wallet-Password-Manager).
