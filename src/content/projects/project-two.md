---
title: Shift Swap
date: 2026-07-10
description: A web app for shift workers to post shifts they cannot make and pick up ones they want, without a group chat full of scrolling.
image: /images/shift-swap-cover.png
tech:
  - Angular
  - TypeScript
  - Node
  - Express
  - SQL
---
<!-- MOCK-UP. Invented placeholder to see the layout with real-length text.
     Replace all of this before publishing. -->

A web app for shift workers to post shifts they cannot make and pick up ones
they want, without a group chat full of scrolling.

## Why I built it

Swapping a shift meant posting in a group chat and hoping. The message scrolled
away in an hour, two people would claim the same shift, and the manager found
out last. The information existed, it just lived somewhere that forgets.

## What it does

- Post a shift you cannot work
- Claim one that suits you, first come first served
- A manager approves the swap before it is real
- Everyone sees the same rota, always

## How it's built

An Angular front end talking to an Express API over REST, with the rota in
Postgres. A swap is a row with a state, not a message: posted, claimed,
approved. The screens only ever read that state, so nothing has its own idea of
who is working when.

## Decisions, and what they cost

### A swap is a state machine, not a message

Every swap moves through the same three states, and only certain moves are
legal. Claimed cannot go back to posted; approved is final. Modelling it this
way killed a whole family of bugs before I wrote the screens.

The cost is that the rules live in one place and are strict. Adding a fourth
state later means touching every screen that reads it.

### The database decides who claimed it first

Two people tapping claim at the same moment was the bug I expected, so the
claim is a conditional update: set the claimer only if there isn't one. The
loser gets told, rather than silently overwriting the winner.

I could have checked first and then written. That reads more naturally and is
wrong, because someone else can slip in between the two steps.

## The parts that were actually hard

### Two people claiming the same shift

My first version checked whether a shift was free, then claimed it. It worked
every time I tested it by hand, because I could not tap twice in the same
millisecond. It broke the first day two people used it.

Writing the check into the update itself, so the database settles the race,
fixed it. The lesson was that "it works when I try it" and "it works" are not
the same claim.

## What's next

- Notifications. Right now you find out by looking.
- A mobile build, since nobody is at a desk when they need this.
- Tests around the state machine, which is where the risk lives.
