-- CreateTable
CREATE TABLE "LearningArticleAttachment" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningArticleAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningArticleAttachment_articleId_idx" ON "LearningArticleAttachment"("articleId");

-- AddForeignKey
ALTER TABLE "LearningArticleAttachment" ADD CONSTRAINT "LearningArticleAttachment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "LearningArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
