export const hbEase = [0.22, 1, 0.36, 1] as const;

export const hbSlide = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 56 : -56,
    opacity: 0,
    scale: 1.035,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -56 : 56,
    opacity: 0,
    scale: 0.985,
  }),
};

export const hbCopy = {
  enter: (direction: number) => ({
    y: direction >= 0 ? 18 : -18,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({
    y: direction >= 0 ? -14 : 14,
    opacity: 0,
  }),
};

export const hbSpring = {
  duration: 0.55,
  ease: hbEase,
};
