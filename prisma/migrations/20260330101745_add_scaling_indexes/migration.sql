-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PortfolioView_createdAt_idx" ON "PortfolioView"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "Template"("category");

-- CreateIndex
CREATE INDEX "Template_isActive_idx" ON "Template"("isActive");

-- CreateIndex
CREATE INDEX "Template_isActive_category_idx" ON "Template"("isActive", "category");

-- CreateIndex
CREATE INDEX "TemplateFeedback_templateId_idx" ON "TemplateFeedback"("templateId");
