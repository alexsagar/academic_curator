import type { TemplateDefinition } from "./types";

/**
 * Global registry of template components.
 *
 * Each template should export a definition block and register itself here.
 */
const registry = new Map<string, TemplateDefinition>();

// FIXME: For now, we only maintain the registry interface.
// Actual implementations of templates (e.g. Modern, Classic) should be imported
// and registered here.
// Example:
// import { ModernTemplate } from "./impl/modern";
// registerTemplate(ModernTemplate);

export function registerTemplate(def: TemplateDefinition): void {
  registry.set(def.slug, def);
}

export function getTemplateRenderer(slug: string): TemplateDefinition | null {
  return registry.get(slug) ?? null;
}

export function listAvailableTemplates(): TemplateDefinition[] {
  return Array.from(registry.values());
}
