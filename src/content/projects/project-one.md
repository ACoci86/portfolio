---
title: Link Stash
date: 2026-07-14
description: An Android app for saving links into folders, with share-sheet support so you can stash a link from any app on your phone.
repo: https://github.com/ACoci86/link-stash
image: /images/link-stash-cover.png
---
An Android app for saving links into folders, with share-sheet support so you can
stash a link from any app on your phone.

Angular · Ionic · Capacitor · TypeScript · Java

## Why I built it

I kept losing links. A recipe someone sent me, a video I meant to watch, a page I
wanted to read properly later. They went into browser bookmarks and never came
back out, because bookmarks are a pile, not a system.

What I wanted was small: hit share, pick a folder, done. No account, no sync, no
subscription, nothing loading. The apps I tried all wanted to be more than that.
So I built the version I actually wanted, and I use it every day.

## What it does

- Save links into folders you make
- Share into it from any other app on the phone
- Titles and thumbnails appear on their own
- Drag to reorder folders and links
- Fix a title by hand if a site won't give one
- Stored on the phone, no account needed

## Screenshots

<div class="shots">
  <figure>
    <img src="/images/link-stash-folders.png" alt="The folder list screen, showing Recipes, Watch Later and Reading folders with link counts" />
    <figcaption>Folder list</figcaption>
  </figure>
  <figure>
    <img src="/images/link-stash-links.png" alt="Inside the Reading folder, showing saved links with their titles and thumbnails" />
    <figcaption>Links inside a folder</figcaption>
  </figure>
</div>

## How it's built

A web app built with Angular and Ionic, wrapped into a real Android app using
Capacitor. One service holds all the folders and links and everything you can do
to them. The three screens just show that data and call into it. Nothing is
stored anywhere else, so the screens can never disagree about what exists.

It is a real signed release, not a demo. It is installed on my phone, and I have
already shipped an update to it.

## Decisions, and what they cost

### Storing everything on the device as JSON, not in a database

All the data is one JSON string in the phone's key/value store. No database, no
schema, no queries. That sounds lazy until you count: even a heavy user has a few
hundred links, which is a few kilobytes of text that the app always reads all at
once anyway. SQLite would have bought me migrations and query planning to manage
something smaller than a photo.

The cost is real, though. Every change rewrites the whole thing. At a few hundred
links that is invisible. At fifty thousand it would be a bad idea, and I would
have to move. I picked for the size the app actually is, not the size it might
one day be.

### One service owns all the data

Every folder and link lives in a single service, and the screens hold nothing of
their own. They read from it and call into it, and that is the only copy that
exists.

I learned this one the hard way. An early version let screens keep their own
copies, and they drifted apart: I would add a folder on one screen and another
screen would carry on showing the old list. The bug was not in either screen. It
was in there being two answers to the same question.

### A web app wrapped as native, not a native Android app

Angular and Ionic wrapped by Capacitor, rather than writing the thing in Kotlin.
It meant one codebase in tools I already knew, and it got a working app onto a
real phone quickly.

The share bug below is exactly what that choice costs. Wrapping the web in native
is free right up until you hit the seam between them, and then you are debugging
in two languages at once. Still the right call for this app. But it was not free,
and it is worth being honest that the wrapper leaks.

### No account, no server

There is no backend at all. Nothing to run, nothing to pay for, nothing to
breach, and it works with no signal. The whole app is the phone.

The cost is that your links live on exactly one device. Lose the phone and they
are gone. That is the first thing on the list below, and it is the one decision
here I would most likely revisit.

## The parts that were actually hard

### Sharing into an app that was already open

Sharing a link into the app worked when the app was closed, but silently did
nothing when it was already open. No crash, no error, it just quietly dropped the
link.

Android only hands an app a shared link when it starts up. An app that is already
running never starts, so it never looks. My code was fine. My assumption about
when my code runs was wrong. Fixing it meant dropping out of the web layer and
into the native Android code underneath.

### Showing what a link actually is

A list of raw URLs is useless to look at, so I wanted each link to show its real
page title and a thumbnail. The problem is that a browser is not allowed to read
another website's page. That is a security rule, and it exists for good reasons,
so there was no clever way round it from inside the app.

The answer was to ask someone else to do the reading. YouTube publishes an
endpoint that hands back a video's title and thumbnail, and
[microlink.io](https://microlink.io) loads any other page on its own server and
returns what it finds. Some sites block that
too, so those fall back to showing the domain name, and I added a way to type a
title in by hand. Not every problem has a clean fix; this one has a good-enough
one plus an escape hatch.

## What's next

- Sync between devices. Everything is stored on one phone right now.
- Search. Fine with a handful of folders, less fine with fifty.
- Tests. The app works, but nothing checks that it keeps working.
