import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { BlogPost } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogIndex() {
    const { data: posts, isLoading } = useQuery<BlogPost[]>({
        queryKey: ["/api/blog"],
    });

    return (
        <Layout>
            <SEO title="Journal" description="Latest stories, news, and updates from Lumina." />

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">The Journal</h1>
                    <p className="text-xl text-muted-foreground">Stories of design, culture, and essentials.</p>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts?.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <a className="group block h-full">
                                    <Card className="h-full border-none shadow-none bg-transparent overflow-hidden">
                                        <div className="aspect-[3/2] rounded-3xl overflow-hidden mb-6 bg-muted relative">
                                            {post.coverImage ? (
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-secondary/10 flex items-center justify-center text-secondary/30 font-black text-4xl">LUMINA</div>
                                            )}
                                        </div>
                                        <CardHeader className="p-0 mb-4">
                                            {post.publishedAt && (
                                                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                                                    {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                                                </div>
                                            )}
                                            <CardTitle className="text-xl font-bold leading-tight group-hover:underline decoration-2 underline-offset-4">
                                                {post.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 text-muted-foreground leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </CardContent>
                                    </Card>
                                </a>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
