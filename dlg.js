(function dlgMacros(macroOptions) {
    'use strict';
    /* globals version, Macro */

    if (!version || !version.title || 'SugarCube' !== version.title || !version.major || version.major < 2) {
        throw new Error('<<dlg>> macro requires SugarCube 2.0 or greater, aborting load');
    }

    function getOrCreate(id) {
        let element = jQuery('#' + id);
        if (element.length === 0) {
            element = jQuery(`<div id="${id}"></div>`);
        }

        return element;
    }

    function isNumber(arg) {
        return typeof arg === 'number';
    }

    function getLevels(ctx) {
        let level = 0;
        const parentLevel = ctx.contextSelect((context) => context.name === 'level');
        if (parentLevel) {
            level = parseInt(parentLevel.args[0], 10);
        }

        let targetLevel = level + 1;
        if (isNumber(ctx.args[1])) {
            targetLevel = parseInt(ctx.args[1], 10);
        } else if (isNumber(ctx.args[2])) {
            targetLevel = parseInt(ctx.args[2], 10);
        }

        return {level, targetLevel};
    }

    Macro.add('line', {
        tags: null,
        handler() {
            const {level, targetLevel} = getLevels(this);

            let dlgId = 'dlg';
            const parentDlg = this.contextSelect((context) => context.name === 'dlg');
            const dlgArgs = parentDlg.args;

            if (parentDlg && dlgArgs[0]) {
                dlgId = dlgArgs[0];
            }

            let bullet = '';
            if (this.args.length === 2 && !isNumber(this.args[1])) {
                bullet = this.args[1];
            } else if (parentDlg && parentDlg.args.length === 3) {
                bullet = parentDlg.args[2];
            }

            let line;
            if (this.args.length === 0) {
                line = this.payload[0].content;
            } else {
                line = this.args[0];
            }

            const doTrim = !!macroOptions.trim;
            const doPrepend = !!macroOptions.prepend;

            const link = jQuery('<a class="dlg-line"></a>');
            link.wiki(`${bullet ? bullet + ' ' : ''}${line}`);
            link.ariaClick(() => {
                const response = doTrim ? this.payload[0].contents.trim() : this.payload[0].contents;
                const result = doPrepend ? (`${line}\n${response}`) : response;
                jQuery('#' + dlgId).wiki((level > 0 ? '\n' : '') + result);

                const dlgStage = jQuery('#' + dlgId + '-stage');
                dlgStage.find('.dlg-level-' + level).attr('hidden', 'hidden');
                dlgStage.find('.dlg-level-' + targetLevel).removeAttr('hidden');
            });

            jQuery(this.output).append(link);
        },
    });

    Macro.add('level', {
        tags: [],
        handler() {
            const level = parseInt(this.args[0], 10);
            if (isNaN(level)) {
                this.error('missing <<dlg>> <<level>> number');
            } else {
                const wrapper = jQuery(`<div class="dlg-level-${level}" hidden></div>`);
                for (const payload of this.payload) {
                    wrapper.wiki(payload.contents);
                }

                jQuery(this.output).append(wrapper);
            }
        },
    });

    Macro.add('dlg', {
        tags: [],
        handler() {
            const dlgId = this.args[0] || 'dlg';

            const currentLevel = this.args.length === 2 ? parseInt(this.args[1], 10) : 0;

            let dlgWrapper = getOrCreate(dlgId);
            let dlgStage = getOrCreate(dlgId + '-stage');

            for (const payload of this.payload) {
                dlgStage.wiki(payload.contents);
            }

            dlgStage.find('.dlg-level-' + currentLevel).removeAttr('hidden', 'hidden');

            jQuery(this.output)
                .append(dlgWrapper)
                .append(dlgStage);
        },
    });
}({trim: false, prepend: false}));