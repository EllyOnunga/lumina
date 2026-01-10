import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo";
import { format } from "date-fns";
import type { BlogPost } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
    const [, params] = useRoute("/blog/:slug");
    const slug = params?.slug;

    const { data: post, isLoading } = useQuery<BlogPost>({
        queryKey: [`/api/blog/${slug}`],
        enabled: !!slug
    });

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-24 max-w-3xl">
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-12" />
                    <Skeleton className="h-[400px] w-full rounded-3xl" />
                </div>
            </Layout>
        )
    }

    if (!post) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-24 text-center">
                    <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                    <Link href="/blog">
                        <a className="text-primary hover:underline">Return to Journal</a>
                    </Link>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <SEO
                title={post.metaTitle || post.title}
                description={post.metaDescription || post.excerpt || ""}
                image={post.coverImage || undefined}
                type="article"
            />

            <article className="container mx-auto px-4 py-24 max-w-4xl">
                <Link href="/blog">
                    <a className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Journal
                    </a>
                </Link>

                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-6">{post.title}</h1>
                    {post.publishedAt && (
                        <time className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                        </time>
                    )}
                </header>

                {post.coverImage && (
                    <div className="aspect-video w-full rounded-[2rem] overflow-hidden mb-16 bg-muted">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="prose prose-lg dark:prose-invert mx-auto max-w-2xl whitespace-pre-wrap">
                    {post.content}
                </div>
            </article>
        </Layout>
    );
}
