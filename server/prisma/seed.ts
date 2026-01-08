import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cgi-242.com' },
    update: {},
    create: {
      email: 'admin@cgi-242.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'CGI 242',
      profession: 'Administrateur',
      isEmailVerified: true,
      personalSubscription: {
        create: {
          type: 'PERSONAL',
          plan: 'PROFESSIONAL',
          questionsPerMonth: -1,
          maxMembers: 1,
        },
      },
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  // Créer une organisation de démonstration
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-cabinet' },
    update: {},
    create: {
      name: 'Cabinet Démo',
      slug: 'demo-cabinet',
      members: {
        create: {
          userId: adminUser.id,
          role: 'OWNER',
        },
      },
      subscription: {
        create: {
          type: 'ORGANIZATION',
          plan: 'TEAM',
          questionsPerMonth: 500,
          maxMembers: 5,
        },
      },
    },
  });

  console.log(`✅ Demo organization created: ${demoOrg.name}`);

  // Créer quelques articles de test
  const articles = [
    {
      numero: 'Art. 1',
      titre: 'Définition des impôts',
      contenu: "L'impôt est une contribution financière obligatoire...",
      livre: 'Livre I',
      partie: 'Première Partie',
      version: '2026',
    },
    {
      numero: 'Art. 2',
      titre: 'Principes généraux',
      contenu: 'Les impôts sont établis sur la base des principes...',
      livre: 'Livre I',
      partie: 'Première Partie',
      version: '2026',
    },
  ];

  for (const article of articles) {
    // Utiliser createMany ou create simple car le seed est exécuté sur une DB vide
    await prisma.article.create({
      data: article,
    });
  }

  console.log(`✅ ${articles.length} articles created`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
