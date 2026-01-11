import { Layout } from "@/components/layout/Layout";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ArrowRight, Minus, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { cart, isLoading, removeFromCart, updateCartItem, isRemovingFromCart, totalPrice } = useCart();
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-muted-foreground opacity-20" />
            </div>
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto">Looks like you haven&apos;t added any luxury pieces to your collection yet.</p>
          <Link href="/">
            <Button size="lg" className="rounded-none px-12 uppercase tracking-[0.2em] font-bold">
              Start Shopping
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-baseline gap-4 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Your Bag</h1>
          <Badge variant="outline" className="rounded-none px-3 py-1 font-bold">
            {cart.items.length} {cart.items.length === 1 ? 'ITEM' : 'ITEMS'}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-16">
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="group relative flex gap-4 sm:gap-8 p-4 md:p-6 bg-white border border-secondary rounded-[2rem] hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 hover:-translate-y-1"
              >
                <Link href={`/product/${item.productId}`} className="w-24 sm:w-40 aspect-[3/4] bg-secondary flex-shrink-0 overflow-hidden rounded-2xl">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </Link>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">{item.product.category}</p>
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="font-bold text-lg md:text-2xl tracking-tighter hover:text-accent transition-colors line-clamp-2 md:line-clamp-none">{item.product.name}</h3>
                        </Link>
                      </div>
                      <p className="font-black text-lg md:text-xl tracking-tight whitespace-nowrap text-accent">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Quantity</span>
                        <div className="flex items-center gap-1 border border-input rounded-xl bg-background overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted rounded-none"
                            onClick={() => updateCartItem({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold w-6 text-center text-xs md:text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted rounded-none"
                            onClick={() => updateCartItem({ productId: item.productId, quantity: item.quantity + 1 })}
                            disabled={item.product.stock !== undefined && item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Unit Price:</span>
                        <span className="font-bold text-xs">{formatPrice(item.product.price)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-4 -ml-4 mt-4 md:mt-6 uppercase text-[10px] font-black tracking-widest transition-all h-9 rounded-full"
                    onClick={() => removeFromCart(item.productId)}
                    disabled={isRemovingFromCart}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white p-6 md:p-10 sticky top-24 border border-secondary rounded-[2.5rem] shadow-xl shadow-secondary/20 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 hover:-translate-y-1 group">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter mb-6 md:mb-8 uppercase group-hover:text-accent transition-colors">Order Summary</h2>

              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-secondary/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-sm md:text-base">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-secondary/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Complimentary</span>
                </div>
                <div className="flex justify-between items-center pt-3 md:pt-4">
                  <span className="text-base md:text-lg font-black tracking-tighter uppercase">Total</span>
                  <span className="text-2xl md:text-3xl font-black tracking-tighter text-accent">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 md:h-16 rounded-[1.25rem] uppercase tracking-[0.2em] font-black text-xs md:text-sm shadow-xl hover:shadow-accent/40 hover:translate-y-[-4px] transition-all duration-300 bg-primary text-primary-foreground hover:bg-accent hover:text-white"
                onClick={() => setLocation("/checkout")}
              >
                Checkout Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="h-[1px] flex-1 bg-secondary"></div>
                <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-black whitespace-nowrap opacity-50">
                  Secure Checkout
                </p>
                <div className="h-[1px] flex-1 bg-secondary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}