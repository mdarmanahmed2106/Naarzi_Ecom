'use client';

import { Lottie } from 'lottie-react';
import confettiAnimation from '../../public/animations/Confetti.json';

// The confetti animation data is ~600 KB, so this is loaded only when the burst plays
// (see CartDrawer), not with every page
export default function ConfettiBurst({ onComplete }) {
  return (
    <Lottie
      src={confettiAnimation}
      loop={false}
      autoplay
      style={{ width: '100%', height: '100%' }}
      subscriptions={{ complete: onComplete }}
    />
  );
}
