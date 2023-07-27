;(function() {
'use strict';
    if(!Element.prototype.matches){
        Element.prototype.matches = Element.prototype.matchesSelector ||
          Element.prototype.webkitMatchesSelector ||
          Element.prototype.mozMatchesSelector ||
          Element.prototype.msMatchesSelector;
    }

    if(!Element.prototype.closest) {
        Element.prototype.closest = function(css){
            let node = this;
            while (node) {
                if (node.matches(css)) return node;
                else node = node.parentElement;
            }
            return null;
        };
    }

    if(document.documentElement.textContent === undefined){
        Object.defineProperty(HTMLElement.prototype, "textContent", {
            get: function() {
                return this.innerText;
            },
            set: function(value) {
                this.innerText = value;
            }
        });
    }

    if(typeof Object.assign != 'function'){
        Object.defineProperty(Object, 'assign', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function(target, firstSource) {
                'use strict';
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert first argument to object');
                }
                let to = Object(target);
                for (let i = 1; i < arguments.length; i++) {
                    let nextSource = arguments[i];
                    if (nextSource === undefined || nextSource === null) {
                        continue;
                    }
                    let keysArray = Object.keys(Object(nextSource));
                    for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        let nextKey = keysArray[nextIndex];
                        let desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
                return to;
            }
        });
    }

    if(!Object.keys){
        Object.keys = function (obj) {
            let arr = [],
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    arr.push(key);
                }
            }
            return arr;
        };
    };
    
    if(!Object.equals){
        Object.equals = function( x, y ) {
        if ( x === y ) return true;
        // if both x and y are null or undefined and exactly the same

        if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
        // if they are not strictly equal, they both need to be Objects

        if ( x.constructor !== y.constructor ) return false;
        // they must have the exact same prototype chain, the closest we can do is
        // test there constructor.

        for ( let p in x ) {
        if ( ! x.hasOwnProperty( p ) ) continue;
        // other properties were tested using x.constructor === y.constructor

        if ( ! y.hasOwnProperty( p ) ) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if ( x[ p ] === y[ p ] ) continue;
        // if they have the same strict value or identity then they are equal

        if ( typeof( x[ p ] ) !== "object" ) return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal

        if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
        // Objects and Arrays must be tested recursively
        }

        for ( p in y ) {
        if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
        // allows x[ p ] to be set to undefined
        }
        return true;
        }
    }

    if( typeof Object.create !== 'function' ) {
        Object.create = function( obj ) {
        function F() {};
        F.prototype = obj;
        return new F();
        };
    }

    (function(e){
        e.matches || (e.matches=e.matchesSelector||function(selector){
            let matches = document.querySelectorAll(selector), th = this;
            return Array.prototype.some.call(matches, function(e){
                 return e === th;
            });
        });
    })(Element.prototype);

    (function(ELEMENT) {
        ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
        ELEMENT.closest = ELEMENT.closest || function closest(selector) {
            if (!this) return null;
            if (this.matches(selector)) return this;
            if (!this.parentElement) {return null}
            else return this.parentElement.closest(selector)
          };
    }(Element.prototype));

    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    window.ClassCreate = function(methods) {
        let property;
        let klass = function() {
            this.initialize.apply(this, arguments);
        };

        for (property in methods) {
           klass.prototype[property] = methods[property];
        }

        if (!klass.prototype.initialize) klass.prototype.initialize = function(){};
        klass.prototype.constructor = klass;
        return klass;
    };
})();