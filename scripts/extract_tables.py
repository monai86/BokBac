"""Extract tables from MCM PDF — proper table parsing."""
import pdfplumber
import json
from pathlib import Path

PDF_PATH = "Manual of Clinical Microbiology (11th Edition, 2015).pdf"
OUTPUT_DIR = Path("scripts/mcm_extract/tables")
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# Page ranges where master biochemical tables are likely located
# Enterobacteriaceae chapter: PDF 742-775
# Table 1 & 2 should be near the beginning (around 745-755)
TARGET_RANGES = {
    "enterobacteriaceae_main": (744, 760),
    "staphylococcus": None,  # find later
    "streptococcus_groups": (411, 425),
}

def extract_tables_from_range(pdf, start, end, label):
    """Extract all tables in a page range."""
    all_tables = []
    for i in range(start - 1, min(end, len(pdf.pages))):
        page = pdf.pages[i]
        try:
            tables = page.extract_tables()
            for t_idx, table in enumerate(tables):
                if not table or len(table) < 2:
                    continue
                all_tables.append({
                    "pdf_page": i + 1,
                    "book_page": i + 1 - 28,
                    "table_index": t_idx,
                    "rows": len(table),
                    "cols": len(table[0]) if table else 0,
                    "data": table,
                })
        except Exception as e:
            print(f"  Error on page {i+1}: {e}")
    return all_tables

if __name__ == "__main__":
    with pdfplumber.open(PDF_PATH) as pdf:
        for label, rng in TARGET_RANGES.items():
            if rng is None:
                continue
            start, end = rng
            print(f"\n=== Extracting tables: {label} (PDF {start}-{end}) ===")
            tables = extract_tables_from_range(pdf, start, end, label)
            print(f"  Found {len(tables)} tables")
            
            # Save to JSON
            out_path = OUTPUT_DIR / f"{label}.json"
            out_path.write_text(json.dumps(tables, ensure_ascii=False, indent=2))
            print(f"  → {out_path}")
            
            # Print summary
            for t in tables[:5]:
                print(f"    PDF p.{t['pdf_page']} (book p.{t['book_page']}): "
                      f"{t['rows']}r × {t['cols']}c")
                if t['data'] and t['data'][0]:
                    header = [str(c)[:25] for c in t['data'][0] if c]
                    print(f"      header: {header[:6]}")
