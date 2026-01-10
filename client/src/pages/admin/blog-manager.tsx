import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function BlogManager() {
    const { data: posts, isLoading } = useQuery<BlogPost[]>({
        queryKey: ["/api/blog"]
    });
    const { toast } = useToast();

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/admin/blog/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
            toast({ title: "Deleted", description: "Blog post deleted successfully." });
        }
    });

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black tracking-tight">Blog Management</h1>
                    <Link href="/admin/blog/new">
                        <Button className="rounded-xl font-bold">
                            <Plus className="mr-2 h-4 w-4" /> New Post
                        </Button>
                    </Link>
                </div>

                <div className="bg-card rounded-xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : posts?.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">No posts found.</TableCell></TableRow>
                            ) : (
                                posts?.map(post => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{post.slug}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${post.isPublished ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {post.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </TableCell>
                                        <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/admin/blog/edit/${post.id}`}>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    if (confirm("Are you sure?")) deleteMutation.mutate(post.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Layout>
    )
}
