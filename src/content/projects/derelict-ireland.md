---
title: Derelict Ireland
date: 2026-07-13
description: An interactive map of 2,196 derelict sites across Ireland, built by pulling together the registers that every local authority is legally required to keep.
repo: https://github.com/ACoci86/derelict-ireland
image: /images/derelict-cover.jpg
tech:
  - Astro
  - TypeScript
  - Node
  - MapLibre
  - Git
---
An interactive map of derelict sites across Ireland, built from the registers
that local authorities are legally required to keep.

Live at
[acoci86.github.io/derelict-ireland](https://acoci86.github.io/derelict-ireland/).

## Why I built it

Under the Derelict Sites Act, every Irish local authority must keep a public
register of derelict sites. All 31 do. The catch is that "public" means dozens
of PDFs, spreadsheets, ArcGIS layers and open-data portals, in wildly different
formats, one per council.

So the information is public and effectively unusable. You cannot ask a simple
question like how many derelict sites are near me, or what they are worth,
without opening thirty websites.

This pulls them into one place: 2,196 sites across 26 councils, mapped, with the
registers valuing them at roughly €210 million.

## What it does

- Every site as a pin, clustered at low zoom so thousands of points stay readable
- Click a council to filter the map to it, zoom, and highlight its boundary
- A coverage table with mapped and unmapped counts, valuations, sources, and when each register was last updated
- Search and sort that table by any column
- Download everything, or one council, as CSV or GeoJSON

![The coverage-by-council table, showing mapped counts, valuations and sources](/images/derelict-table.jpg)

## How it's built

Two halves that never talk to each other directly. An offline pipeline produces
the data; a static site displays it.

The pipeline has one adapter per council, twenty-six of them. Councils publish
in two ways. Some give coordinates directly through ArcGIS or open-data layers,
so those sites map precisely with no guessing. The rest publish addresses only,
in a PDF or spreadsheet, which a one-off converter scrapes into a committed CSV
before anything is geocoded.

The website reads the committed data files and needs no secrets and no server.
The update loop is: run the pipeline, commit the regenerated data, push.

## Decisions, and what they cost

### Every pin says how sure it is

A geocoded address is not a fact, it is a guess with a confidence level. So
every site carries one: `council` where the council gave coordinates, then
`exact`, `street`, `town`, and `none` for anything still unplaced.

Currently about 1,350 are council-precise, 45 exact, 401 street-level and 400
town-level. A pin derived from a vague address is honestly capped at street or
town precision rather than presented as a house.

The cost is that the map is less impressive than it could be. I could have
dropped every address on its best guess and shown a tidier picture. The map
would then be quietly wrong in a few hundred places, and nobody looking at it
would know which ones.

### Anything unplaceable is held back, not guessed

About 260 addresses could not be geocoded to a standard I trusted. They are
written to a review file rather than pushed onto the map at low confidence, and
the coverage table shows them as not-yet-mapped.

This is why the site says 26 of 31 councils and 89% coverage instead of quietly
rounding up. An honest gap is more useful than a fabricated pin, especially for
something that names real addresses.

### Only location data is ever read

Some registers expose owner names, owner addresses and occupier details. The
pipeline never reads those fields, even when they are sitting right there in the
source. It takes location, reference, dates and valuation and nothing else.

The register being public does not make republishing every field on it a
reasonable thing to do.

### No Google, nothing that forbids storing results

Geocoding goes through Nominatim then Photon, both OpenStreetMap. That was a
deliberate constraint: no paid service, and nothing whose terms forbid keeping
the coordinates. Results are cached, so re-runs cost nothing and finish fast.

The cost is accuracy. A paid geocoder would place more of those 260 holdouts.
This one is free forever and the data stays reusable, which for a public-interest
dataset matters more.

## The parts that were actually hard

### Streets with the same name in the wrong county

Geocoders are eager to please. Ask for "North Main Street" and you will get one,
just possibly the one in Wexford when you meant Cork.

Two things fixed it. Each council gets a locality hint added to the query, and
every result is then checked against a bounding box for that council's own
county and rejected if it falls outside. A wrong-county match now never reaches
the map, it goes to the review pile instead.

The hints needed to be less specific than felt natural. "Cork" works; "Cork
City" over-specifies and returns nothing at all.

### One entry, several buildings

Registers often list a run of properties as a single line: `6, 8, 10 Main
Street`. Mapped literally, three derelict buildings become one pin.

Splitting them is easy enough. The part I did not see coming is that the entry
carries one valuation for the whole run, so splitting into three sites and
copying the valuation across counted that money three times and inflated the
council's total. The valuation now stays on the first split only.

The lesson was that when you split a record, you have to ask what each field
means afterwards. Some fields describe each property. Some describe the entry.

### Every council formats things differently

There is no shared format. Some publish clean ArcGIS layers, some a PDF that has
been through a scanner. This is why there are 26 adapters and not one parser:
each council's mess is its own, and pretending otherwise produces a parser that
half-works everywhere.

Adding a council is now a contained job: write an adapter, add a line to the
run list, add a county box if it needs geocoding, drop in the logo.

## What's next

- The five councils that keep a register but do not publish it online. That is a records request, not a code problem.
- The 260 held-back addresses, which need better source data rather than a better geocoder.
- Scheduled re-runs, so the registers stay current without me remembering.
