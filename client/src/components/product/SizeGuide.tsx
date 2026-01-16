import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler, Info } from "lucide-react";

interface SizeGuideProps {
    category?: string;
    content?: string;
}

export function SizeGuide({ category, content }: SizeGuideProps) {
    const isElectronics = category?.toLowerCase().includes('electronics') || category?.toLowerCase().includes('phone');
    const isShoes = category?.toLowerCase().includes('shoes') || category?.toLowerCase().includes('footwear');

    const renderTable = () => {
        if (content) {
            return (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            );
        }

        if (isElectronics) {
            return (
                <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
                    <p className="text-sm font-bold mb-4">Common Specifications</p>
                    <ul className="space-y-2 text-sm">
                        <li>• <span className="opacity-60">Standard:</span> Global Compliance</li>
                        <li>• <span className="opacity-60">Voltage:</span> 110V - 240V Auto-Switch</li>
                        <li>• <span className="opacity-60">Warranty:</span> 12 Months Standard</li>
                    </ul>
                </div>
            );
        }

        if (isShoes) {
            return (
                <table className="w-full text-sm">
                    <thead className="bg-muted text-[10px] font-black uppercase tracking-widest italic">
                        <tr>
                            <th className="px-6 py-4 text-left">EU Size</th>
                            <th className="px-6 py-4 text-left">US Size</th>
                            <th className="px-6 py-4 text-left">UK Size</th>
                            <th className="px-6 py-4 text-left">CM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-muted">
                        {[
                            { eu: "40", us: "7", uk: "6", cm: "25" },
                            { eu: "41", us: "8", uk: "7", cm: "26" },
                            { eu: "42", us: "9", uk: "8", cm: "27" },
                            { eu: "43", us: "10", uk: "9", cm: "28" },
                            { eu: "44", us: "11", uk: "10", cm: "29" },
                        ].map((row) => (
                            <tr key={row.eu} className="hover:bg-muted/30 transition-colors capitalize font-bold">
                                <td className="px-6 py-4 font-black text-primary">{row.eu}</td>
                                <td className="px-6 py-4">{row.us}</td>
                                <td className="px-6 py-4">{row.uk}</td>
                                <td className="px-6 py-4">{row.cm}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        // Default: Clothing
        return (
            <table className="w-full text-sm">
                <thead className="bg-muted text-[10px] font-black uppercase tracking-widest italic">
                    <tr>
                        <th className="px-6 py-4 text-left">Size</th>
                        <th className="px-6 py-4 text-left">Chest</th>
                        <th className="px-6 py-4 text-left">Length</th>
                        <th className="px-6 py-4 text-left">Sleeve</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                    {[
                        { size: "S", chest: '36-38"', length: '27"', sleeve: '33.5"' },
                        { size: "M", chest: '39-41"', length: '28"', sleeve: '34.5"' },
                        { size: "L", chest: '42-44"', length: '29"', sleeve: '35.5"' },
                        { size: "XL", chest: '45-47"', length: '30"', sleeve: '36.5"' },
                        { size: "XXL", chest: '48-50"', length: '31"', sleeve: '37.5"' },
                    ].map((row) => (
                        <tr key={row.size} className="hover:bg-muted/30 transition-colors capitalize font-bold">
                            <td className="px-6 py-4 font-black text-primary">{row.size}</td>
                            <td className="px-6 py-4">{row.chest}</td>
                            <td className="px-6 py-4">{row.length}</td>
                            <td className="px-6 py-4">{row.sleeve}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto font-black uppercase tracking-widest text-[9px] text-muted-foreground hover:text-accent flex items-center gap-1.5 transition-colors">
                    <Ruler className="w-3 h-3" />
                    Size Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-primary text-primary-foreground">
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <Ruler className="w-8 h-8" />
                        {category || 'Product'} Size Guide
                    </DialogTitle>
                </DialogHeader>
                <div className="p-8 space-y-8">
                    <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10 flex gap-4">
                        <Info className="w-6 h-6 text-accent shrink-0" />
                        <p className="text-sm font-medium leading-relaxed">
                            {isElectronics ? "Standard operating specifications and compatibility guide." : "Measurements are in inches. For the best fit, we recommend measuring a similar garment you already own and comparing it to the values below."}
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-2xl ring-1 ring-muted">
                        {renderTable()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
