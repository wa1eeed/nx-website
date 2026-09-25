# NX Commerce Infrastructure — page generator

The 22 pages under `/ar/solutions/commerce/` and `/en/solutions/commerce/` are
generated, not hand-written. Everything on them derives from two content files,
so editing the HTML directly will silently desynchronise the copies of that copy
that live elsewhere — the cards on `/solutions/`, the tiles on the family page,
the "related solutions" blocks, the share images and the structured data.

Edit the content, then rebuild.

## Files

| File | What it holds |
|---|---|
| `data.py` | All Arabic copy: ten solutions plus the family page, and the shared capability catalogue |
| `data_en.py` | The same in English, page for page |
| `build.py` | The page template. Lifts the site's own `<head>`/nav/footer from `solutions/index.html` so the chrome never drifts |
| `solutions_index.py` | Writes the solution cards into `ar|en/solutions/index.html`, between `<!-- commerce:start -->` markers |
| `ogcards.py` | Renders one 1200×630 share card per page into `assets/images/og/` |
| `make.sh` | Runs `build.py` for both languages, then stamps the asset version |

## Rebuilding

```sh
docs/commerce/make.sh 135          # pages, both languages; 135 is the ?v= to stamp
python3 docs/commerce/solutions_index.py   # refresh the cards on /solutions/
python3 docs/commerce/ogcards.py           # only when a headline or badge changed
```

`make.sh` takes the asset version because `build.py` copies the `?v=` it finds in
the borrowed chrome, which lags while `nx-commerce.css` is still changing.

## Things that will bite

- **`ogcards.py` needs macOS.** It rasterises with `sips`, which is the only SVG
  renderer available on the machine this was built on. `sips` shapes Arabic
  correctly and handles gradients, patterns and embedded images, but **ignores
  SVG filters** — that is why the logo sits on a white chip rather than being
  recoloured.
- **`build.py` asserts rather than guesses.** It refuses to write a page whose
  stylesheet or engine failed to attach, and refuses to write one whose share
  card is missing. An earlier version used a silent string replace, and ten
  English pages shipped without their animation engine before anyone noticed.
- **Unread source copy** is written as `⟦…⟧` in the data files. `build.py`
  counts the markers and prints the total; a page with any is not finished.
- `docs/` is excluded from the Docker image and from `.dockerignore`, so nothing
  here is ever served.
