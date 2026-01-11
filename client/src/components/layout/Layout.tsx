import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FlashSaleBanner } from "../features/FlashSaleBanner";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
            <FlashSaleBanner />
            <Navbar />
            <main className="flex-1 w-full max-w-[1920px] mx-auto">
                {children}
            </main>
            <Footer />
        </div>
    );
}
