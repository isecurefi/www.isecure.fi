# UI components

Shared building blocks for every page rendered through `Layout.astro`. Colours
come from the tokens in `src/styles/theme.css` (`--landing-*`), so light and dark
themes work without page-specific overrides. Do not hard-code colours in pages.

## Page structure

```astro
<Layout … fullWidth>
  <PageHero eyebrow="…" title="…" lead="…">
    <Actions><Button href="…">Primary</Button></Actions>
    <Card slot="aside" tone="accent">…</Card>
  </PageHero>

  <Section>…</Section>
  <Section tone="band">…</Section>
  <Section>…</Section>
</Layout>
```

- `PageHero` must be the first element. It extends behind the fixed navigation,
  which stays transparent over it until the page scrolls.
- Catalog pages pass the hero to `CatalogPageLayout` with `slot="hero"`; the
  product tabs render below it.
- Alternate `Section tone="plain"` and `tone="band"` (a soft band that fades in
  and out of white) and vary layouts instead of stacking identical boxes.

## Components

| Component                       | Use                                                                        |
| ------------------------------- | -------------------------------------------------------------------------- |
| `PageHero`                      | Page title area; default slot under the lead, `aside` slot on the right    |
| `Section`                       | Full-width section with container; `tone`, `width="narrow"`, `spacing`     |
| `SectionHeading`                | Eyebrow, H2, lead; `align="center"`; default slot for actions              |
| `Split`                         | Two columns: `side` slot and main; `sticky` pins the side, `reverse` swaps |
| `Card`, `CardGrid`              | Content cards; `href` makes the whole card a link                          |
| `FeatureGrid`                   | Borderless icon + title + text columns                                     |
| `Steps`                         | Numbered steps, `direction="row"` or `"column"`                            |
| `CheckList`                     | Icon list for scope, boundaries and inclusions                             |
| `Callout`                       | Highlighted note for limitations or status                                 |
| `FaqList`                       | Accordion questions                                                        |
| `Button`, `Actions`             | Primary, secondary and link buttons; button row                            |
| `Badge`, `IconTile`, `icons.ts` | Small labels and the shared stroke icon set                                |
| `Prose`                         | Long-form text (guides, policies)                                          |
