import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | Naarzi',
  description: 'Naarzi Terms of Service and user agreement.',
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full text-on-surface">
        <h1 className="text-4xl font-display-lg mb-2">Terms of Service</h1>
        <p className="text-sm text-on-surface-variant mb-10">Last updated: September 1, 2026</p>
        
        <div className="space-y-8 font-body-md text-base leading-relaxed text-on-surface/80">
          <p>
            Welcome to Naarzi. By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Use of Our Site</h2>
            <p>
              You must be at least 18 years old, or have the consent of a parent or guardian, to make a purchase on our site. You agree to provide accurate and complete information when creating an account or placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Account Registration</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account access (including OTP verification on your registered phone number) and for all activity under your account. Notify us immediately if you suspect unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Products and Pricing</h2>
            <p>
              We make every effort to display our products and pricing accurately. However, we do not warrant that product descriptions, images, or pricing are error-free. We reserve the right to correct any errors and to cancel orders arising from such errors, with a full refund where payment has been made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Orders and Payment</h2>
            <p>
              By placing an order, you make an offer to purchase the product(s) at the listed price. All orders are subject to acceptance and availability. Payment is processed securely through Razorpay at the time of order placement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Shipping</h2>
            <p>
              Shipping timelines provided are estimates and not guarantees. We are not responsible for delays caused by circumstances outside our control, including courier delays or force majeure events.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Cancellations</h2>
            <p>
              Orders may be cancelled by the customer while still in "processing" status, before shipment, through the account order page. Once an order has shipped, it cannot be cancelled through self-service and must be handled as a return, subject to our Return Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Returns and Refunds</h2>
            <p>
              Items may be returned within 7 days of delivery, provided they are unused and in original packaging. The customer is responsible for return shipping costs. (Note: This is a draft policy and requires finalized details from Naarzi.)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Intellectual Property</h2>
            <p>
              All content on this site, including images, text, logos, and designs, is the property of Naarzi and protected by applicable intellectual property laws. You may not reproduce, distribute, or use our content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Naarzi shall not be liable for any indirect, incidental, or consequential damages arising from your use of our site or products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Delhi, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of our site after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Contact Us</h2>
            <p>
              For questions about these Terms, contact us at support@naarzi.com or +91 99999 99999, Delhi, India.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
