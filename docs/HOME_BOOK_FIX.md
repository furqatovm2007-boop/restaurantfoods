# Home and menu book release correction

User explicitly requested live deployment after removing Home booking promotions and correcting the paper turn and its audio.

- Removed Home hero booking CTA, booking service tile and booking promotion. Delivery and pickup links remain. Restaurant-specific booking remains.
- Height-only ResizeObserver notifications no longer cancel an active turn. Width changes still cancel misaligned snapshots; changing between single-page and spread layouts recalculates pagination.
- Turned paper now carries the arriving page on its reverse face, using disabled, inert copies with no IDs/names. Live inputs remain untouched.
- Removed CSS filter from the 3D strip parent because a filter creates a flattened grouping layer. Shading is a face overlay instead.
- Existing natural paper recording was amplified 11x without clipping into book-page-turn-v2.wav. Original PCM peak was 0.0476 full scale; new peak is approximately 0.524. Media playback volume is 0.9. The file is preloaded when the menu binds; playback still starts only from user interaction. Existing mute preference is retained.
- The premium review changes are integrated on the current v45 lineage; profile/help, OpenAI robot and menu/cart changes are retained. This release does not update GitHub PR #2 or execute database migrations.

Regression coverage includes height-only resize during opening and paper turns, visible reverse-page content, bounded cleanup, Home without booking CTAs, draft quantities, accepted-only cart feedback, pagination and reduced motion. Browser/device rendering and audio quality require separate verification; code tests do not establish them.
