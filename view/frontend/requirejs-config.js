/**
 * Copyright © Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
var config = {
    map: {
        '*': {
            assetsBase: 'Buhmann_Assets/js/lib/base',
            goToLinks: 'Buhmann_Assets/js/go-to-links',
            imagesLoaded: 'Buhmann_Assets/js/lib/imagesLoaded',
            customForms: 'Buhmann_Assets/js/lib/custom-forms',
            customScrollbar: 'Buhmann_Assets/js/lib/custom-scrollbar',
            bxSlider: 'Buhmann_Assets/js/lib/jquery.bxslider',
            bxSliderMin: 'Buhmann_Assets/js/lib/jquery.bxslider.min',
            scrollToFixed: 'Buhmann_Assets/js/lib/jquery.scrollToFixed',
            bxFunctions: 'Buhmann_Assets/js/bx-functions',
            ScrollMagic: 'Buhmann_Assets/js/lib/gsap/ScrollMagic.min', //'//cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.7/ScrollMagic.min.js',
            debugAddIndicators: 'Buhmann_Assets/js/lib/gsap/debug.addIndicators.min', //'//cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.7/plugins/debug.addIndicators.min.js',
            TweenLite: 'Buhmann_Assets/js/lib/gsap/TweenLite.min', //'//cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenLite.min.js',
            TweenMax: 'Buhmann_Assets/js/lib/gsap/TweenMax.min', //'//cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenMax.min.js',
            TimelineLite: 'Buhmann_Assets/js/lib/gsap/TimelineLite.min', //'//cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TimelineLite.min.js',
            TimelineMax: 'Buhmann_Assets/js/lib/gsap/TimelineMax.min', //'//cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TimelineMax.min.js',
            AnimationGsap: 'Buhmann_Assets/js/lib/gsap/animation.gsap.min', //'//cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.7/plugins/animation.gsap.min.js'
            sameHeightElements: 'Buhmann_Assets/js/sameHeightElements',
            tabsHtml: 'Buhmann_Assets/js/tabs-html',
        }
    },
    shim:{
        'AnimationGsap': ["jquery","ScrollMagic","TweenMax","TimelineMax"],
    },
    config: {
        mixins: {
            'mage/tabs': {
                'Buhmann_Assets/js/mixins/tabs-mixin': true
            },
        }
    }
};
