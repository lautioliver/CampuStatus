const STORAGE_KEY = 'theme';

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // localStorage no disponible
  }
}

function animateCircleReveal(button: HTMLElement, isDark: boolean, onComplete: () => void) {
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const overlay = document.createElement('div');
  overlay.className = 'theme-reveal-overlay';
  overlay.style.setProperty('--reveal-x', `${x}px`);
  overlay.style.setProperty('--reveal-y', `${y}px`);
  overlay.style.setProperty('--reveal-radius', `${radius}px`);
  overlay.dataset.theme = isDark ? 'dark' : 'light';
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('theme-reveal-active');
  });

  overlay.addEventListener(
    'transitionend',
    () => {
      applyTheme(isDark);
      overlay.remove();
      onComplete();
    },
    { once: true }
  );
}

export function toggleTheme(button: HTMLElement): Promise<boolean> {
  const nextDark = !document.documentElement.classList.contains('dark');

  if (document.startViewTransition) {
    const transition = document.startViewTransition(() => {
      applyTheme(nextDark);
    });

    transition.ready
      .then(() => {
        const rect = button.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 480,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => {
        // View transition cancelada; el tema ya se aplicó.
      });

    return Promise.resolve(nextDark);
  }

  return new Promise((resolve) => {
    animateCircleReveal(button, nextDark, () => resolve(nextDark));
  });
}

export function getInitialTheme(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}
