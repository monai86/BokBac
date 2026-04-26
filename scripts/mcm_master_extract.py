"""Master MCM 11th Edition extractor.

Extracts biochemical reactivity tables from all relevant chapters and
saves them as structured JSON for downstream processing.

Output:
  scripts/mcm_extract/raw_tables/<chapter>.json — list of tables per chapter
"""
import pdfplumber
import json
import re
from pathlib import Path

PDF_PATH = "Manual of Clinical Microbiology (11th Edition, 2015).pdf"
RAW_DIR = Path("scripts/mcm_extract/raw_tables")
RAW_DIR.mkdir(exist_ok=True, parents=True)

# Chapter ranges (PDF page numbers, 1-indexed)
# Offset = book page + 28 (front matter)
CHAPTERS = {
    "ch21_staphylococcus": (382, 410),
    "ch22_streptococcus": (411, 430),
    "ch23_enterococcus": (431, 450),
    "ch37_escherichia_salmonella_shigella": (713, 741),
    "ch38_klebsiella_others": (742, 776),
    "ch41_vibrio": (790, 810),
    "ch42_pseudomonas_burkholderia": (801, 825),
    "ch43_acinetobacter_nfb": (825, 850),
    "ch34_neisseria": (663, 685),
    "ch35_haemophilus": (685, 712),
}

# Match table headers like "TABLE 5  Separation of ..."
TABLE_HEADER_RE = re.compile(r"^\s*TABLE\s+(\d+)\s+(.{10,200})$", re.MULTILINE)

def extract_page_layout(pdf, page_idx):
    """Extract page text preserving layout."""
    return pdf.pages[page_idx - 1].extract_text(
        layout=True, x_tolerance=2, y_tolerance=2
    ) or ""

def find_tables_in_text(text, page_num, book_page):
    """Find all 'TABLE N: ...' segments in a page's text."""
    tables = []
    for match in TABLE_HEADER_RE.finditer(text):
        table_num = match.group(1)
        title = match.group(2).strip()
        start = match.end()
        # Capture roughly 70 lines after header
        lines = text[start:].split("\n")
        body_lines = []
        for line in lines:
            stripped = line.strip()
            # Stop at next TABLE header or footer markers
            if re.match(r"^TABLE\s+\d", stripped) and body_lines:
                break
            if "MCM 11th Edition" in line or stripped.startswith("PDFd:"):
                break
            body_lines.append(line)
        tables.append({
            "table_num": table_num,
            "title": title,
            "pdf_page": page_num,
            "book_page": book_page,
            "body": "\n".join(body_lines[:80]),  # limit
        })
    return tables

def extract_chapter(pdf, label, start_page, end_page):
    """Extract all tables from a chapter."""
    all_tables = []
    for p in range(start_page, end_page + 1):
        if p > len(pdf.pages):
            break
        try:
            text = extract_page_layout(pdf, p)
        except Exception as e:
            print(f"  Error page {p}: {e}")
            continue
        tables = find_tables_in_text(text, p, p - 28)
        all_tables.extend(tables)
    return all_tables

def main():
    print(f"Opening {PDF_PATH}...")
    with pdfplumber.open(PDF_PATH) as pdf:
        for label, (start, end) in CHAPTERS.items():
            print(f"\n=== {label} (PDF {start}-{end}) ===")
            tables = extract_chapter(pdf, label, start, end)
            print(f"  Found {len(tables)} tables")
            for t in tables[:8]:
                print(f"    Table {t['table_num']} (p.{t['pdf_page']}/book {t['book_page']}): "
                      f"{t['title'][:80]}")
            
            # Save to JSON
            out_path = RAW_DIR / f"{label}.json"
            out_path.write_text(
                json.dumps(tables, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )
            print(f"  → {out_path}")

if __name__ == "__main__":
    main()
