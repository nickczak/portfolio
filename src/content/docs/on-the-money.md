---
title: "On The Money — Technical Documentation"
description: "Architecture, data model, and design decisions behind the On The Money self-hosted finance tracker."
project: "on-the-money"
stack: ["Java 17 / Spring Boot 3.3", "TypeScript / React", "PostgreSQL", "C++17 / Monte Carlo Engine", "Docker"]
updated: "08.31.2026"
---

## Architecture Overview

## Data Model

PostgreSQL stores accounts, transactions, and net worth history via Spring Data JPA / Hibernate. That is all fed by Plaid for real-time account and transaction syncing, with FinnHub providing market data. The system is designed to be self-hosted, so all data remains private.


## Plaid Integration

### Getting Started
To understand how I integrated Plaid, you need to understand how Plaid works. Which I will refer you to the [QuickStart docs](https://plaid.com/docs/quickstart/) for a more in depth understanding of how Plaid works. But in short, Plaid is a service that allows you to connect your bank accounts to your application and retrieve account and transaction data. It does this by providing a set of APIs that you can use to interact with the Plaid service. For example, Plaid can retrieve account balances using the `/accounts/balance/get` endpoint, or retrieve transactions using the `/transactions/get` endpoint. Plaid also provides a set of webhooks that you can use to receive notifications when certain events occur, such as when a new transaction is posted to an account.

It is also important to know what a Plaid Item is. A Plaid Item is a representation of a user's bank account(s) that is connected to your application. Each Item has a unique `item_id` that you can use to retrieve account and transaction data for that Item. When a user connects their bank account to your application, Plaid creates an Item for that account and returns the `item_id` to your application. You can then use the `item_id` to retrieve account and transaction data for that Item. So in short, it's a login at a financial institution.

### How To Talk To Plaid
For the client to be able to open Plaid and link their bank, the client needs to request a `link_token` from the backend. The backend will then call the Plaid API (because it has the secret key) to create a `link_token` and return it to the client. The client can then use the `link_token` to open the Plaid Link flow and link their bank account. Once the user has linked their bank account, Plaid will return a `public_token` to the client. The client will then send the `public_token` to the backend, which will exchange it for an `access_token` and an `item_id`. The backend will then store the `access_token` and `item_id` in the database for future use. 

Simple. Right?

1 — Call `/link/token/create` to create a link_token and pass the temporary token to your app's client.
Step 1 diagram

2 — Use the link_token to open Link for your user. In the onSuccess callback, Link will provide a temporary public_token. This token can also be obtained on the backend via `/link/token/get`.
Step 2 diagram

3 — Call `/item/public_token/exchange` to exchange the public_token for a permanent access_token and item_id for the new Item.
Step 3 diagram

4 — Store the access_token and use it to make product requests for your user's Item.


### Encryption
Now that we have the access_token and item_id, we need to store them in the database. But we don't want to store them in plain text, because that would be a security risk. So we need to encrypt them before storing them in the database. I used Spring Security's `AesBytesEncrypter`, which uses `javax.crypto` package under the hood to encrypt the access_token and item_id using AES encryption. I then stored the encrypted access_token and item_id in the database. When I need to use the access_token and item_id, I decrypt them using the same key that I used to encrypt them.

So encryption would look something like this:

```java
  public PlaidCrypto(@Value("${application.secret}") String secret) {
    this.encryptor =
        new AesBytesEncryptor(
            secret, secret + "-salt", 
            KeyGenerators.secureRandom(IV_LENGTH), 
            CipherAlgorithm.GCM
        );
  }

  public String encrypt(String plaintext) {
    byte[] enc = encryptor.encrypt(plaintext.getBytes(StandardCharsets.UTF_8));
    return Base64.getEncoder().encodeToString(enc);
  }

  public String decrypt(String encoded) {
    byte[] raw = encryptor.decrypt(Base64.getDecoder().decode(encoded));
    return new String(raw, StandardCharsets.UTF_8);
  }
```

If things look pretty abstract here, that's because they are. But this solution works and is secure (AES-GCM), you should have seen the first soluction AI came up with :). This is actually quite simple code wise, and if you understand a little bit about encryption.

### Plaid As a Service

### Webhooks

### Plaid API 

### Design Decisions

The biggest decision I made early on was treating **Plaid's balance as the single source of truth**. I deliberately keep imported transactions completely out of `AccountEntity.balance` — balances come straight from `/accounts/balance/get`, and transactions are stored as read-only history records mapped to `DEPOSIT`/`WITHDRAW` so the existing UI renders them without changes. The reasoning is simple: if I ever derived a balance from transactions, every sync would double-count and the numbers would drift from what the bank actually reports.

Regarding **security**, the `access_token` is encrypted at rest with AES-256-GCM using a derived key, annotated with `@JsonIgnore` so it's never serialized in API responses, and it never gets logged. I didn't just use Plaid's official SDK because it's generated code that drags in OkHttp, Retrofit, and Gson, which would have been more than we needed. 


## FinnHub API

## User Authentication (Simple)

## Frontend Design
### React Structure

## Key Takeaways
