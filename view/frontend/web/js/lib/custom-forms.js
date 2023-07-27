/*
 * JavaScript Custom Forms Module
 *
 * Copyright © Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'assetsBase'
], function($, b){
    'use strict';

    const jcf = {
        // global options
        modules: {},
        plugins: {},
        baseOptions: {
            unselectableClass:'jcf-unselectable',
            labelActiveClass:'jcf-label-active',
            labelDisabledClass:'jcf-label-disabled',
            classPrefix: 'jcf-class-',
            hiddenClass:'jcf-hidden',
            focusClass:'jcf-focus',
            wrapperTag: 'div',
            errorValidationSelector: '.mage-error',
            observable: false,
            fakeElementInsertBefore: true,
            configElementObserver: {
                attributes: true,
                childList: true,
                characterData:true,
                attributeOldValue: true,
                subtree: true,
                attributeFilter: ['style', 'value', 'checked']
            }
        },
        update: true,
        // replacer function
        customForms: {
            setOptions: function(obj) {
                for(let p in obj) {
                    if(obj.hasOwnProperty(p) && typeof obj[p] === 'object') {
                        jcf.lib.extend(jcf.modules[p].prototype.defaultOptions, obj[p]);
                    }
                }
            },
            replaceAll: function(context) {
                this.refreshDomObserver();
                for(let k in jcf.modules) {
                    if(jcf.modules[k].prototype.enabled && jcf.modules[k].prototype.selector !== ''){
                        const els = (context || document).querySelectorAll(jcf.modules[k].prototype.selector);
                        for(let i = 0; i<els.length; i++) {
                            // replace form element
                            if(els[i].jcf) {
                                els[i].jcf.destroy();
                            }
                            if(!els[i].classList.contains('default') && jcf.modules[k].prototype.checkElement(els[i])) {
                                new jcf.modules[k]({
                                    replaces:els[i]
                                });
                            }
                        }
                    }
                }
            },
            refreshAll: function(context) {
                for(var k in jcf.modules) {
                    var els = (context || document).querySelectorAll(jcf.modules[k].prototype.selector);
                    for(let i = 0; i<els.length; i++) {
                        if(els[i].jcf) {
                            // refresh form element state
                            els[i].jcf.refreshState();
                        }
                    }
                }
            },
            refreshElement: function(obj) {
                if(obj && obj.jcf) {
                    obj.jcf.refreshState();
                }
            },
            refreshDomObserver: function(){
                var replaces, domObserver;
                replaces = function(el, selector, k){
                    if(el.matches && el.matches(selector) && !el.jcf && jcf.modules[k].prototype.checkElement(el) && !el.classList.contains('default')) {
                        new jcf.modules[k]({
                            replaces:el
                        });
                    }
                };
                domObserver = new MutationObserver(function(mutations){
                    mutations.forEach(function(mutation) {
                        if(mutation.target.nodeType == Node.ELEMENT_NODE){
                            if(mutation.addedNodes.length && mutation.addedNodes[0].nodeType == Node.ELEMENT_NODE){
                                [].slice.call(mutation.addedNodes).forEach(function(node){
                                    for(var k in jcf.modules){
                                        if(jcf.modules[k].prototype.enabled && jcf.modules[k].prototype.selector !== ''){
                                            var selector = jcf.modules[k].prototype.selector;
                                            if(node.matches && node.matches(selector) && !node.jcf && jcf.modules[k].prototype.checkElement(node) && !node.classList.contains('default')) {
                                                replaces(node, selector, k);
                                            }else if(node.matches && node.querySelector(selector)){
                                                [].slice.call(node.querySelectorAll(selector)).forEach(function(el){
                                                    replaces(el, selector, k);
                                                });
                                            }
                                        }
                                    }
                                });
                            }else if(mutation.removedNodes.length && mutation.removedNodes[0].nodeType == Node.ELEMENT_NODE){
                                [].slice.call(mutation.removedNodes).forEach(function(node){
                                    for(let k in jcf.modules){
                                        if(jcf.modules[k].prototype.enabled && jcf.modules[k].prototype.selector !== ''){
                                            var selector = jcf.modules[k].prototype.selector;
                                            if(node.matches && node.matches(selector) && node.jcf && node.jcf.fakeElement && node.jcf.fakeElement.parentNode && node.parentNode != node.jcf.fakeElement){
                                                node.jcf.fakeElement.parentNode.removeChild(node.jcf.fakeElement);
                                                node.jcf = null;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
                domObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            },
            destroyAll: function() {
                for(var k in jcf.modules) {
                    var els = document.querySelectorAll(jcf.modules[k].prototype.selector);
                    for(var i = 0; i<els.length; i++) {
                        if(els[i].jcf) {
                            els[i].jcf.destroy();
                        }
                    }
                }
            }
        },
        // detect device type
        isTouchDevice: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        isWinPhoneDevice: navigator.msPointerEnabled && /MSIE 10.*Touch/.test(navigator.userAgent),
        // define base module
        setBaseModule: function(obj) {
            jcf.customControl = function(opt){
                this.options = jcf.lib.extend({}, jcf.baseOptions, this.defaultOptions, opt);
                this.init();
            };
            for(let p in obj) {
                jcf.customControl.prototype[p] = obj[p];
            }
        },
        // add module to jcf.modules
        addModule: function(obj) {
            if(obj.name){
                // create new module proto class
                jcf.modules[obj.name] = function(){
                    jcf.modules[obj.name].superclass.constructor.apply(this, arguments);
                }
                jcf.lib.inherit(jcf.modules[obj.name], jcf.customControl);
                for(let p in obj) {
                    jcf.modules[obj.name].prototype[p] = obj[p]
                }
                // on create module
                jcf.modules[obj.name].prototype.onCreateModule();
                // make callback for exciting modules
                for(let mod in jcf.modules) {
                    if(jcf.modules[mod] != jcf.modules[obj.name]) {
                        jcf.modules[mod].prototype.onModuleAdded(jcf.modules[obj.name]);
                    }
                }
            }
        },
        // add plugin to jcf.plugins
        addPlugin: function(obj) {
            if(obj && obj.name) {
                jcf.plugins[obj.name] = function() {
                    this.init.apply(this, arguments);
                }
                for(let p in obj) {
                    jcf.plugins[obj.name].prototype[p] = obj[p];
                }
            }
        },
        // miscellaneous init
        init: function(){
            if(navigator.msPointerEnabled && navigator.msDoNotTrack) {
                this.eventPress = 'MSPointerDown';
                this.eventMove = 'MSPointerMove';
                this.eventRelease = 'MSPointerUp';
            } else {
                this.eventPress = this.isTouchDevice ? 'touchstart' : 'mousedown';
                this.eventMove = this.isTouchDevice ? 'touchmove' : 'mousemove';
                this.eventRelease = this.isTouchDevice ? 'touchend' : 'mouseup';
            }
            setTimeout(function(){
                jcf.lib.domReady(function(){
                    jcf.initStyles();
                });
            },1);
            return this;
        },
        initStyles: function() {
            // create <style> element and rules
            let head = document.getElementsByTagName('head')[0],
                style = document.createElement('style'),
                rules = document.createTextNode('.'+jcf.baseOptions.unselectableClass+'{'+
                    '-moz-user-select:none;'+
                    '-webkit-tap-highlight-color:rgba(255,255,255,0);'+
                    '-webkit-user-select:none;'+
                    'user-select:none;'+
                '}');

            // append style element
            style.type = 'text/css';
            if(style.styleSheet) {
                style.styleSheet.cssText = rules.nodeValue;
            } else {
                style.appendChild(rules);
            }
            head.appendChild(style);
        }
    }.init();

    /*
     * Custom Form Control prototype
     */
    jcf.setBaseModule({
        init: function(){
            if(this.options.replaces) {
                this.realElement = this.options.replaces;
                this.realElement.jcf = this;
                this.removeWrongSiblingElement();
                this.replaceObject();
                this.elementObserver();
            }
        },
        defaultOptions: {
            // default module options (will be merged with base options)
        },
        removeWrongSiblingElement: function(){
            let siblingNode;
            if(this.options.fakeElementInsertBefore){
                siblingNode = this.realElement.previousSibling;
            }else{
                siblingNode = this.realElement.nextSibling;
            }
            if(siblingNode && siblingNode.nodeType == Node.ELEMENT_NODE && siblingNode.classList.contains(this.options.wrapperClass)){
                siblingNode.parentNode.removeChild(siblingNode);
            }
        },
        elementObserver: function(){
            if(!this.options.observable)
                return this;
            let self = this,
                eventsTimer,
                thatObserver;
            thatObserver = new MutationObserver(function(mutations){
                mutations.forEach(function(mutation) {
                    if(mutation.type === 'attributes')
                        self.replaceElement();
                    clearTimeout(eventsTimer);
                    eventsTimer = setTimeout(function (){
                        self.replaceElement();
                    }, 20);
                });
            });
            thatObserver.observe(this.realElement, this.options.configElementObserver);
        },
        checkElement: function(el){
            return true; // additional check for correct form element
        },
        replaceElement: function(el) {
            el = el || this.realElement;
            if(el.jcf) el.jcf.destroy();
            this.options.replaces = el;
            el.jcf = this;
            if(this.checkElement(el) && !el.classList.contains('default'))
                this.replaceObject();
        },
        replaceObject: function(){
            this.createWrapper();
            this.attachEvents();
            this.fixStyles();
            this.setupWrapper();
        },
        createWrapper: function(){
            const _this = this;
            this.fakeElement = jcf.lib.createElement(this.options.wrapperTag);
            this.labelFor = jcf.lib.getLabelFor(this.realElement);
            jcf.lib.disableTextSelection(this.fakeElement);

            jcf.lib.getAllClasses(this.realElement.className, this.options.classPrefix).split(' ').forEach(function(cname){
                if(_this.fakeElement && cname.trim() != ''){
                    _this.fakeElement.classList.add(cname.trim());
                }
            });
            this.realElement.classList.add(jcf.baseOptions.hiddenClass);
        },
        attachEvents: function(){
            jcf.lib.event.add(this.realElement, 'focus', this.onFocusHandler, this);
            jcf.lib.event.add(this.realElement, 'blur', this.onBlurHandler, this);
            jcf.lib.event.add(this.fakeElement, 'click', this.onFakeClick, this);
            jcf.lib.event.add(this.fakeElement, 'touchend', this.onFakeClick, this);
            jcf.lib.event.add(this.fakeElement, jcf.eventPress, this.onFakePressed, this);
            jcf.lib.event.add(this.fakeElement, jcf.eventRelease, this.onFakeReleased, this);

            if(this.labelFor) {
                this.labelFor.jcf = this;
                jcf.lib.event.add(this.labelFor, 'click', this.onFakeClick, this);
                jcf.lib.event.add(this.labelFor, 'touchend', this.onFakeClick, this);
                jcf.lib.event.add(this.labelFor, jcf.eventPress, this.onFakePressed, this);
                jcf.lib.event.add(this.labelFor, jcf.eventRelease, this.onFakeReleased, this);
            }
        },
        fixStyles: function() {
            // hide mobile webkit tap effect
            if(jcf.isTouchDevice) {
                const tapStyle = 'rgba(255,255,255,0)';
                this.realElement.style.webkitTapHighlightColor = tapStyle;
                this.fakeElement.style.webkitTapHighlightColor = tapStyle;
                if(this.labelFor) {
                    this.labelFor.style.webkitTapHighlightColor = tapStyle;
                }
            }
        },
        setupWrapper: function(){
            // implement in subclass
        },
        refreshState: function(){
            // implement in subclass
        },
        destroy: function(){
            if(this.fakeElement && this.fakeElement.parentNode){
                if(this.realElement.localName === 'select' && this.realElement.parentNode.localName === 'span'){   //for mobile
                    this.fakeElement.parentNode.appendChild(this.realElement);
                }else{
                    this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
                }
                this.fakeElement.parentNode.removeChild(this.fakeElement);
            }
            this.realElement.classList.remove(jcf.baseOptions.hiddenClass);
            this.realElement.jcf = null;
        },
        onFocus: function(){
            // emulated focus event
            this.fakeElement.classList.add(this.options.focusClass);
        },
        onBlur: function(cb){
            // emulated blur event
            this.fakeElement.classList.remove(this.options.focusClass);
        },
        onFocusHandler: function() {
            // handle focus loses
            if(this.focused) return;
            this.focused = true;

            // handle touch devices also
            if(jcf.isTouchDevice) {
                if(jcf.focusedInstance && jcf.focusedInstance.realElement != this.realElement) {
                    jcf.focusedInstance.onBlur();
                    jcf.focusedInstance.realElement.blur();
                }
                jcf.focusedInstance = this;
            }
            this.onFocus.apply(this, arguments);
        },
        onBlurHandler: function() {
            // handle focus loses
            if(!this.pressedFlag) {
                this.focused = false;
                this.onBlur.apply(this, arguments);
            }
        },
        onFakeClick: function(){
            if(jcf.isTouchDevice) {
                this.onFocus();
            } else if(!this.realElement.disabled) {
                this.realElement.focus();
            }
        },
        onFakePressed: function(e){
            this.pressedFlag = true;
        },
        onFakeReleased: function(){
            this.pressedFlag = false;
        },
        onCreateModule: function(){
            // implement in subclass
        },
        onModuleAdded: function(module) {
            // implement in subclass
        },
        onControlReady: function() {
            // implement in subclass
        }
    });

    /*
     * JCF Utility Library
     */
    jcf.lib = Object.assign({}, b.lib, {
        getLabelFor: function(object) {
            const parentLabel = jcf.lib.getParent(object,'label');
            if(parentLabel) {
                return parentLabel;
            } else if(object.id) {
                const getLabelForParent = function(obj, id){
                    while(obj.parentNode && obj.parentNode != document.body){
                        if(obj.parentNode.matches && obj.parentNode.querySelector('label[for="' + id + '"]')){
                            return obj.parentNode.querySelector('label[for="' + id + '"]');
                        }
                        obj = obj.parentNode;
                    }
                    return false;
                }
                return getLabelForParent(object, object.id) || document.querySelector('label[for="' + object.id + '"]');
            }
        },
        disableTextSelection: function(el){
            if (typeof el.onselectstart !== 'undefined') {
                el.onselectstart = function() {return false;};
            } else if(window.opera) {
                el.setAttribute('unselectable', 'on');
            } else {
                el.classList.add(jcf.baseOptions.unselectableClass);
            }
        },
        enableTextSelection: function(el) {
            if (typeof el.onselectstart !== 'undefined') {
                el.onselectstart = null;
            } else if(window.opera) {
                el.removeAttribute('unselectable');
            } else {
                el.classList.remove(jcf.baseOptions.unselectableClass);
            }
        },
        getAllClasses: function(cname, prefix, skip) {
            if(!skip) skip = '';
            if(!prefix) prefix = '';
            cname = cname ? cname.replace(new RegExp('(\\s|^)'+skip+'(\\s|$)'),' ').replace(/[\s]*([\S]+)+[\s]*/gi,prefix+"$1 ") : '';
            return cname; //cname.trim().split(' ').map(function(c){ return '"' + c + '"' }).toString()
        }
    });

    // custom select module
    jcf.addModule({
        name:'select',
        selector:'', //'select',
        enabled: true,
        defaultOptions: {
            observable: true,
            useNativeDropOnMobileDevices: true,
            hideDropOnScroll: true,
            showNativeDrop: false,
            handleDropPosition: false,
            selectDropPosition: 'bottom', // or 'top'
            wrapperClass:'select-area',
            focusClass:'select-focus',
            dropActiveClass:'select-active',
            selectedClass:'item-selected',
            currentSelectedClass:'current-selected',
            disabledClass:'select-disabled',
            hasValueClass:'has-value',
            changeValueClass:'change-value',
            valueSelector:'span.center',
            labelClass:'.select-label',
            islabelClass:'is-label',
            optGroupClass:'optgroup',
            openerSelector:'a.select-opener',
            selectStructure:'<span class="select-label"></span><span class="center"></span><a class="select-opener"></a>',
            wrapperTag: 'span',
            classPrefix:'select-',
            dropMaxHeight: 305,
            dropFlippedClass: 'select-options-flipped',
            dropHiddenClass:'options-hidden',
            dropScrollableClass:'options-overflow',
            dropClass:'select-options',
            dropClassPrefix:'drop-',
            dropStructure:'<div class="drop-holder"><div class="select-list"></div></div>',
            dropSelector:'div.select-list',
            imageOptionAttr: 'data-imagesrc'
        },
        checkElement: function(el){
            el = el || this.realElement;

            let prev = jcf.lib.prevSibling(el),
                jcfParent = el.parentNode;

            if(el.classList.contains('default-initial')){
                el.classList.add('default');
                if(prev && prev.classList.contains('select-area')) prev.classList.add('hidden');
            }

            if(el.style.display === 'none'){
                el.classList.add('default');
                if(prev && prev.classList.contains('select-area')) prev.classList.add('hidden');
                if(jcfParent && jcfParent.classList.contains('select-area')) jcfParent.classList.add('hidden');
            }else if(!el.classList.contains('default-initial')){
                el.classList.remove('default');
                if(prev && prev.classList.contains('select-area')) prev.classList.remove('hidden');
                if(jcfParent && jcfParent.classList.contains('select-area')) jcfParent.classList.remove('hidden');
            }

            return (!el.size && !el.multiple);
        },
        errorObserver: function(){
            if(!this.options.observable)
                return this;
            let self = this,
                thatObserver;
            thatObserver = new MutationObserver(function(mutations){
                mutations.forEach(function(mutation) {
                    if(mutation.addedNodes.length && mutation.addedNodes[0].nodeType == Node.ELEMENT_NODE){
                        [].slice.call(mutation.addedNodes).forEach(function(node){
                            if(node.matches && node.matches(self.options.errorValidationSelector)){
                                jcf.lib.insertAfter(node, mutation.target);
                            }
                        });
                    }
                });
            });
            thatObserver.observe(this.fakeElement, this.options.configElementObserver);
        },
        setupWrapper: function(){
            let dataLabelElement, labelElement;
            this.fakeElement.classList.add(this.options.wrapperClass);
            if(this.realElement.parentNode){
                if(this.options.fakeElementInsertBefore)
                    this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
                else
                    this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement.nextSibling);
            }
            this.realElement.setAttribute('data-default-value', this.realElement.value);
            this.fakeElement.innerHTML = this.options.selectStructure;

            dataLabelElement = this.realElement.getAttribute('data-label');
            if(dataLabelElement){
                labelElement = this.fakeElement.querySelector(this.options.labelClass);
                $(labelElement).html(dataLabelElement);
                this.fakeElement.classList.add(this.options.islabelClass);
            }

            // show native drop if specified in options
            if(this.options.useNativeDropOnMobileDevices && (jcf.isTouchDevice || jcf.isWinPhoneDevice)) {
                this.options.showNativeDrop = true;
            }
            if(this.options.showNativeDrop) {
                this.fakeElement.appendChild(this.realElement);
                this.realElement.classList.remove(this.options.hiddenClass);
                jcf.lib.setStyles(this.realElement, {
                    top:0,
                    left:0,
                    margin:0,
                    padding:0,
                    opacity:0,
                    border:'none',
                    position:'absolute',
                    width: '100%',
                    height: '100%'
                });
                jcf.lib.event.add(this.realElement, jcf.eventPress, function(){
                    this.realElement.title = '';
                }, this)
                this.errorObserver();
            }

            // create select body
            this.opener = this.fakeElement.querySelector(this.options.openerSelector);
            this.valueText = this.fakeElement.querySelector(this.options.valueSelector);
            jcf.lib.disableTextSelection(this.valueText);
            this.opener.jcf = this;

            if(!this.options.showNativeDrop) {
                this.createDropdown();
                this.refreshState();
                this.onControlReady(this);
                this.hideDropdown(true);
            } else {
                this.refreshState();
            }
            this.addEvents();
        },
        addEvents: function(){
            if(this.options.showNativeDrop) {
                jcf.lib.event.add(this.realElement, 'click', this.onChange, this);
            } else {
                jcf.lib.event.add(this.fakeElement, 'click', this.toggleDropdown, this);
                jcf.lib.event.add(window, 'keyup', function(e){
                    if(e.keyCode === 27) this.hideDropdown();
                }, this);
            }
            jcf.lib.event.add(this.realElement, 'change', this.onChange, this);
        },
        onFakeClick: function() {
            // do nothing (drop toggles by toggleDropdown method)
        },
        onFocus: function(){
            jcf.modules[this.name].superclass.onFocus.apply(this, arguments);
            if(!this.options.showNativeDrop) {
                // Mac Safari Fix
                if(jcf.lib.browser.safariMac) {
                    this.realElement.setAttribute('size','2');
                }
                //jcf.lib.event.add(this.realElement, 'keydown', this.onKeyDown, this);
                if(jcf.activeControl && jcf.activeControl != this) {
                    jcf.activeControl.hideDropdown();
                    jcf.activeControl = this;
                }
            }
        },
        onBlur: function(){
            if(!this.options.showNativeDrop) {
                // Mac Safari Fix
                if(jcf.lib.browser.safariMac) {
                    this.realElement.removeAttribute('size');
                }
                if(!this.isActiveDrop() || !this.isOverDrop()) {
                    jcf.modules[this.name].superclass.onBlur.apply(this);
                    if(jcf.activeControl === this) jcf.activeControl = null;
                    if(!jcf.isTouchDevice) {
                        this.hideDropdown();
                    }
                }
                //jcf.lib.event.remove(this.realElement, 'keydown', this.onKeyDown);
            } else {
                jcf.modules[this.name].superclass.onBlur.apply(this);
            }
        },
        onChange: function() {
            this.refreshState();
        },
        onKeyDown: function(e){
            if(e.keyCode === 38 || e.keyCode === 40){
                this.dropOpened = true;
                jcf.tmpFlag = true;
                setTimeout(function(){jcf.tmpFlag = false},100);
                var context = this;
                context.keyboardFix = true;
                setTimeout(function(){
                    context.refreshState();
                },10);
            }
            if(e.keyCode === 13) {
                //context.toggleDropdown.apply(context);
                //return false;
                alert('custom form');
                jcf.lib.event.remove(this.realElement, 'keydown', this.onKeyDown);
            }
        },
        onResizeWindow: function(e){
            if(this.isActiveDrop()) {
                this.hideDropdown();
            }
        },
        onScrollWindow: function(e){
            if(this.options.hideDropOnScroll) {
                this.hideDropdown();
            } else if(this.isActiveDrop()) {
                this.positionDropdown();
            }
        },
        onOptionClick: function(e){
            const opener = e.target && e.target.tagName && e.target.tagName.toLowerCase() == 'li' ? e.target : jcf.lib.getParent(e.target, 'li');
            if(opener) {
                this.dropOpened = true;
                this.realElement.selectedIndex = parseInt(opener.getAttribute('rel'));
                if(jcf.isTouchDevice) {
                    this.onFocus();
                } else {
                    this.realElement.focus();
                }
                this.refreshState();
                this.hideDropdown();
                jcf.lib.fireEvent(this.realElement, 'change');
            }
            return false;
        },
        onClickOutside: function(e){
            if(jcf.tmpFlag) {
                jcf.tmpFlag = false;
                return;
            }
            if(!jcf.lib.isParent(this.fakeElement, e.target) && !jcf.lib.isParent(this.selectDrop, e.target)) {
                this.hideDropdown();
            }
        },
        onDropHover: function(e){
            if(!this.keyboardFix) {
                this.hoverFlag = true;
                const opener = e.target && e.target.tagName && e.target.tagName.toLowerCase() == 'li' ? e.target : jcf.lib.getParent(e.target, 'li');
                if(opener) {
                    this.realElement.selectedIndex = parseInt(opener.getAttribute('rel'));
                    this.refreshSelectedClass(parseInt(opener.getAttribute('rel')));
                }
            } else {
                this.keyboardFix = false;
            }
        },
        onDropLeave: function(){
            this.hoverFlag = false;
        },
        isActiveDrop: function(){
            return !this.selectDrop.classList.contains(this.options.dropHiddenClass);
        },
        isOverDrop: function(){
            return this.hoverFlag;
        },
        createDropdown: function(){
            // remove old dropdown if exists
            if(this.selectDrop && this.selectDrop.parentNode) {
                this.selectDrop.parentNode.removeChild(this.selectDrop);
            }
            // create dropdown holder
            this.selectDrop = document.createElement('div');
            this.selectDrop.className = this.options.dropClass;
            this.selectDrop.innerHTML = this.options.dropStructure;
            jcf.lib.setStyles(this.selectDrop, {position:'absolute'});
            this.selectList = this.selectDrop.querySelector(this.options.dropSelector);
            this.selectDrop.classList.add(this.options.dropHiddenClass);
            document.body.appendChild(this.selectDrop);
            this.selectDrop.jcf = this;
            jcf.lib.event.add(this.selectDrop, 'click', this.onOptionClick, this);
            jcf.lib.event.add(this.selectDrop, 'mouseover', this.onDropHover, this);
            jcf.lib.event.add(this.selectDrop, 'mouseout', this.onDropLeave, this);
            this.buildDropdown();
        },
        buildDropdown: function() {
            // build select options / optgroups
            this.buildDropdownOptions();

            // position and resize dropdown
            this.positionDropdown();

            // cut dropdown if height exceedes
            this.buildDropdownScroll();
        },
        buildDropdownOptions: function() {
            this.resStructure = '';
            this.optNum = 0;
            for(let i = 0; i < this.realElement.children.length; i++) {
                this.resStructure += this.buildElement(this.realElement.children[i], i) +'\n';
            }
            this.selectList.innerHTML = this.resStructure;
        },
        buildDropdownScroll: function() {
            const _this = this;
            if(this.options.dropMaxHeight) {
                if(this.selectDrop.offsetHeight > this.options.dropMaxHeight && this.realElement.id != 'clinic-name') {
                    this.selectList.style.height = this.options.dropMaxHeight+'px';
                    this.selectList.style.overflow = 'auto';
                    this.selectList.style.overflowX = 'hidden';
                    this.selectDrop.classList.add(this.options.dropScrollableClass);
                }
            }
            jcf.lib.getAllClasses(this.realElement.className, this.options.dropClassPrefix, jcf.baseOptions.hiddenClass).split(' ').forEach(function(cname){
                if(_this.selectDrop && cname.trim() !== ''){
                    _this.selectDrop.classList.add(cname.trim());
                }
            });
        },
        parseOptionTitle: function(optTitle) {
            return (typeof optTitle === 'string' && /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i.test(optTitle)) ? optTitle : '';
        },
        buildElement: function(obj, index){
            // build option
            let res = '', optImage;
            if(obj.tagName.toLowerCase() === 'option') {
                if(!jcf.lib.prevSibling(obj) || jcf.lib.prevSibling(obj).tagName.toLowerCase() !== 'option') {
                    res += '<ul>';
                }
                optImage = this.parseOptionTitle(obj.getAttribute(this.options.imageOptionAttr) || obj.title);
                res += '<li rel="'+(this.optNum++)+'" class="'+(obj.className? obj.className + ' ' : '')+(index % 2 ? 'option-even ' : '')+'jcfcalc"><a href="#">'+(optImage ? '<span class="img"><img src="'+optImage+'" alt="" /></span>' : '')+'<span>' + obj.innerHTML + '</span></a></li>';
                if(!jcf.lib.nextSibling(obj) || jcf.lib.nextSibling(obj).tagName.toLowerCase() !== 'option') {
                    res += '</ul>';
                }
                return res;
            }
            // build option group with options
            else if(obj.tagName.toLowerCase() === 'optgroup' && obj.label) {
                res += '<div class="'+this.options.optGroupClass+'">';
                res += '<strong class="jcfcalc"><em>'+(obj.label)+'</em></strong>';
                for(let i = 0; i < obj.children.length; i++) {
                    res += this.buildElement(obj.children[i], i);
                }
                res += '</div>';
                return res;
            }
        },
        positionDropdown: function(){
            var ofs = $(this.fakeElement).offset(), selectAreaHeight = this.fakeElement.offsetHeight, selectDropHeight = this.selectDrop.offsetHeight;
            var fitInTop = ofs.top - selectDropHeight >= jcf.lib.getScrollTop() && jcf.lib.getScrollTop() + jcf.lib.getWindowHeight() < ofs.top + selectAreaHeight + selectDropHeight;
            if((this.options.handleDropPosition && fitInTop) || this.options.selectDropPosition === 'top') {
                this.selectDrop.style.top = (ofs.top - selectDropHeight)+'px';
                this.selectDrop.classList.add(this.options.dropFlippedClass);
            } else {
                this.selectDrop.style.top = (ofs.top + selectAreaHeight)+'px';
                this.selectDrop.classList.remove(this.options.dropFlippedClass);
            }
            this.selectDrop.style.left = ofs.left+'px';
            this.selectDrop.style.width = (parseInt(window.getComputedStyle(this.fakeElement).width) || this.fakeElement.offsetWidth) + 'px';
        },
        showDropdown: function(){
            document.body.appendChild(this.selectDrop);
            this.selectDrop.classList.remove(this.options.dropHiddenClass);
            this.fakeElement.classList.add(this.options.dropActiveClass);
            this.positionDropdown();

            // highlight current active item
            var activeItem = this.getFakeActiveOption();
            this.removeClassFromItems(this.options.currentSelectedClass);
            activeItem.classList.add(this.options.currentSelectedClass);

            // show current dropdown
            jcf.lib.event.add(window, 'resize', this.onResizeWindow, this);
            jcf.lib.event.add(window, 'scroll', this.onScrollWindow, this);
            jcf.lib.event.add(document, jcf.eventPress, this.onClickOutside, this);
            this.positionDropdown();
        },
        hideDropdown: function(partial){
            if(this.selectDrop.parentNode) {
                if(this.selectDrop.offsetWidth) {
                    this.selectDrop.parentNode.removeChild(this.selectDrop);
                }
                if(partial) {
                    return;
                }
            }
            if(typeof this.origSelectedIndex === 'number') {
                this.realElement.selectedIndex = this.origSelectedIndex;
            }
            this.fakeElement.classList.remove(this.options.dropActiveClass);
            this.selectDrop.classList.add(this.options.dropHiddenClass);
            jcf.lib.event.remove(window, 'resize', this.onResizeWindow);
            jcf.lib.event.remove(window, 'scroll', this.onScrollWindow);
            jcf.lib.event.remove(document.documentElement, jcf.eventPress, this.onClickOutside);
            if(jcf.isTouchDevice) {
                this.onBlur();
            }
        },
        toggleDropdown: function(){
            if(!this.realElement.disabled) {
                if(jcf.isTouchDevice) {
                    this.onFocus();
                } else {
                    this.realElement.focus();
                }
                if(this.isActiveDrop()) {
                    this.hideDropdown();
                } else {
                    this.showDropdown();
                }
                this.refreshState();
            }
        },
        scrollToItem: function(){
            if(this.isActiveDrop()) {
                var dropHeight = this.selectList.offsetHeight;
                var offsetTop = this.calcOptionOffset(this.getFakeActiveOption());
                var sTop = this.selectList.scrollTop;
                var oHeight = this.getFakeActiveOption().offsetHeight;
                //offsetTop+=sTop;

                if(offsetTop >= sTop + dropHeight) {
                    this.selectList.scrollTop = offsetTop - dropHeight + oHeight;
                } else if(offsetTop < sTop) {
                    this.selectList.scrollTop = offsetTop;
                }
            }
        },
        getFakeActiveOption: function(c) {
            return this.selectList.querySelector('li[rel="'+(typeof c === 'number' ? c : this.realElement.selectedIndex) +'"]');
        },
        calcOptionOffset: function(fake) {
            var h = 0;
            var els = this.selectList.querySelectorAll('.jcfcalc');
            for(let i = 0; i < els.length; i++) {
                if(els[i] == fake) break;
                h+=els[i].offsetHeight;
            }
            return h;
        },
        childrenHasItem: function(hold,item) {
            var items = hold.getElementsByTagName('*');
            for(i = 0; i < items.length; i++) {
                if(items[i] == item) return true;
            }
            return false;
        },
        removeClassFromItems: function(className){
            var children = this.selectList.querySelectorAll('li');
            for(let i = children.length - 1; i >= 0; i--) {
                children[i].classList.remove(className);
            }
        },
        setSelectedClass: function(c){
            this.getFakeActiveOption(c).classList.add(this.options.selectedClass);
        },
        refreshSelectedClass: function(c){
            if(!this.options.showNativeDrop && c) {
                this.removeClassFromItems(this.options.selectedClass);
                this.setSelectedClass(c);
            }
            if(this.realElement.disabled) {
                this.fakeElement.classList.add(this.options.disabledClass);
                if(this.labelFor) {
                    this.labelFor.classList.add(this.options.labelDisabledClass);
                }
            } else {
                this.fakeElement.classList.remove(this.options.disabledClass);
                if(this.labelFor) {
                    this.labelFor.classList.remove(this.options.labelDisabledClass);
                }
            }
        },
        refreshSelectedText: function() {
            var dataTitle = this.realElement.getAttribute('data-title');
            if(!dataTitle) {
                dataTitle = '';
            } else {
                dataTitle =  '<span class="data-title">' + dataTitle + '</span> ';
            }
            this.valueText.innerHTML = dataTitle;

            if(this.realElement.options[this.realElement.selectedIndex]) {
                var optImage = this.parseOptionTitle(this.realElement.options[this.realElement.selectedIndex].getAttribute(this.options.imageOptionAttr) || this.realElement.options[this.realElement.selectedIndex].title );
                if(optImage) {
                    this.valueText.innerHTML += (optImage ? '<img src="'+optImage+'" alt="" />' : '') + this.realElement.options[this.realElement.selectedIndex].innerHTML + '&nbsp;';
                } else {
                    this.valueText.innerHTML += this.realElement.options[this.realElement.selectedIndex].innerHTML + '&nbsp;';
                }
            }else if(!this.dropOpened && this.realElement.title){
                this.valueText.innerHTML += this.realElement.title;
            }
            if(this.realElement.value && this.realElement.value != 0){
                this.fakeElement.classList.add(this.options.hasValueClass);
            }else{
                this.fakeElement.classList.remove(this.options.hasValueClass);
            }
            if(this.realElement.getAttribute('data-default-value') != this.realElement.value){
                this.fakeElement.classList.add(this.options.changeValueClass);
            }else{
                this.fakeElement.classList.remove(this.options.changeValueClass);
            }
        },
        refreshState: function(){
            this.origSelectedIndex = this.realElement.selectedIndex;
            this.refreshSelectedClass();
            this.refreshSelectedText();
            if(!this.options.showNativeDrop) {
                this.positionDropdown();
                if(this.selectDrop.offsetWidth) {
                    this.scrollToItem();
                }
            }
        }
    });

    // custom checkbox module
    jcf.addModule({
        name:'checkbox',
        selector: '', //'input[type="checkbox"]',
        enabled: true,
        defaultOptions: {
            observable: true,
            wrapperClass:'chk-area',
            focusClass:'chk-focus',
            checkedClass:'chk-checked',
            labelActiveClass:'chk-label-active',
            uncheckedClass:'chk-unchecked',
            disabledClass:'chk-disabled',
            chkStructure:'<span></span>'
        },
        setupWrapper: function(){
            this.fakeElement.classList.add(this.options.wrapperClass);
            this.fakeElement.innerHTML = this.options.chkStructure;
            if(this.realElement.parentNode){
                if(this.options.fakeElementInsertBefore)
                    this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
                else
                    this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement.nextSibling);
            }
            jcf.lib.event.add(this.realElement, 'click', this.onRealClick, this);
            jcf.lib.event.add(this.realElement, 'change', this.onRealClick, this);
            this.refreshState();
        },
        isLinkTarget: function(target, limitParent) {
            while(target.parentNode || target === limitParent) {
                if(target.tagName.toLowerCase() === 'a') {
                    return true;
                }
                target = target.parentNode;
            }
        },
        onFakePressed: function() {
            jcf.modules[this.name].superclass.onFakePressed.apply(this, arguments);
            if(!this.realElement.disabled) {
                this.realElement.focus();
            }
        },
        onFakeClick: function(e) {
            jcf.modules[this.name].superclass.onFakeClick.apply(this, arguments);
            this.tmpTimer = setTimeout(jcf.lib.bind(function(){
                this.toggle();
            },this),10);
            if(!this.isLinkTarget(e.target, this.labelFor)) {
                return false;
            }
        },
        onRealClick: function(e) {
            setTimeout(jcf.lib.bind(function(){
                this.refreshState();
            },this),10);
            e.stopPropagation();
        },
        toggle: function(e){
            let clickOnAgreementLink = window.clickOnAgreementLink
            if(typeof clickOnAgreementLink === 'undefined' || !clickOnAgreementLink) {
                if(!this.realElement.disabled) {
                    if(this.realElement.checked) {
                        //this.realElement.checked = false;
                        this.realElement.click();
                    } else {
                        //this.realElement.checked = true;
                        this.realElement.click();
                    }
                }
                this.refreshState();
                jcf.lib.fireEvent(this.realElement, 'change');
                //Event.fire(this.realElement, 'customcheckbox:clickafter', { customCheckboxObject : this });
                return false;
            }
            window.clickOnAgreementLink = false;
        },
        refreshState: function(){
            if(this.realElement.checked) {
                this.fakeElement.classList.add(this.options.checkedClass);
                this.fakeElement.classList.remove(this.options.uncheckedClass);
                if(this.labelFor) {
                    this.labelFor.classList.add(this.options.labelActiveClass);
                }
            } else {
                this.fakeElement.classList.remove(this.options.checkedClass);
                this.fakeElement.classList.add(this.options.uncheckedClass);
                if(this.labelFor) {
                    this.labelFor.classList.remove(this.options.labelActiveClass);
                }
            }
            if(this.realElement.disabled) {
                this.fakeElement.classList.add(this.options.disabledClass);
                if(this.labelFor) {
                    this.labelFor.classList.add(this.options.labelDisabledClass);
                }
            } else {
                this.fakeElement.classList.remove(this.options.disabledClass);
                if(this.labelFor) {
                    this.labelFor.classList.remove(this.options.labelDisabledClass);
                }
            }
        }
    });

    // custom radio module
    jcf.addModule({
        name:'radio',
        selector: '', // 'input[type="radio"]',
        enabled: true,
        defaultOptions: {
            observable: true,
            wrapperClass:'rad-area',
            focusClass:'rad-focus',
            checkedClass:'rad-checked',
            uncheckedClass:'rad-unchecked',
            disabledClass:'rad-disabled',
            radStructure:'<span></span>'
        },
        getRadioGroup: function(item){
            var name = item.getAttribute('name');
            if(name && jcf.lib.getParent(item, 'form')) {
                var items = jcf.lib.getParent(item, 'form').querySelectorAll('input[name="'+name+'"]');
                items = (items.lenght > 1)? items : jcf.lib.getParent(item, 'form').querySelectorAll(this.selector);
                return items;
            } else {
                return [item];
            }
        },
        setupWrapper: function(){
            this.fakeElement.classList.add(this.options.wrapperClass);
            this.fakeElement.innerHTML = this.options.radStructure;
            if(this.realElement.parentNode){
                if(this.options.fakeElementInsertBefore)
                    this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
                else
                    this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement.nextSibling);
            }
            this.refreshState();
            this.addEvents();
        },
        addEvents: function(){
            jcf.lib.event.add(this.realElement, 'change', this.refreshState, this);
            jcf.lib.event.add(this.fakeElement, 'click', this.toggleRadio, this);
            if(this.labelFor) {
                jcf.lib.event.add(this.labelFor, 'click', this.toggleRadio, this);
            }
        },
        onFocus: function(e) {
            jcf.modules[this.name].superclass.onFocus.apply(this, arguments);
            setTimeout(jcf.lib.bind(function(){
                this.refreshState();
            },this),10);
        },
        toggleRadio: function(){
            if(!this.realElement.disabled) {
                this.realElement.click();
                //jcf.lib.fireEvent(this.realElement, 'change');
            }
            this.refreshState();
        },
        refreshState: function(){
            const els = this.getRadioGroup(this.realElement);
            for(let i = 0; i < els.length; i++) {
                const curEl = els[i].jcf;
                if(curEl) {
                    if(curEl.realElement.checked) {
                        curEl.fakeElement.classList.add(curEl.options.checkedClass);
                        curEl.fakeElement.classList.remove(curEl.options.uncheckedClass);
                        if(curEl.labelFor) {
                            curEl.labelFor.classList.add(curEl.options.labelActiveClass);
                        }
                    } else {
                        curEl.fakeElement.classList.remove(curEl.options.checkedClass);
                        curEl.fakeElement.classList.add(curEl.options.uncheckedClass);
                        if(curEl.labelFor) {
                            curEl.labelFor.classList.remove(curEl.options.labelActiveClass);
                        }
                    }
                    if(curEl.realElement.disabled) {
                        curEl.fakeElement.classList.add(curEl.options.disabledClass);
                        if(curEl.labelFor) {
                            curEl.labelFor.classList.add(curEl.options.labelDisabledClass);
                        }
                    } else {
                        curEl.fakeElement.classList.remove(curEl.options.disabledClass);
                        if(curEl.labelFor) {
                            curEl.labelFor.classList.remove(curEl.options.labelDisabledClass);
                        }
                    }
                }
            }
        }
    });

    // custom scrollbars module
    jcf.addModule({
        name:'customscroll',
        selector:'div.scrollable-area',
        enabled: true,
        defaultOptions: {
            //observable: true,
            alwaysPreventWheel: false,
            enableMouseWheel: true,
            captureFocus: false,
            handleNested: true,
            alwaysKeepScrollbars: false,
            autoDetectWidth: false,
            scrollbarOptions: {},
            focusClass:'scrollable-focus',
            wrapperTag: 'div',
            autoDetectWidthClass: 'autodetect-width',
            noHorizontalBarClass:'noscroll-horizontal',
            noVerticalBarClass:'noscroll-vertical',
            innerWrapperClass:'scrollable-inner-wrapper',
            outerWrapperClass:'scrollable-area-wrapper',
            horizontalClass: 'hscrollable',
            verticalClass: 'vscrollable',
            bothClass: 'anyscrollable'
        },
        replaceObject: function(){
            this.initStructure();
            this.refreshState();
            this.addEvents();
        },
        initStructure: function(){
            // set scroll type
            this.realElement.jcf = this;
            if(this.realElement.classList.contains(this.options.bothClass) ||
            this.realElement.classList.contains(this.options.horizontalClass) && this.realElement.classList.contains(this.options.verticalClass)) {
                this.scrollType = 'both';
            } else if(this.realElement.classList.contains(this.options.horizontalClass)) {
                this.scrollType = 'horizontal';
            } else {
                this.scrollType = 'vertical';
            }

            // autodetect horizontal width
            if(this.realElement.classList.contains(this.options.autoDetectWidthClass)) {
                this.options.autoDetectWidth = true;
            }

            // init dimensions and build structure
            this.realElement.style.position = 'relative';
            this.realElement.style.overflow = 'hidden';

            // build content wrapper and scrollbar(s)
            this.buildWrapper();
            this.buildScrollbars();
        },
        buildWrapper: function() {
            this.outerWrapper = document.createElement(this.options.wrapperTag);
            this.outerWrapper.className = this.options.outerWrapperClass;
            this.realElement.parentNode.insertBefore(this.outerWrapper, this.realElement);
            this.outerWrapper.appendChild(this.realElement);

            // autosize content if single child
            if(this.options.autoDetectWidth && (this.scrollType === 'both' || this.scrollType === 'horizontal') && this.realElement.children.length === 1) {
                var tmpWidth = 0;
                this.realElement.style.width = '99999px';
                tmpWidth = this.realElement.children[0].offsetWidth;
                this.realElement.style.width = '';
                if(tmpWidth) {
                    this.realElement.children[0].style.width = tmpWidth+'px';
                }
            }
        },
        buildScrollbars: function() {
            if(this.scrollType === 'horizontal' || this.scrollType === 'both') {
                this.hScrollBar = new jcf.plugins.scrollbar(jcf.lib.extend(this.options.scrollbarOptions,{
                    vertical: false,
                    spawnClass: this,
                    holder: this.outerWrapper,
                    range: this.realElement.scrollWidth - this.realElement.offsetWidth,
                    size: this.realElement.offsetWidth,
                    onScroll: jcf.lib.bind(function(v) {
                        this.realElement.scrollLeft = v;
                    },this)
                }));
            }
            if(this.scrollType === 'vertical' || this.scrollType === 'both') {
                this.vScrollBar = new jcf.plugins.scrollbar(jcf.lib.extend(this.options.scrollbarOptions,{
                    vertical: true,
                    spawnClass: this,
                    holder: this.outerWrapper,
                    range: this.realElement.scrollHeight - this.realElement.offsetHeight,
                    size: this.realElement.offsetHeight,
                    onScroll: jcf.lib.bind(function(v) {
                        this.realElement.scrollTop = v;
                    },this)
                }));
            }
            this.outerWrapper.style.width = this.realElement.offsetWidth + 'px';
            this.outerWrapper.style.height = this.realElement.offsetHeight + 'px';
            this.resizeScrollContent();
        },
        resizeScrollContent: function() {
            var diffWidth = this.realElement.offsetWidth - jcf.lib.getInnerWidth(this.realElement);
            var diffHeight = this.realElement.offsetHeight - jcf.lib.getInnerHeight(this.realElement);
            this.realElement.style.width = Math.max(0, this.outerWrapper.offsetWidth - diffWidth - (this.vScrollBar ? this.vScrollBar.getScrollBarSize() : 0)) + 'px';
            this.realElement.style.height = Math.max(0, this.outerWrapper.offsetHeight - diffHeight - (this.hScrollBar ? this.hScrollBar.getScrollBarSize() : 0)) + 'px';
        },
        addEvents: function() {
            // enable mouse wheel handling
            if(!jcf.isTouchDevice && this.options.enableMouseWheel) {
                jcf.lib.event.add(this.outerWrapper, 'mousewheel', this.onMouseWheel, this);
            }
            // add touch scroll on block body
            if(jcf.isTouchDevice || navigator.msPointerEnabled) {
                this.outerWrapper.style.msTouchAction = 'none';
                jcf.lib.event.add(this.realElement, jcf.eventPress, this.onScrollablePress, this);
            }

            // handle nested scrollbars
            if(this.options.handleNested) {
                var el = this.realElement, name = this.name;
                while(el.parentNode) {
                    if(el.parentNode.jcf && el.parentNode.jcf.name == name) {
                        el.parentNode.jcf.refreshState();
                    }
                    el = el.parentNode;
                }
            }
        },
        onMouseWheel: function(e) {
            if(this.scrollType === 'vertical' || this.scrollType === 'both') {
                return this.vScrollBar.doScrollWheelStep(e.mWheelDelta) === false ? false : !this.options.alwaysPreventWheel;
            } else {
                return this.hScrollBar.doScrollWheelStep(e.mWheelDelta) === false ? false : !this.options.alwaysPreventWheel;
            }
        },
        onScrollablePress: function(e) {
            if(e.pointerType !== e.MSPOINTER_TYPE_TOUCH) return;

            this.preventFlag = true;
            this.origWindowScrollTop = jcf.lib.getScrollTop();
            this.origWindowScrollLeft = jcf.lib.getScrollLeft();

            this.scrollableOffset = jcf.lib.getOffset(this.realElement);
            if(this.hScrollBar) {
                this.scrollableTouchX = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageX;
                this.origValueX = this.hScrollBar.getScrollValue();
            }
            if(this.vScrollBar) {
                this.scrollableTouchY = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageY;
                this.origValueY = this.vScrollBar.getScrollValue();
            }
            jcf.lib.event.add(this.realElement, jcf.eventMove, this.onScrollableMove, this);
            jcf.lib.event.add(this.realElement, jcf.eventRelease, this.onScrollableRelease, this);
        },
        onScrollableMove: function(e) {
            if(this.vScrollBar) {
                var difY = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageY - this.scrollableTouchY;
                var valY = this.origValueY-difY;
                this.vScrollBar.scrollTo(valY);
                if(valY < 0 || valY > this.vScrollBar.options.range) {
                    this.preventFlag = false;
                }
            }
            if(this.hScrollBar) {
                var difX = (jcf.isTouchDevice ? e.changedTouches[0] : e).pageX - this.scrollableTouchX;
                var valX = this.origValueX-difX;
                this.hScrollBar.scrollTo(valX);
                if(valX < 0 || valX > this.hScrollBar.options.range) {
                    this.preventFlag = false;
                }
            }
            if(this.preventFlag) {
                e.preventDefault();
            }
        },
        onScrollableRelease: function() {
            jcf.lib.event.remove(this.realElement, jcf.eventMove, this.onScrollableMove);
            jcf.lib.event.remove(this.realElement, jcf.eventRelease, this.onScrollableRelease);
        },
        refreshState: function() {
            if(this.options.alwaysKeepScrollbars) {
                if(this.hScrollBar) this.hScrollBar.scrollBar.style.display = 'block';
                if(this.vScrollBar) this.vScrollBar.scrollBar.style.display = 'block';
            } else {
                if(this.hScrollBar) {
                    if(this.getScrollRange(false)) {
                        this.hScrollBar.scrollBar.style.display = 'block';
                        this.resizeScrollContent();
                        this.hScrollBar.setRange(this.getScrollRange(false));
                    } else {
                        this.hScrollBar.scrollBar.style.display = 'none';
                        this.realElement.style.width = this.outerWrapper.style.width;
                    }
                    this.outerWrapper.classList.toggle(this.options.noHorizontalBarClass, this.hScrollBar.options.range === 0);
                }
                if(this.vScrollBar) {
                    if(this.getScrollRange(true) > 0) {
                        this.vScrollBar.scrollBar.style.display = 'block';
                        this.resizeScrollContent();
                        this.vScrollBar.setRange(this.getScrollRange(true));
                    } else {
                        this.vScrollBar.scrollBar.style.display = 'none';
                        this.realElement.style.width = this.outerWrapper.style.width;
                    }
                    this.outerWrapper.classList.toggle(this.options.noVerticalBarClass, this.vScrollBar.options.range === 0);
                }
            }
            if(this.vScrollBar) {
                this.vScrollBar.setRange(this.realElement.scrollHeight - this.realElement.offsetHeight);
                this.vScrollBar.setSize(this.realElement.offsetHeight);
                this.vScrollBar.scrollTo(this.realElement.scrollTop);
            }
            if(this.hScrollBar) {
                this.hScrollBar.setRange(this.realElement.scrollWidth - this.realElement.offsetWidth);
                this.hScrollBar.setSize(this.realElement.offsetWidth);
                this.hScrollBar.scrollTo(this.realElement.scrollLeft);
            }
        },
        getScrollRange: function(isVertical) {
            if(isVertical) {
                return this.realElement.scrollHeight - this.realElement.offsetHeight;
            } else {
                return this.realElement.scrollWidth - this.realElement.offsetWidth;
            }
        },
        getCurrentRange: function(scrollInstance) {
            return this.getScrollRange(scrollInstance.isVertical);
        },
        onCreateModule: function(){
            if(jcf.modules.select) {
                this.extendSelect();
            }
            if(jcf.modules.selectmultiple) {
                this.extendSelectMultiple();
            }
            if(jcf.modules.textarea) {
                this.extendTextarea();
            }
        },
        onModuleAdded: function(module){
            if(module.prototype.name == 'select') {
                this.extendSelect();
            }
            if(module.prototype.name == 'selectmultiple') {
                this.extendSelectMultiple();
            }
            if(module.prototype.name == 'textarea') {
                this.extendTextarea();
            }
        },
        extendSelect: function() {
            // add scrollable if needed on control ready
            jcf.modules.select.prototype.onControlReady = function(obj){
                if(obj.selectList.scrollHeight > obj.selectList.offsetHeight) {
                    obj.jcfScrollable = new jcf.modules.customscroll({
                        alwaysPreventWheel: true,
                        replaces:obj.selectList
                    });
                }
            }
            // update scroll function
            var orig = jcf.modules.select.prototype.scrollToItem;
            jcf.modules.select.prototype.scrollToItem = function(){
                orig.apply(this);
                if(this.jcfScrollable) {
                    this.jcfScrollable.refreshState();
                }
            }
        },
        extendTextarea: function() {
            // add scrollable if needed on control ready
            jcf.modules.textarea.prototype.onControlReady = function(obj){
                obj.jcfScrollable = new jcf.modules.customscroll({
                    alwaysKeepScrollbars: true,
                    alwaysPreventWheel: true,
                    replaces: obj.realElement
                });
            }
            // update scroll function
            var orig = jcf.modules.textarea.prototype.refreshState;
            jcf.modules.textarea.prototype.refreshState = function(){
                orig.apply(this);
                if(this.jcfScrollable) {
                    this.jcfScrollable.refreshState();
                }
            }
        },
        extendSelectMultiple: function(){
            // add scrollable if needed on control ready
            jcf.modules.selectmultiple.prototype.onControlReady = function(obj){
                //if(obj.optionsHolder.scrollHeight > obj.optionsHolder.offsetHeight) {
                    obj.jcfScrollable = new jcf.modules.customscroll({
                        alwaysPreventWheel: true,
                        replaces:obj.optionsHolder
                    });
                //}
            }
            // update scroll function
            var orig = jcf.modules.selectmultiple.prototype.scrollToItem;
            jcf.modules.selectmultiple.prototype.scrollToItem = function(){
                orig.apply(this);
                if(this.jcfScrollable) {
                    this.jcfScrollable.refreshState();
                }
            }

            // update scroll size?
            var orig2 = jcf.modules.selectmultiple.prototype.rebuildOptions;
            jcf.modules.selectmultiple.prototype.rebuildOptions = function(){
                orig2.apply(this);
                if(this.jcfScrollable) {
                    this.jcfScrollable.refreshState();
                }
            }

        }
    });

    // scrollbar plugin
    jcf.addPlugin({
        name: 'scrollbar',
        enabled: true,
        defaultOptions: {
            size: 0,
            range: 0,
            moveStep: 6,
            moveDistance: 50,
            moveInterval: 10,
            trackHoldDelay: 900,
            holder: null,
            vertical: true,
            scrollTag: 'div',
            onScroll: function(){},
            onScrollEnd: function(){},
            onScrollStart: function(){},
            disabledClass: 'btn-disabled',
            VscrollBarClass:'vscrollbar',
            VscrollStructure: '<div class="vscroll-up"></div><div class="vscroll-line"><div class="vscroll-slider"><div class="scroll-bar-top"></div><div class="scroll-bar-bottom"></div></div></div></div><div class="vscroll-down"></div>',
            VscrollTrack: 'div.vscroll-line',
            VscrollBtnDecClass:'div.vscroll-up',
            VscrollBtnIncClass:'div.vscroll-down',
            VscrollSliderClass:'div.vscroll-slider',
            HscrollBarClass:'hscrollbar',
            HscrollStructure: '<div class="hscroll-left"></div><div class="hscroll-line"><div class="hscroll-slider"><div class="scroll-bar-left"></div><div class="scroll-bar-right"></div></div></div></div><div class="hscroll-right"></div>',
            HscrollTrack: 'div.hscroll-line',
            HscrollBtnDecClass:'div.hscroll-left',
            HscrollBtnIncClass:'div.hscroll-right',
            HscrollSliderClass:'div.hscroll-slider'
        },
        init: function(userOptions) {
            this.setOptions(userOptions);
            this.createScrollBar();
            this.attachEvents();
            this.setSize();
        },
        setOptions: function(extOptions) {
            // merge options
            this.options = jcf.lib.extend({}, this.defaultOptions, extOptions);
            this.isVertical = this.options.vertical;
            this.prefix = this.isVertical ? 'V' : 'H';
            this.eventPageOffsetProperty = this.isVertical ? 'pageY' : 'pageX';
            this.positionProperty = this.isVertical ? 'top' : 'left';
            this.sizeProperty = this.isVertical ? 'height' : 'width';
            this.dimenionsProperty = this.isVertical ? 'offsetHeight' : 'offsetWidth';
            this.invertedDimenionsProperty = !this.isVertical ? 'offsetHeight' : 'offsetWidth';

            // set corresponding classes
            for(let p in this.options) {
                if(p.indexOf(this.prefix) == 0) {
                    this.options[p.substr(1)] = this.options[p];
                }
            }
        },
        createScrollBar: function() {
            // create dimensions
            this.scrollBar = document.createElement(this.options.scrollTag);
            this.scrollBar.className = this.options.scrollBarClass;
            this.scrollBar.innerHTML = this.options.scrollStructure;

            // get elements
            this.track = this.scrollBar.querySelector(this.options.scrollTrack);
            this.btnDec = this.scrollBar.querySelector(this.options.scrollBtnDecClass);
            this.btnInc = this.scrollBar.querySelector(this.options.scrollBtnIncClass);
            this.slider = this.scrollBar.querySelector(this.options.scrollSliderClass);
            this.slider.style.position = 'absolute';
            this.track.style.position = 'relative';
        },
        attachEvents: function() {
            // append scrollbar to holder if provided
            if(this.options.holder) {
                this.options.holder.appendChild(this.scrollBar);
            }

            // attach listeners for slider and buttons
            jcf.lib.event.add(this.slider, jcf.eventPress, this.onSliderPressed, this);
            jcf.lib.event.add(this.btnDec, jcf.eventPress, this.onBtnDecPressed, this);
            jcf.lib.event.add(this.btnInc, jcf.eventPress, this.onBtnIncPressed, this);
            jcf.lib.event.add(this.track, jcf.eventPress, this.onTrackPressed, this);
        },
        setSize: function(value) {
            if(typeof value === 'number') {
                this.options.size = value;
            }
            this.scrollOffset = this.scrollValue = this.sliderOffset = 0;
            this.scrollBar.style[this.sizeProperty] = this.options.size + 'px';
            this.resizeControls();
            this.refreshSlider();
        },
        setRange: function(r) {
            this.options.range = Math.max(r,0);
            this.resizeControls();
        },
        doScrollWheelStep: function(direction) {
            // 1 - scroll up, -1 scroll down
            this.startScroll();
            if((direction < 0 && !this.isEndPosition()) || (direction > 0 && !this.isStartPosition())) {
                this.scrollTo(this.getScrollValue()-this.options.moveDistance * direction);
                this.moveScroll();
                this.endScroll();
                return false;
            }
        },
        resizeControls: function() {
            // calculate dimensions
            this.barSize = this.scrollBar[this.dimenionsProperty];
            this.btnDecSize = this.btnDec[this.dimenionsProperty];
            this.btnIncSize = this.btnInc[this.dimenionsProperty];
            this.trackSize = this.barSize - this.btnDecSize - this.btnIncSize;

            // resize and reposition elements
            this.track.style[this.sizeProperty] = this.trackSize + 'px';
            this.trackSize = this.track[this.dimenionsProperty];
            this.sliderSize = this.getSliderSize();
            this.slider.style[this.sizeProperty] = this.sliderSize + 'px';
            this.sliderSize = this.slider[this.dimenionsProperty];
        },
        refreshSlider: function(complete) {
            // refresh dimensions
            if(complete) {
                this.resizeControls();
            }
            // redraw slider and classes
            this.sliderOffset = isNaN(this.sliderOffset) ? 0 : this.sliderOffset;
            this.slider.style[this.positionProperty] = this.sliderOffset + 'px';
        },
        startScroll: function() {
            // refresh range if possible
            if(this.options.spawnClass && typeof this.options.spawnClass.getCurrentRange === 'function') {
                this.setRange(this.options.spawnClass.getCurrentRange(this));
            }
            this.resizeControls();
            this.scrollBarOffset = jcf.lib.getOffset(this.track)[this.positionProperty];
            this.options.onScrollStart();
        },
        moveScroll: function() {
            this.options.onScroll(this.scrollValue);

            // add disabled classes
            this.btnDec.classList.remove(this.options.disabledClass);
            this.btnInc.classList.remove(this.options.disabledClass);
            if(this.scrollValue === 0) {
                this.btnDec.classList.add(this.options.disabledClass);
            }
            if(this.scrollValue === this.options.range) {
                this.btnInc.classList.add(this.options.disabledClass);
            }
        },
        endScroll: function() {
            this.options.onScrollEnd();
        },
        startButtonMoveScroll: function(direction) {
            this.startScroll();
            clearInterval(this.buttonScrollTimer);
            this.buttonScrollTimer = setInterval(jcf.lib.bind(function(){
                this.scrollValue += this.options.moveStep * direction
                if(this.scrollValue > this.options.range) {
                    this.scrollValue = this.options.range;
                    this.endButtonMoveScroll();
                } else if(this.scrollValue < 0) {
                    this.scrollValue = 0;
                    this.endButtonMoveScroll();
                }
                this.scrollTo(this.scrollValue);

            },this),this.options.moveInterval);
        },
        endButtonMoveScroll: function() {
            clearInterval(this.buttonScrollTimer);
            this.endScroll();
        },
        isStartPosition: function() {
            return this.scrollValue === 0;
        },
        isEndPosition: function() {
            return this.scrollValue === this.options.range;
        },
        getSliderSize: function() {
            return Math.round(this.getSliderSizePercent() * this.trackSize / 100);
        },
        getSliderSizePercent: function() {
            return this.options.range === 0 ? 0 : this.barSize * 100 / (this.barSize + this.options.range);
        },
        getSliderOffsetByScrollValue: function() {
            return (this.scrollValue * 100 / this.options.range) * (this.trackSize - this.sliderSize) / 100;
        },
        getSliderOffsetPercent: function() {
            return this.sliderOffset * 100 / (this.trackSize - this.sliderSize);
        },
        getScrollValueBySliderOffset: function() {
            return this.getSliderOffsetPercent() * this.options.range / 100;
        },
        getScrollBarSize: function() {
            return this.scrollBar[this.invertedDimenionsProperty];
        },
        getScrollValue: function() {
            return this.scrollValue || 0;
        },
        scrollOnePage: function(direction) {
            this.scrollTo(this.scrollValue + direction*this.barSize);
        },
        scrollTo: function(x) {
            this.scrollValue = x < 0 ? 0 : x > this.options.range ? this.options.range : x;
            this.sliderOffset = this.getSliderOffsetByScrollValue();
            this.refreshSlider();
            this.moveScroll();
        },
        onSliderPressed: function(e){
            jcf.lib.event.add(document.body, jcf.eventRelease, this.onSliderRelease, this);
            jcf.lib.event.add(document.body, jcf.eventMove, this.onSliderMove, this);
            jcf.lib.disableTextSelection(this.slider);

            // calculate offsets once
            this.sliderInnerOffset = (jcf.isTouchDevice ? e.changedTouches[0] : e)[this.eventPageOffsetProperty] - jcf.lib.getOffset(this.slider)[this.positionProperty];
            this.startScroll();
            return false;
        },
        onSliderRelease: function(){
            jcf.lib.event.remove(document.body, jcf.eventRelease, this.onSliderRelease);
            jcf.lib.event.remove(document.body, jcf.eventMove, this.onSliderMove);
        },
        onSliderMove: function(e) {
            this.sliderOffset = (jcf.isTouchDevice ? e.changedTouches[0] : e)[this.eventPageOffsetProperty] - this.scrollBarOffset - this.sliderInnerOffset;
            if(this.sliderOffset < 0) {
                this.sliderOffset = 0;
            } else if(this.sliderOffset + this.sliderSize > this.trackSize) {
                this.sliderOffset = this.trackSize - this.sliderSize;
            }
            if(this.previousOffset != this.sliderOffset) {
                this.previousOffset = this.sliderOffset;
                this.scrollTo(this.getScrollValueBySliderOffset());
            }
        },
        onBtnIncPressed: function() {
            jcf.lib.event.add(document.body, jcf.eventRelease, this.onBtnIncRelease, this);
            jcf.lib.disableTextSelection(this.btnInc);
            this.startButtonMoveScroll(1);
            return false;
        },
        onBtnIncRelease: function() {
            jcf.lib.event.remove(document.body, jcf.eventRelease, this.onBtnIncRelease);
            this.endButtonMoveScroll();
        },
        onBtnDecPressed: function() {
            jcf.lib.event.add(document.body, jcf.eventRelease, this.onBtnDecRelease, this);
            jcf.lib.disableTextSelection(this.btnDec);
            this.startButtonMoveScroll(-1);
            return false;
        },
        onBtnDecRelease: function() {
            jcf.lib.event.remove(document.body, jcf.eventRelease, this.onBtnDecRelease);
            this.endButtonMoveScroll();
        },
        onTrackPressed: function(e) {
            var position = e[this.eventPageOffsetProperty] - jcf.lib.getOffset(this.track)[this.positionProperty];
            var direction = position < this.sliderOffset ? -1 : position > this.sliderOffset + this.sliderSize ? 1 : 0;
            if(direction) {
                this.scrollOnePage(direction);
            }
        }
    });

    // custom textarea module
    jcf.addModule({
        name:'textarea',
        selector: '', // 'textarea',
        enabled: true,
        defaultOptions: {
            observable: true,
            wrapperClass:'textarea-wrapper',
            focusClass:'textarea-wrapper-focus',
            cropMaskClass: 'scroll-cropper',
            txtStructure:'<div class="control-wrapper"><div class="ctop"><div class="cleft"></div><div class="cright"></div></div><div class="cmid"><div class="chold"></div></div><div class="cbot"><div class="cleft"></div><div class="cright"></div></div></div>',
            txtHolder: 'div.chold',
            refreshInterval: 100
        },
        setupWrapper: function(){
            this.realElement.classList.remove(jcf.baseOptions.hiddenClass);
            this.fakeElement.classList.add(this.options.wrapperClass);

            // create structure
            this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
            this.fakeElement.innerHTML = this.options.txtStructure;
            this.textareaHolder = this.fakeElement.querySelector(this.options.txtHolder);
            this.textareaHolder.appendChild(this.realElement);
            jcf.lib.enableTextSelection(this.fakeElement);

            // init object and events
            this.prepareElement();
            this.refreshState();
            this.addEvents();
            this.addCustomScroll();
        },
        prepareElement: function() {
            jcf.lib.setStyles(this.realElement, {
                resize:'none',
                overflow:'hidden',
                verticalAlign:'top',
                width: jcf.lib.getInnerWidth(this.realElement),
                height: jcf.lib.getInnerHeight(this.realElement)
            });
            jcf.lib.setStyles(this.textareaHolder, {
                width:this.realElement.offsetWidth
            });
        },
        addCustomScroll: function() {
            // call ready state, so scrollbars can attach here
            this.onControlReady(this);
            var origWidth = jcf.lib.getInnerWidth(this.realElement);
            var barWidth = jcf.lib.scrollSize.getWidth();

            // change text area size by scrollbar width
            jcf.lib.setStyles(this.realElement, {
                width: origWidth + barWidth,
                overflowX: 'hidden',
                overflowY: 'scroll',
                direction: 'ltr'
            });

            // create crop mask
            this.scrollCropper = jcf.lib.createElement('div',{
                'class': this.options.cropMaskClass,
                style: {
                    width: origWidth,
                    overflow: 'hidden'
                }
            });
            this.realElement.parentNode.insertBefore(this.scrollCropper, this.realElement);
            this.scrollCropper.appendChild(this.realElement);
        },
        addEvents: function(){
            this.delayedRefresh = jcf.lib.bind(this.delayedRefresh, this);
            jcf.lib.event.add(this.realElement, 'keydown', this.delayedRefresh);
            jcf.lib.event.add(this.realElement, 'keyup', this.delayedRefresh);
        },
        onFocus: function(e) {
            jcf.modules[this.name].superclass.onFocus.apply(this, arguments);
            clearInterval(this.refreshTimer);
            this.delayedRefresh();
            this.refreshTimer = setInterval(this.delayedRefresh, this.options.refreshInterval);
        },
        onBlur: function() {
            jcf.modules[this.name].superclass.onBlur.apply(this, arguments);
            clearInterval(this.refreshTimer);
        },
        delayedRefresh: function() {
            clearTimeout(this.delayTimer);
            this.delayTimer = setTimeout(jcf.lib.bind(this.refreshState, this),10);
        },
        refreshState: function() {
            if(this.scrollCropper) {
                this.scrollCropper.scrollTop = this.scrollCropper.scrollLeft = 0;
                this.scrollCropper.parentNode.scrollTop = 0;
            }
            // custom scrollbars will call this method before refreshing themself
        }
    });

    jcf.addSelectors = function(opt){
        const options = Object.assign({},{
                select: '',
                checkbox: '',
                radio: '',
                customscroll: '',
                textarea: '',
            }, opt || {});

        for(let k in options){
            if(options[k] !== '' && this.modules.hasOwnProperty(k)){
                let selector = (this.modules[k].prototype.selector !== '')? this.modules[k].prototype.selector.split(',') : [];
                selector = selector.concat(options[k].split(','));
                this.modules[k].prototype.selector = selector.join();
            }
        }
        jcf.customForms.replaceAll();
    }

    // page init
    jcf.lib.domReady(function(){
        jcf.customForms.replaceAll();
    });

    return jcf;
});
