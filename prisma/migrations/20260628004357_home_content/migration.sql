-- CreateTable
CREATE TABLE "HomeContent" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "showBenefits" BOOLEAN NOT NULL DEFAULT true,
    "showFeatured" BOOLEAN NOT NULL DEFAULT true,
    "showProblemSol" BOOLEAN NOT NULL DEFAULT true,
    "showTestimonials" BOOLEAN NOT NULL DEFAULT true,
    "showCategories" BOOLEAN NOT NULL DEFAULT true,
    "showDifferentials" BOOLEAN NOT NULL DEFAULT true,
    "showUgc" BOOLEAN NOT NULL DEFAULT true,
    "showFaq" BOOLEAN NOT NULL DEFAULT true,
    "showFinalCta" BOOLEAN NOT NULL DEFAULT true,
    "benefitsTitle" TEXT NOT NULL DEFAULT '',
    "benefits" TEXT NOT NULL DEFAULT '[]',
    "featuredTitle" TEXT NOT NULL DEFAULT 'Nuestros modelos',
    "featuredSubtitle" TEXT NOT NULL DEFAULT '',
    "psTitle" TEXT NOT NULL DEFAULT '',
    "psSubtitle" TEXT NOT NULL DEFAULT '',
    "psItems" TEXT NOT NULL DEFAULT '[]',
    "testimonialsTitle" TEXT NOT NULL DEFAULT '',
    "testimonialsSubtitle" TEXT NOT NULL DEFAULT '',
    "testimonials" TEXT NOT NULL DEFAULT '[]',
    "categoriesTitle" TEXT NOT NULL DEFAULT '',
    "categoriesSubtitle" TEXT NOT NULL DEFAULT '',
    "categories" TEXT NOT NULL DEFAULT '[]',
    "differentialsTitle" TEXT NOT NULL DEFAULT '',
    "differentialsSubtitle" TEXT NOT NULL DEFAULT '',
    "differentials" TEXT NOT NULL DEFAULT '[]',
    "ugcTitle" TEXT NOT NULL DEFAULT '',
    "ugcSubtitle" TEXT NOT NULL DEFAULT '',
    "ugcImages" TEXT NOT NULL DEFAULT '',
    "faqTitle" TEXT NOT NULL DEFAULT '',
    "faqSubtitle" TEXT NOT NULL DEFAULT '',
    "faqs" TEXT NOT NULL DEFAULT '[]',
    "finalCtaTitle" TEXT NOT NULL DEFAULT '',
    "finalCtaText" TEXT NOT NULL DEFAULT '',
    "finalCtaButton" TEXT NOT NULL DEFAULT '',
    "finalCtaLink" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "tiktok" TEXT NOT NULL DEFAULT '',
    "transferAlias" TEXT NOT NULL DEFAULT '',
    "storeBg" TEXT NOT NULL DEFAULT '#0a0f24',
    "storeAccent" TEXT NOT NULL DEFAULT '#8b6dff',
    "storeFont" TEXT NOT NULL DEFAULT 'moderna',
    "mpAccessToken" TEXT NOT NULL DEFAULT '',
    "mpPublicKey" TEXT NOT NULL DEFAULT '',
    "heroProductId" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '',
    "heroTitle" TEXT NOT NULL DEFAULT '',
    "heroSubtitle" TEXT NOT NULL DEFAULT '',
    "heroBadge" TEXT NOT NULL DEFAULT '',
    "heroCtaText" TEXT NOT NULL DEFAULT '',
    "heroCtaLink" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("heroImage", "heroProductId", "heroSubtitle", "heroTitle", "id", "instagram", "mpAccessToken", "mpPublicKey", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp") SELECT "heroImage", "heroProductId", "heroSubtitle", "heroTitle", "id", "instagram", "mpAccessToken", "mpPublicKey", "storeAccent", "storeBg", "storeFont", "tiktok", "transferAlias", "updatedAt", "whatsapp" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
