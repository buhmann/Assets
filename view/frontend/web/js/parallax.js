define([
    'jquery',
    //'jquery/ui',
    'Buhmann_Assets/js/lib/parallax'
], function($){
    'use strict';

    $.widget('mage.parallaxDefault', {
        options: {},
        _init: function(){

            console.log(this.element);

            this.element.parallax();
        },
    });

    return $.mage.parallaxDefault;
});
