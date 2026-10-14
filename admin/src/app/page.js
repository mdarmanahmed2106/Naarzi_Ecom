import { redirect } from 'next/navigation';

// The dashboard now lives at /products, /orders, ...; keep / (where login lands) working
export default function Home() {
  redirect('/products');
}
