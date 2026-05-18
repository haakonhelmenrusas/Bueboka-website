import { readFileSync } from 'fs';

const MOBILE_EN = '/Users/haakon/Prosjekter/Buboka-app/lib/i18n/translations/en.ts';
const MOBILE_NO = '/Users/haakon/Prosjekter/Buboka-app/lib/i18n/translations/no.ts';

const NORWEGIAN_CHARS = /[æøåÆØÅ]/;

// Legitimately identical in both languages
const KNOWN_IDENTICAL = new Set([
  'bowDetails.type',
  'arrowDetails.spine',
  'arrowDetails.vanes',
  'arrowDetails.nock',
  'arrowDetails.diameter',
  'form.score',
  'scoring.sum',
  'scoring.of',
  'target.size40cm',
  'target.size60cm',
  'target.size80cm',
  'target.size122cm',
  'bowType.recurve',
  'bowType.compound',
  'bowType.barebow',
  'arrowMaterial.aluminium',
  'practiceCategory.felt',
  'practiceStep.info',
  'competitionStep.info',
  'language.english',
  'marksForm.mark',
  'calcMarks.interval',
  'calcMarks.angle',
  'sightMarkCard.marksCount',
  'marksTable.calculated',
  'arrowForm.grainSuffix',
  'arrowForm.mmSuffix',
  // Universal terms / industry jargon
  'arrowDetails.material',
  'scoring.scoreSuffix',
  'achievements.filterStatus',
]);

function parseTranslations(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  const result: Record<string, string> = {};

  // Match single-quoted key-value pairs (handles simple values and multiline template strings)
  const simpleRegex = /'([^']+)':\s*'((?:[^'\\]|\\.)*)'/g;
  let match;
  while ((match = simpleRegex.exec(content)) !== null) {
    const key = match[1];
    const value = match[2].replace(/\\n/g, '\n').replace(/\\'/g, "'");
    result[key] = value;
  }

  // Match backtick/double-quoted multiline values
  const doubleQuoteRegex = /'([^']+)':\s*"((?:[^"\\]|\\.)*)"/g;
  while ((match = doubleQuoteRegex.exec(content)) !== null) {
    const key = match[1];
    if (!result[key]) {
      result[key] = match[2].replace(/\\n/g, '\n');
    }
  }

  return result;
}

const en = parseTranslations(MOBILE_EN);
const no = parseTranslations(MOBILE_NO);

const enKeys = Object.keys(en);
const noKeySet = new Set(Object.keys(no));

const missingInEn = Object.keys(no).filter((k) => !(k in en));
const missingInNo = enKeys.filter((k) => !noKeySet.has(k));

const identical = enKeys.filter(
  (k) => en[k] === no[k] && !KNOWN_IDENTICAL.has(k)
);

const norwegianInEn = enKeys.filter((k) => NORWEGIAN_CHARS.test(en[k]));

console.log('\n=== MOBILE TRANSLATION AUDIT REPORT ===\n');

if (missingInEn.length) {
  console.log(`\n❌ MISSING FROM en.ts (${missingInEn.length} keys):`);
  missingInEn.forEach((k) => console.log(`  ${k}: "${no[k]}"`));
} else {
  console.log('✅ No keys missing from en.ts');
}

if (missingInNo.length) {
  console.log(`\n❌ MISSING FROM no.ts (${missingInNo.length} keys):`);
  missingInNo.forEach((k) => console.log(`  ${k}: "${en[k]}"`));
} else {
  console.log('✅ No keys missing from no.ts');
}

if (identical.length) {
  console.log(`\n⚠️  IDENTICAL VALUES en === no — possible untranslated (${identical.length}):`);
  identical.forEach((k) => console.log(`  ${k}: "${en[k]}"`));
} else {
  console.log('✅ No suspicious identical values');
}

if (norwegianInEn.length) {
  console.log(`\n🇳🇴 NORWEGIAN CHARACTERS in en.ts (${norwegianInEn.length}):`);
  norwegianInEn.forEach((k) => console.log(`  ${k}: "${en[k]}"`));
} else {
  console.log('✅ No Norwegian characters found in en.ts');
}

console.log(`\n=== SUMMARY ===`);
console.log(`  Total keys in en.ts: ${enKeys.length}`);
console.log(`  Total keys in no.ts: ${Object.keys(no).length}`);
console.log(`  Missing from en.ts:  ${missingInEn.length}`);
console.log(`  Missing from no.ts:  ${missingInNo.length}`);
console.log(`  Possibly untranslated: ${identical.length}`);
console.log(`  Norwegian chars in en: ${norwegianInEn.length}`);
console.log('');
