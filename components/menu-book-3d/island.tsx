/**
 * Browser entry for the vanilla RestaurantFoods SPA. Built to public/rf-3d.js by
 * vite.menu-book.config.ts and loaded on demand by public/rf-3d-loader.js:
 *
 *   RF3D.menuBook.mount(el, props) / reveal / unmount   inline 3D book
 *   RF3D.fullscreenMenu.open(props) → close()           full-screen 3D menu overlay
 *   RF3D.hall.mount(el, props) / unmount                3D hall table picker
 *   RF3D.orb.mount(props) / unmount                     admin AI orb widget
 *   RF3D.tableMap.mount(el, props) / unmount            live table map for the dashboard
 */
import { createRef, StrictMode, type ReactNode, type RefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AdminOrb, type AdminOrbProps } from '../admin-orb/AdminOrb';
import { AdminTableMap, type AdminTableMapProps } from '../admin-table-map/AdminTableMap';
import { Hall3D, type Hall3DProps } from '../hall-3d/Hall3D';
import { FullscreenMenu, type FullscreenMenuProps } from './FullscreenMenu';
import { MenuBook3D, type MenuBook3DHandle, type MenuBook3DProps } from './MenuBook3D';
import './menu-book-3d.css';

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** One React root per host element; released automatically when the SPA removes the host. */
const roots = new Map<Element, { root: Root; observer: MutationObserver }>();
function render(el: Element, node: ReactNode) {
  let entry = roots.get(el);
  if (!entry) {
    const observer = new MutationObserver(() => !el.isConnected && unmount(el));
    observer.observe(document.body, { childList: true, subtree: true });
    entry = { root: createRoot(el), observer };
    roots.set(el, entry);
  }
  entry.root.render(<StrictMode>{node}</StrictMode>);
}
function unmount(el: Element) {
  const entry = roots.get(el);
  if (!entry) return;
  entry.observer.disconnect();
  entry.root.unmount();
  roots.delete(el);
}

const bookHandles = new Map<Element, RefObject<MenuBook3DHandle | null>>();

const menuBook = {
  mount(el: Element, props: MenuBook3DProps) {
    if (!webglAvailable()) return false;
    const handle = bookHandles.get(el) ?? createRef<MenuBook3DHandle>();
    bookHandles.set(el, handle);
    render(el, <MenuBook3D {...props} ref={handle} />);
    return true;
  },
  reveal(el: Element, dishId: string) {
    return bookHandles.get(el)?.current?.reveal(dishId) ?? false;
  },
  unmount(el: Element) {
    bookHandles.delete(el);
    unmount(el);
  },
};

let overlay: HTMLDivElement | null = null;
const fullscreenMenu = {
  open(props: Omit<FullscreenMenuProps, 'onClose'> & { onClose?: () => void }) {
    if (!webglAvailable()) return null;
    fullscreenMenu.close();
    const host = document.createElement('div');
    host.setAttribute('data-rf-3d-overlay', '');
    document.body.appendChild(host);
    overlay = host;
    const close = () => {
      if (overlay === host) overlay = null;
      unmount(host);
      host.remove();
      props.onClose?.();
    };
    render(host, <FullscreenMenu {...props} onClose={close} />);
    return { close };
  },
  close() {
    if (!overlay) return;
    unmount(overlay);
    overlay.remove();
    overlay = null;
  },
};

const hall = {
  mount(el: Element, props: Hall3DProps) {
    if (!webglAvailable()) return false;
    render(el, <Hall3D {...props} />);
    return true;
  },
  unmount,
};

let orbHost: HTMLDivElement | null = null;
const orb = {
  mount(props: AdminOrbProps = {}) {
    if (!webglAvailable()) return false;
    if (!orbHost) {
      orbHost = document.createElement('div');
      orbHost.setAttribute('data-rf-admin-orb', '');
      document.body.appendChild(orbHost);
    }
    render(orbHost, <AdminOrb {...props} />);
    return true;
  },
  unmount() {
    if (!orbHost) return;
    unmount(orbHost);
    orbHost.remove();
    orbHost = null;
  },
};

// Plain SVG, so it works without WebGL.
const tableMap = {
  mount(el: Element, props: AdminTableMapProps) {
    render(el, <AdminTableMap {...props} />);
    return true;
  },
  unmount,
};

const api = { supported: webglAvailable, menuBook, fullscreenMenu, hall, orb, tableMap };

declare global {
  interface Window {
    RF3D?: typeof api;
    /** Kept for code written against the first 3D menu release. */
    RFMenuBook3D?: typeof menuBook & { supported: typeof webglAvailable };
  }
}

window.RF3D = api;
window.RFMenuBook3D = { ...menuBook, supported: webglAvailable };
document.dispatchEvent(new CustomEvent('rf:3d-ready'));
document.dispatchEvent(new CustomEvent('rf:menu-book-3d-ready'));
