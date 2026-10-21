export type BookLang = 'uz' | 'ru' | 'en';

export interface MenuDish {
  id: string;
  name: string;
  description?: string;
  ingredients?: string;
  /** Already formatted for display, e.g. "45 000 so‘m". */
  price: string;
  image?: string | null;
  available: boolean;
}

export interface MenuChapter {
  key: string;
  title: string;
  dishes: MenuDish[];
}

export interface MenuBookData {
  restaurantName: string;
  chapters: MenuChapter[];
}

export type PageContent =
  | { kind: 'cover' }
  | { kind: 'endpaper' }
  | { kind: 'toc'; entries: TocEntry[]; part: number }
  | { kind: 'dishes'; chapter: MenuChapter; dishes: MenuDish[]; first: boolean }
  | { kind: 'closing' }
  | { kind: 'back-cover' };

export interface TocEntry {
  chapterKey: string;
  title: string;
  count: number;
  /** Physical page index inside the book (0 = front cover). */
  page: number;
}

export interface BookPage {
  index: number;
  /** Printed folio, null for covers and endpapers. */
  folio: number | null;
  content: PageContent;
}

/** A physical leaf: `front` is seen on the right, `back` on the left once turned. */
export interface BookSheet {
  index: number;
  front: BookPage;
  back: BookPage;
  rigid: boolean;
}

/** Click targets in normalised page space (0..1, origin top-left). */
export type HotspotAction =
  | { type: 'goto'; page: number }
  | { type: 'qty'; dishId: string; delta: 1 | -1 }
  | { type: 'add'; dishId: string }
  | { type: 'open' };

export interface Hotspot {
  x: number;
  y: number;
  w: number;
  h: number;
  action: HotspotAction;
}

export interface BookLabels {
  menu: string;
  contents: string;
  page: string;
  of: string;
  open: string;
  close: string;
  prev: string;
  next: string;
  add: string;
  added: string;
  unavailable: string;
  ingredients: string;
  dishes: string;
  closing: string;
  soundOn: string;
  soundOff: string;
  hint: string;
  empty: string;
}
