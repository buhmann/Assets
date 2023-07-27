define([
    'jquery',
    'underscore',
    'Buhmann_Assets/js/lib/video-url-info',
    'mage/template',
    'jquery/ui',
    'Magento_Ui/js/modal/modal',
    '//player.vimeo.com/api/player.js',
    '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js',
    '//www.youtube.com/iframe_api'
], function($, _, videoUrlInfo, mageTemplate){
    'use strict';

    $.widget('mage.videoPopup', {
        options: {
            contentTemplate:
                '<div class="video-block" data-type="<%- data.type %>" data-videoId="<%- data.id %>">' +
                    '<div class="video-holder">' +
                        '<iframe width="<%- data.width %>" height="<%- data.height %>" src="<%- data.url %>" frameborder="0" allowfullscreen></iframe>' +
                    '</div>' +
                '</div>',
            src: '',
            iframeData: {
                width: 968,
                height: 575
            },
            popUpOptions: {
                modalClass: 'modal-video',
                buttons: []
            },
        },
        _create: function(){
            this._super();

            this.element.one('click', _.bind(this.createModal, this));
        },
        createModal: function () {
            this.videoInfo = $.extend({}, this.options.iframeData,  videoUrlInfo(this.options.src));

            this.modal = $(mageTemplate(this.options.contentTemplate, {
                data: this.videoInfo
            })).modal($.extend({
                trigger: this.element,
                autoOpen: true
            }, this.options.popUpOptions));

            this._on(this.modal, {
                'modalopened': this._openModal,
                'modalclosed': this._closeModal
            });
        },
        _stopAllVideo: function(skipId){
            $('iframe').each(function(index, iframe){
                let iframeInfo = videoUrlInfo(iframe.src);
                if(skipId !== iframeInfo.id){
                    switch (iframeInfo.type){
                        case 'youtube':
                            iframe.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
                            break;
                        case 'vimeo':
                            let player = new Player(iframe);
                            player.pause();
                            break;
                    }
                }
            }.bind(this));
        },
        _openModal: function () {
            this._stopAllVideo(this.videoInfo.id);
        },
        _closeModal: function () {
            this._stopAllVideo();
        },
    });

     return $.mage.videoPopup;
});
