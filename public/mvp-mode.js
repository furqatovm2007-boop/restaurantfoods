// SIMPLE_MVP_MODE for the browser — keep equal to app/mvp.ts (tests/mvp.test.cjs checks both). With it on the
// site shows the 3-step booking flow (public/mvp.js) and hides flowers, the AI assistant, Call AI, Smart
// Vision and pricing from menus and the landing page. Set to false to bring every full screen back.
window.SIMPLE_MVP_MODE = true;
if (window.SIMPLE_MVP_MODE) document.documentElement.classList.add('rf-mvp');
// Who books (app/mvp.ts MVP_CHECKOUT): 'telegram' — sign in with Telegram at checkout; 'guest' — name and phone.
window.MVP_CHECKOUT = 'guest';
