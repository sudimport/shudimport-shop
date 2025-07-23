'use client';

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const immagini = [
  '/banner1.jpg',
  '/banner2.jpg',
  '/banner3.jpg'
];

export default function Carousel() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    created(s) {
      setInterval(() => s.next(), 4000);
    },
  });

  return (
    <div ref={sliderRef} className="keen-slider h-[300px] md:h-[400px] rounded-b-xl overflow-hidden">
      {immagini.map((src, i) => (
        <div className="keen-slider__slide" key={i}>
          <img src={src} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
