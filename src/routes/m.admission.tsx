import { createFileRoute } from "@tanstack/react-router";
import { AdmissionModule } from "@/components/admission/AdmissionModule";
import { modulesBySlug } from "@/lib/modules";

export const Route = createFileRoute("/m/admission")({
  head: () => {
    const mod = modulesBySlug.get("admission");
    const title = `${mod?.title.en ?? "Student Admission"} — STAR School ERP`;
    const description = mod?.desc.en ?? "Online admission workflow";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: AdmissionModule,
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
