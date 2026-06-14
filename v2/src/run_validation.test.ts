import { describe, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { calcProbabilityBayes } from './lib/bayesianEngine'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from './lib/dataLoader'
import { BIOCHEMICAL_TEST_REGISTRY } from './data/tests/biochemicalTestRegistry'
import type { AnswersMap, InitialObservation } from './lib/types'

const opts = {
  library: LIBRARY_CLEAN,
  mcmData: ALL_MCM_DATA,
  suites: ALL_SUITES,
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(cell => {
    let c = cell.trim();
    if (c.startsWith('"') && c.endsWith('"')) {
      c = c.substring(1, c.length - 1);
    }
    return c.replace(/""/g, '"');
  });
}

describe('BokBac Validation Runner', () => {
  it('dumps library, suites, and tests to validation/temp', () => {
    const tempDir = path.resolve(__dirname, '../../validation/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(tempDir, 'library.json'),
      JSON.stringify(LIBRARY_CLEAN, null, 2),
      'utf-8'
    );
    fs.writeFileSync(
      path.join(tempDir, 'suites.json'),
      JSON.stringify(ALL_SUITES, null, 2),
      'utf-8'
    );
    fs.writeFileSync(
      path.join(tempDir, 'tests.json'),
      JSON.stringify(BIOCHEMICAL_TEST_REGISTRY, null, 2),
      'utf-8'
    );
    console.log('Successfully dumped library, suites, and tests to validation/temp');
  });

  it('runs validation on all reference profiles', () => {
    const csvPath = path.resolve(__dirname, '../../validation/reference_profiles_generated.csv');
    const jsonOutputPath = path.resolve(__dirname, '../../validation/temp_predictions.json');

    if (!fs.existsSync(csvPath)) {
      console.warn(`CSV file not found at ${csvPath}. Skipping validation.`);
      return;
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);

    const headers = parseCSVLine(lines[0]);
    const caseIdIdx = headers.indexOf('Case ID');
    const expectedOrgIdx = headers.indexOf('Expected Organism (ID)');
    const gramIdx = headers.indexOf('Gram Reaction');
    const morphIdx = headers.indexOf('Morphology');
    const arrIdx = headers.indexOf('Arrangement');
    const includedIdx = headers.indexOf('Included In Analysis');

    const testCols: { id: string; idx: number }[] = [];
    headers.forEach((header, idx) => {
      if (header.startsWith('test__')) {
        testCols.push({
          id: header.replace('test__', ''),
          idx,
        });
      }
    });

    const predictions: any[] = [];
    let top1CorrectCount = 0;
    let top3CorrectCount = 0;
    let totalIncluded = 0;

    const logPath = path.resolve(__dirname, '../../validation/mismatches.log');
    fs.writeFileSync(logPath, `=== BOKBAC VALIDATION MISMATCH LOG ===\n\n`, 'utf-8');

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length < headers.length) continue;

      const included = row[includedIdx];
      if (included !== 'Yes') continue;

      const caseId = row[caseIdIdx];
      const expectedOrgName = row[expectedOrgIdx];
      const gram = row[gramIdx] as any;
      const morphology = row[morphIdx] as any;
      const arrangement = row[arrIdx] as any;

      // Find bug in library to get its group
      const bug = LIBRARY_CLEAN.find(b => b.name.toLowerCase() === expectedOrgName.toLowerCase());
      if (!bug) {
        console.warn(`Warning: Organism "${expectedOrgName}" not found in library.`);
        continue;
      }

      totalIncluded++;

      const initialObservation: InitialObservation = {
        gramReaction: gram || 'unknown',
        morphology: morphology || 'unknown',
        arrangement: arrangement || 'unknown',
      };

      const answers: AnswersMap = {};
      testCols.forEach(col => {
        const val = row[col.idx];
        if (val && val !== '—' && val !== '') {
          answers[col.id] = val;
        }
      });

      // Run Bayesian calculation
      const results = calcProbabilityBayes(bug.group, answers, opts, initialObservation);

      const top1 = results[0] ? results[0].name : '';
      const top2 = results[1] ? results[1].name : '';
      const top3 = results[2] ? results[2].name : '';
      const confidence = results[0] && results[0]._confidence ? results[0]._confidence : 'very_low';

      const isTop1Correct = top1.toLowerCase() === expectedOrgName.toLowerCase();
      const isTop3Correct = isTop1Correct || 
                            top2.toLowerCase() === expectedOrgName.toLowerCase() || 
                            top3.toLowerCase() === expectedOrgName.toLowerCase();

      if (isTop1Correct) top1CorrectCount++;
      if (isTop3Correct) top3CorrectCount++;

      let reviewNote = '';
      if (!isTop1Correct) {
        reviewNote = `Mismatch: expected "${expectedOrgName}", got "${top1}" (${results[0]?.pct || 0}%)`;
        
        let logContent = `[MISMATCH] Case ID: ${caseId} | Expected: "${expectedOrgName}" | Top 3 predicted:\n`;
        results.slice(0, 3).forEach((r, idx) => {
          logContent += `  ${idx + 1}. ${r.name} (pct: ${r.pct}%, caseFitScore: ${r.caseFitScore?.toFixed(3)}, evidenceCoverage: ${r.evidenceCoverage?.toFixed(3)})\n`;
          logContent += `     Evidence:\n`;
          r._evidence.forEach(ev => {
            logContent += `       - ${ev.test}: Answer: ${ev.answer} | Likelihood: ${ev.likelihood} | Source: ${ev.source} | Direction: ${ev.direction}\n`;
          });
        });
        logContent += `\n`;
        fs.appendFileSync(logPath, logContent, 'utf-8');
      } else {
        reviewNote = `Match (${results[0]?.pct || 0}%)`;
      }

      predictions.push({
        expected_organism: expectedOrgName,
        bokbac_top1: top1,
        bokbac_top2: top2,
        bokbac_top3: top3,
        bokbac_confidence: confidence,
        top1_correct: isTop1Correct ? 'Yes' : 'No',
        top3_correct: isTop3Correct ? 'Yes' : 'No',
        review_note: reviewNote,
      });
    }

    fs.writeFileSync(jsonOutputPath, JSON.stringify(predictions, null, 2), 'utf-8');
    console.log(`Generated predictions for ${totalIncluded} cases.`);
    console.log(`Top-1 Accuracy: ${top1CorrectCount}/${totalIncluded} (${(top1CorrectCount/totalIncluded*100).toFixed(2)}%)`);
    console.log(`Top-3 Accuracy: ${top3CorrectCount}/${totalIncluded} (${(top3CorrectCount/totalIncluded*100).toFixed(2)}%)`);
  }, 60000);
});
