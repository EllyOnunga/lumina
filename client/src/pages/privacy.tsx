import { Layout } from "@/components/layout/Layout";

export default function Privacy() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 no-prose">Privacy Policy</h1>
                    <p className="lead text-lg text-muted-foreground mb-8">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground">
                            At Lumina, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">2. Collection of Your Information</h2>
                        <p className="text-muted-foreground mb-4">
                            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">3. Use of Your Information</h2>
                        <p className="text-muted-foreground">
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                            <li>Create and manage your account.</li>
                            <li>Process your orders and payments.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">4. Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have questions or comments about this Privacy Policy, please contact us at:
                            <br />
                            <strong className="text-primary block mt-2">hello@lumina.co.ke</strong>
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
