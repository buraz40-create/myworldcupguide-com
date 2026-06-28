<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Everything you build must be interactive

Every page, feature, or data view you add to this site MUST be interactive — not a static dump of numbers or text. The user requires this for every build, every time, no exceptions.

- Give the reader controls: things to click, toggle, filter, sort, re-run, pick, or adjust, and have the page respond live.
- Data/stats pages must let the reader manipulate the data (sort columns, filter, change inputs, re-simulate), not just read a fixed table.
- Models and simulations should be re-runnable client-side with adjustable parameters, not only computed once at build time.
- When in doubt, add interactivity. A passive page is a failed build here.
