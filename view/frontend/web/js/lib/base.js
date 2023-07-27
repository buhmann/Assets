/* Base Scripts */
/**
 * Copyright © Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'Buhmann_Assets/js/lib/polyfills'
], function(){
    'use strict';
    const b = {};

    b.methods = {};
    b.plugins = {};
    b.addMethod = function(name, obj) {
        this.methods[name] = window.ClassCreate();
        this.methods[name].prototype = obj;
    };

    b.lib = {
        deviceProperty: (function(){
            let device = {
                isTouchDevice: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
                isWinPhoneDevice: navigator.msPointerEnabled && /MSIE 10.*Touch/.test(navigator.userAgent),
                isMobile: navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i),
            };
            if(navigator.msPointerEnabled && navigator.msDoNotTrack) {
                device.eventPress = 'MSPointerDown';
                device.eventMove = 'MSPointerMove';
                device.eventRelease = 'MSPointerUp';
            } else {
                device.eventPress = device.isTouchDevice ? 'touchstart' : 'mousedown';
                device.eventMove = device.isTouchDevice ? 'touchmove' : 'mousemove';
                device.eventRelease = device.isTouchDevice ? 'touchend' : 'mouseup';
            }

            return device;
        }()),
        getRandomInt: function(min, max){
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        inArray: function(value, array){
            for(let i = 0; i < array.length; i++){
                if(array[i] == value) return true;
            }
            return false;
        },
        stringToBoolean: function(str){
            if(str == null)
                return false;

            if(typeof str === 'boolean'){
                return (str === true);
            }

            if(typeof str === 'string'){
                if(str === "")
                    return false;

                str = str.replace(/^\s+|\s+$/g, '');
                if(str.toLowerCase() === 'true' || str.toLowerCase() === 'yes')
                    return true;

                str = str.replace(/,/g, '.');
                str = str.replace(/^\s*\-\s*/g, '-');
            }

            if(!isNaN(str))
                return (parseFloat(str) !== 0);

            return false;
        },
        bind: function(func, scope){
            return function() {
                return func.apply(scope, arguments);
            };
        },
        browser: (function() {
            let ua = navigator.userAgent.toLowerCase(), res = {},
            match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
            res[match[1]] = true;
            res.version = match[2] || "0";
            res.safariMac = ua.indexOf('mac') !== -1 && ua.indexOf('safari') !== -1;
            return res;
        })(),
        getOffset: function (obj) {
            if (obj.getBoundingClientRect && !this.deviceProperty.isWinPhoneDevice) {
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
                var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
                return {
                    top:Math.round(obj.getBoundingClientRect().top + scrollTop - clientTop),
                    left:Math.round(obj.getBoundingClientRect().left + scrollLeft - clientLeft)
                };
            } else {
                var posLeft = 0, posTop = 0;
                while (obj.offsetParent) {posLeft += obj.offsetLeft; posTop += obj.offsetTop; obj = obj.offsetParent;}
                return {top:posTop,left:posLeft};
            }
        },
        getScrollTop: function() {
            return window.pageYOffset || document.documentElement.scrollTop;
        },
        getScrollLeft: function() {
            return window.pageXOffset || document.documentElement.scrollLeft;
        },
        getWindowWidth: function(){
            return document.compatMode==='CSS1Compat' ? document.documentElement.clientWidth : document.body.clientWidth;
        },
        getWindowHeight: function(){
            return document.compatMode==='CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
        },
        getStyle: function(el, prop) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                return document.defaultView.getComputedStyle(el, null)[prop];
            } else if (el.currentStyle) {
                return el.currentStyle[prop];
            } else {
                return el.style[prop];
            }
        },
        getParent: function(obj, selector) {
            while(obj.parentNode && obj.parentNode != document.body) {
                if(obj.parentNode.matches && obj.parentNode.matches(selector)) {
                    return obj.parentNode;
                }
                obj = obj.parentNode;
            }
            return false;
        },
        isParent: function(parent, child) {
            while(child.parentNode) {
                if(child.parentNode === parent) {
                    return true;
                }
                child = child.parentNode;
            }
            return false;
        },
        prevSibling: function(node) {
            while(node = node.previousSibling) if(node.nodeType == 1) break;
            return node;
        },
        nextSibling: function(node) {
            while(node = node.nextSibling) if(node.nodeType == 1) break;
            return node;
        },
        siblings: function(obj, nodeType){
            let siblingNodes = [];
            if(obj.parentNode){
                nodeType = nodeType || Node.ELEMENT_NODE;
                siblingNodes = [].slice.call(obj.childNodes).filter(function(node){
                    return (node.nodeType === nodeType) && obj != node;
                });
            }
            return siblingNodes;
        },
        insertAfter: function(element,referenceElement) {
            let parent = referenceElement.parentNode;
            if(parent.lastchild == referenceElement) {
                parent.appendChild(element);
            } else {
                parent.insertBefore(element, referenceElement.nextSibling);
            }
            return element;
        },
        fireEvent: function(element,event) {
            if(element.dispatchEvent){
                let evt = document.createEvent('HTMLEvents');
                evt.initEvent(event, true, true );
                return !element.dispatchEvent(evt);
            }else if(document.createEventObject){
                let evt = document.createEventObject();
                return element.fireEvent('on'+event,evt);
            }
        },
        inherit: function(Child, Parent) {
            let F = function() { }
            F.prototype = Parent.prototype
            Child.prototype = new F()
            Child.prototype.constructor = Child
            Child.superclass = Parent.prototype
        },
        extend: function(obj) {
            for(let i = 1; i < arguments.length; i++) {
                for(let p in arguments[i]) {
                    if(arguments[i].hasOwnProperty(p)) {
                        obj[p] = arguments[i][p];
                    }
                }
            }
            return obj;
        },
        createElement: function(tagName, options) {
            let el = document.createElement(tagName);
            for(let p in options) {
                if(options.hasOwnProperty(p)) {
                    switch (p) {
                        case 'class': el.className = options[p]; break;
                        case 'html': el.innerHTML = options[p]; break;
                        case 'style': this.setStyles(el, options[p]); break;
                        default: el.setAttribute(p, options[p]);
                    }
                }
            }
            return el;
        },
        getChildren: function(obj, nodeType){
            let childNodes = [];
            if(obj.childNodes){
                nodeType = nodeType || Node.ELEMENT_NODE;
                childNodes = [].slice.call(obj.childNodes).filter(function(node){
                    return node.nodeType === nodeType;
                });
            }
            return childNodes;
        },
        setStyles: function(el, styles) {
            for(let p in styles) {
                if(styles.hasOwnProperty(p)) {
                    switch (p) {
                        case 'float': el.style.cssFloat = styles[p]; break;
                        case 'opacity': el.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity='+styles[p]*100+')'; el.style.opacity = styles[p]; break;
                        default: el.style[p] = (typeof styles[p] === 'undefined' ? 0 : styles[p]) + (typeof styles[p] === 'number' ? 'px' : '');
                    }
                }
            }
            return el;
        },
        getInnerWidth: function(el) {
            return el.offsetWidth - (parseInt(this.getStyle(el,'paddingLeft')) || 0) - (parseInt(this.getStyle(el,'paddingRight')) || 0);
        },
        getInnerHeight: function(el) {
            return el.offsetHeight - (parseInt(this.getStyle(el,'paddingTop')) || 0) - (parseInt(this.getStyle(el,'paddingBottom')) || 0);
        },
        scrollSize: (function(){
            let content, hold, sizeBefore, sizeAfter;
            function buildSizer(){
                if(hold) removeSizer();
                content = document.createElement('div');
                hold = document.createElement('div');
                hold.style.cssText = 'position:absolute;overflow:hidden;width:100px;height:100px';
                hold.appendChild(content);
                document.body.appendChild(hold);
            }
            function removeSizer(){
                document.body.removeChild(hold);
                hold = null;
            }
            function calcSize(vertical) {
                buildSizer();
                content.style.cssText = 'height:'+(vertical ? '100%' : '200px');
                sizeBefore = (vertical ? content.offsetHeight : content.offsetWidth);
                hold.style.overflow = 'scroll'; content.innerHTML = 1;
                sizeAfter = (vertical ? content.offsetHeight : content.offsetWidth);
                if(vertical && hold.clientHeight) sizeAfter = hold.clientHeight;
                removeSizer();
                return sizeBefore - sizeAfter;
            }
            return {
                getWidth:function(){
                    return calcSize(false);
                },
                getHeight:function(){
                    return calcSize(true)
                }
            }
        }()),
        domReady: function (handler){
            let called = false;
            function ready() {
                if (called) return;
                called = true;
                handler();
            }
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", ready, false);
            } else if (document.attachEvent) {
                if (document.documentElement.doScroll && window == window.top) {
                    let tryScroll = function (){
                        if (called) return
                        if (!document.body) return
                        try {
                            document.documentElement.doScroll("left")
                            ready()
                        } catch(e) {
                            setTimeout(tryScroll, 0)
                        }
                    };
                    tryScroll();
                }
                document.attachEvent("onreadystatechange", function(){
                    if (document.readyState === "complete") {
                        ready()
                    }
                })
            }
            if (window.addEventListener) window.addEventListener('load', ready, false)
            else if (window.attachEvent) window.attachEvent('onload', ready)
        },
        event: (function(){
            let guid = 0;
            function fixEvent(e) {
                e = e || window.event;
                if (e.isFixed) {
                    return e;
                }
                e.isFixed = true;
                e.preventDefault = e.preventDefault || function(){this.returnValue = false}
                e.stopPropagation = e.stopPropagaton || function(){this.cancelBubble = true}
                if (!e.target) {
                    e.target = e.srcElement
                }
                if (!e.relatedTarget && e.fromElement) {
                    e.relatedTarget = e.fromElement == e.target ? e.toElement : e.fromElement;
                }
                if (e.pageX == null && e.clientX != null) {
                    let html = document.documentElement, body = document.body;
                    e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
                    e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
                }
                if (!e.which && e.button) {
                    e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));
                }
                if(e.type === "DOMMouseScroll" || e.type === 'mousewheel') {
                    e.mWheelDelta = 0;
                    if (e.wheelDelta) {
                        e.mWheelDelta = e.wheelDelta/120;
                    } else if (e.detail) {
                        e.mWheelDelta = -e.detail/3;
                    }
                }
                return e;
            }
            function commonHandle(event, customScope) {
                event = fixEvent(event);
                let handlers = this.events[event.type];
                for (let g in handlers) {
                    let handler = handlers[g];
                    let ret = handler.call(customScope || this, event);
                    if (ret === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
            let publicAPI = {
                add: function(elem, type, handler, forcedScope) {
                    if (elem.setInterval && (elem != window && !elem.frameElement)) {
                        elem = window;
                    }
                    if (!handler.guid) {
                        handler.guid = ++guid;
                    }
                    if (!elem.events) {
                        elem.events = {};
                        elem.handle = function(event) {
                            return commonHandle.call(elem, event);
                        }
                    }
                    if (!elem.events[type]) {
                        elem.events[type] = {};
                        if (elem.addEventListener) elem.addEventListener(type, elem.handle, false);
                        else if (elem.attachEvent) elem.attachEvent("on" + type, elem.handle);
                        if(type === 'mousewheel') {
                            publicAPI.add(elem, 'DOMMouseScroll', handler, forcedScope);
                        }
                    }
                    let fakeHandler = b.lib.bind(handler, forcedScope);
                    fakeHandler.guid = handler.guid;
                    elem.events[type][handler.guid] = forcedScope ? fakeHandler : handler;
                },
                remove: function(elem, type, handler) {
                    let handlers = elem.events && elem.events[type];
                    if (!handlers) return;
                    delete handlers[handler.guid];
                    for(let any in handlers) return;
                    if (elem.removeEventListener) elem.removeEventListener(type, elem.handle, false);
                    else if (elem.detachEvent) elem.detachEvent("on" + type, elem.handle);
                    delete elem.events[type];
                    for (let any in elem.events) return;
                    try {
                        delete elem.handle;
                        delete elem.events;
                    } catch(e) {
                        if(elem.removeAttribute) {
                            elem.removeAttribute("handle");
                            elem.removeAttribute("events");
                        }
                    }
                    if(type === 'mousewheel') {
                        publicAPI.remove(elem, 'DOMMouseScroll', handler);
                    }
                }
            }
            return publicAPI;
        }()),
        queryString: function(){
            let query_string = {},
                query = window.location.search.substring(1),
                vars = query.split("&");
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split("=");
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = decodeURIComponent(pair[1]);
                } else if (typeof query_string[pair[0]] === "string") {
                    query_string[pair[0]] = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                } else {
                    query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return query_string;
        }(),
        insertQueryParam: function(key, value){
            key = encodeURIComponent(key);
            value = encodeURIComponent(value);
            var s = document.location.search;
            var kvp = key+"="+value;
            var r = new RegExp("(&|\\?)"+key+"=[^\&]*");

            s = s.replace(r,"$1"+kvp);
            if(!RegExp.$1) {s += (s.length>0 ? '&' : '?') + kvp;};

            if (history.pushState) {
                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + s;
                window.history.pushState({path:newurl},'',newurl);
            }
        },
        htmlToElement: function(html){
            var template = document.createElement('template');
            template.innerHTML = html;
            return template.content.firstChild;
        },
        htmlToElements: function(html){
            var template = document.createElement('template');
            template.innerHTML = html;
            return template.content.childNodes;
        },
    };

    b.addMethod('ScrollTo', {
        baseOptions: {
            destinationOffset: 0,
            easing: 'linear',
            duration: 300,
            scrollBefore: function(){},
            scrollAfter: function(){}
        },
        easings: {
            linear(t){
                return t;
            },
            easeInQuad(t){
                return t * t;
            },
            easeOutQuad(t){
                return t * (2 - t);
            },
            easeInOutQuad(t){
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            },
            easeInCubic(t){
                return t * t * t;
            },
            easeOutCubic(t){
                return (--t) * t * t + 1;
            },
            easeInOutCubic(t){
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            },
            easeInQuart(t){
                return t * t * t * t;
            },
            easeOutQuart(t){
                return 1 - (--t) * t * t * t;
            },
            easeInOutQuart(t){
                return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
            },
            easeInQuint(t){
                return t * t * t * t * t;
            },
            easeOutQuint(t){
                return 1 + (--t) * t * t * t * t;
            },
            easeInOutQuint(t){
                return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
            }
        },
        scroll: function(){
            const self = this;
            function scroll(){
                const now = 'now' in window.performance ? performance.now() : new Date().getTime();
                const time = Math.min(1, ((now - self.startTime) / self.options.duration));
                const timeFunction = self.easings[self.options.easing](time);
                window.scroll(0, Math.ceil((timeFunction * (self.destinationOffsetToScroll - self.start)) + self.start));

                if (window.pageYOffset === self.destinationOffsetToScroll) {
                    self.options.scrollAfter();
                    return;
                }
                requestAnimationFrame(scroll);
            };
            scroll();
        },
        initialize: function(opt){
            let documentHeight, windowHeight;

            this.options = Object.assign({}, this.baseOptions, opt);
            this.options.scrollBefore();

            documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

            this.start = window.pageYOffset;
            this.startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
            this.destinationOffsetToScroll = Math.round(documentHeight - this.options.destinationOffset < windowHeight ? documentHeight - windowHeight : this.options.destinationOffset);

            if ('requestAnimationFrame' in window === false) {
                window.scroll(0, this.destinationOffsetToScroll);
                this.options.scrollAfter();
                return;
            }
            this.scroll();
        }
    });

    b.addMethod('ElementParentWidth', {
        lib: Object.assign({}, b.lib, {}),
        initialize: function(node, opt){
            const self = this;
            opt = opt || {};
            this.elementNode = node;
            this.options = Object.assign({}, {
                parentSelector: null,
                elementSelector: '.use-window-width',
                windowSelector: '.page-wrapper'
            }, opt);

            if(this.elementNode){
                this.windowNode = this.options.parentSelector? this.lib.getParent(this.elementNode, this.options.parentSelector) : document.body;
                this.lib.domReady(function(){
                    self.fixWidth();
                });
            }

        },
        fixWidth: function(){
            const self = this;

            let setStyles = function(){
                self.lib.setStyles(self.elementNode, {
                    'width': self.windowNode.offsetWidth,
                    'margin-left': self.sideMargin(),
                    'margin-right': self.sideMargin(),
                });
            };

            let initTimer = setInterval(function (){
                if(self.elementNode.offsetWidth !== self.windowNode.offsetWidth){
                    setStyles();
                }else{
                    clearInterval(initTimer);
                }
            }, 300);

            window.addEventListener("resize", setStyles);
            window.addEventListener("orientationchange", setStyles);
        },
        sideMargin: function(){
            return (this.elementNode.parentNode.clientWidth - this.windowNode.offsetWidth) / 2;
        }
    });

    return b;
});
