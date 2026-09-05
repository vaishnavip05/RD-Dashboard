# FLABS Research Dashboard

This is a self-contained dashboard generated from the five supplied Excel workbooks.

## Start it

1. Regenerate the data whenever a source workbook changes:
   ```powershell
   & 'C:\Users\Dell\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' build_data.py
   ```
2. Open `index.html` in a browser. For the most reliable local experience, run:
   ```powershell
   & 'C:\Users\Dell\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 8080
   ```
   Then visit `http://localhost:8080`.

The source workbooks remain unchanged. `data.js` is the generated dashboard data.
