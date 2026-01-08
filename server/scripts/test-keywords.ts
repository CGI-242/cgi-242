import { KEYWORD_ARTICLE_MAP_2026 } from '../src/config/keyword-mappings-2026.js';

// Find keywords for Art. 4A
const art4aKeys = Object.entries(KEYWORD_ARTICLE_MAP_2026).filter(([k,v]) => v.includes('Art. 4A'));
console.log('Keywords for Art. 4A:', art4aKeys.map(([k]) => k));

// Test query for Art. 4A matches
const testQuery = "quel est le taux de l'irf sur les plus-values immobilières ?";
console.log('\nQuery:', testQuery);
console.log('\n--- All matches ---');

for (const [keyword, articles] of Object.entries(KEYWORD_ARTICLE_MAP_2026)) {
  if (testQuery.includes(keyword.toLowerCase())) {
    console.log('MATCH:', JSON.stringify(keyword), '->', articles.join(', '));
  }
}
