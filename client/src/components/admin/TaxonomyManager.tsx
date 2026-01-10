import { useQuery, useMutation } from "@tanstack/react-query";
import { type Category, type Tag } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Tags as TagsIcon, FolderTree, Trash2, Hash } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TaxonomyManager() {
    const { toast } = useToast();
    const [newCategory, setNewCategory] = useState({ name: "", slug: "", parentId: null as number | null });
    const [newTag, setNewTag] = useState({ name: "", slug: "" });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ["/api/categories"],
    });

    const { data: tags } = useQuery<Tag[]>({
        queryKey: ["/api/tags"],
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (cat: { name: string; slug: string; parentId: number | null }) => {
            const res = await apiRequest("POST", "/api/admin/categories", cat);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
            setNewCategory({ name: "", slug: "", parentId: null });
            toast({ title: "Category created" });
        }
    });

    const createTagMutation = useMutation({
        mutationFn: async (tag: { name: string; slug: string }) => {
            const res = await apiRequest("POST", "/api/admin/tags", tag);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
            setNewTag({ name: "", slug: "" });
            toast({ title: "Tag created" });
        }
    });

    const renderCategoryTree = (parentId: number | null = null, depth = 0) => {
        const children = categories?.filter(c => c.parentId === parentId) || [];
        return children.map(cat => (
            <div key={cat.id} className="space-y-2">
                <div
                    className={cn(
                        "flex items-center justify-between p-4 bg-background border border-secondary/10 rounded-2xl group transition-all hover:border-primary/50",
                        depth > 0 && "ml-8 border-l-4 border-l-primary/20"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <FolderTree className={cn("w-4 h-4", depth === 0 ? "text-primary" : "text-muted-foreground")} />
                        <div>
                            <p className="font-black tracking-tight">{cat.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">/{cat.slug}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setNewCategory(prev => ({ ...prev, parentId: cat.id }))} aria-label="Add subcategory" title="Add subcategory">
                            <Plus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" aria-label="Delete category" title="Delete category">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                {renderCategoryTree(cat.id, depth + 1)}
            </div>
        ));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Categories Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            <FolderTree className="text-primary" />
                            Hierarchical Taxonomy
                        </h2>
                        <p className="text-muted-foreground font-medium">Structure your catalog with infinite depth</p>
                    </div>
                </div>

                <Card className="rounded-[2rem] border-none shadow-xl bg-secondary/5 p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Category Name</Label>
                            <Input
                                placeholder="E.g. Outerwear"
                                className="h-12 rounded-xl border-none bg-background font-bold"
                                value={newCategory.name}
                                onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">URL Slug</Label>
                            <Input
                                placeholder="outerwear"
                                className="h-12 rounded-xl border-none bg-background font-mono text-xs"
                                value={newCategory.slug}
                                onChange={e => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                            />
                        </div>
                    </div>
                    {newCategory.parentId && (
                        <div className="flex items-center justify-between px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                            <span className="text-xs font-bold text-primary">Subcategory of: {categories?.find(c => c.id === newCategory.parentId)?.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => setNewCategory(prev => ({ ...prev, parentId: null }))} className="h-6 px-2 text-[10px] font-black uppercase">Cancel</Button>
                        </div>
                    )}
                    <Button
                        className="w-full h-12 rounded-xl font-black uppercase tracking-widest"
                        disabled={!newCategory.name || createCategoryMutation.isPending}
                        onClick={() => createCategoryMutation.mutate(newCategory)}
                    >
                        Deploy Category
                    </Button>
                </Card>

                <div className="space-y-4 pr-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {renderCategoryTree()}
                </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <TagsIcon className="text-primary" />
                        Flexible Tagging
                    </h2>
                    <p className="text-muted-foreground font-medium">Flat metadata for dynamic discovery</p>
                </div>

                <Card className="rounded-[2rem] border-none shadow-xl bg-secondary/5 p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Tag Name</Label>
                            <Input
                                placeholder="E.g. Eco-Friendly"
                                className="h-12 rounded-xl border-none bg-background font-bold"
                                value={newTag.name}
                                onChange={e => setNewTag(prev => ({ ...prev, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">URL Slug</Label>
                            <Input
                                placeholder="eco-friendly"
                                className="h-12 rounded-xl border-none bg-background font-mono text-xs"
                                value={newTag.slug}
                                onChange={e => setNewTag(prev => ({ ...prev, slug: e.target.value }))}
                            />
                        </div>
                    </div>
                    <Button
                        className="w-full h-12 rounded-xl font-black uppercase tracking-widest"
                        disabled={!newTag.name || createTagMutation.isPending}
                        onClick={() => createTagMutation.mutate(newTag)}
                    >
                        Register Tag
                    </Button>
                </Card>

                <div className="flex flex-wrap gap-3">
                    {tags?.map(tag => (
                        <div key={tag.id} className="group relative bg-background border border-secondary/10 px-4 py-3 rounded-2xl flex items-center gap-2 hover:border-primary/50 transition-all">
                            <Hash className="w-3 h-3 text-muted-foreground" />
                            <span className="font-bold tracking-tight">{tag.name}</span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-destructive" aria-label="Delete tag" title="Delete tag">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
