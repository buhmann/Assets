/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'mage/template',
    'jquery/ui',
    'mage/mage',
    'mage/tabs',
    'sameHeightElements'
], function ($, mageTemplate) {
    'use strict';

    $.widget('mage.tabsHtml', {
        options: {
            labelTemplate:
                '<div class="<%= tabClass %>" aria-labelledby="tab-label-<%= alias %>-title" data-role="collapsible" id="tab-label-<%= alias %>">' +
                    '<a class="data switch" tabindex="-1" data-toggle="switch" href="#<%= alias %>" id="tab-label-<%= alias %>-title">' +
                        '<% if(iconUrl){ %>' +
                        '<div class="title__icon">' +
                            '<% if(iconType === "svg"){ %>' +
                                '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="<%= iconUrl %>"></use></svg>' +
                            '<% } %>' +
                            '<% if(iconType === "img"){ %>' +
                            '<img src="<%= iconUrl %>" alt="<%= label %>">' +
                            '<% } %>' +
                        '</div>' +
                        '<% } %>' +
                        '<span class="title__label"><%= label %></span>' +
                    '</a>' +
                '</div>',
            dropdownTemplate:
                '<div class="tab-dropdown">' +
                    '<p>Select a topic from the dropdown below</p>' +
                    '<select class="tab-dropdown__menu">' +
                        '<% _.each(data.tabs, function(tab, index) { %>' +
                        '<option name="<%= tab.alias %>" value="<%= index %>"><%= tab.labelText %></option>' +
                        '<% }) %>' +
                    '</select>' +
                '</div>',
            tabSelector: '.tab',
            tabsOpt: {
                useTabIcon: true,
                iconType: 'svg',
                wrapperClass: 'tabs data items',
                tabClass: 'data item title',
                contentClass: 'data item content',
                openedState: 'active'
            }
        },
        tabsData: {
            tabs: {}
        },
        _create: function () {
            this._super();

            this.element.addClass(this.options.tabsOpt.wrapperClass);
            this.tabsData = $.extend({}, this.tabsData, this.options.tabsOpt);
            this.tabsData.toggleActivate = this._toggleActivate;

            _.each(this.element.children(this.options.tabSelector), function(tab) {
                let labelText = tab.dataset.label;
                if(labelText){
                    const alias = this._normalizeString(labelText);
                    const label = $('#tab-label-' + alias).length ? $('#tab-label-' + alias) : $(mageTemplate(this.options.labelTemplate, {
                        label: labelText,
                        alias: alias,
                        tabClass: this.options.tabsOpt.tabClass,
                        iconType: this.options.tabsOpt.iconType,
                        iconUrl: tab.dataset.iconUrl,
                    }));

                    tab.dataset.role = 'content';
                    tab.id = alias;
                    $(tab).addClass(this.options.tabsOpt.contentClass);

                    label.insertBefore(tab);

                    this.tabsData.tabs[alias] = {
                        label: label,
                        labelText: labelText,
                        alias: alias,
                        html: tab
                    };
                }
            }.bind(this));

            const tabsCount = Object.keys(this.tabsData.tabs).length;
            _.each(this.tabsData.tabs, function(tab) {
                $(tab.label).css({'width': 100 / tabsCount + '%'}).on('click', function () {
                    this.tabsData.dropdown.find('select').val($(tab.label).attr('aria-controls'));
                }.bind(this));

            }.bind(this));

            this.tabsData.dropdown = $(mageTemplate(this.options.dropdownTemplate, {
                data: this.tabsData
            }));

            _.each(this.tabsData.dropdown.find('select'), function(dropdown) {
                this._on(dropdown, {
                    'change': this._toggleActivate
                });
            }.bind(this));

            this.tabsData.dropdown.prependTo(this.element);

            this.element.tabs(this.options.tabsOpt);
            this.element.sameHeightElements({
                elements: '[role="tab"]'
            });
        },
        _normalizeString: function (str) {
            return str.toString().toLowerCase()
                .replace(/\s+/g, '-') // Replace spaces with -
                .replace(/&/g, '-and-') // Replace & with 'and'
                .replace(/[^a-z0-9-]/gi, '-')
                .replace(/\-\-+/g, '-') // Replace multiple - with single -
                .replace(/^-+/, '') // Trim - from start of text
                .replace(/-+$/, '') // Trim - from end of text
        },
        _toggleActivate: function (event) {
            const alias = event.target.value;
            const tab = this.tabsData.tabs[alias];
            if(tab) {
                tab.label.trigger('click');
            }
        }
    });

    return $.mage.tabsHtml;
});
