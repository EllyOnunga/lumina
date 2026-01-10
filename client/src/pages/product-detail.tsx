import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Minus, Plus, ArrowLeft, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { GridSkeleton } from "@/components/ui/skeletons";
import { useCart } from "@/hooks/use-cart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, HelpCircle, Play, CheckCircle2, ShoppingBag } from "lucide-react";
import { ProductImageZoom } from "@/components/product/ProductImageZoom";
import type { Review, Question, User as SchemaUser, BundleItem } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm, Controller, useWatch } from "react-hook-form";
import { SizeGuide } from "@/components/product/SizeGuide";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RefreshCcw } from "lucide-react";

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

  const { data: product, isLoading, refetch } = useQuery<DetailedProduct>({
    queryKey: [`/api/products/${id}`],
  });

  const { data: relatedProducts, isLoading: isLoadingRelated } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: product?.category }],
    enabled: !!product?.category,
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

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group ring-1 ring-secondary/10 overflow-hidden rounded-3xl shadow-2xl">
              <ProductImageZoom
                src={allImages[activeImage]}
                alt={product.name}
              />
              {product.videoUrl && (
                <div className="absolute top-6 right-6">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full h-12 w-12 bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all shadow-xl"
                    onClick={() => window.open(product.videoUrl!, '_blank')}
                  >
                    <Play className="w-5 h-5 fill-white text-white" />
                  </Button>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all snap-start ${activeImage === idx ? "border-primary ring-4 ring-primary/20 scale-95" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 sticky top-24 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-3 py-1.5 bg-accent/5 rounded-full border border-accent/10">
                  {product.category}
                </span>
                {isOutOfStock ? (
                  <span className="text-[10px] font-black text-destructive uppercase tracking-[0.2em] px-3 py-1.5 bg-destructive/5 rounded-full border border-destructive/10">
                    Sold Out
                  </span>
                ) : product.stock < 5 ? (
                  <span className="text-[10px] font-black text-warning uppercase tracking-[0.2em] px-3 py-1.5 bg-warning/5 rounded-full border border-warning/10">
                    Rare Find: {product.stock} Left
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-success uppercase tracking-[0.2em] px-3 py-1.5 bg-success/5 rounded-full border border-success/10">
                    In Stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight uppercase italic">{product.name}</h1>
              <div className="flex items-center gap-3">
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-accent font-black uppercase tracking-widest text-[9px] transition-colors flex items-center gap-1.5"
                  onClick={() => setLocation(`/returns`)}
                >
                  <RefreshCcw className="w-3 h-3" />
                  Easy Returns
                </Button>
                <SizeGuide category={product.category} />
              </div>

              {product.type === "variant" && product.parentId && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-accent font-black uppercase tracking-widest text-[9px] transition-colors"
                  onClick={() => setLocation(`/product/${product.parentId}`)}
                >
                  Part of a larger collection
                </Button>
              )}
              <p className="text-4xl font-black tracking-tighter italic">{formatCurrency(product.price)}</p>
            </div>

            {product.type === "configurable" && product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-10 border-t border-muted">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Variations</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant="outline"
                      className={`rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] border-2 transition-all ${variant.id === product.id ? 'border-accent bg-accent/5 text-accent' : 'border-muted hover:border-accent/30'}`}
                      onClick={() => setLocation(`/product/${variant.id}`)}
                    >
                      {variant.name.replace(product.name, '').trim() || `Type ${variant.id}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.type === "bundle" && product.bundleItems && product.bundleItems.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-secondary">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Included in this Kit</h3>
                <div className="space-y-3">
                  {product.bundleItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-secondary/10 p-3">
                      <img src={item.product.image} alt={item.product.image} className="w-12 h-12 object-cover" />
                      <div className="flex-1">
                        <p className="font-bold text-sm tracking-tight">{item.product.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Qty: {item.quantity}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setLocation(`/product/${item.product.id}`)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-8 border-t border-secondary/10">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-8 border-b border-secondary/10 rounded-none mb-8">
                  <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 pb-4 font-black uppercase tracking-widest text-[10px]">Description</TabsTrigger>
                  <TabsTrigger value="specs" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 pb-4 font-black uppercase tracking-widest text-[10px]">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 pb-4 font-black uppercase tracking-widest text-[10px]">Reviews ({product.reviewCount})</TabsTrigger>
                  <TabsTrigger value="qa" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none px-0 pb-4 font-black uppercase tracking-widest text-[10px]">Q&A</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-0 outline-none">
                  <div className="prose prose-stone text-muted-foreground max-w-none">
                    <p className="text-lg leading-relaxed">{product.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="specs" className="mt-0 outline-none">
                  <div className="bg-secondary/10 p-8 rounded-3xl space-y-4">
                    {product.specifications?.split('\n').map((spec, i) => {
                      const [label, value] = spec.split(':');
                      return (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                          <span className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">{label?.trim()}</span>
                          <span className="font-bold text-sm">{value?.trim() || spec}</span>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-0 outline-none space-y-12">
                  <div className="flex flex-col gap-8">
                    {/* Review Form */}
                    <div className="bg-primary/5 p-8 rounded-[2rem] space-y-6">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <h4 className="text-xl font-black uppercase tracking-tighter">Voice Your Opinion</h4>
                      </div>
                      <form onSubmit={reviewForm.handleSubmit((d) => createReviewMutation.mutate(d))} className="space-y-4">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Button
                              key={s}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`p-0 h-10 w-10 rounded-full transition-all ${rating >= s ? 'text-primary' : 'text-muted-foreground/30'}`}
                              onClick={() => reviewForm.setValue('rating', s)}
                            >
                              <Star className={`w-6 h-6 ${rating >= s ? 'fill-primary' : ''}`} />
                            </Button>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">How was the fit?</Label>
                          <Controller
                            control={reviewForm.control}
                            name="fit"
                            render={({ field }) => (
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4"
                              >
                                {['small', 'true', 'large'].map((opt) => (
                                  <div key={opt} className="flex-1">
                                    <RadioGroupItem value={opt} id={`fit-${opt}`} className="sr-only" />
                                    <Label
                                      htmlFor={`fit-${opt}`}
                                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value === opt ? 'border-primary bg-primary/10 text-primary' : 'border-muted bg-white/50 hover:border-primary/20'}`}
                                    >
                                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                        {opt === 'true' ? 'Just Right' : opt}
                                      </span>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}
                          />
                        </div>
                        <Textarea
                          {...reviewForm.register('comment')}
                          placeholder="Your experience matters..."
                          className="bg-white/50 border-none rounded-2xl min-h-[100px] font-medium"
                        />
                        <Button
                          type="submit"
                          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                          disabled={createReviewMutation.isPending}
                        >
                          Publish Review
                        </Button>
                      </form>
                    </div>

                    {/* Review List */}
                    <div className="space-y-8">
                      {product.reviews?.length ? (
                        product.reviews.map((review) => (
                          <div key={review.id} className="group p-8 rounded-[2rem] bg-secondary/5 hover:bg-secondary/10 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                  <AvatarFallback className="font-black bg-primary/10 text-primary">
                                    {review.user.username[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <p className="font-black text-sm">{review.user.username}</p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/20'}`} />
                                      ))}
                                    </div>
                                    {review.fit && (
                                      <Badge variant="outline" className="text-[8px] h-4 px-1.5 font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                                        Fit: {review.fit === 'true' ? 'Just Right' : review.fit}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-muted-foreground font-medium leading-relaxed">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-secondary/5 rounded-[2rem] border-2 border-dashed border-secondary/10">
                          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
                          <p className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">No voices yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qa" className="mt-0 outline-none space-y-12">
                  <div className="flex flex-col gap-8">
                    <div className="bg-primary/5 p-8 rounded-[2rem] space-y-6">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        <h4 className="text-xl font-black uppercase tracking-tighter">Curious? Ask Away</h4>
                      </div>
                      <form onSubmit={questionForm.handleSubmit((d) => createQuestionMutation.mutate(d))} className="flex gap-4">
                        <Input
                          {...questionForm.register('question')}
                          placeholder="What can we clarify for you?"
                          className="bg-white/50 border-none h-14 rounded-2xl font-medium px-6"
                        />
                        <Button
                          type="submit"
                          className="h-14 aspect-square rounded-2xl flex-shrink-0"
                          disabled={createQuestionMutation.isPending}
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-6">
                      {product.questions?.length ? (
                        product.questions.map((q) => (
                          <div key={q.id} className="p-8 rounded-[2rem] bg-secondary/5 space-y-6">
                            <div className="flex gap-4">
                              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs flex-shrink-0">Q</div>
                              <p className="font-black tracking-tight">{q.question}</p>
                            </div>
                            {q.answer ? (
                              <div className="flex gap-4 bg-white/40 p-6 rounded-2xl ring-1 ring-black/5">
                                <div className="h-8 w-8 rounded-xl bg-black/10 flex items-center justify-center font-black text-black text-xs flex-shrink-0">A</div>
                                <p className="font-medium text-muted-foreground">{q.answer}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-6 py-3 bg-secondary/20 rounded-xl w-fit">
                                <CheckCircle2 className="w-4 h-4 text-muted-foreground/50" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logistics Pending</span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-secondary/5 rounded-[2rem]">
                          <p className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">Clear as day. No questions yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6 pt-10 border-t border-muted">
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <div className="flex items-center bg-muted rounded-2xl h-14 overflow-hidden border border-input/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-14 rounded-none hover:bg-black/5"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-16 text-center text-lg font-black italic">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-14 rounded-none hover:bg-black/5"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 h-14 rounded-2xl uppercase tracking-[0.2em] text-[10px] bg-primary text-primary-foreground hover:bg-accent hover:text-white transition-all font-black shadow-xl shadow-primary/20"
                  onClick={() => addToCart({ productId: product.id, quantity, product })}
                  disabled={isAddingToCart || isOutOfStock}
                >
                  {isOutOfStock ? "Sold Out" : isAddingToCart ? "Securing Asset..." : "Add to Manifest"}
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl uppercase tracking-widest text-[10px] font-black border-2 border-muted hover:border-accent hover:text-accent transition-all italic"
                  onClick={() => addToWishlistMutation.mutate()}
                  disabled={addToWishlistMutation.isPending}
                >
                  {addToWishlistMutation.isPending ? "Adding..." : "Wishlist"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl uppercase tracking-widest text-[10px] font-black border-2 border-muted hover:border-accent hover:text-accent transition-all italic"
                  onClick={handleCompare}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Compare
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        <section className="mt-24 pt-24 border-t border-secondary">
          <h2 className="text-3xl font-bold tracking-tighter mb-12">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
            {isLoadingRelated ? (
              <GridSkeleton count={4} />
            ) : (
              relatedProducts
                ?.filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}