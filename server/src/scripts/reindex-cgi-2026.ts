// server/src/scripts/reindex-cgi-2026.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { generateEmbedding } from '../services/rag/embeddings.service.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Chemin vers le dossier data (depuis la racine du projet server)
const DATA_DIR = path.resolve(process.cwd(), 'data/cgi/2026');

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
});

const COLLECTION_NAME = 'cgi_2026';
const VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small

interface Article {
  article: string;
  titre?: string;
  texte: string[];
  mots_cles?: string[];
  statut?: string;
  annee_application?: number;
  section?: string;
}

interface CGIFile {
  meta: {
    edition: string;
    tome: number;
    livre: number;
    chapitre: number;
    chapitre_titre: string;
    base_juridique?: string;
  };
  articles: Article[];
}

/**
 * Normalise le numéro d'article (Art. 1er -> 1, Art. 86B -> 86B)
 */
function normalizeArticleNumber(article: string): string {
  return article
    .replace(/^Art\.\s*/i, '')
    .replace(/1er/i, '1')
    .trim();
}

/**
 * Crée ou recrée la collection CGI 2026
 */
async function createCollection(): Promise<void> {
  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (exists) {
      console.log(`🗑️  Suppression de la collection existante ${COLLECTION_NAME}...`);
      await client.deleteCollection(COLLECTION_NAME);
    }

    console.log(`📦 Création de la collection ${COLLECTION_NAME}...`);
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
    });

    console.log(`✅ Collection ${COLLECTION_NAME} créée`);
  } catch (error) {
    console.error('Erreur création collection:', error);
    throw error;
  }
}

/**
 * Charge tous les fichiers JSON du dossier 2026
 */
function loadCGIFiles(): CGIFile[] {
  const files: CGIFile[] = [];

  console.log(`📂 Chargement des fichiers depuis ${DATA_DIR}...`);

  const jsonFiles = fs.readdirSync(DATA_DIR).filter((f) => {
    // Filtrer uniquement les fichiers tome*.json (exclure les fichiers de test/metadata)
    return f.endsWith('.json') && f.startsWith('tome');
  });

  for (const file of jsonFiles) {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content) as CGIFile;
    files.push(data);
    console.log(`  📄 ${file} - ${data.articles.length} articles`);
  }

  return files;
}

/**
 * Indexe les articles dans Qdrant
 */
async function indexArticles(files: CGIFile[]): Promise<void> {
  let totalIndexed = 0;
  let totalErrors = 0;
  const seenArticles = new Set<string>();

  for (const file of files) {
    const { meta, articles } = file;

    for (const article of articles) {
      // Normaliser le numéro d'article
      const normalizedNumber = normalizeArticleNumber(article.article);

      // Éviter les doublons (même numéro d'article)
      if (seenArticles.has(normalizedNumber)) {
        console.log(`  ⏭️  Skip doublon: ${article.article} (${normalizedNumber})`);
        continue;
      }
      seenArticles.add(normalizedNumber);

      try {
        // Construire le contenu complet
        const contenuComplet = article.texte.join('\n');

        // Créer le texte pour l'embedding (enrichi avec mots-clés)
        const searchableText = [
          article.article,
          article.titre || '',
          contenuComplet,
          (article.mots_cles || []).join(' '),
          article.section || '',
        ].join(' ');

        // Générer l'embedding
        const { embedding } = await generateEmbedding(searchableText);

        // Créer un ID unique (UUID requis par Qdrant)
        const id = randomUUID();

        // Insérer dans Qdrant
        await client.upsert(COLLECTION_NAME, {
          points: [
            {
              id,
              vector: embedding,
              payload: {
                articleId: id,
                numero: normalizedNumber,
                titre: article.titre || '',
                contenu: contenuComplet,
                version: '2026',
                tome: meta.tome.toString(),
                livre: meta.livre.toString(),
                chapitre: meta.chapitre_titre,
                mots_cles: article.mots_cles || [],
                statut: article.statut || 'en vigueur',
                section: article.section || '',
                base_juridique: meta.base_juridique || '',
              },
            },
          ],
        });

        totalIndexed++;
        console.log(`  ✅ ${article.article} (${normalizedNumber}): ${article.titre || '(sans titre)'}`);

        // Pause pour éviter le rate limiting OpenAI
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        totalErrors++;
        console.error(`  ❌ Erreur ${article.article}:`, error);
      }
    }
  }

  console.log(`\n📊 Résumé: ${totalIndexed} articles indexés, ${totalErrors} erreurs`);
}

/**
 * Vérifie l'indexation
 */
async function verifyIndexation(): Promise<void> {
  console.log('\n🔍 Vérification de l\'indexation...');

  const count = await client.count(COLLECTION_NAME);
  console.log(`  📊 Total points: ${count.count}`);

  // Test de recherche
  const testQueries = [
    { query: 'impôt sur les sociétés IS principe', expected: '1' },
    { query: 'personnes imposables IS sociétés', expected: '2' },
    { query: 'exonérations IS BEAC', expected: '3' },
  ];

  for (const test of testQueries) {
    const { embedding } = await generateEmbedding(test.query);
    const results = await client.search(COLLECTION_NAME, {
      vector: embedding,
      limit: 3,
      with_payload: true,
    });

    const found = results.some((r) => (r.payload as any).numero === test.expected);
    const firstResult = (results[0]?.payload as any)?.numero;

    if (found && firstResult === test.expected) {
      console.log(`  ✅ "${test.query}" → Art. ${test.expected} (1ère position)`);
    } else if (found) {
      console.log(`  ⚠️  "${test.query}" → Art. ${test.expected} trouvé (1er: ${firstResult})`);
    } else {
      console.log(`  ❌ "${test.query}" → Art. ${test.expected} NON trouvé (résultats: ${results.map((r) => (r.payload as any).numero).join(', ')})`);
    }
  }
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('   RÉINDEXATION CGI 2026');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Créer la collection
    await createCollection();

    // 2. Charger les fichiers JSON
    const files = loadCGIFiles();
    const totalArticles = files.reduce((sum, f) => sum + f.articles.length, 0);
    console.log(`\n📚 Total: ${totalArticles} articles à indexer\n`);

    // 3. Indexer les articles
    await indexArticles(files);

    // 4. Vérifier l'indexation
    await verifyIndexation();

    console.log('\n✅ Réindexation terminée avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
