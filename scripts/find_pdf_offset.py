"""Find offset between book page numbers and PDF page indices."""
import pdfplumber

PDF_PATH = "Manual of Clinical Microbiology (11th Edition, 2015).pdf"

# Book pages of interest
TARGETS = {
    "Enterobacteriaceae": 714,
    "Escherichia/Salmonella/Shigella": 685,
    "Streptococcus": 383,
    "Pseudomonas": 773,
    "Vibrio": 762,
}

def find_book_page(pdf, target_book_page, search_radius=80):
    """Try to locate the PDF page that corresponds to a printed book page number."""
    candidates = []
    # MCM front matter is usually ~30-50 pages, so book page N is around PDF page N+30-50
    for offset in range(20, 80):
        pdf_page_idx = target_book_page + offset - 1
        if pdf_page_idx >= len(pdf.pages):
            continue
        try:
            txt = pdf.pages[pdf_page_idx].extract_text() or ""
            # Check if it contains the target book page number anywhere (header/footer)
            if str(target_book_page) in txt[-200:] or str(target_book_page) in txt[:200]:
                candidates.append(pdf_page_idx + 1)  # 1-indexed
        except Exception:
            pass
    return candidates

if __name__ == "__main__":
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total PDF pages: {len(pdf.pages)}")
        for name, book_page in TARGETS.items():
            cands = find_book_page(pdf, book_page)
            print(f"  Book p.{book_page} ({name}) → PDF pages: {cands[:5]}")
