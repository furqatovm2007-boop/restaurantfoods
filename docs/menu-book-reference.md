# Menu book design

Adapted from the user-provided `book-flip-master(1).zip` reference (archive commit 65a52d4dc83a081247660bc1a04094bdd0416f54).

The restaurant menu uses the reference's teal linen cover, gold ornament, cream paper, EB Garamond fonts, and a sine-bowed page curve. Its Three.js shader and React app are not installed: the curve is sampled into 20–28 CSS 3D strips while original HTML form controls stay in place. The cover swings as a rigid leaf. This preserves accessible, selectable text, live quantity inputs, cart actions, category navigation, and the assistant's dish reveal API. No perpetual animation runs while reading.

The fonts are copied from the supplied archive. The cover ornament and textures are CSS. The existing local page-turn recording and add-to-cart effects are retained. Reduced motion skips the animated snapshots. Close/reopen retains selection and position. Scroll, resize, route teardown, or a subsequent turn cancel the current snapshot and its scheduled frame.

Validation: controller and animation lifecycle tests use a DOM mock; cart tests cover explicit additions and rejected updates. These checks do not establish real-device visual rendering or audible sound quality. Browser preview is skipped when the required control-browser skill is unavailable.
