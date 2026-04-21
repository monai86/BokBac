// ══════════════════════════════════════════════════════════════
// MicrobialWorld Console Test Suite
// วิธีใช้: เปิด index.html ใน browser → F12 → Console → paste ทั้งหมด
// ══════════════════════════════════════════════════════════════

(function () {
  const pass = (msg) => console.log(`%c✅ PASS: ${msg}`, 'color:#22c55e;font-weight:bold');
  const fail = (msg) => console.error(`❌ FAIL: ${msg}`);
  const info = (msg) => console.log(`%cℹ️  ${msg}`, 'color:#60a5fa');
  const section = (msg) => console.log(`%c\n══ ${msg} ══`, 'color:#a78bfa;font-size:14px;font-weight:bold');

  let passed = 0, failed = 0;

  function expect(label, result, top1Id, minPct = 60) {
    if (!result || result.length === 0) { fail(`${label} → no results`); failed++; return; }
    const top = result[0];
    if (top.id === top1Id && top.pct >= minPct) {
      pass(`${label} → #1: ${top.name} (${top.pct}%)`);
      passed++;
    } else {
      fail(`${label} → expected #1="${top1Id}" ≥${minPct}%, got #1="${top.id}" (${top.pct}%), #2="${result[1]?.id}" (${result[1]?.pct}%)`);
      failed++;
    }
  }

  function expectTop3(label, result, expectedId, minPct = 40) {
    if (!result || result.length === 0) { fail(`${label} → no results`); failed++; return; }
    const top3 = result.slice(0, 3);
    const found = top3.find(r => r.id === expectedId);
    if (found && found.pct >= minPct) {
      pass(`${label} → "${expectedId}" in top-3 (${found.pct}%)`);
      passed++;
    } else {
      fail(`${label} → expected "${expectedId}" in top-3 ≥${minPct}%, top3=[${top3.map(r => `${r.id}(${r.pct}%)`).join(', ')}]`);
      failed++;
    }
  }

  // ─── GPC CLUSTER ─────────────────────────────────────────────
  section('GPC CLUSTER (Staphylococcus / Micrococcus)');

  expect('S. aureus: Catalase+ Coagulase+ Oxidase−',
    calcProbability('gpc_cluster', { catalase: '+', coagulase: '+', oxidase: '−', glucose_of: '+/+' }),
    's_aureus', 70);

  expect('S. saprophyticus: Catalase+ Coagulase− Novobiocin R',
    calcProbability('gpc_cluster', { catalase: '+', coagulase: '−', novobiocin: 'R (resistant)', glucose_of: '+/+' }),
    's_saprophyticus', 60);

  expect('CoNS: Catalase+ Coagulase− Novobiocin S',
    calcProbability('gpc_cluster', { catalase: '+', coagulase: '−', novobiocin: 'S (sensitive)', glucose_of: '+/+' }),
    's_epidermidis', 50);

  // ─── GPC CHAIN ───────────────────────────────────────────────
  section('GPC CHAIN (Streptococcus / Enterococcus)');

  expect('S. pyogenes: β-hemolysis + Bacitracin S + PPR−',
    calcProbability('gpc_chain', { catalase: '−', hemolysis: 'β (complete)', bacitracin: 'S (sensitive)', ppr: '−', camp: '−', bile_esculin: '−', nacl_6: '−' }),
    's_pyogenes', 70);

  expect('S. agalactiae: β-hemolysis + Bacitracin R + CAMP+',
    calcProbability('gpc_chain', { catalase: '−', hemolysis: 'β (complete)', bacitracin: 'R (resistant)', ppr: '+', camp: '+', bile_esculin: '−', nacl_6: '−' }),
    's_agalactiae', 70);

  expect('S. pneumoniae: α-hemolysis + Optochin S + Bile Solubility+',
    calcProbability('gpc_chain', { catalase: '−', hemolysis: 'α (partial/green)', optochin: 'S (sensitive)', bile_solubility: '+', bile_esculin: '−', nacl_6: '−' }),
    's_pneumoniae', 70);

  expect('E. faecalis: γ-hemolysis + Bile Esculin+ + 6.5%NaCl+ + Sorbitol+',
    calcProbability('gpc_chain', { catalase: '−', hemolysis: 'γ (none)', bile_esculin: '+', nacl_6: '+', sorbitol_ent: '+', arabinose_ent: '−' }),
    'enterococcus_faecalis', 55);

  expect('E. faecium: γ-hemolysis + Bile Esculin+ + 6.5%NaCl+ + Arabinose+',
    calcProbability('gpc_chain', { catalase: '−', hemolysis: 'γ (none)', bile_esculin: '+', nacl_6: '+', sorbitol_ent: '−', arabinose_ent: '+' }),
    'enterococcus_faecium', 55);

  // ─── NFB ─────────────────────────────────────────────────────
  section('NFB (Non-fermentative Gram-negative Bacilli)');

  expect('P. aeruginosa: Oxidase+ KingP+ Growth42°C+',
    calcProbability('nfb', { oxidase: '+', motile: '+', king_p: '+', king_f: '+', growth_42c: '+', n2_gas_from_no3: '+', starch: '−', maltose: '−' }),
    'pseudomonas_aeruginosa', 70);

  expect('P. fluorescens: Oxidase+ KingF+ Growth42°C−',
    calcProbability('nfb', { oxidase: '+', motile: '+', king_p: '−', king_f: '+', growth_42c: '−', gelatin: '+', n2_gas_from_no3: '−', maltose: '−' }),
    'pseudomonas_fluorescens', 60);

  expect('P. stutzeri: Oxidase+ Starch+ KingF−',
    calcProbability('nfb', { oxidase: '+', motile: '+', king_p: '−', king_f: '−', starch: '+', n2_gas_from_no3: '+', maltose: '−' }),
    'pseudomonas_stutzeri', 60);

  expect('S. maltophilia: Oxidase− Maltose+ DNase+',
    calcProbability('nfb', { oxidase: '−', motile: '+', maltose: '+', dnase: '+', sucrose: '−', lactose: '−', mannitol: '−' }),
    'stenotrophomonas_maltophilia', 70);

  expect('B. pseudomallei: Oxidase+ N2gas+ Arabinose− Maltose+',
    calcProbability('nfb', { oxidase: '+', motile: '+', n2_gas_from_no3: '+', arabinose: '−', maltose: '+', sucrose: '+', lactose: '+', mannitol: '+', king_p: '−', dnase: '−' }),
    'b_pseudomallei', 65);

  expect('A. baumannii: Oxidase− Non-motile Glucose_OF+/−',
    calcProbability('nfb', { oxidase: '−', motile: '−', glucose_of: '+/−', growth_42c: '+', maltose: '−', lactose: '+' }),
    'acinetobacter_baumannii', 65);

  expect('Elizabethkingia: Oxidase+ Non-motile Indole+ Maltose+',
    calcProbability('nfb', { oxidase: '+', motile: '−', indole: '+', maltose: '+', lactose: '+', sucrose: '−', arabinose: '−' }),
    'elizabethkingia_meningoseptica', 65);

  // ─── ENTEROBACTERALES ────────────────────────────────────────
  section('ENTEROBACTERALES');

  expect('E. coli: Oxidase− Indole+ MR+ VP− Citrate−',
    calcProbability('enterobacterales', { oxidase_ent: '−', tsi: 'A/A (gas+)', indole: '+', mr: '+', vp: '−', citrate: '−', motility: '+' }),
    'e_coli', 70);

  expect('K. pneumoniae: Oxidase− Indole− VP+ Citrate+ Non-motile',
    calcProbability('enterobacterales', { oxidase_ent: '−', tsi: 'A/A (gas−)', indole: '−', mr: '−', vp: '+', citrate: '+', motility: '−', urease: '+' }),
    'klebsiella_pneumoniae', 65);

  expect('Salmonella: Oxidase− H2S+ MR+ VP− LDC+ Urease−',
    calcProbability('enterobacterales', { oxidase_ent: '−', tsi: 'K/A H₂S', h2s: '+', indole: '−', mr: '+', vp: '−', citrate: '+', motility: '+', ldc: '+', urease: '−', mannitol: '+', arabinose: '+' }),
    'salmonella', 65);

  expect('P. mirabilis: Oxidase− H2S+ Urease+ Swarming',
    calcProbability('enterobacterales', { oxidase_ent: '−', tsi: 'K/A H₂S', indole: '−', mr: '+', vp: '−', urease: '+', motility: '+' }),
    'proteus_mirabilis', 60);

  // ─── VIBRIO ──────────────────────────────────────────────────
  section('VIBRIO');

  expect('V. cholerae: Oxidase+ TCBS Yellow + 0%NaCl+',
    calcProbability('vibrio', { oxidase: '+', tcbs: 'Yellow', sucrose: '+', nacl_0: '+', nacl_8: '−', ldc: '+' }),
    'vibrio_cholerae', 65);

  expect('V. parahaemolyticus: Oxidase+ TCBS Green/blue + 0%NaCl−',
    calcProbability('vibrio', { oxidase: '+', tcbs: 'Green/blue', sucrose: '−', nacl_0: '−', nacl_1: '+', nacl_6: '+', ldc: '+', odc: '+', adc: '−' }),
    'vibrio_parahaemolyticus', 60);

  // ─── HARD EXCLUSION sanity checks ────────────────────────────
  section('HARD EXCLUSION sanity checks');

  (function () {
    // Catalase+ should NOT match S. pyogenes (Catalase−)
    const res = calcProbability('gpc_chain', { catalase: '+', hemolysis: 'β (complete)', bacitracin: 'S (sensitive)' });
    const spyo = res.find(r => r.id === 's_pyogenes');
    if (spyo && spyo.pct <= 5) {
      pass(`Hard exclusion: S. pyogenes correctly excluded when Catalase+ (got ${spyo.pct}%)`);
      passed++;
    } else {
      fail(`Hard exclusion FAILED: S. pyogenes not excluded when Catalase+, got ${spyo?.pct}%`);
      failed++;
    }
  })();

  (function () {
    // S. maltophilia is Oxidase− → Oxidase+ should exclude it
    const res = calcProbability('nfb', { oxidase: '+', maltose: '+', dnase: '+' });
    const sm = res.find(r => r.id === 'stenotrophomonas_maltophilia');
    if (sm && sm.pct <= 5) {
      pass(`Hard exclusion: S. maltophilia excluded when Oxidase+ (got ${sm.pct}%)`);
      passed++;
    } else {
      fail(`Hard exclusion FAILED: S. maltophilia not excluded when Oxidase+, got ${sm?.pct}%`);
      failed++;
    }
  })();

  (function () {
    // S. aureus is Catalase+ → Catalase− should exclude it
    const res = calcProbability('gpc_cluster', { catalase: '−', coagulase: '+' });
    const sa = res.find(r => r.id === 's_aureus');
    if (sa && sa.pct <= 5) {
      pass(`Hard exclusion: S. aureus excluded when Catalase− (got ${sa.pct}%)`);
      passed++;
    } else {
      fail(`Hard exclusion FAILED: S. aureus not excluded when Catalase−, got ${sa?.pct}%`);
      failed++;
    }
  })();

  // ─── SUMMARY ─────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n%c══════════════════════════════════`, 'color:#a78bfa');
  console.log(`%cTEST RESULTS: ${passed}/${total} passed`, `color:${failed === 0 ? '#22c55e' : '#f97316'};font-size:16px;font-weight:bold`);
  if (failed > 0) {
    console.log(`%c${failed} test(s) FAILED — ดูรายละเอียดด้านบน`, 'color:#ef4444;font-weight:bold');
  } else {
    console.log('%c🎉 ทุก test ผ่าน!', 'color:#22c55e;font-size:14px');
  }
  console.log(`%c══════════════════════════════════`, 'color:#a78bfa');
})();
