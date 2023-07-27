/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'mage/utils/wrapper',
    'matchMedia',
    'jquery/ui',
    'mage/mage',
    'mage/collapsible'
], function ($, wrapper, mediaCheck) {
    'use strict';

    return function(tabs){
        tabs.prototype.mediaCheckObserver = function () {
            if(this.options.media){
                mediaCheck({
                    media: this.options.media,
                    entry: $.proxy(function () {
                        this._callCollapsible();
                    }, this),
                    exit: $.proxy(function () {
                        this._destroy();
                        $.each(this.contents, function () {
                            $(this).css('display', '');
                        });
                    }, this)
                });
            }
        };

        tabs.prototype._create = wrapper.wrap(tabs.prototype._create, function(original){
            original();

            this.mediaCheckObserver();
        });

        return tabs;
    };
});
