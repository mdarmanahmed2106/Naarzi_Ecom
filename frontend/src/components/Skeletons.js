// Loading placeholders shaped like the content they stand in for, so nothing jumps when it arrives.
// All use the .animate-shimmer sweep from globals.css (a flat tint for reduced motion).

const bar = 'rounded animate-shimmer';

// One product card: 3:4 photo, name and price
export function ProductCardSkeleton({ className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="w-full aspect-[3/4] rounded-xl mb-4 animate-shimmer" />
      <div className="space-y-2 px-1">
        <div className={`h-4 w-3/4 ${bar}`} />
        <div className={`h-3.5 w-1/3 ${bar}`} />
      </div>
    </div>
  );
}

// A grid of product cards; pass the same grid classes the real grid uses
export function ProductGridSkeleton({ count = 6, className = '' }) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

// One order in My Account: date and total, status badge, progress tracker, item rows
export function OrderCardSkeleton() {
  return (
    <div className="bg-surface border border-outline-variant/50 rounded-xl overflow-hidden" aria-hidden="true">
      <div className="p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-outline-variant/20">
        <div className="space-y-2">
          <div className={`h-3 w-28 ${bar}`} />
          <div className={`h-5 w-20 ${bar}`} />
        </div>
        <div className={`h-5 w-14 ${bar}`} />
      </div>
      <div className="px-5 sm:px-6 py-5 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full animate-shimmer shrink-0" />
              <div className="flex-1 h-0.5 animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 sm:p-6 space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-14 h-[4.5rem] rounded-lg animate-shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className={`h-3.5 w-1/2 ${bar}`} />
              <div className={`h-3 w-1/4 ${bar}`} />
            </div>
            <div className={`h-4 w-14 ${bar}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// My Account while sign-in is being checked: side nav beside a list of orders
export function AccountSkeleton() {
  return (
    <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full pt-8 pb-20 flex-1" aria-busy="true" aria-label="Loading your account">
      <div className="bg-surface-container/20 border border-outline-variant/40 rounded-2xl flex flex-col md:flex-row md:min-h-[600px] mt-4">
        <div className="md:hidden border-b border-outline-variant/40 px-6 pt-6 pb-5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl animate-shimmer" />
              <div className={`h-3 w-14 ${bar}`} />
            </div>
          ))}
        </div>
        <div className="hidden md:flex md:w-[280px] md:border-r border-outline-variant/40 p-6 flex-col gap-3">
          <div className={`h-5 w-32 mb-4 ${bar}`} />
          {[0, 1, 2].map((i) => <div key={i} className="h-11 rounded-lg animate-shimmer" />)}
        </div>
        <div className="flex-1 p-6 md:p-10 space-y-6">
          <div className={`h-7 w-44 ${bar}`} />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>
    </main>
  );
}

// Checkout while sign-in is being checked: the form on the left, the order summary on the right
export function CheckoutSkeleton() {
  return (
    <main className="w-full flex-1 flex flex-col lg:flex-row" aria-busy="true" aria-label="Loading checkout">
      <div className="w-full lg:w-[55%] xl:w-[60%] lg:border-r border-outline-variant/30 px-4 sm:px-6 py-6 lg:py-12 lg:px-12 xl:px-20">
        <div className="max-w-xl mx-auto lg:ml-auto lg:mr-0 xl:mr-10 space-y-6">
          <div className={`h-8 w-36 ${bar}`} />
          <div className={`h-3 w-56 ${bar}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`space-y-2 ${i === 2 ? 'md:col-span-2' : ''}`}>
                <div className={`h-3 w-20 ${bar}`} />
                <div className="h-12 rounded-xl animate-shimmer" />
              </div>
            ))}
          </div>
          <div className="h-14 rounded-xl animate-shimmer" />
        </div>
      </div>
      <div className="hidden lg:block w-full lg:w-[45%] xl:w-[40%] bg-surface-container-low px-12 py-12">
        <div className="max-w-md space-y-5">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg animate-shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className={`h-3.5 w-2/3 ${bar}`} />
                <div className={`h-3 w-1/3 ${bar}`} />
              </div>
              <div className={`h-4 w-16 ${bar}`} />
            </div>
          ))}
          <div className="border-t border-outline-variant/30 pt-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className={`h-3.5 w-24 ${bar}`} />
                <div className={`h-3.5 w-16 ${bar}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
