import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";

export default function About() {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-secondary">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
                        alt="Fashion Workshop"
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
                    >
                        The Spirit of Lumina
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Defining modern elegance through sustainable luxury and curated essentials.
                    </motion.p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-bold mb-8 tracking-tighter">Our Story</h2>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                Born in the heart of Kenya, Lumina was founded on the belief that fashion should be a harmonious blend of individual expression and conscious living.
                            </p>
                            <p>
                                We began as a small boutique with a singular vision: to create a space where modern design meets traditional craftsmanship. Today, we are proud to be a beacon of contemporary style, offering curated collections that speak to the soul of the modern individual.
                            </p>
                            <p>
                                Our journey is one of continuous evolution, driven by a passion for quality and a commitment to our community.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="aspect-square bg-secondary overflow-hidden rounded-2xl"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                            alt="Styled Look"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-secondary/50">
                <div className="container mx-auto px-4 text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter">Our Core Values</h2>
                </div>
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        {
                            title: "Curated Excellence",
                            description: "Every piece in our collection is handpicked for its quality, design, and timeless appeal."
                        },
                        {
                            title: "Sustainable Luxury",
                            description: "We believe in beauty that doesn't cost the earth, prioritizing ethical sourcing and eco-friendly practices."
                        },
                        {
                            title: "Authentic Design",
                            description: "We celebrate originality and craftsmanship, fostering a community of creative visionaries."
                        }
                    ].map((value, index) => (
                        <motion.div
                            key={value.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 bg-background rounded-2xl shadow-sm border"
                        >
                            <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                            <p className="text-muted-foreground">{value.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
