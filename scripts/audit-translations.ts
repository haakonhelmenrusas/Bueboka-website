import { en } from '../lib/i18n/translations/en';
import { no } from '../lib/i18n/translations/no';

const NORWEGIAN_CHARS = /[æøåÆØÅ]/;

// Archery/tech terms that are legitimately the same in both languages
const KNOWN_IDENTICAL = new Set([
  'label.bowRecurve',
  'label.bowCompound',
  'label.bowLongbow',
  'label.bowBarebow',
  'label.bowHorsebow',
  'label.arrowAluminium',
  'label.category3D',
  'label.categoryFelt',
  'practiceCategory.felt',
  'environment.indoor',
  'environment.outdoor',
  'practiceStep.info',
  'competitionStep.info',
  'lang.norwegian',
  'lang.english',
  'arrowsForm.spine',
  'arrowsForm.nock',
  'arrowsForm.vanes',
  'bowForm.tiller',
  'bowForm.riser',
  'bowForm.limbs',
  'bowForm.stup',
  'nav.team',
  'nav.feedback',
  'competition.rounds.from',
  'competition.rounds.to',
  'competition.rounds.distance',
  'competition.rounds.target',
  'competition.rounds.select',
  'competition.rounds.arrowsWithScore',
  'competition.rounds.arrowsWithoutScore',
  'competition.rounds.addRound',
  'competition.rounds.maxRounds',
  'competition.rounds.removeRound',
  'form.score',
  'achievement.traditionalist.name',
  'achievement.perfect-end.name',
  'sightMarksPrintCard.calibration',
  // Numeric/dimension labels — same in all languages
  'target.size40cm',
  'target.size60cm',
  'target.size80cm',
  'target.size80Centre6',
  'target.size122cm',
  // Universal terms / industry jargon
  'feedback.submit',
  'common.send',
  'practiceDetails.totalScore',
  'achievements.statusFilter',
  'bowForm.typeLabel',
  'arrowsForm.diameter',
  'contributors.roleUxDesigner',
]);

const enKeys = Object.keys(en) as (keyof typeof en)[];
const noKeys = new Set(Object.keys(no));

// 1. Keys missing from en.ts
const missingInEn = (Object.keys(no) as (keyof typeof no)[]).filter(
  (k) => !(k in en)
);

// 2. Keys missing from no.ts
const missingInNo = enKeys.filter((k) => !(noKeys.has(k)));

// 3. Identical values (suspicious — might be untranslated)
const identical = enKeys.filter(
  (k) =>
    en[k] === (no as unknown as Record<string, string>)[k] &&
    !KNOWN_IDENTICAL.has(k)
);

// 4. Norwegian characters in English values
const norwegianInEn = enKeys.filter((k) => NORWEGIAN_CHARS.test(en[k]));

console.log('\n=== TRANSLATION AUDIT REPORT ===\n');

if (missingInEn.length) {
  console.log(`\n❌ MISSING FROM en.ts (${missingInEn.length} keys):`);
  missingInEn.forEach((k) => console.log(`  ${k}: "${(no as unknown as Record<string, string>)[k]}"`));
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
  console.log(`\n⚠️  IDENTICAL VALUES en === no — possible untranslated (${identical.length} keys):`);
  identical.forEach((k) => console.log(`  ${k}: "${en[k]}"`));
} else {
  console.log('✅ No suspicious identical values');
}

if (norwegianInEn.length) {
  console.log(`\n🇳🇴 NORWEGIAN CHARACTERS in en.ts (${norwegianInEn.length} keys):`);
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
