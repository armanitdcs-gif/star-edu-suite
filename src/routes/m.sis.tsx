import { createFileRoute } from "@tanstack/react-router";
import { SISModule } from "@/components/sis/SISModule";
import { modulesBySlug } from "@/lib/modules";

export const Route = createFileRoute("/m/sis")({
  head: () => {
    const mod = modulesBySlug.get("sis");
    const title = `${mod?.title.en ?? "Student Information System"} — STAR School ERP`;
    const description = mod?.desc.en ?? "360° student profiles and enrollments";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SISModule,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="font-display text-3xl font-semibold">Not found</h1>
    </div>
  ),
});
