---
title: Fixture Feed
date: 2026-07-05
description: A small REST API that collects local league fixtures and serves them as clean JSON, with a Java test suite that checks it stays honest.
image: /images/fixture-feed-cover.png
tech:
  - Node
  - Express
  - SQL
  - Java
  - Git
---
<!-- MOCK-UP. Invented placeholder to see the layout with real-length text.
     Replace all of this before publishing. -->

A small REST API that collects local league fixtures and serves them as clean
JSON, with a Java test suite that checks it stays honest.

## Why I built it

Every club published its fixtures as a PDF, or a photo of a whiteboard, or a
post that got edited later. There was no way to ask a simple question like what
is on this weekend without opening eight tabs.

## What it does

- One endpoint for fixtures, filterable by club and by date
- Kick-off times normalised, so everything is in one timezone
- A cached response, because the data changes weekly, not hourly
- A test suite that fails loudly when a source changes shape

## How it's built

An Express API in front of a SQL table of fixtures, with a scheduled job that
refreshes them. The API never reads a source directly: it only reads the table,
so a source going down slows the data getting stale rather than taking the
whole thing offline.

The tests are Java, driving the API from outside like a real client would.

## Decisions, and what they cost

### The importer and the API never talk

The job that fetches fixtures writes to the table. The API reads the table. They
share nothing else. Either can be restarted, rewritten, or broken without the
other noticing.

The cost is that the API can serve stale data and not know it. I add a
last-updated field rather than pretend it is always fresh.

### Testing from outside, in a different language

The tests are Java, and they talk to the API over HTTP like any other client.
Nothing is mocked. If a test passes, the thing genuinely worked end to end.

It is slower than unit tests and it needs a running server, which makes it more
annoying to run. In return it has never once passed while the API was broken,
which is more than I can say for the mocked version I started with.

## The parts that were actually hard

### Kick-off times that were nearly right

Fixtures came back an hour out, but only some of them, and only for part of the
year. It was daylight saving: some sources published local time, some published
UTC, and neither said which.

There was no clever fix. I had to work out what each source meant, write it
down, and convert on the way in. The bug was not in my code, it was in believing
a time is a number.

## What's next

- More leagues, which mostly means more sources to pin down.
- A results endpoint, not just fixtures.
- A public status page, so staleness is visible rather than implied.
