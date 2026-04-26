"""Extract pages with layout info to preserve column structure."""
import pdfplumber
from pathlib import Path

PDF_PATH = "Manual of Clinical Microbiology (11th Edition, 2015).pdf"
OUTPUT_DIR = Path("scripts/mcm_extract/layout")
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# Pages where Table 1 & 2 of Enterobacteriaceae likely live
# Chapter starts at PDF 742, tables usually 2-5 pages in
TARGET_PAGES = [744, 745, 746, 747, 748, 749, 750, 751, 752, 753]

def extract_with_layout(pdf, page_idx):
    """Extract text preserving spatial layout."""
    page = pdf.pages[page_idx - 1]
    # use layout=True to preserve original whitespace
    return page.extract_text(layout=True, x_tolerance=2, y_tolerance=2) or ""

if __name__ == "__main__":
    with pdfplumber.open(PDF_PATH) as pdf:
        for p in TARGET_PAGES:
            print(f"Extracting PDF page {p} (book p.{p-28})...")
            txt = extract_with_layout(pdf, p)
            out = OUTPUT_DIR / f"page_{p}.txt"
            out.write_text(txt, encoding="utf-8")
            # Show first 30 lines of each
            print(f"  {out} ({len(txt)} chars, {txt.count(chr(10))} lines)")
