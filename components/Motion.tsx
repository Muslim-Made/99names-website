"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide motion, one observer for everything:
 *  - [data-reveal]            fades/rises in when it enters the viewport
 *    (stagger children by putting data-reveal on the parent with data-stagger)
 *  - [data-parallax="0.15"]   translates against scroll by that factor
 *  - .ncard-link              gets a gentle pointer tilt
 */
export default function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("motion-ready");
    if (reduced) {
      document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));

    // parallax
    const px = [...document.querySelectorAll<HTMLElement>("[data-parallax]")].map(el => ({
      el, f: parseFloat(el.dataset.parallax || "0.1"),
    }));
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = innerHeight;
        for (const { el, f } of px) {
          const r = el.getBoundingClientRect();
          const c = r.top + r.height / 2 - vh / 2;
          el.style.transform = `translate3d(0, ${(-c * f).toFixed(1)}px, 0)`;
        }
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // pointer tilt on cards
    const tiltable = "pointer: fine" ;
    const onMove = (e: PointerEvent) => {
      const link = (e.target as HTMLElement).closest?.(".ncard-link, .card[data-tilt]") as HTMLElement | null;
      if (!link || !matchMedia(`(${tiltable})`).matches) return;
      const card = (link.querySelector(".ncard") as HTMLElement) || link;
      const r = link.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
    };
    const onOut = (e: PointerEvent) => {
      const link = (e.target as HTMLElement).closest?.(".ncard-link, .card[data-tilt]") as HTMLElement | null;
      if (!link) return;
      const card = (link.querySelector(".ncard") as HTMLElement) || link;
      card.style.transform = "";
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });

    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);
  return null;
}
