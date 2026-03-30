import type { ReactNode } from "react";
import type { PortfolioCustomizations } from "@/lib/portfolio";
import type { Template } from "@prisma/client";

/**
 * Common properties passed to every template component.
 */
export interface TemplateRenderProps {
  /** The full template DB record, in case the component needs fallback styles. */
  template: Template;
  /** The user's typed customizations (styles, content, images). */
  customizations: PortfolioCustomizations;
  /** Which device viewport is currently active. 'desktop' is used for the public page. */
  device: "desktop" | "tablet" | "mobile";
}

/**
 * Definition of a registered template component.
 */
export interface TemplateDefinition {
  /** matches Template.slug in DB */
  slug: string;
  name: string;
  version: number;
  component: React.ComponentType<TemplateRenderProps>;
}
