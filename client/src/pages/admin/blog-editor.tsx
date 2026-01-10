import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlogPostSchema, type BlogPost } from "@shared/schema";
import { Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";

export default function BlogEditor() {
    const [, params] = useRoute("/admin/blog/edit/:id");
    const id = params?.id ? parseInt(params.id) : undefined;
    const isEditing = !!id;
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const { data: post, isLoading: isLoadingPost } = useQuery<BlogPost>({
        queryKey: [`/api/admin/blog/${id}`],
        enabled: isEditing
    });

    const form = useForm({
        resolver: zodResolver(insertBlogPostSchema),
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            coverImage: "",
            isPublished: true,
            metaTitle: "",
            metaDescription: ""
        }
    });

    useEffect(() => {
        if (post) {
            form.reset({
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt || "",
                coverImage: post.coverImage || "",
                isPublished: post.isPublished,
                metaTitle: post.metaTitle || "",
                metaDescription: post.metaDescription || ""
            });
        }
    }, [post, form]);

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof insertBlogPostSchema>) => {
            if (isEditing) {
                return apiRequest("PATCH", `/api/admin/blog/${id}`, values);
            } else {
                return apiRequest("POST", "/api/admin/blog", values);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
            toast({ title: "Success", description: "Blog post saved." });
            setLocation("/admin/blog");
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    if (isEditing && isLoadingPost) {
        return (
            <Layout>
                <div className="container py-24 flex justify-center"><Loader2 className="animate-spin" /></div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/blog"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
                    <h1 className="text-3xl font-bold">{isEditing ? "Edit Post" : "New Post"}</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="slug" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormDescription>URL-friendly name (e.g. my-first-post)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="content" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content (HTML supported)</FormLabel>
                                <FormControl><Textarea {...field} className="min-h-[400px] font-mono" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="excerpt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Excerpt</FormLabel>
                                <FormControl><Textarea {...field} className="h-24" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="coverImage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cover Image URL</FormLabel>
                                <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
                            <FormField control={form.control} name="metaTitle" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SEO Meta Title</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="metaDescription" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SEO Meta Description</FormLabel>
                                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="isPublished" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Published</FormLabel>
                                    <FormDescription>Check to make this post visible to everyone.</FormDescription>
                                </div>
                            </FormItem>
                        )} />

                        <Button type="submit" disabled={mutation.isPending} className="w-full">
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? "Update Post" : "Create Post")}
                        </Button>
                    </form>
                </Form>
            </div>
        </Layout>
    );
}
