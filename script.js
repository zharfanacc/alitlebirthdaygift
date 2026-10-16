const root = document.documentElement;
const body = document.body;
const bookStory = document.querySelector(".book-story");
const giftStory = document.querySelector(".gift-story");
const memories = document.querySelector(".memories");
const progressFill = document.querySelector(".journey-progress__fill");
const startButton = document.querySelector("#start-story");
const replayButton = document.querySelector("#replay-story");
const song = document.querySelector("#birthday-song");
const musicToggle = document.querySelector(".music-toggle");
const musicLabel = document.querySelector(".music-toggle__label");
const wishSlides = [...document.querySelectorAll(".wish-slide")];
const wishDots = [...document.querySelectorAll(".wish-dots i")];
const momentCount = document.querySelector(".book-moment__count");
const momentLabel = document.querySelector(".book-moment__label");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const momentLabels = ["sebuah doa kecil", "untuk langkahmu", "selalu dikelilingi cinta"];
let framePending = false;
let activeMoment = -1;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (start, end, value) => {
  const point = clamp((value - start) / (end - start));
  return point * point * (3 - 2 * point);
};

const sectionProgress = (section) => {
  const travel = section.offsetHeight - window.innerHeight;
  if (travel <= 0) return 0;
  return clamp((window.scrollY - section.offsetTop) / travel);
};

const setMoment = (index) => {
  if (index === activeMoment) return;
  activeMoment = index;

  wishSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === index);
  });

  wishDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });

  momentCount.textContent = `${String(index + 1).padStart(2, "0")} / 03`;
  momentLabel.textContent = momentLabels[index];
};

const updateScrollStory = () => {
  const bookProgress = sectionProgress(bookStory);
  const openIn = smoothstep(0.1, 0.29, bookProgress);
  const closeOut = 1 - smoothstep(0.76, 0.92, bookProgress);
  const bookOpen = openIn * closeOut;
  const bookVisible = 1 - smoothstep(0.92, 0.985, bookProgress);

  root.style.setProperty("--book-open", bookOpen.toFixed(4));
  root.style.setProperty("--book-visible", bookVisible.toFixed(4));

  if (bookProgress < 0.47) setMoment(0);
  else if (bookProgress < 0.62) setMoment(1);
  else setMoment(2);

  const giftProgress = sectionProgress(giftStory);
  const giftRise = smoothstep(0.05, 0.29, giftProgress);
  const giftOut = 1 - smoothstep(0.69, 0.91, giftProgress);
  const giftOpacity = giftRise * giftOut;

  root.style.setProperty("--gift-rise", giftRise.toFixed(4));
  root.style.setProperty("--gift-opacity", giftOpacity.toFixed(4));

  const pageTravel = document.documentElement.scrollHeight - window.innerHeight;
  const documentProgress = pageTravel > 0 ? clamp(window.scrollY / pageTravel) : 0;
  progressFill.style.transform = `scaleX(${documentProgress.toFixed(4)})`;

  const viewportMiddle = window.scrollY + window.innerHeight * 0.5;
  if (viewportMiddle < bookStory.offsetTop) body.dataset.scene = "intro";
  else if (viewportMiddle < giftStory.offsetTop) body.dataset.scene = "book";
  else if (viewportMiddle < memories.offsetTop) body.dataset.scene = "gift";
  else body.dataset.scene = "memories";

  framePending = false;
};

const requestScrollUpdate = () => {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updateScrollStory);
};

const updateMusicButton = () => {
  const playing = !song.paused;
  musicToggle.classList.toggle("is-playing", playing);
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
  musicLabel.textContent = playing ? "pause song" : "play song";
};

const playSong = async () => {
  try {
    await song.play();
  } catch (error) {
    console.info("Musik menunggu interaksi pengguna berikutnya.", error);
  }
  updateMusicButton();
};

startButton.addEventListener("click", () => {
  playSong();
  bookStory.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
});

musicToggle.addEventListener("click", () => {
  if (song.paused) playSong();
  else song.pause();
  updateMusicButton();
});

song.addEventListener("play", updateMusicButton);
song.addEventListener("pause", updateMusicButton);

replayButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );

  document.querySelectorAll(".reveal-on-view").forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll(".reveal-on-view").forEach((element) => {
    element.classList.add("is-visible");
  });
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
window.addEventListener("load", requestScrollUpdate, { once: true });

setMoment(0);
updateMusicButton();
updateScrollStory();
