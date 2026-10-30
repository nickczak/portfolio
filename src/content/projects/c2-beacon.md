---
name: "C2 Beacon"
title: "C2 Beacon — Exploring Systems Programming in C"
description: "An early-stage C17 systems and security learning project. The current local prototype explores a timed task loop, monotonic clocks, and error handling through a small, deterministic simulator."
status: "Malware Persistence · In Progress"
stack: ["C17", "CMake", "POSIX / Windows APIs", "AddressSanitizer / UndefinedBehaviorSanitizer"]
href: "https://github.com/nickczak/myC2-beacon"
gif: "c2-beacon-heartbeat.png"
readingTime: 1
date: "10.29.2026"
---

## Overview

C2 Beacon is an early-stage project for exploring systems programming in C and the structure of a periodic task loop. The current local prototype is a command-line simulator that runs a fixed uptime task three times, waits one second between iterations, and exits.

## Current Prototype

The implementation uses a monotonic clock to measure elapsed runtime independently of changes to the system clock. Platform-specific helpers use POSIX timing functions on Unix-like systems and Windows APIs on Windows. The command-line interface provides help, version information, and an explicit simulation mode.

CMake configures the C17 build and compiler warnings. Optional AddressSanitizer and UndefinedBehaviorSanitizer instrumentation supports checking memory and undefined-behavior issues during development.

## Status

The project is in progress. The local simulator currently has no networking, command execution, or command-and-control server. The public repository introduces the project; the simulator implementation is still local work and has not yet been published there.

Follow the project on [GitHub](https://github.com/nickczak/myC2-beacon).
