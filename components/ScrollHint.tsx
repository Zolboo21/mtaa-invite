"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { scrollToTarget } from "./fx";

/**
 * Obvious "keep scrolling" control at the bottom of the hero:
 * a labelled pill (tap = smooth scroll to the next section), a swipe hint on
 * touch devices, a one-time pulse + small page nudge if nobody scrolls, and a
 * gentle auto-scroll into the story after the invitation is opened.
 */
export default function ScrollHint({ target }: { target: string }) {
  const [gone, setGone] = useState(false);
  const [touch, setTouch] = useState(false);
  const pulse = useAnimationControls();

  useEffect(() => {
    setTouch(matchMedia("(pointer: coarse)").matches);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scrolled = false;
    const onScroll = () => {
      if (scrollY > innerHeight * 0.1) {
        scrolled = true;
        setGone(true);
      }
    };
    addEventListener("scroll", onScroll, { passive: true });

    const timers: ReturnType<typeof setTimeout>[] = [];
    const onOpen = () => {
      if (reduce) return;
      // let the "20" assemble, then glide into the first section
      timers.push(setTimeout(() => !scrolled && scrollToTarget(target, { duration: 2.4 }), 3600));
    };
    addEventListener("gate:open", onOpen);

    // nobody scrolled after ~6 s on the hero: pulse once and nudge the page
    if (!reduce)
      timers.push(
        setTimeout(() => {
          if (scrolled || document.querySelector(".gate")) return;
          pulse.start({ scale: [1, 1.12, 1], transition: { duration: 0.8 } });
          scrollToTarget(40, { duration: 0.6 });
          timers.push(setTimeout(() => !scrolled && scrollToTarget(0, { duration: 0.6 }), 700));
        }, 6000),
      );

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("gate:open", onOpen);
      timers.forEach(clearTimeout);
    };
  }, [target, pulse]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="hint"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <motion.button type="button" className="hint-btn" animate={pulse} onClick={() => scrollToTarget(target)}>
            {touch ? (
              <span className="hint-swipe" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.2-2.3L4.5 15a1.5 1.5 0 0 1 2.4-1.8L9 15" />
                </svg>
              </span>
            ) : null}
            <span>Урилгаа үзэх</span>
            <span className="hint-arrow" aria-hidden>
              ↓
            </span>
          </motion.button>
          <span className="hint-sub">{touch ? "дээш шударна уу" : "доош гүйлгэнэ үү"}</span>

          <style jsx global>{`
            .hint {
              position: absolute;
              left: 50%;
              bottom: clamp(70px, 11vh, 110px);
              translate: -50% 0;
              z-index: 3;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }
            .hint-btn {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              min-height: 52px;
              padding: 0 26px;
              border-radius: 999px;
              border: 0;
              font: inherit;
              font-size: 16px;
              font-weight: 700;
              color: #0b1220;
              background: #fff;
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 6px rgba(255, 255, 255, 0.12);
              cursor: pointer;
            }
            .hint-arrow {
              display: inline-block;
              font-size: 20px;
              animation: hint-bounce 1.4s ease-in-out infinite;
            }
            .hint-swipe {
              display: inline-flex;
              animation: hint-swipe 1.6s ease-in-out infinite;
            }
            .hint-sub {
              font-size: 13px;
              color: rgba(238, 242, 246, 0.8);
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
            }
            @keyframes hint-bounce {
              0%, 100% { transform: translateY(-2px); }
              50% { transform: translateY(5px); }
            }
            @keyframes hint-swipe {
              0% { transform: translateY(6px); opacity: 0.4; }
              60% { transform: translateY(-6px); opacity: 1; }
              100% { transform: translateY(-6px); opacity: 0; }
            }
            @media (prefers-reduced-motion: reduce) {
              .hint-arrow, .hint-swipe { animation: none; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
