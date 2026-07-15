# How the Projects + Pages CMS setup works

A plain-English explanation of the changes made to this site so that your
**projects live in editable files** and can be managed through **Pages CMS**.

---

## 1. The big idea

Before, your projects were **typed directly into the page code** as a list.
To change a project you had to edit code. That also meant a CMS had nothing to
edit, because a CMS can only manage **files**, not code buried inside a page.

So the goal was to move projects out of the page and into **content files**,
then teach three things to read those files:

1. **Astro** (your website), so it can display the projects.
2. **Pages CMS**, so you can edit the projects in a friendly web form.
3. **A schema**, a rulebook that keeps everything consistent.

Once that's done, the whole thing works as a loop:

```
You edit a project in Pages CMS
   -> it saves a file and commits it to GitHub
      -> Cloudflare rebuilds the site
         -> Astro reads the file and shows the updated page
```

There is **no database** anywhere. The Markdown files _are_ the database.

---

## 2. What each new file does

### The content itself: `src/content/projects/`

Three Markdown files: `project-one.md`, `project-two.md`, `project-three.md`.
**Each file is one project.** A file has two parts:

```markdown
---
title: Project One
date: 2026-07-14
description: A short summary of the project.
repo: https://github.com/ACoci86/portfolio
---

Here is where you write freely about the project: what you built,
what you learned, problems you hit.
```

- The block between the `---` lines is the **frontmatter**, the structured
  facts (title, date, description, optional repo link).
- Everything below is the **body**, your write-up, in Markdown.

**Adding a new project means adding a new file here.** That is exactly what
Pages CMS does for you when you click "add."

### The rulebook: `src/content.config.ts`

This declares a collection called `projects`, says where it lives, and lists
the fields every project must have (title, date, description, and an optional
repo URL). If a project is ever missing its title, the site build **fails
loudly** instead of quietly publishing something broken. It's a safety net.

### The pages that display projects

- `src/pages/projects/index.astro` builds the **`/projects`** page, listing
  every project, newest first.
- `src/pages/projects/[slug].astro` builds the **individual write-up** page.
  The `[slug]` in the filename is Astro shorthand for "automatically make one
  page for every project file." Three project files become three pages, with no
  extra work. Each page shows the title, date, a "Source" link (if a repo was
  given), and your full write-up.

### The shared layout: `src/layouts/Base.astro`

The header (name and navigation) and footer used to live only inside the
homepage. They were moved here so **every page shares the same header and
footer** without copy-pasting. Change the nav once, it changes everywhere. The
nav links point to `/#about`, `/projects`, and `/#contact` so they work from
any page.

### The homepage: `src/pages/index.astro`

Rewritten to use the shared layout. Its "Featured projects" section no longer
contains fake hardcoded projects. It now **automatically pulls the three most
recent real projects** from the collection and links each to its full write-up.
(Services and the tech list stayed hardcoded, because only projects needed to
be CMS-managed.)

### The CMS config: `.pages.yml`

This is the file that fixes the "Configuration not found" screen in Pages CMS.
It describes your projects in the CMS's own language: "show a **Projects**
section, it's a list you can add to, and each entry has these form fields:
Title, Date, Description, Repository URL, and a rich-text Write-up." It also
points image uploads at the `public/images/` folder.

> Important: `.pages.yml`, the rulebook (`content.config.ts`), and the Markdown
> files all describe the **same shape** from three angles, so if you add a
> field in one, add it in the others too, or they'll disagree.

### The featured image (added later)

Each project can now have an optional **featured image**. Because a featured
image touches the same three-places-must-agree rule, it was added in three
spots at once, plus shown on the pages:

1. **`.pages.yml`**: a `Featured image` field of `type: image`. In the CMS this
   is an upload box with a preview and a "Remove" button. Uploads go to
   `public/images` and the file's frontmatter stores the served path, e.g.
   `image: /images/daisy.jpg`.
2. **`src/content.config.ts`**: `image: z.string().optional()` was added to the
   schema. It's **optional**, so projects without an image still build fine
   (nothing breaks, no empty box appears).
3. **The pages that display it:**
   - `src/pages/projects/[slug].astro` shows the image at the top of the
     write-up, just under the title.
   - `src/pages/projects/index.astro` and `src/pages/index.astro` show it as a
     thumbnail on each project card (the `/projects` list and the homepage
     "Featured projects" section).
   - `src/styles/global.css` sizes the thumbnails uniformly (a 16:9 crop that
     fills the card) and the write-up image (full width, capped height), so
     different source images all look tidy.

Existing projects have no `image:` line yet, so they simply show no image until
one is uploaded in the CMS. Adding a featured image is entirely optional per
project.

### The images folder: `public/images/.gitkeep`

Pages CMS saves uploaded images to `public/images`. Git can't track an empty
folder, so a placeholder file called `.gitkeep` was added just to make the
(currently empty) folder exist in the repo. Once you upload a real image, you
can delete the placeholder. It never appears on your site.

---

## 3. How to add or edit a project

**Two ways, both ending up doing the same thing:**

- **In code:** add or edit a `.md` file in `src/content/projects/`.
- **In Pages CMS (once connected):** click into the Projects section, fill in
  the form, and save. The CMS writes the same kind of `.md` file for you and
  commits it to GitHub.

---

## 4. Publishing it (the remaining manual steps)

1. **Push to GitHub.** Pages CMS only sees what's on GitHub, so nothing appears
   in the CMS until these files are committed and pushed.
2. **Refresh Pages CMS.** The "Configuration not found" screen becomes your
   **Projects** editor.
3. Each save in the CMS commits to GitHub, and Cloudflare automatically
   rebuilds and deploys the site.

---

## 5. Adding a blog later

A blog would be the **same four pieces again**, just duplicated with a new
name. Nothing above needs to change:

1. A new folder, e.g. `src/content/posts/`.
2. A new collection added to `src/content.config.ts` (same file, one more
   entry).
3. Two new pages: `src/pages/blog/index.astro` and
   `src/pages/blog/[slug].astro`.
4. A new block in `.pages.yml` describing the posts.

Then add a "Blog" link to the nav. Because you've already done the whole loop
once for Projects, the second time is mostly copy-paste-and-rename.
