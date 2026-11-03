"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { photo } from "@/lib/data";

const slides = [
  {
    image: "photo-1773243086631-962baefccd8a",
    alt: "A newborn baby resting on a soft knitted blanket",
    title: "Wrapped in softness.",
    subtitle: "Made for love.",
    position: "center 42%",
  },
  {
    image: "photo-1522771930-78848d9293e8",
    alt: "A little one wearing a cozy knitted outfit",
    title: "Cozy little layers.",
    subtitle: "For everyday adventures.",
    position: "center 40%",
  },
  {
    image: "photo-1574661570553-be40c85891e5",
    alt: "A soft teddy bear surrounded by delicate flowers",
    title: "Their first little friend.",
    subtitle: "A whole lot of cuddles.",
    position: "center 48%",
  },
  {
    image: "photo-1512909006721-3d6018887383",
    alt: "A thoughtfully wrapped gift box tied with ribbon",
    title: "Little gifts. Big smiles.",
    subtitle: "Beautifully given.",
    position: "center 52%",
  },
];

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % slides.length),
      5000,
    );
    return () => window.clearTimeout(timer);
  }, [active, paused, hovered, focused, reducedMotion]);

  function move(direction: number) {
    setActive(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }

  return (
    <div
      className="hero-photo hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Baby shop highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="hero-slides" aria-live="off">
        {slides.map((slide, index) => (
          <div
            className={`hero-slide ${index === active ? "is-active" : ""}`}
            key={slide.image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={index !== active}
          >
            <img
              src={photo(slide.image, 1600)}
              alt={slide.alt}
              fetchPriority={index === 0 ? "high" : "low"}
              style={{ objectPosition: slide.position }}
            />
            <div className="hero-tag">
              <span>✧</span>
              {slide.title}
              <br />
              <i>{slide.subtitle}</i>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="hero-arrow hero-arrow-prev"
        aria-label="Previous slide"
        onClick={() => move(-1)}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        className="hero-arrow hero-arrow-next"
        aria-label="Next slide"
        onClick={() => move(1)}
      >
        <ChevronRight size={20} />
      </button>
      <div className="hero-slider-controls">
        <div className="hero-slider-dots" aria-label="Choose a slide">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.image}
              aria-label={`Show slide ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              onClick={() => setActive(index)}
            >
              <span />
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            className="hero-play-toggle"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
