export const hbEase = [0.22, 1, 0.36, 1] as const;

export const hbSlide = {
  enter: (direction: number) => ({
    x: direction >= 0 ? "18%" : "-18%",
    opacity: 0,
    scale: 1.08,
  }),
  center: {
    x: "0%",
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? "-14%" : "14%",
    opacity: 0,
    scale: 0.98,
  }),
};

export const hbCopy = {
  enter: (direction: number) => ({
    y: direction >= 0 ? 28 : -28,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({
    y: direction >= 0 ? -22 : 22,
    opacity: 0,
  }),
};

export const hbSpring = {
  duration: 0.62,
  ease: hbEase,
};
