import { useState, useRef } from "react";

interface ProductImageZoomProps {
    src: string;
    alt: string;
}

export function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;

        setPosition({ x, y });
    };

    return (
        <div
            ref={containerRef}
            className="relative aspect-[3/4] overflow-hidden cursor-zoom-in bg-secondary"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
        >
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? "scale-150" : "scale-100"
                    }`}
                style={
                    isZoomed
                        ? {
                            transformOrigin: `${position.x}% ${position.y}%`,
                        }
                        : undefined
                }
            />
            {isZoomed && (
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full pointer-events-none">
                    Zoom Active
                </div>
            )}
        </div>
    );
}
