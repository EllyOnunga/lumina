import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useCurrency } from "@/hooks/use-currency";
import type { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Minus, Plus, ArrowLeft, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Play } from "lucide-react";
import { ProductImageZoom } from "@/components/product/ProductImageZoom";
import type { Review, Question, User as SchemaUser, BundleItem } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useWatch } from "react-hook-form";
import { SizeGuide } from "@/components/product/SizeGuide";
import { RefreshCcw } from "lucide-react";
import { Recommendations } from "@/components/features/Recommendations";

type DetailedProduct = Product & {
  variants?: Product[],
  bundleItems?: (BundleItem & { product: Product })[],
  reviews?: (Review & { user: SchemaUser })[],
  questions?: (Question & { user: SchemaUser })[]
};

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { formatPrice } = useCurrency();

  const { data: product, isLoading, refetch } = useQuery<DetailedProduct>({
    queryKey: [`/api/products/${id}`],
  });


  const { addToCart, isAddingToCart } = useCart();

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/wishlist/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Added to wishlist",
        description: `${product?.name} has been added to your wishlist.`,
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("401")) {
        setLocation("/auth?redirect=/product/" + id);
      } else {
        toast({
          title: "Error",
          description: "Failed to add to wishlist.",
          variant: "destructive",
        });
      }
    },
  });

  const handleCompare = () => {
    const saved = localStorage.getItem("compare_list");
    const list = saved ? JSON.parse(saved) : [];
    if (!list.includes(parseInt(id!))) {
      if (list.length >= 3) {
        toast({
          title: "Comparison limit reached",
          description: "You can compare up to 3 products at a time.",
          variant: "destructive",
        });
        return;
      }
      list.push(parseInt(id!));
      localStorage.setItem("compare_list", JSON.stringify(list));
      toast({
        title: "Added to compare",
        description: `${product?.name} added to comparison list.`,
      });
    } else {
      toast({
        title: "Already in compare",
        description: `${product?.name} is already in your comparison list.`,
      });
    }
  };

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number, comment: string, fit?: string }) => {
      const res = await apiRequest("POST", `/api/products/${id}/reviews`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
      refetch();
    },
    onError: (error: Error) => {
      if (error.message?.includes("401")) setLocation("/auth");
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: { question: string }) => {
      const res = await apiRequest("POST", `/api/products/${id}/questions`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Question posted", description: "We will get back to you soon." });
      refetch();
    },
    onError: (error: Error) => {
      if (error.message?.includes("401")) setLocation("/auth");
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const reviewForm = useForm({
    defaultValues: { rating: 5, comment: "", fit: "true" }
  });

  const rating = useWatch({
    control: reviewForm.control,
    name: "rating",
    defaultValue: 5
  });

  const questionForm = useForm({
    defaultValues: { question: "" }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-none" />
                <Skeleton className="h-20 w-20 rounded-none" />
                <Skeleton className="h-20 w-20 rounded-none" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-black tracking-tighter mb-4 uppercase">Product Not Found</h2>
          <Button variant="outline" onClick={() => setLocation("/")} className="rounded-xl uppercase tracking-widest px-8 h-12 font-black italic">
            Return to Shop
          </Button>
        </div>
      </Layout>
    );
  }

  const allImages = product.images?.length ? product.images : [product.image];
  const isOutOfStock = product.stock <= 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-8 pl-0 hover:bg-transparent hover:text-muted-foreground uppercase text-xs tracking-widest"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Button>

        <div className="grid lg:grid-cols-12 gap-12 items-start h-full">
          {/* Image Gallery with Card Style */}
          <div className="lg:col-span-7 space-y-8 h-full">
            <div className="bg-card/50 dark:bg-card/20 backdrop-blur-md border border-border dark:border-white/5 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-700 h-full">
              <div className="relative group overflow-hidden rounded-2xl bg-secondary/5 h-[800px]">
                <ProductImageZoom
                  src={allImages[activeImage]}
                  alt={product.name}
                />
                {product.videoUrl && (
                  <div className="absolute top-8 right-8">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full h-14 w-14 bg-white/20 backdrop-blur-3xl border-white/30 hover:bg-white/40 transition-all shadow-2xl"
                      onClick={() => window.open(product.videoUrl!, '_blank')}
                      aria-label="Watch product video"
                    >
                      <Play className="w-6 h-6 fill-white text-white" />
                    </Button>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-4 p-4 mt-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all snap-start ${activeImage === idx ? "border-accent ring-4 ring-accent/10 scale-95 shadow-xl" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                        }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details with Card Style */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-card/50 dark:bg-card/20 backdrop-blur-md border border-border dark:border-white/5 rounded-3xl p-10 lg:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-700 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-accent uppercase tracking-[0.25em] px-4 py-2 bg-accent/5 rounded-full border border-accent/20">
                    {product.category}
                  </span>
                  {isOutOfStock ? (
                    <span className="text-[11px] font-black text-destructive uppercase tracking-[0.25em] px-4 py-2 bg-destructive/5 rounded-full border border-destructive/20">
                      De-registered
                    </span>
                  ) : product.stock < 5 ? (
                    <span className="text-[11px] font-black text-warning uppercase tracking-[0.25em] px-4 py-2 bg-warning/5 rounded-full border border-warning/20">
                      Sourcing Limit: {product.stock}
                    </span>
                  ) : (
                    <span className="text-[11px] font-black text-success uppercase tracking-[0.25em] px-4 py-2 bg-success/5 rounded-full border border-success/20">
                      Operational
                    </span>
                  )}
                </div>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] uppercase italic">{product.name}</h1>
                <div className="flex items-center gap-6">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-muted-foreground hover:text-accent font-black uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2"
                    onClick={() => setLocation(`/returns`)}
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Logistics Policy
                  </Button>
                  <SizeGuide category={product.category} content={product.sizeGuide || undefined} />
                </div>

                <p className="text-5xl font-black tracking-tighter italic text-primary">{formatPrice(product.price)}</p>
              </div>

              {product.type === "configurable" && product.variants && product.variants.length > 0 && (
                <div className="space-y-6 pt-10 border-t border-secondary/10">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Specifications & Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    {product.variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant="outline"
                        className={`rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[11px] border-2 transition-all ${variant.id === product.id ? 'border-accent bg-accent/5 text-accent shadow-lg' : 'border-secondary/20 hover:border-accent/40'}`}
                        onClick={() => setLocation(`/product/${variant.id}`)}
                      >
                        {variant.name.replace(product.name, '').trim() || `Asset-${variant.id}`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-12">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-10 border-b border-secondary/10 rounded-none mb-10 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 border-accent rounded-none px-0 pb-5 font-black uppercase tracking-[0.2em] text-[10px] transition-all">Manifest</TabsTrigger>
                    <TabsTrigger value="specs" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 border-accent rounded-none px-0 pb-5 font-black uppercase tracking-[0.2em] text-[10px] transition-all">Intel</TabsTrigger>
                    <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 border-accent rounded-none px-0 pb-5 font-black uppercase tracking-[0.2em] text-[10px] transition-all">Briefs ({product.reviewCount})</TabsTrigger>
                    <TabsTrigger value="questions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 border-accent rounded-none px-0 pb-5 font-black uppercase tracking-[0.2em] text-[10px] transition-all">Queries ({product.questions?.length || 0})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="mt-0 outline-none">
                    <p className="text-xl leading-relaxed text-muted-foreground font-medium italic opacity-80">{product.description}</p>
                  </TabsContent>

                  <TabsContent value="specs" className="mt-0 outline-none">
                    <div className="bg-secondary/5 p-10 rounded-2xl border border-secondary/10 space-y-5">
                      {product.specifications?.split('\n').map((spec, i) => {
                        const [label, value] = spec.split(':');
                        return (
                          <div key={i} className="flex justify-between items-center py-4 border-b border-black/5 last:border-0">
                            <span className="font-black uppercase tracking-[0.25em] text-[10px] text-muted-foreground">{label?.trim()}</span>
                            <span className="font-bold text-sm">{value?.trim() || spec}</span>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-0 outline-none space-y-10">
                    <div className="bg-card/50 dark:bg-card/20 backdrop-blur-sm p-8 rounded-3xl border border-secondary/10 shadow-sm mb-10">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-6 italic text-foreground">File a Field Report</h3>
                      <form onSubmit={reviewForm.handleSubmit((data) => createReviewMutation.mutate(data))} className="space-y-6">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => reviewForm.setValue("rating", star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                              aria-label={`Rate ${star} out of 5 stars`}
                            >
                              <Star className={`w-6 h-6 ${star <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/20'}`} />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          {...reviewForm.register("comment")}
                          placeholder="Document your experience with this asset..."
                          className="rounded-2xl border-secondary/20 focus:border-accent min-h-[100px] bg-background dark:bg-card italic text-foreground"
                        />
                        <Button
                          type="submit"
                          disabled={createReviewMutation.isPending}
                          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-accent text-white shadow-xl shadow-accent/20"
                        >
                          {createReviewMutation.isPending ? "Transmitting..." : "Submit Brief"}
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-8">
                      {product.reviews?.map((review) => (
                        <div key={review.id} className="p-8 rounded-2xl bg-secondary/5 border border-secondary/10 transition-all hover:bg-secondary/10">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-[11px] uppercase tracking-tighter opacity-70">Agent: {review.user.username}</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/20'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-medium opacity-80 italic leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="questions" className="mt-0 outline-none space-y-10">
                    <div className="bg-card/50 dark:bg-card/20 backdrop-blur-sm p-8 rounded-3xl border border-secondary/10 shadow-sm mb-10">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-6 italic text-foreground">Initiate Query</h3>
                      <form onSubmit={questionForm.handleSubmit((data) => createQuestionMutation.mutate(data))} className="space-y-4">
                        <Textarea
                          {...questionForm.register("question")}
                          placeholder="What information do you require regarding this unit?"
                          className="rounded-2xl border-secondary/20 focus:border-accent min-h-[100px] bg-background dark:bg-card italic text-foreground"
                        />
                        <Button
                          type="submit"
                          disabled={createQuestionMutation.isPending}
                          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-accent text-white shadow-xl shadow-accent/20"
                        >
                          {createQuestionMutation.isPending ? "Transmitting..." : "Post Intel Request"}
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-8">
                      {product.questions?.map((q) => (
                        <div key={q.id} className="p-8 rounded-2xl bg-secondary/5 border border-secondary/10 transition-all hover:bg-secondary/10">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-[11px] uppercase tracking-tighter opacity-70">User ID: {q.user.username}</span>
                            <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">{new Date(q.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-bold italic mb-6">Q: {q.question}</p>
                          {q.answer ? (
                            <div className="pl-6 border-l-2 border-accent/30 bg-accent/5 p-6 rounded-r-2xl">
                              <p className="text-sm opacity-80 italic">
                                <span className="font-black text-accent uppercase text-[10px] mr-3 tracking-[0.2em]">Response:</span>
                                {q.answer}
                              </p>
                            </div>
                          ) : (
                            <div className="pl-6 border-l-2 border-secondary/30 italic">
                              <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Awaiting HQ Response...</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-8 pt-10 border-t border-secondary/10">
                <div className="flex flex-col sm:flex-row items-stretch gap-6">
                  <div className="flex items-center bg-secondary/5 rounded-2xl h-16 overflow-hidden border border-secondary/20 min-w-[140px]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-14 rounded-none hover:bg-black/5"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <span className="flex-1 text-center text-xl font-black italic">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-14 rounded-none hover:bg-black/5"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={isOutOfStock || quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    size="lg"
                    className="flex-1 h-16 rounded-2xl uppercase tracking-[0.3em] text-[11px] bg-accent text-white hover:scale-[1.02] active:scale-95 transition-all font-black shadow-2xl shadow-accent/20"
                    onClick={() => addToCart({ productId: product.id, quantity, product })}
                    disabled={isAddingToCart || isOutOfStock}
                  >
                    {isOutOfStock ? "De-registered" : isAddingToCart ? "Securing Asset..." : "Add to Manifest"}
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black border-2 border-secondary/20 hover:border-accent hover:text-accent transition-all italic"
                    onClick={() => addToWishlistMutation.mutate()}
                    disabled={addToWishlistMutation.isPending}
                  >
                    {addToWishlistMutation.isPending ? "Syncing..." : "Interest List"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black border-2 border-secondary/20 hover:border-accent hover:text-accent transition-all italic"
                    onClick={handleCompare}
                  >
                    <ArrowRightLeft className="w-5 h-5 mr-3" />
                    Compare Unit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <Recommendations productId={parseInt(id!)} />
      </div>
    </Layout>
  );
}