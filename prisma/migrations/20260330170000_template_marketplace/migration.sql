-- Create enum
CREATE TYPE "TemplateSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- Alter template table
ALTER TABLE "Template"
ADD COLUMN     "approvalStatus" "TemplateSubmissionStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "demoUrl" TEXT,
ADD COLUMN     "submissionId" TEXT,
ADD COLUMN     "templateConfig" JSONB NOT NULL DEFAULT '{}';

-- Create category tables
CREATE TABLE "TemplateCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TemplateCategoryOnTemplate" (
    "templateId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "TemplateCategoryOnTemplate_pkey" PRIMARY KEY ("templateId","categoryId")
);

CREATE TABLE "TemplateSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "demoUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "htmlContent" TEXT NOT NULL,
    "cssContent" TEXT NOT NULL,
    "templateConfig" JSONB NOT NULL DEFAULT '{}',
    "status" "TemplateSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "adminReviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TemplateCategoryOnSubmission" (
    "submissionId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "TemplateCategoryOnSubmission_pkey" PRIMARY KEY ("submissionId","categoryId")
);

-- Indexes
CREATE UNIQUE INDEX "Template_submissionId_key" ON "Template"("submissionId");
CREATE INDEX "Template_approvalStatus_isActive_idx" ON "Template"("approvalStatus", "isActive");
CREATE INDEX "Template_creatorId_idx" ON "Template"("creatorId");

CREATE UNIQUE INDEX "TemplateCategory_slug_key" ON "TemplateCategory"("slug");
CREATE INDEX "TemplateCategory_sortOrder_idx" ON "TemplateCategory"("sortOrder");

CREATE INDEX "TemplateCategoryOnTemplate_categoryId_idx" ON "TemplateCategoryOnTemplate"("categoryId");

CREATE INDEX "TemplateSubmission_userId_idx" ON "TemplateSubmission"("userId");
CREATE INDEX "TemplateSubmission_status_createdAt_idx" ON "TemplateSubmission"("status", "createdAt");
CREATE INDEX "TemplateSubmission_userId_updatedAt_idx" ON "TemplateSubmission"("userId", "updatedAt");

CREATE INDEX "TemplateCategoryOnSubmission_categoryId_idx" ON "TemplateCategoryOnSubmission"("categoryId");

-- Foreign keys
ALTER TABLE "Template" ADD CONSTRAINT "Template_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Template" ADD CONSTRAINT "Template_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TemplateSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TemplateCategoryOnTemplate" ADD CONSTRAINT "TemplateCategoryOnTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateCategoryOnTemplate" ADD CONSTRAINT "TemplateCategoryOnTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TemplateCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TemplateSubmission" ADD CONSTRAINT "TemplateSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TemplateCategoryOnSubmission" ADD CONSTRAINT "TemplateCategoryOnSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TemplateSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateCategoryOnSubmission" ADD CONSTRAINT "TemplateCategoryOnSubmission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TemplateCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
