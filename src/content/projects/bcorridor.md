---
title: B Corridor
date: 2026-07-18
description: A biodiversity website for a Waterford conservation project, with an interactive trail map and a writing tool that lets the team publish without touching code.
repo: https://github.com/ACoci86/bcorridor-website
image: /images/bcorridor-cover.jpg
tech:
  - JavaScript
  - Node
  - Leaflet
  - Cloudflare
  - Git
---
A biodiversity website for a Waterford conservation project, with an interactive
trail map and a writing tool that lets the team publish without touching code.

## What it is

B Corridor is a conservation project connecting habitats across Waterford. They
needed a site that could explain the work, show people where the corridor
actually runs, and let them post news themselves.

It is live at [bcorridorwaterford.com](https://bcorridorwaterford.com), and the
team has been publishing through the admin tool since June.

## The interactive trail map

The centrepiece. Six numbered stops along a walking trail, the corridor
boundary, and a dotted route that follows real paths rather than cutting across
buildings.

![The trail map, with six numbered stops and the corridor boundary](/images/bcorridor-map.jpg)

The coordinates came from the project's own Google Earth file. The route asks a
free routing service for genuine walking directions, and if that call fails a
straight line between the stops stays on screen. The map still works, it is just
less precise.

## Publishing without touching code

The team writes posts in a private admin page: title, date, words, a photo. They
never see the code and never open a text editor.

What happens next is the part I am most pleased with. The post is saved as plain
text into the project's history, which triggers a rebuild, which writes out
every page fresh. One post becomes three things: a full article page, a card on
the news page, and a card on the homepage. Nothing is copied by hand.

There is no database anywhere in the system.

## Decisions, and what they cost

### Every page is written out in advance

Most sites do their thinking when you arrive: you click, a server queries a
database, and builds the page while you wait. This one does the opposite. Every
page already exists before anyone asks for it, so visiting is just collecting a
finished file.

That single decision explains most of the rest. It is why the site is fast, why
it costs almost nothing to run, why a traffic spike cannot knock it over, and
why there is no database to maintain, back up or secure.

The cost is that publishing is not instant. A post goes through a rebuild before
it appears, so the team waits about a minute rather than seeing it live
immediately. For a news page that is a fair trade. For something like live
comments it would be the wrong one entirely.

### The content lives in version control, not a database

Posts are saved as plain text files through GitHub's API. Every edit becomes a
dated, attributed commit that can be read or undone, and the content is never
trapped: if the site were rebuilt from scratch tomorrow, the writing comes
across intact.

Writes are slower than a database would be, and this would not suit a site with
many editors working at once. With a handful of people posting news, it has not
once been a problem.

### Photos are shrunk in the browser, before upload

Phone photos arrive at 4 to 10 MB, which would make the site slow and fill the
repository. So the editor's own browser resizes and re-encodes each one before
it is ever sent: a 4 MB photo leaves as roughly 200 KB.

The wrinkle is that some browsers quietly ignore a request for the modern WebP
format and hand back a large PNG, ignoring the quality setting with it. The code
checks what actually came back and falls back to JPEG, so the image is always
genuinely compressed rather than only apparently so.

## The parts that were actually hard

### The map sheet that would not close

On phones the stop details slide up as a sheet you can drag away. It worked,
until occasionally it did not: the sheet would stick half-closed and stay there.

The animation reports when it finishes, and I was waiting for that signal before
tidying up. But it does not always fire. Now a timer runs alongside it and
whichever arrives first does the work, so the sheet always finishes closing.

The wider lesson was that dragging had to be taught manners. The sheet only
starts to pull when the content is already scrolled to the top and the finger is
moving down. Otherwise you are trying to read and the whole panel comes away in
your hand.

### A scroll that threw you down the page

Opening a stop scrolled it into view. On iPhones that sometimes flung the
visitor somewhere else entirely.

The sheet is pinned to the viewport on phones, and Mobile Safari, asked to
scroll a pinned element into view, scrolls to where that element would have sat
in the document instead. My code was reasonable. My assumption that every
browser meant the same thing by it was not. It now only scrolls on desktop.

### Photos that popped in one by one

The stop photos are named only inside the JavaScript, never in the HTML, so the
browser's preloader cannot see them coming. Every stop you opened, the photo
appeared a beat late.

The fix was to quietly fetch them in the background while the browser is
otherwise idle, so they are already cached by the time anyone taps a stop.

## What I would change

The stylesheet is the weak point. It grew to 4,590 lines, and its later sections
were written as corrections layered on top of earlier ones rather than edits to
them, so one visual change can live in several places. Nothing is broken, but it
is the part most likely to get harder over time, and it is where I would spend
the next tidy-up.
