"""Parse MCM Table 1 (Ch.37) — numerical % positivity for Escherichia/Salmonella/Shigella.

The table has 22 columns, each species row contains:
  <species name>  v1 v2 v3 ... v22
where vN is a percentage (0-100).

We extract these into a structured dict.
"""
import re
import json
from pathlib import Path

# Test column headers in order (decoded from reversed text in PDF)
TEST_HEADERS = [
    "indole_production",
    "voges_proskauer",
    "motility",
    "yellow_pigment",
    "lysine_decarboxylase",
    "ornithine_decarboxylase",
    "kcn_growth",
    "acetate_utilization",
    "mucate_utilization",
    "glucose_gas",
    "adonitol_acid",
    "arabinose_acid",
    "arabitol_d_acid",
    "cellobiose_acid",
    "dulcitol_acid",
    "lactose_acid",
    "sucrose_acid",
    "mannitol_d_acid",
    "raffinose_acid",
    "rhamnose_l_acid",
    "sorbitol_d_acid",
    "xylose_d_acid",
]

# Match a row: species name then 22 numbers (allow leading whitespace)
ROW_RE = re.compile(
    r"^\s*(?P<name>[A-Z][A-Za-z\.\-\s/()=]+?)\s+"
    r"(?P<vals>(?:\d{1,3}\s+){21}\d{1,3})(?:\s|$)",
    re.MULTILINE,
)

def parse_table1(body_text):
    """Parse the body text and return list of {name, values: dict}."""
    # Normalize whitespace: collapse multiple spaces but preserve newlines
    rows = []
    # Split by lines, but rejoin continuation lines (those starting with letters
    # but no numbers).
    # Simpler approach: regex on the entire blob
    for m in ROW_RE.finditer(body_text):
        name = re.sub(r"\s+", " ", m.group("name").strip())
        # Skip stray header fragments
        if any(skip in name for skip in ["Species", "Continued", "TABLE", "biogroup ("]):
            # but accept things like "Escherichia albertii/biogroup 1"
            if "biogroup" not in name.lower() or "(" in name:
                # Names with "(n =" should be cleaned later
                pass
        nums = [int(x) for x in m.group("vals").split()]
        if len(nums) != 22:
            continue
        values = dict(zip(TEST_HEADERS, nums))
        rows.append({"name": name, "values": values})
    return rows

def main():
    src = Path("scripts/mcm_extract/raw_tables/ch37_escherichia_salmonella_shigella.json")
    data = json.loads(src.read_text(encoding="utf-8"))
    
    # Find Table 1
    table1 = None
    for t in data:
        if t["table_num"] == "1":
            table1 = t
            break
    if not table1:
        print("Table 1 not found!")
        return
    
    body = table1["body"]
    rows = parse_table1(body)
    print(f"Parsed {len(rows)} species rows from Table 1")
    
    # Pretty print
    for row in rows:
        print(f"\n  {row['name']}")
        # Show key tests
        v = row['values']
        print(f"    indole={v['indole_production']:3}  motility={v['motility']:3}  "
              f"LDC={v['lysine_decarboxylase']:3}  ODC={v['ornithine_decarboxylase']:3}  "
              f"lactose={v['lactose_acid']:3}  H2S=?")
    
    # Save
    out_path = Path("scripts/mcm_extract/parsed/ch37_table1.json")
    out_path.parent.mkdir(exist_ok=True, parents=True)
    out_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n→ Saved to {out_path}")

if __name__ == "__main__":
    main()
