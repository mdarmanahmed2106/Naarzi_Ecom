import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import AboutContent from '@/components/about/AboutContent';

export const metadata = {
  title: 'Our Story | NAARZI — Beauty Where Others Saw Waste',
  description:
    'The story behind NAARZI — a design house built on noticing beauty others overlooked, and turning colour into clothing that speaks.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <AboutContent />
      <Footer />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}
