import { createFileRoute, notFound } from "@tanstack/react-router";
import { ModulePage } from "@/components/ModulePage";
import { modulesBySlug } from "@/lib/modules";

export const Route = createFileRoute("/m/$slug")({
  loader: ({ params }) => {
    const mod = modulesBySlug.get(params.slug);
    if (!mod) throw notFound();
    return { mod };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Module not found — STAR School ERP" }, { name: "robots", content: "noindex" }] };
    }
    const { mod } = loaderData;
    const title = `${mod.title.en} — STAR School ERP`;
    return {
      meta: [
        { title },
        { name: "description", content: mod.desc.en },
        { property: "og:title", content: title },
        { property: "og:description", content: mod.desc.en },
      ],
    };
  },
  component: ModuleRoute,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="font-display text-3xl font-semibold">Module not found</h1>
      <p className="mt-2 text-muted-foreground">The requested module does not exist.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function ModuleRoute() {
  const { mod } = Route.useLoaderData();
  return <ModulePage module={mod} />;
}
