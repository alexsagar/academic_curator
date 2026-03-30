import test from "node:test";
import assert from "node:assert/strict";
import { TemplateSubmissionStatus } from "@prisma/client";
import {
  buildPublicTemplateWhere,
  canEditTemplateSubmission,
  getTemplateModerationState,
  getTemplateSubmissionState,
  validateTemplateSubmissionInput,
} from "./template-marketplace.ts";

test("buildPublicTemplateWhere adds approved and active constraints", () => {
  const where = buildPublicTemplateWhere("research", "researchers");

  assert.equal(where.isActive, true);
  assert.equal(where.approvalStatus, TemplateSubmissionStatus.APPROVED);
  assert.deepEqual(where.categoryLinks, {
    some: {
      category: {
        slug: "researchers",
      },
    },
  });
  assert.ok(Array.isArray(where.OR));
});

test("validateTemplateSubmissionInput sanitizes creator payload", () => {
  const result = validateTemplateSubmissionInput({
    title: " Research Template ",
    description: " Long-form showcase ",
    thumbnail: "https://example.com/thumb.webp",
    demoUrl: "https://example.com/demo",
    tags: ["Research", " Editorial "],
    categorySlugs: ["researchers", "students"],
    htmlContent: "<section>hello</section>",
    cssContent: ".shell { display: grid; }",
    templateConfig: "{\"palette\":\"neutral\"}",
  });

  assert.equal(result.success, true);
  if (!result.success) {
    return;
  }

  assert.equal(result.data.title, "Research Template");
  assert.equal(result.data.description, "Long-form showcase");
  assert.deepEqual(result.data.categorySlugs, ["researchers", "students"]);
  assert.deepEqual(result.data.tags, ["research", "editorial"]);
  assert.deepEqual(result.data.templateConfig, { palette: "neutral" });
});

test("submission lifecycle supports draft and review transitions", () => {
  const submitState = getTemplateSubmissionState(
    TemplateSubmissionStatus.REJECTED,
    "submit",
    new Date("2026-03-30T10:00:00.000Z")
  );

  assert.equal(submitState.status, TemplateSubmissionStatus.SUBMITTED);
  assert.equal(
    submitState.submittedAt instanceof Date,
    true
  );

  const reviewState = getTemplateModerationState(
    TemplateSubmissionStatus.SUBMITTED,
    "approve",
    "Looks good",
    new Date("2026-03-30T11:00:00.000Z")
  );

  assert.equal(reviewState.status, TemplateSubmissionStatus.APPROVED);
  assert.equal(reviewState.adminReviewNotes, "Looks good");
  assert.equal(reviewState.reviewedAt instanceof Date, true);
});

test("canEditTemplateSubmission blocks non-owners and approved items", () => {
  assert.equal(
    canEditTemplateSubmission("user-1", "user-1", TemplateSubmissionStatus.DRAFT),
    true
  );
  assert.equal(
    canEditTemplateSubmission("user-1", "user-2", TemplateSubmissionStatus.DRAFT),
    false
  );
  assert.equal(
    canEditTemplateSubmission("user-1", "user-1", TemplateSubmissionStatus.APPROVED),
    false
  );
});
