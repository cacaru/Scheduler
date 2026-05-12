import type { ThemeApplier } from '@project/shared/src/adapters/theme';

const FONT_BODY_FALLBACK = '-apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif';

export const webThemeApplier: ThemeApplier = {
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  },
  applyColors(primary, light, heavy) {
    const root = document.documentElement.style;
    root.setProperty('--accent', primary);
    root.setProperty('--accent-light', light);
    root.setProperty('--accent-heavy', heavy);
  },
  applyFonts(body, title) {
    const root = document.documentElement.style;
    root.setProperty('--font-body', `"${body}", ${FONT_BODY_FALLBACK}`);
    root.setProperty('--font-title', `"${title}", sans-serif`);
  },
  applyScrollLock(locked) {
    if (typeof document === 'undefined') return;
    if (locked) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  },
};
