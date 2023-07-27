/**
 * Copyright © Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*jshint browser:true jquery:true*/
/*global confirm:true*/
define([
    'jquery',
    'Magento_Ui/js/lib/view/utils/dom-observer',
    'jquery/ui',
    'Buhmann_Assets/js/lib/sameheight',
    'imagesLoaded'
], function ($, domObserver) {
    'use strict';

    $.widget('mage.sameHeightElements', {
        options: {
            skipClass: 'same-height-ignore',
            leftEdgeClass: 'same-height-left',
            rightEdgeClass: 'same-height-right',
            elements: '>*',
            items: null,
            flexible: true,
            multiLine: true,
            useMinHeight: false,
            biggestHeight: false,
            afterHeightSet: function(){},
        },
        _init: function(){
            this.updateElements();
        },
        updateElements: function(){
            if(this.options.items){
                const elements = this.options.items.split(';');
                for(let i in elements){
                    this.elementsObserver($.extend({}, this.options, {
                        elements: elements[i].trim()
                    }));
                }
            }else{
                this.elementsObserver(this.options);
            }
        },
        elementsObserver: function(options){
            domObserver.get(options.elements, function(node){
                domObserver.get('*', function(el){
                    this.element.sameHeight(options);
                }.bind(this), node);

                if(this.element.find('img').length){
                    this.element.waitForImages(function(){
                        this.element.sameHeight(options);
                    }.bind(this));
                }else{
                    this.element.sameHeight(options);
                }
            }.bind(this), this.element[0]);
        }
    });

    return $.mage.sameHeightElements;
});
