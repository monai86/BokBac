import { describe, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { calcProbabilityBayes } from './lib/bayesianEngine'
import { ALL_MCM_DATA, ALL_SUITES, LIBRARY_CLEAN } from './lib/dataLoader'
import { suggestOrganismGroups } from './lib/gramStain/groupSuggestion'
import type { AnswersMap, InitialObservation } from './lib/types'

const opts = {
  library: LIBRARY_CLEAN,
  mcmData: ALL_MCM_DATA,
  suites: ALL_SUITES,
}

describe('BokBac Validation Runner Engine', () => {
  it('reads cases and calculates predictions', () => {
    const inputPath = path.resolve(__dirname, '../../validation/temp/cases_to_predict.json')
    const outputPath = path.resolve(__dirname, '../../validation/temp/predictions_output.json')

    if (!fs.existsSync(inputPath)) {
      console.warn(`Input file not found at ${inputPath}. Skipping prediction run.`);
      return;
    }

    const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    const resultsData: Record<string, any[]> = {
      reference_predictions: [],
      real_predictions: []
    };

    // Helper to process cases
    const processCases = (cases: any[], outputKey: string) => {
      for (const c of cases) {
        const { case_id, expected_organism, gram_reaction, morphology, arrangement, specimen_type, answers } = c;

        // Try to find expected organism in library to determine group
        let bug = LIBRARY_CLEAN.find(b => 
          b.name.toLowerCase() === expected_organism.toLowerCase() ||
          b.id.toLowerCase() === expected_organism.toLowerCase()
        );

        // Normalize initial observations
        const normGram = (gram_reaction || '').toLowerCase();
        const normMorph = (morphology || '').toLowerCase();
        const normArr = (arrangement || '').toLowerCase();
        const normSpecimen = (specimen_type || '').toLowerCase();

        let gramValue: any = 'unknown';
        if (normGram.includes('pos')) gramValue = 'positive';
        else if (normGram.includes('neg')) gramValue = 'negative';

        let morphValue: any = 'unknown';
        if (normMorph.includes('coccobac')) morphValue = 'coccobacilli';
        else if (normMorph.includes('curv')) morphValue = 'curved_rod';
        else if (normMorph.includes('branch')) morphValue = 'branching_filament';
        else if (normMorph.includes('cocci')) morphValue = 'cocci';
        else if (normMorph.includes('rod') || normMorph.includes('bacil')) morphValue = 'bacilli';

        let arrValue: any = 'unknown';
        if (normArr.includes('cluster')) arrValue = 'cluster';
        else if (normArr.includes('chain')) arrValue = 'chain';
        else if (normArr.includes('pair')) arrValue = 'pairs';
        else if (normArr.includes('diplo')) arrValue = 'diplococci';
        else if (normArr.includes('palisade')) arrValue = 'palisade';
        else if (normArr.includes('single')) arrValue = 'single';

        let specimenValue: any = 'unknown';
        if (normSpecimen.includes('blood')) specimenValue = 'blood';
        else if (normSpecimen.includes('urine')) specimenValue = 'urine';
        else if (normSpecimen.includes('stool')) specimenValue = 'stool';
        else if (normSpecimen.includes('sputum') || normSpecimen.includes('respir')) specimenValue = 'respiratory';
        else if (normSpecimen.includes('genit') || normSpecimen.includes('vagin')) specimenValue = 'genital';
        else if (normSpecimen.includes('throat')) specimenValue = 'throat';
        else if (normSpecimen.includes('ear')) specimenValue = 'ear';
        else if (normSpecimen.includes('csf')) specimenValue = 'csf';

        const initialObservation: InitialObservation = {
          gramReaction: gramValue,
          morphology: morphValue,
          arrangement: arrValue,
          specimen: specimenValue
        };

        let group = '';
        if (bug) {
          group = bug.group;
        } else {
          // Fallback to group suggestion based on observation
          const suggestions = suggestOrganismGroups(initialObservation);
          group = suggestions[0] ? suggestions[0].groupId : 'enterobacterales';
        }

        // Run calculation
        const results = calcProbabilityBayes(group, answers as AnswersMap, opts, initialObservation);

        const top1 = results[0] ? results[0].name : '';
        const top2 = results[1] ? results[1].name : '';
        const top3 = results[2] ? results[2].name : '';
        const confidence = results[0] && results[0]._confidence ? results[0]._confidence : 'very_low';

        // Check correctness
        const isTop1Correct = top1.toLowerCase() === expected_organism.toLowerCase() || 
                             (bug && top1.toLowerCase() === bug.name.toLowerCase());
        const isTop3Correct = isTop1Correct ||
                             [top2, top3].some(t => t.toLowerCase() === expected_organism.toLowerCase() || (bug && t.toLowerCase() === bug.name.toLowerCase()));

        const top1Pct = results[0]?.pct || 0;
        let reviewNote = '';
        if (isTop1Correct) {
          reviewNote = `Match (${top1Pct}%)`;
        } else {
          reviewNote = `Mismatch: expected "${expected_organism}", got "${top1}" (${top1Pct}%)`;
        }

        resultsData[outputKey].push({
          case_id,
          expected_organism,
          predicted_top1: top1,
          predicted_top2: top2,
          predicted_top3: top3,
          confidence_score: confidence,
          top1_correct: isTop1Correct ? 'Yes' : 'No',
          top3_correct: isTop3Correct ? 'Yes' : 'No',
          warning_note: reviewNote
        });
      }
    };

    if (inputData.reference_cases) {
      processCases(inputData.reference_cases, 'reference_predictions');
    }
    if (inputData.real_cases) {
      processCases(inputData.real_cases, 'real_predictions');
    }

    fs.writeFileSync(outputPath, JSON.stringify(resultsData, null, 2), 'utf-8');
    console.log(`Prediction runner successfully completed. Output written to ${outputPath}`);
  }, 60000);
});
