# Flight v2 prototype

The approved look-and-feel reference for the six-stop Home page: dusk flight scrubbed by scroll, an intro
fly-in on load, and at each stop a reticle lock → pin drop → leader line → card. Reduced motion shows each
stop as a still section with its card in place.

`index.html` is the page body as published as a Claude artifact (no `<html>`/`<head>`). Its frames are not
committed: run `tools/flight/export_web.py docs/prototypes/flight-v2` to write `frames/fNNN.webp` next to
it (and refresh the stop data block). To view it locally, wrap it in a minimal HTML document and serve the folder.

Approved since: cards will reveal with a "condensing mist" effect instead of the clip-path unfold.
