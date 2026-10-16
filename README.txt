SEOKY separated frontend files

Files:
- index.html: HTML page structure
- style.css: CSS extracted from all 14 inline style blocks
- script.js: JavaScript extracted from all 7 inline script blocks, in original order

Keep all three files in the same folder. Open index.html in a browser to test.

Notes:
- The original HTML references manifest.json, but that file was not included in the uploaded source. The storefront can still load, but the browser may show a missing manifest warning until you add the original manifest file.
- Any image files or other assets referenced by URLs/paths must remain available at those same paths.
- This is a mechanical split of the supplied file; test cart, wishlist, filters, and admin behavior after splitting.
