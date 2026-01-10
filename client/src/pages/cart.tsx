import { Layout } from "@/components/layout/Layout";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ArrowRight, Minus, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { cart, isLoading, removeFromCart, updateCartItem, isRemovingFromCart, totalPrice } = useCart();

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
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-baseline gap-4 mb-12">
          <h1 className="text-5xl font-black tracking-tighter">Your Bag</h1>
          <Badge variant="outline" className="rounded-none px-3 py-1 font-bold">
            {cart.items.length} {cart.items.length === 1 ? 'ITEM' : 'ITEMS'}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-8 py-8 border-b border-secondary group">
                <Link href={`/product/${item.productId}`} className="w-full sm:w-40 aspect-[3/4] bg-secondary flex-shrink-0 overflow-hidden">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </Link>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{item.product.category}</p>
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="font-bold text-2xl tracking-tighter hover:underline decoration-1 underline-offset-4">{item.product.name}</h3>
                        </Link>
                      </div>
                      <p className="font-black text-xl tracking-tight">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Quantity:</span>
                        <div className="flex items-center gap-1 border border-input rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItem({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartItem({ productId: item.productId, quantity: item.quantity + 1 })}
                            disabled={item.product.stock !== undefined && item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Price:</span>
                        <span className="font-bold">{formatCurrency(item.product.price)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-muted-foreground hover:text-destructive hover:bg-transparent pl-0 mt-8 uppercase text-[10px] font-black tracking-widest transition-colors"
                    onClick={() => removeFromCart(item.productId)}
                    disabled={isRemovingFromCart}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Remove from Bag
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-secondary/20 p-10 sticky top-24 border border-secondary">
              <h2 className="text-2xl font-black tracking-tighter mb-8 uppercase">Order Summary</h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center pb-4 border-b border-secondary/50">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                  <span className="font-bold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-secondary/50">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Complimentary</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-black tracking-tighter uppercase">Total</span>
                  <span className="text-3xl font-black tracking-tighter">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-16 rounded-2xl uppercase tracking-[0.2em] font-black text-sm shadow-xl hover:translate-y-[-2px] transition-transform bg-primary text-primary-foreground hover:bg-accent hover:text-white"
                onClick={() => setLocation("/checkout")}
              >
                Continue to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="mt-8 text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
                Secure Checkout Powered by Lumina
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}