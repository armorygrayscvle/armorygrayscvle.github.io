import re
import pathlib

SNIPPET = """
  <script>
    (function() {
      const KEY = "ag_seen_loader";
      try {
        if (sessionStorage.getItem(KEY)) {
          document.documentElement.classList.add("skip-loader");
          document.body && document.body.classList.add("skip-loader");
        } else {
          sessionStorage.setItem(KEY, "1");
        }
      } catch (e) {
        /* ignore */
      }
    })();
  </script>
"""

def inject(path: pathlib.Path):
  text = path.read_text()
  if "ag_seen_loader" in text:
    return False
  # insert after first meta charset
  m = re.search(r"(<meta\\s+charset[^>]*>\\s*)", text, re.IGNORECASE)
  if not m:
    return False
  new = text[: m.end()] + SNIPPET + text[m.end():]
  path.write_text(new)
  return True

def main():
  changed = 0
  for p in pathlib.Path(".").rglob("*.html"):
    if inject(p):
      changed += 1
      print(f"Injected skip-loader snippet into {p}")
  print(f"Done. Updated {changed} files.")

if __name__ == "__main__":
  main()
