import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "admin@hatsimulator.com";
    const adminPassword = "hat-admin-2026";

    const hashedPassword = await hash(adminPassword, 10);

    console.log("Seeding admin user...");

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: "ADMIN",
        },
        create: {
            email: adminEmail,
            name: "System Admin",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log(`Admin user created/updated: ${admin.email}`);

    // Ensure gamification profile exists
    await prisma.gamificationProfile.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
            userId: admin.id,
        },
    });

    console.log("Gamification profile ensured for admin.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
