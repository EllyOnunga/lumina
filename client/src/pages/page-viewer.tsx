import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo";
import type { Page } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function PageViewer() {
    const [, params] = useRoute("/pages/:slug");
    const slug = params?.slug;

    const { data: page, isLoading } = useQuery<Page>({
        queryKey: [`/api/pages/${slug}`],
        enabled: !!slug
    });

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-24">
                    <Skeleton className="h-12 w-1/3 mb-8" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </Layout>
        );
    }

    if (!page) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-24 text-center">
                    <h1 className="text-2xl font-bold">Page not found</h1>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={page.metaTitle || page.title}
                description={page.metaDescription || ""}
            />
            <div className="container mx-auto px-4 py-24 max-w-4xl">
                <h1 className="text-4xl font-black tracking-tight mb-8">{page.title}</h1>
                <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap">
                    {page.content}
                </div>
            </div>
        </Layout>
    );
}
