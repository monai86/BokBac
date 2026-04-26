"""Extract specific chapter pages from MCM 11th edition."""
import pdfplumber
import sys
from pathlib import Path

PDF_PATH = "Manual of Clinical Microbiology (11th Edition, 2015).pdf"
OUTPUT_DIR = Path("scripts/mcm_extract")
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

def extract_range(pdf, start_pdf_page, end_pdf_page, label):
    """Extract text from a PDF page range (1-indexed)."""
    out_path = OUTPUT_DIR / f"{label}.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        for i in range(start_pdf_page - 1, end_pdf_page):
            if i >= len(pdf.pages):
                break
            try:
                txt = pdf.pages[i].extract_text() or ""
                f.write(f"\n=== PDF PAGE {i+1} (book p.{i+1-28}) ===\n")
                f.write(txt)
                f.write("\n")
            except Exception as e:
                f.write(f"\n=== PDF PAGE {i+1} ERROR: {e} ===\n")
    return out_path

CHAPTERS = {
    # name: (start_pdf, end_pdf)
    "enterobacteriaceae": (742, 775),  # Chapter 39
    "staphylococcus": None,  # find later
    "streptococcus": (411, 440),  # Chapter 22
    "enterococcus": (431, 460),  # Chapter 23 (overlaps Strep)
    "pseudomonas_nfb": (801, 845),  # Pseudomonas + non-fermenters
    "vibrio": (790, 810),  # Chapter 41
    "neisseria_haem": (663, 715),  # Neisseria + Haemophilus
}

if __name__ == "__main__":
    print(f"Opening {PDF_PATH}...")
    with pdfplumber.open(PDF_PATH) as pdf:
        for label, rng in CHAPTERS.items():
            if rng is None:
                continue
            start, end = rng
            print(f"Extracting {label}: PDF {start}-{end}...")
            path = extract_range(pdf, start, end, label)
            size_kb = path.stat().st_size / 1024
            print(f"  → {path} ({size_kb:.0f} KB)")
