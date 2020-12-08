(function muteBtn() {
    // Note: volumeButtons.js provides more functionality
    // requires menuButton.js
    //
    // Adds 'mute' toggle button to UI Bar

    'use strict';

    /* globals l10nStrings, scUtils, storage */

    let mute = storage.get('mute') === 'true';

    function renderMute() {
        storage.get('mute', mute.toString());
        document.documentElement.classList.toggle('mute', mute);
        jQuery.wiki(`<<masteraudio ${mute ? 'mute' : 'unmute'}>>`); // use engine API instead of undocumented access
    }

    function handler() {
        mute = !mute;

        renderMute();
    }

    const { style } = scUtils.createHandlerButton(l10nStrings.uiBarMute || 'Sound', '\\e843\\00a0', 'mute', handler);
    const styleId = style.attr('id').replace(/-style$/, '');

    style.text(`
        #menu-core #${styleId} a::before {
            content: '\\e843\\00a0';
        }
        .mute #menu-core #${styleId} a::before {
            content: '\\e842\\00a0';
        }
    `);

    renderMute();
}());