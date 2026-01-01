"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Créer un utilisateur admin
    const hashedPassword = await bcryptjs_1.default.hash('Admin123!', 12);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@cgi-engine.com' },
        update: {},
        create: {
            email: 'admin@cgi-engine.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'CGI Engine',
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
        await prisma.article.upsert({
            where: { numero: article.numero },
            update: {},
            create: article,
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
//# sourceMappingURL=seed.js.map