// PM monogram geometry — single source of truth so the header, footer and
// preloader all draw the exact same mark. The "P" is an outline (stroke); the
// "M" is filled with the accent. Replace these two paths when the final
// supplied PM monogram arrives — nothing else needs to change.
export const PM_P = "M22 82 V18 H48 a17 17 0 0 1 0 34 H22";
export const PM_M = "M54 82 V26 l13 23 13 -23 V82 h-10 V49 l-3 5 -3 -5 V82 Z";
export const PM_VIEWBOX = "0 0 100 100";
