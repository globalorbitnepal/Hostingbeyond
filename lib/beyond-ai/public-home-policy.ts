import {
  BEYOND_AI_PUBLIC_ENABLED,
  filterNavBeyondAi,
} from "@/config/beyond-ai-public";
import { routes } from "@/config/routes";
import type { CmsHomeSections } from "@/lib/orbit/defaults";

export function applyBeyondAiPublicHomePolicy(
  sections: CmsHomeSections,
): CmsHomeSections {
  if (BEYOND_AI_PUBLIC_ENABLED) return sections;

  const footer = {
    ...sections.footer,
    columns: sections.footer.columns.map((column) => ({
      ...column,
      links: column.links.filter(
        (link) =>
          link.id !== "builder" &&
          link.href !== routes.beyondAi &&
          !link.href.startsWith(`${routes.beyondAi}/`),
      ),
    })),
  };

  return {
    ...sections,
    beyondAi: { ...sections.beyondAi, visible: false },
    navigation: filterNavBeyondAi(sections.navigation),
    footer,
  };
}
