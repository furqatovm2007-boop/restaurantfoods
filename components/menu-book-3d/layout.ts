import type { BookPage, BookSheet, MenuBookData, PageContent, TocEntry } from './types';

export const DISHES_PER_PAGE = 2;
export const TOC_ROWS_PER_PAGE = 11;

/**
 * Lays the menu out as a physical book:
 *   cover | endpaper, contents… | chapter pages… | closing | endpaper | back cover
 * Every sheet carries two pages, so the page count is always even.
 */
export function buildBook(data: MenuBookData): { pages: BookPage[]; sheets: BookSheet[]; toc: TocEntry[] } {
  const chapters = data.chapters.filter((c) => c.dishes.length > 0);
  const tocPageCount = Math.max(1, Math.ceil(chapters.length / TOC_ROWS_PER_PAGE));

  // Chapter pages start after cover (0), endpaper (1) and the contents pages.
  const body: PageContent[] = [];
  const toc: TocEntry[] = [];
  let cursor = 2 + tocPageCount;
  for (const chapter of chapters) {
    toc.push({ chapterKey: chapter.key, title: chapter.title, count: chapter.dishes.length, page: cursor });
    for (let i = 0; i < chapter.dishes.length; i += DISHES_PER_PAGE) {
      body.push({ kind: 'dishes', chapter, dishes: chapter.dishes.slice(i, i + DISHES_PER_PAGE), first: i === 0 });
      cursor++;
    }
  }

  const contents: PageContent[] = [{ kind: 'cover' }, { kind: 'endpaper' }];
  for (let part = 0; part < tocPageCount; part++) {
    contents.push({ kind: 'toc', part, entries: toc.slice(part * TOC_ROWS_PER_PAGE, (part + 1) * TOC_ROWS_PER_PAGE) });
  }
  contents.push(...body, { kind: 'closing' });
  // Back cover must land on the back of the last sheet: pad with a closing page if odd.
  if ((contents.length + 2) % 2 !== 0) contents.push({ kind: 'closing' });
  contents.push({ kind: 'endpaper' }, { kind: 'back-cover' });

  let folio = 0;
  const pages: BookPage[] = contents.map((content, index) => {
    const printed = content.kind === 'toc' || content.kind === 'dishes' || content.kind === 'closing';
    return { index, content, folio: printed ? ++folio : null };
  });

  const sheets: BookSheet[] = [];
  for (let i = 0; i < pages.length; i += 2) {
    const index = i / 2;
    sheets.push({ index, front: pages[i], back: pages[i + 1], rigid: index === 0 || i + 2 === pages.length });
  }
  return { pages, sheets, toc };
}

/** Number of turned sheets needed so that `page` is visible in the open spread. */
export function spreadForPage(page: number): number {
  return page % 2 === 0 ? page / 2 : (page + 1) / 2;
}

/** Pages visible at a given spread: left is the back of the last turned sheet. */
export function pagesAtSpread(spread: number, sheets: BookSheet[]): { left: BookPage | null; right: BookPage | null } {
  return { left: sheets[spread - 1]?.back ?? null, right: sheets[spread]?.front ?? null };
}
