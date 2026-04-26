"""Extract TOC and search for biochemical table pages from MCM 11th edition."""
import pdfplumber
import re
import json
from pathlib import Path

PDF_PATH = "Manual of Clinical Microbiology (11th Edition, 2015).pdf"
OUTPUT_DIR = Path("scripts/mcm_extract")
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# Keywords that indicate biochemical reaction tables
BIOCHEM_KEYWORDS = [
    "indole", "citrate", "urease", "oxidase", "catalase",
    "biochemical reactions", "differential characteristics",
    "phenotypic characteristics", "% positive",
    "tsi", "kligler", "lysine decarboxylase"
]

# Critical chapters/genera to find
TARGET_GENERA = [
    "enterobacteriaceae", "escherichia", "klebsiella", "salmonella",
    "shigella", "proteus", "serratia", "enterobacter",
    "staphylococcus", "streptococcus", "enterococcus",
    "pseudomonas", "acinetobacter", "vibrio", "neisseria",
    "haemophilus", "bacillus"
]

def extract_toc(pdf):
    """Extract first 50 pages where TOC usually lives."""
    toc_text = []
    for i, page in enumerate(pdf.pages[:50]):
        try:
            txt = page.extract_text() or ""
            toc_text.append(f"=== PAGE {i+1} ===\n{txt}")
        except Exception as e:
            toc_text.append(f"=== PAGE {i+1} ERROR: {e} ===")
    return "\n\n".join(toc_text)

def search_pages(pdf, start, end, keywords):
    """Search a page range for keywords, return list of (page_num, score, snippet)."""
    hits = []
    for i in range(start, min(end, len(pdf.pages))):
        try:
            txt = (pdf.pages[i].extract_text() or "").lower()
            score = sum(1 for kw in keywords if kw in txt)
            if score >= 3:
                # capture lines containing biochemical keywords
                lines = txt.split("\n")
                snippet_lines = [l for l in lines if any(k in l for k in keywords)]
                hits.append((i+1, score, "\n".join(snippet_lines[:5])))
        except Exception:
            pass
    return hits

if __name__ == "__main__":
    print(f"Opening {PDF_PATH}...")
    with pdfplumber.open(PDF_PATH) as pdf:
        total = len(pdf.pages)
        print(f"Total pages: {total}")
        
        # 1) Extract TOC
        print("Extracting TOC (first 50 pages)...")
        toc = extract_toc(pdf)
        (OUTPUT_DIR / "toc_first50.txt").write_text(toc, encoding="utf-8")
        print(f"  Saved to {OUTPUT_DIR / 'toc_first50.txt'}")
        
        # 2) Find target genera in TOC
        print("\nSearching TOC for target genera...")
        toc_lower = toc.lower()
        for genus in TARGET_GENERA:
            # Find lines containing genus + page number
            pattern = re.compile(rf"{genus}.{{0,80}}?(\d{{3,4}})", re.IGNORECASE)
            matches = pattern.findall(toc_lower)
            if matches:
                print(f"  {genus:25s} → pages: {matches[:5]}")
