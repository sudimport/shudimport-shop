'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider, KeenSliderPlugin } from 'keen-slider/react';
import { useEffect } from 'react';

const images = [
  '/images/slider/banner1.jpg',
  '/images/slider/banner2.jpg',
  '/images/slider/banner3.jpg',
];

// Plugin autoplay
const Autoplay: KeenSliderPlugin = (slider) => {
  let timeout: ReturnType<typeof setTimeout>;
  let mouseOver = false;

  function clearNextTimeout() {
    clearTimeout(timeout);
  }

  function nextTimeout() {
    clearTimeout(timeout);
    if (mouseOver) return;
    timeout = setTimeout(() => {
      slider.next();
    }, 3000);
  }

  slider.on('created', () => {
    slider.container.addEventListener('mouseover', () => {
      mouseOver = true;
      clearNextTimeout();
    });
    slider.container.addEventListener('mouseout', () => {
      mouseOver = false;
      nextTimeout();
    });
    nextTimeout();
  });

  slider.on('dragStarted', clearNextTimeout);
  slider.on('animationEnded', nextTimeout);
  slider.on('updated', nextTimeout);
};

export default function Slider() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: 'snap',
      slides: { perView: 1 },
    },
    [Autoplay]
  );

  return (
    <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden mb-8">
      {images.map((src, i) => (
        <div key={i} className="keen-slider__slide">
          <img src={src} alt={`Banner ${i + 1}`} className="w-full h-auto object-cover" />
        </div>
      ))}
    </div>
  );
}
