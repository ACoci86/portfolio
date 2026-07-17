// @ts-check
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";

// Markdown links that leave the site open in a new tab.
//
// This is a Sätteri plugin. Sätteri is the thing that turns the project
// Markdown files into HTML, and it lets you step in just before the HTML is
// written and change it. Here we look at every link, and if it points at
// another website we add the two attributes that make it open in a new tab.
//
// Docs, if this ever needs changing:
//   How to write the plugin (the `filter: ["a"]` and `setProperty` bits):
//   https://satteri.bruits.org/docs/plugin-api/
//
//   How to plug it into Astro (the `markdown.processor` section):
//   https://docs.astro.build/en/reference/configuration-reference/
//
// Note: the old way of doing this was `markdown.rehypePlugins`, which most
// answers on the web still tell you to use. Astro has deprecated it, so it is
// worth ignoring those.
const externalLinks = {
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return;
      ctx.setProperty(node, "target", "_blank");
      ctx.setProperty(node, "rel", "noreferrer");
    },
  },
};

// https://astro.build/config
export default defineConfig({
  // Once the domain is decided CHANGE.
  site: "https://portfolio.pages.dev",

  markdown: {
    processor: satteri({ hastPlugins: [externalLinks] }),
  },
});
