/* /investors: "📥 PDF / Chop etish" opens the print dialog (A4, all answers expanded). */
(() => {
  const open = () => document.querySelectorAll('.inv-faq details').forEach((d) => (d.open = true));
  window.addEventListener('beforeprint', open);
  document.querySelector('[data-print]')?.addEventListener('click', () => {
    open();
    window.print();
  });
})();
