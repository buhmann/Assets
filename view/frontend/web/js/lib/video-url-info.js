/**
 * Copyright © Magento All rights reserved.
 * See COPYING.txt for license details.
 */
define([], function () {
    'use strict';

    return function(url){
        let videoId,
            videoUrl,
            videoType;
        const timestamp = new Date().getTime();

        url = url || '';
        if(url.search('vimeo') > 0){
            let m = url.match(/^.+vimeo.com\/(.*\/)?([^#\?]*)/);
            videoId = m ? m[2] || m[1] : null;
            videoUrl = videoId? window.location.protocol + '//player.vimeo.com/video/' +
                videoId + '?api=1&player_id=vimeo' +
                videoId +
                timestamp : '';
            videoType = 'vimeo';
        }else if(url.search('youtu') > 0){
            url = (decodeURIComponent(url));
            videoId = (url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/)) ? RegExp.$1 : null;
            videoUrl = videoId? 'https://www.youtube.com/embed/' + videoId + '?rel=0&showinfo=0&autoplay=1&color=white&enablejsapi=1&theme=light&widgetid=1' : '';
            videoType = 'youtube';
        }
        return {
            id: videoId,
            url: videoUrl,
            type: videoType
        };
    }
});
