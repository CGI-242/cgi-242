/**
 * Script pour vérifier et réindexer les articles problématiques du Chapitre 2
 * Articles: 109, 110A, 111B, 111C, 113, 113A
 */

import { config } from 'dotenv';
config(); // Charger les variables d'environnement

import { QdrantClient } from '@qdrant/js-client-rest';
import { readFileSync } from 'fs';
import OpenAI from 'openai';

const COLLECTION_NAME = 'cgi_2026';
const PROBLEMATIC_ARTICLES = ['109', '110A', '111B', '111C', '113', '113A'];

interface Article {
  article: string;
  titre: string;
  texte: string[];
  mots_cles?: string[];
  section?: string;
}

interface ChapterData {
  meta: {
    edition: string;
    chapitre: number;
    chapitre_titre: string;
  };
  articles: Article[];
}

interface ArticleEnrichi {
  titre: string;
  impot: string;
  section: number;
  themes_principaux: string[];
  mots_cles_obligatoires: string[];
  synonymes: string[];
  regles_cles: string[];
  questions_types: string[];
  boost_score: number;
}

interface CorrectionsRag {
  articles_enrichis: Record<string, ArticleEnrichi>;
  keyword_routing: Record<string, string>;
}

async function main() {
  console.log('='.repeat(70));
  console.log('VÉRIFICATION ET RÉINDEXATION DES ARTICLES PROBLÉMATIQUES');
  console.log('='.repeat(70));

  // Initialiser les clients
  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 1. Vérifier quels articles sont dans Qdrant
  console.log('\n📋 Vérification des articles dans Qdrant...\n');

  const missingArticles: string[] = [];
  const existingArticles: string[] = [];

  for (const artNum of PROBLEMATIC_ARTICLES) {
    try {
      const result = await qdrant.scroll(COLLECTION_NAME, {
        filter: {
          must: [
            {
              key: 'numero',
              match: { value: artNum }  // Sans préfixe "Art. "
            }
          ]
        },
        limit: 1,
        with_payload: true,
      });

      if (result.points.length > 0) {
        existingArticles.push(artNum);
        const existingId = result.points[0].id;
        console.log(`✓ Art. ${artNum} trouvé (ID: ${existingId})`);
      } else {
        missingArticles.push(artNum);
        console.log(`✗ Art. ${artNum} MANQUANT dans Qdrant`);
      }
    } catch (error) {
      console.log(`⚠ Art. ${artNum} - Erreur: ${error}`);
      missingArticles.push(artNum);
    }
  }

  console.log(`\n📊 Résumé: ${existingArticles.length} trouvés, ${missingArticles.length} manquants`);

  // 2. Charger les articles et les corrections RAG
  console.log('\n📄 Chargement des articles et corrections RAG...\n');

  const chapterData: ChapterData = JSON.parse(
    readFileSync('data/cgi/2026/tome1-livre1-chapitre2.json', 'utf-8')
  );

  const corrections: CorrectionsRag = JSON.parse(
    readFileSync('data/cgi/2026/cgi_2026_chapitre2_corrections_rag.json', 'utf-8')
  );

  // 3. Réindexer TOUS les articles problématiques avec métadonnées enrichies
  console.log('\n🔄 Réindexation des articles avec métadonnées enrichies...\n');

  for (const artNum of PROBLEMATIC_ARTICLES) {
    const articleKey = `Art. ${artNum}`;
    const enrichi = corrections.articles_enrichis[articleKey];
    const impot = enrichi?.impot || (artNum.startsWith('11') ? 'IRF' : 'IRCM');

    // Récupérer le point existant dans Qdrant
    const existingResult = await qdrant.scroll(COLLECTION_NAME, {
      filter: {
        must: [{ key: 'numero', match: { value: artNum } }]
      },
      limit: 1,
      with_payload: true,
      with_vector: true,
    });

    if (existingResult.points.length === 0) {
      console.log(`⚠ Art. ${artNum} non trouvé dans Qdrant, impossible de mettre à jour`);
      continue;
    }

    const existingPoint = existingResult.points[0];
    const existingPayload = existingPoint.payload as any;
    const existingId = existingPoint.id;

    // Préparer le texte enrichi avec les métadonnées de corrections
    const texteComplet = existingPayload.contenu || '';
    const themes = enrichi?.themes_principaux?.join(', ') || '';
    const motsClés = enrichi?.mots_cles_obligatoires?.join(', ') || existingPayload.mots_cles?.join(', ') || '';
    const synonymes = enrichi?.synonymes?.join(', ') || '';
    const regles = enrichi?.regles_cles?.join('. ') || '';
    const questions = enrichi?.questions_types?.join(' | ') || '';

    // Créer un texte TRÈS enrichi pour de meilleurs embeddings
    const enrichedText = `
Impôt: ${impot}
Article: Art. ${artNum}
Titre: ${enrichi?.titre || existingPayload.titre}
Thèmes: ${themes}
Mots-clés: ${motsClés}
Synonymes: ${synonymes}
Règles clés: ${regles}
Questions types: ${questions}

Contenu officiel:
${texteComplet}
`.trim();

    console.log(`  📝 Art. ${artNum} (${impot}): "${enrichi?.titre || existingPayload.titre}"`);
    console.log(`     ID existant: ${existingId}`);
    console.log(`     Thèmes: ${themes.substring(0, 60)}...`);

    try {
      // Générer l'embedding enrichi
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: enrichedText,
      });

      const vector = embeddingResponse.data[0].embedding;

      // Upsert dans Qdrant avec métadonnées enrichies (garder l'ID existant)
      await qdrant.upsert(COLLECTION_NAME, {
        points: [
          {
            id: existingId as string,
            vector: vector,
            payload: {
              ...existingPayload,
              titre: enrichi?.titre || existingPayload.titre,
              keywords: enrichi?.mots_cles_obligatoires || existingPayload.mots_cles || [],
              themes: enrichi?.themes_principaux || [],
              synonymes: enrichi?.synonymes || [],
              regles_cles: enrichi?.regles_cles || [],
              questions_types: enrichi?.questions_types || [],
              impot: impot,
              boost_score: enrichi?.boost_score || 1.0,
              enriched: true,
              enriched_at: new Date().toISOString(),
            },
          },
        ],
      });

      console.log(`     ✓ Réindexé avec succès (boost: ${enrichi?.boost_score || 1.0})`);

    } catch (error) {
      console.log(`     ✗ Erreur: ${error}`);
    }

    // Petit délai pour éviter rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 4. Vérification finale
  console.log('\n📋 Vérification finale...\n');

  for (const artNum of PROBLEMATIC_ARTICLES) {
    try {
      const result = await qdrant.scroll(COLLECTION_NAME, {
        filter: {
          must: [
            {
              key: 'numero',
              match: { value: artNum }  // Sans préfixe "Art. "
            }
          ]
        },
        limit: 1,
        with_payload: true,
      });

      if (result.points.length > 0) {
        const payload = result.points[0].payload as any;
        const enrichedStatus = payload.enriched ? '✨ enrichi' : 'non enrichi';
        console.log(`✓ Art. ${artNum} - "${payload.titre}" (${payload.impot || 'N/A'}) [${enrichedStatus}]`);
      } else {
        console.log(`✗ Art. ${artNum} toujours manquant!`);
      }
    } catch (error) {
      console.log(`⚠ Art. ${artNum} - Erreur: ${error}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('Réindexation terminée. Relancez les tests pour valider.');
  console.log('='.repeat(70));
}

main().catch(console.error);
