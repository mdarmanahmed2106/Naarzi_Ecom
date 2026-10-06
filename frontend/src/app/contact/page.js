import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import Icon from '@/components/Icon';
import { SUPPORT_EMAIL, SUPPORT_HOURS } from '@/lib/faqContent';

export const metadata = {
  title: 'Contact Us | NAARZI',
  description: `Get in touch with NAARZI — write to ${SUPPORT_EMAIL} for help with orders, sizing, fabric or styling.`,
};

const ROUTES = [
  {
    icon: 'local_shipping',
    title: 'Track or cancel an order',
    body: 'See every order and its status, and cancel while it’s still processing.',
    href: '/account',
    cta: 'My orders',
  },
  {
    icon: 'straighten',
    title: 'Sizing, fabric & delivery',
    body: 'Quick answers on sizes, fabrics, shipping and returns.',
    href: '/faq',
    cta: 'Read the FAQs',
  },
  {
    icon: 'auto_awesome',
    title: 'Our story',
    body: 'Why every NAARZI collection starts with a colour, not a trend.',
    href: '/about',
    cta: 'About NAARZI',
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="flex-1 w-full">
        <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pt-12 md:pt-20 pb-14 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Intro + email card */}
          <div className="lg:col-span-6 space-y-6 toast-enter">
            <span className="font-label-caps text-[10px] text-primary tracking-[0.25em] flex items-center gap-3 font-bold">
              <span className="inline-block w-8 h-[2px] bg-primary" />
              CONTACT
            </span>
            <h1 className="font-display-lg text-[2.25rem] sm:text-5xl text-on-surface font-bold leading-[1.08]">
              We&apos;d Love to <span className="italic font-normal text-primary">Hear From You</span>
            </h1>
            <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed max-w-lg">
              A question about sizing, a fabric you&apos;d like to know more about, or help with an order — write to us and a
              real person from the NAARZI team will get back to you.
            </p>

            <div className="relative overflow-hidden rounded-[24px] bg-primary text-white p-7 md:p-9 shadow-[0_24px_60px_-30px_rgba(107,34,51,0.6)]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute -right-4 -top-4 w-28 h-28 text-white/10">
                <path fill="currentColor" d="M12 0c.6 6.2 1.8 8.4 12 12-10.2 3.6-11.4 5.8-12 12-.6-6.2-1.8-8.4-12-12C10.2 8.4 11.4 6.2 12 0Z" />
              </svg>
              <span className="font-label-caps text-[10px] tracking-[0.25em] text-white/75 font-bold">WRITE TO US</span>
              <p className="font-display-lg text-2xl md:text-3xl mt-3 break-all">{SUPPORT_EMAIL}</p>
              <p className="flex items-center gap-2 text-sm text-white/85 mt-3">
                <Icon name="schedule" size="sm" />
                {SUPPORT_HOURS}
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="group mt-7 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary font-label-caps text-xs tracking-widest rounded-xl font-bold hover:bg-surface transition-colors"
              >
                <Icon name="mail" size="sm" />
                SEND AN EMAIL
              </a>
              <p className="text-xs text-white/70 mt-4">Writing about an order? Include your order ID so we can help faster.</p>
            </div>
          </div>

          {/* Self-serve routes */}
          <div className="lg:col-span-6 lg:pt-14">
            <p className="font-label-caps text-[10px] text-on-surface-variant tracking-[0.25em] font-bold mb-4">OR FIND IT YOURSELF</p>
            <ul className="space-y-3 md:space-y-4">
              {ROUTES.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="group flex items-center gap-4 md:gap-5 bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 rounded-2xl p-5 md:p-6 transition-all hover:shadow-[0_16px_40px_-24px_rgba(107,34,51,0.45)]"
                  >
                    <span className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-none">
                      <Icon name={r.icon} size="md" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors">{r.title}</span>
                      <span className="block font-body-md text-sm text-on-surface-variant mt-0.5">{r.body}</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 font-label-caps text-[10px] tracking-widest text-primary font-bold flex-none">
                      {r.cta.toUpperCase()}
                      <Icon name="arrow_forward" size="sm" className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <Icon name="chevron_right" size="md" className="sm:hidden text-primary flex-none" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}
