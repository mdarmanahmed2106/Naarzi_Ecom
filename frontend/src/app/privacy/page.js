import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | Naarzi',
  description: 'How Naarzi collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full text-on-surface">
        <h1 className="text-4xl font-display-lg mb-2">Privacy Policy</h1>
        <p className="text-sm text-on-surface-variant mb-10">Last updated: September 1, 2026</p>
        
        <div className="space-y-8 font-body-md text-base leading-relaxed text-on-surface/80">
          <p>
            Naarzi ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases from us.
          </p>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Information We Collect</h2>
            <p className="mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Order history and preferences</li>
              <li>Communications you send to us</li>
            </ul>
            <p className="mt-3">
              We also automatically collect certain information when you use our site, including your IP address, browser type, device information, and browsing behavior on our site, through cookies and similar technologies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders, account, and promotions</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Payment Information</h2>
            <p>
              Payments on our site are processed securely through Razorpay. We do not store your full card details on our servers. Please refer to Razorpay's own privacy policy for information on how they handle payment data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Sharing Your Information</h2>
            <p className="mb-2">We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Service providers who help us operate our business (payment processors, shipping partners, hosting providers)</li>
              <li>Law enforcement or regulatory authorities, when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Cookies</h2>
            <p>
              We use cookies to keep you logged in, remember your cart, and understand how you use our site. You can control cookies through your browser settings, though disabling them may affect site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Data Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information by contacting us at support@naarzi.com. You may also update your account details directly through your account page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Children's Privacy</h2>
            <p>
              Our site is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a new "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline-sm text-on-surface mb-3">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at support@naarzi.com or +91 99999 99999, Delhi, India.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
