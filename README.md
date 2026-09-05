# Google AI Remover

A browser extension (Firefox and Chrome, Manifest V3) that stops Google AI
Overviews **before they are generated** -- not just hidden! The goal is model
inference never runs, so nothing is spent on an overview you never wanted!

## How it works

### Layer 1: Never ask for an AI Overview (primary, prevents generation)

Every navigation to `google.com/search?q=...` is rewritten **inside the
browser's network layer** (via `declarativeNetRequest`) to append `udm=14`,
which requests Google's "Web" results mode. In that mode the AI Overview
pipeline is simply never invoked so the original AI request is never sent.

Searches that already carry a `udm`, `tbm`, or `asearch` parameter are left
untouched, so images, news, and videos tabs or a deliberate click on the AI Mode
tab still work normally.

### Layer 2: Block the generation trigger

On a normal results page, the AI Overview is delivered lazily: the initial HTML
contains only an empty "Searching..." shell, and a follow-up XMLHttpRequest to
`/async/folsrch` is what actually kicks off and streams the AI generation. If a
results page ever loads without `udm=14` (a link from another app, a Google
experiment, etc.), rules 3–4 block that follow-up request (`/async/folsrch` and
the older `asearch=arc` streaming variant), so the trigger is never sent.

### Layer 3: Cosmetic cleanup

For the minority of queries where Google pre-renders or serves a cached overview
inline, `content.js` + `hide-aio.css` hide the container by its structural data
attributes (`data-async-type="folsrch"`, `data-aim`) and by the English "AI
Overview" heading text as a fallback. Only this layer fails to save compute --
layers 1–2 are language-independent and do.

## Installation

### Firefox

1. Open `about:debugging` → "This Firefox"
2. "Load Temporary Add-on" → select this folder's `manifest.json`
3. Official add-on listing [TBD]

### Chrome / Chromium

1. Open `chrome://extensions`, enable "Developer mode"
2. "Load unpacked" → select this folder (Chrome may warn about the
`browser_specific_settings` key, it is ignored there and harmless.)

## Verifying it actually prevents the request

1. Search for something -- the address bar should show `udm=14` and the page
should be plain web results.
2. Open DevTools → Network, filter for `folsrch` -- there should be no request.

## Limitations and trade-offs

>> `udm=14` is an **undocumented** parameter (available since May 2024, still
working as of 2026). Google could remove it -- layers 2–3 remain as backstops.
>> The Web results mode also drops some non-AI SERP features (shopping units,
some inline widgets). Knowledge panels and the tab strip remain.
>> Layer 3's text matching is English-only.
>> Host permissions cover `*.google.com` country-code domains (google.co.uk
etc.) already redirect to google.com for search, but if you use one directly the
redirect rule matches them -- only Chrome's redirect action may lack host
permission there. Add the TLD to `host_permissions` if needed.
>> Google's endpoints and markup change frequently. If overviews reappear, check
whether `folsrch` has been renamed (DevTools → Network on an unfiltered search)
and update `rules.json`.
