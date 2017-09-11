/**
 * MOST Web Framework
 * A JavaScript Web Framework
 * http://themost.io
 * Created by Kyriakos Barbounakis<k.barbounakis@gmail.com> on 2017-09-10.
 *
 * Copyright (c) 2014, Kyriakos Barbounakis k.barbounakis@gmail.com
 Anthi Oikonomou anthioikonomou@gmail.com
 All rights reserved.
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.
 * Neither the name of MOST Web Framework nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';
/**
 *
 */
var _ = require('lodash');
var winston = require('winston');

var UUID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var HEX_CHARS = 'abcdef1234567890';
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


var DateTimeRegex = /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/g;
var BooleanTrueRegex = /^true$/ig;
var BooleanFalseRegex = /^false$/ig;
var NullRegex = /^null$/ig;
var UndefinedRegex = /^undefined$/ig;
var IntegerRegex =/^[-+]?\d+$/g;
var FloatRegex =/^[+-]?\d+(\.\d+)?$/g;

var logger = new winston.Logger({
    level: (process.env.NODE_ENV === 'development') ? 'debug' : 'info',
    transports: [
        new (winston.transports.Console)({
            timestamp: function() {
                return (new Date()).toUTCString()
            },
            formatter: function(options) {
                return '[' + options.timestamp() +'] ['+ options.level.toUpperCase() +'] '+ (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta, null, 4) : '' );
            }
        })
    ]
});


/**
 * @class
 * @constructor
 */
function UnknownPropertyDescriptor(obj, name) {
    Object.defineProperty(this, 'value', { configurable:false, enumerable:true, get: function() { return obj[name]; }, set: function(value) { obj[name]=value; } });
    Object.defineProperty(this, 'name', { configurable:false, enumerable:true, get: function() { return name; } });
}


/**
 * @class
 * @constructor
 */
function LangUtils() {
    //
}

/**
 * Inherit the prototype methods from one constructor into another.
 * @param {Function} ctor
 * @param {Function} superCtor
 * @example
function Animal() {
    //
}

function Dog() {
    Dog.super_.bind(this)();
}
LangUtils.inherits(Dog,Animal);
 */
LangUtils.inherits = function(ctor, superCtor) {
    if (typeof superCtor !== "function" && superCtor !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superCtor);
    }
    ctor.prototype = Object.create(superCtor && superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superCtor) {
        /**
         * @function setPrototypeOf
         * @param {*} obj
         * @param {*} prototype
         * @memberOf Object
         * @static
         */
        if (typeof Object.setPrototypeOf === 'function') {
            Object.setPrototypeOf(ctor, superCtor)
        }
        else {
            ctor.__proto__ = superCtor
        }
    }
    //node.js As an additional convenience, superConstructor will be accessible through the constructor.super_ property.
    ctor.super_ = ctor.__proto__;
};

/**
 * Returns an array of strings which represents the arguments' names of the given function
 * @param {Function} fn
 * @returns {Array}
 */
LangUtils.getFunctionParams = function(fn) {
    if (!_.isFunction(fn))
        return [];
    var fnStr = fn.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if(result === null)
        result = [];
    return result;
};


/**
 * @param {string} value
 */
LangUtils.convert = function(value) {
    var result;
    if ((typeof value === 'string'))
    {
        if (value.length===0) {
            result = value
        }
        if (value.match(BooleanTrueRegex)) {
            result = true;
        }
        else if (value.match(BooleanFalseRegex)) {
            result = false;
        }
        else if (value.match(NullRegex) || value.match(UndefinedRegex)) {
            result = null;
        }
        else if (value.match(IntegerRegex)) {
            result = parseInt(value);
        }
        else if (value.match(FloatRegex)) {
            result = parseFloat(value);
        }
        else if (value.match(DateTimeRegex)) {
            result = new Date(Date.parse(value));
        }
        else {
            result = value;
        }
    }
    else {
        result = value;
    }
    return result;
};

/**
 *
 * @param {*} origin
 * @param {string} expr
 * @param {string} value
 * @param {*=} options
 * @returns {*}
 */
LangUtils.extend = function(origin, expr, value, options) {

    options = options || { convertValues:false };
    //find base notation
    var match = /(^\w+)\[/.exec(expr), name, descriptor, expr1;
    if (match) {
        //get property name
        name = match[1];
        //validate array property
        if (/^\d+$/g.test(name)) {
            //property is an array
            if (!_.isArray(origin.value))
                origin.value = [];
            // get new expression
            expr1 = expr.substr(match.index + match[1].length);
            LangUtils.extend(origin, expr1, value);
        }
        else {
            //set property value (unknown)
            origin[name] = origin[name] || new LangUtils();
            descriptor = new UnknownPropertyDescriptor(origin, name);
            // get new expression
            expr1 = expr.substr(match.index + match[1].length);
            LangUtils.extend(descriptor, expr1, value);
        }
    }
    else if (expr.indexOf('[')===0) {
        //get property
        var re = /\[(.*?)\]/g;
        match = re.exec(expr);
        if (match) {
            name = match[1];
            // get new expression
            expr1 = expr.substr(match.index + match[0].length);
            if (/^\d+$/g.test(name)) {
                //property is an array
                if (!_.isArray(origin.value))
                    origin.value = [];
            }
            if (expr1.length===0) {
                if (origin.value instanceof LangUtils) {
                    origin.value = {};
                }
                var typedValue;
                //convert string value
                if ((typeof value === 'string') && options.convertValues) {
                    typedValue = LangUtils.convert(value);
                }
                else {
                    typedValue = value;
                }
                if (_.isArray(origin.value))
                    origin.value.push(typedValue);
                else
                    origin.value[name] = typedValue;
            }
            else {
                if (origin.value instanceof LangUtils) {
                    origin.value = { };
                }
                origin.value[name] = origin.value[name] || new LangUtils();
                descriptor = new UnknownPropertyDescriptor(origin.value, name);
                LangUtils.extend(descriptor, expr1, value);
            }
        }
        else {
            throw new Error('Invalid object property notation. Expected [name]');
        }
    }
    else if (/^\w+$/.test(expr)) {
        if (options.convertValues)
            origin[expr] = LangUtils.convert(value);
        else
            origin[expr] = value;
    }
    else {
        throw new Error('Invalid object property notation. Expected property[name] or [name]');
    }
    return origin;
};


/**
 *
 * @param {*} form
 * @returns {*}
 */
LangUtils.parseForm = function (form) {
    var result = {};
    if (typeof form === 'undefined' || form===null)
        return result;
    var keys = Object.keys(form);
    keys.forEach(function(key) {
        if (form.hasOwnProperty(key))
        {
            LangUtils.extend(result, key, form[key])
        }
    });
    return result;
};
/**
 * Parses any value or string and returns the resulted object.
 * @param {*} any
 * @returns {*}
 */
LangUtils.parseValue = function(any) {
    return LangUtils.convert(any);
};
/**
 * Parses any value and returns the equivalent integer.
 * @param {*} any
 * @returns {*}
 */
LangUtils.parseInt = function(any) {
    return parseInt(any) || 0;
};
/**
 * Parses any value and returns the equivalent float number.
 * @param {*} any
 * @returns {*}
 */
LangUtils.parseFloat = function(any) {
    return parseFloat(any) || 0;
};
/**
 * Parses any value and returns the equivalent boolean.
 * @param {*} any
 * @returns {*}
 */
LangUtils.parseBoolean = function(any) {
    if (typeof any === 'undefined' || any === null)
        return false;
    else if (typeof any === 'number')
        return any !== 0;
    else if (typeof any === 'string') {
        if (any.match(LangUtils.IntegerRegex) || any.match(LangUtils.FloatRegex)) {
            return parseInt(any, 10) !== 0;
        }
        else if (any.match(LangUtils.BooleanTrueRegex))
            return true;
        else if (any.match(LangUtils.BooleanFalseRegex))
            return false;
        else if (/^yes$|^on$|^y$|^valid$/i.test(any))
            return true;
        else if (/^no$|^off$|^n$|^invalid$/i.test(any))
            return false;
        else
            return false;
    }
    else if (typeof any === 'boolean')
        return any;
    else {
        return (parseInt(any) || 0) !== 0;
    }
};

LangUtils.DateTimeRegex = /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/g;
LangUtils.BooleanTrueRegex = /^true$/ig;
LangUtils.BooleanFalseRegex = /^false$/ig;
LangUtils.NullRegex = /^null$/ig;
LangUtils.UndefinedRegex = /^undefined$/ig;
LangUtils.IntegerRegex =/^[-+]?\d+$/g;
LangUtils.FloatRegex =/^[+-]?\d+(\.\d+)?$/g;

/**
 * @function captureStackTrace
 * @memberOf Error
 * @param {Error} thisArg
 * @param {string} name
 * @static
 */

/**
 * @class
 * @param {string} msg
 * @param {string} code
 * @constructor
 * @extends error
 */
function ArgumentError(msg, code) {
    ArgumentError.super_.bind(this)(msg);
    this.message = msg;
    this.code = code || "EARG";
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
    }
}
LangUtils.inherits(ArgumentError, Error);

/**
 * @class
 * @constructor
 */
function Args() {
    //
}

/**
 * Checks the expression and throws an exception if the condition is not met.
 * @param {*} expr
 * @param {string|Error} err
 */
Args.check = function(expr, err) {
    Args.notNull(expr,"Expression");
    var res;
    if (typeof expr === 'function') {
        res = !(expr.call());
    }
    else {
        res = (!expr);
    }
    if (res) {
        if (err instanceof Error) {
            throw err;
        }
        throw new ArgumentError(err, "ECHECK");
    }
};

/**
 *
 * @param {*} arg
 * @param {string} name
 */
Args.notNull = function(arg, name) {
    if (typeof arg === 'undefined' || arg === null) {
        throw new ArgumentError(name + " may not be null or undefined", "ENULL");
    }
};

/**
 * @param {*} arg
 * @param {string} name
 */
Args.notString = function(arg, name) {
    if (typeof arg !== 'string') {
        throw new ArgumentError(name + " must be a string", "EARG");
    }
};

/**
 * @param {*} arg
 * @param {string} name
 */
Args.notFunction = function(arg, name) {
    if (typeof arg !== 'function') {
        throw new ArgumentError(name + " must be a function", "EARG");
    }
};

/**
 * @param {*} arg
 * @param {string} name
 */
Args.notNumber = function(arg, name) {
    if ((typeof arg !== 'number') || isNaN(arg)) {
        throw new ArgumentError(name + " must be number", "EARG");
    }
};

/**
 * @param {string|*} arg
 * @param {string} name
 */
Args.notEmpty = function(arg, name) {
    Args.notNull(arg,name);
    if ((Object.prototype.toString.bind(arg)() === '[object Array]') && (arg.length === 0)) {
        throw new ArgumentError(name + " may not be empty","EEMPTY");
    }
    else if ((typeof arg === 'string') && (arg.length===0)) {
        throw new ArgumentError(name + " may not be empty","EEMPTY");
    }
};

/**
 * @param {number|*} arg
 * @param {string} name
 */
Args.notNegative = function(arg, name) {
    Args.notNumber(arg,name);
    if (arg<0) {
        throw new ArgumentError(name + " may not be negative", "ENEG");
    }
};

/**
 * @param {number|*} arg
 * @param {string} name
 */
Args.positive = function(arg, name) {
    Args.notNumber(arg,name);
    if (arg<=0) {
        throw new ArgumentError(name + " may not be negative or zero", "EPOS");
    }
};


/**
 * @class
 * @constructor
 */
function TextUtils() {
    
}

    /**
     * Converts the given parameter to MD5 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    TextUtils.toMD5 = function(value) {

        if (typeof value === 'undefined' || value === null) {
            return;
        }
        //browser implementation
        var md5, md5module;
        if (typeof window !== 'undefined') {
            md5module = 'blueimp-md5';
            md5 = require(md5module);
            if (typeof value === 'string') {
                return md5(value);
            }
            else if (value instanceof Date) {
                return md5(value.toUTCString());
            }
            else {
                return md5(JSON.stringify(value));
            }
        }
        //node.js implementation
        md5module = 'crypto';
        var crypto = require(md5module);
        md5 = crypto.createHash('md5');
        if (typeof value === 'string') {
            md5.update(value);
        }
        else if (value instanceof Date) {
            md5.update(value.toUTCString());
        }
        else {
            md5.update(JSON.stringify(value));
        }
        return md5.digest('hex');
    };

    /**
     * Converts the given parameter to SHA1 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    TextUtils.toSHA1 = function(value) {

        if (typeof window !== 'undefined') {
            throw new Error('This method is not implemented for this environment')
        }

        var crypto = require('crypto');
        if (typeof value === 'undefined' || value === null) {
            return;
        }
        var sha1 = crypto.createHash('sha1');
        if (typeof value === 'string') {
            sha1.update(value);
        }
        else if (value instanceof Date) {
            sha1.update(value.toUTCString());
        }
        else {
            sha1.update(JSON.stringify(value));
        }
        return sha1.digest('hex');
    };

    /**
     * Converts the given parameter to SHA256 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    TextUtils.toSHA256 = function(value) {

        if (typeof window !== 'undefined') {
            throw new Error('This method is not implemented for this environment')
        }

        var crypto = require('crypto');
        if (typeof value === 'undefined' || value === null) {
            return;
        }
        var sha256 = crypto.createHash('sha256');
        if (typeof value === 'string') {
            sha256.update(value);
        }
        else if (value instanceof Date) {
            sha256.update(value.toUTCString());
        }
        else {
            sha256.update(JSON.stringify(value));
        }
        return sha256.digest('hex');
    };

    /**
     * Returns a random GUID/UUID string
     * @static
     * @returns {string}
     */
    TextUtils.newUUID = function() {
        var uuid = [];
        var i;
        // rfc4122, version 4 form
        var r, n;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                n = (i === 19) ? (r & 0x3) | 0x8 : r;
                uuid[i] = UUID_CHARS.substring(n,1);
            }
        }
        return uuid.join('');
    };


/**
 * @class
 * @constructor
 */
function TraceUtils() {
        
    }

    /**
     * @static
     * @param {...*} data
     */
    TraceUtils.log = function(data) {
        var args = Array.prototype.slice.call(arguments);
        if (args.length===0) { return; }
        if (data instanceof Error) {
            return TraceUtils.error.apply(this, args);
        }
        if (_.isObject(data)) {
            return logger.info.call(logger, JSON.stringify(data,null, 2));
        }
        return logger.info.apply(logger, args);
    };

    /**
     * @static
     * @param {...*} data
     */
    TraceUtils.error = function(data) {
        var args = Array.prototype.slice.call(arguments);
        if (args.length===0) { return; }
        if (data instanceof Error) {
            if (data.stack) {
                return logger.error(data.stack);
            }
            else {
                return logger.error.apply(logger, args);
            }
        }
        return logger.error.apply(logger, args);
    };

    /**
     *
     * @static
     * @param {...*} data
     */
    TraceUtils.info = function(data) {
        var args = Array.prototype.slice.call(arguments);
        if (args.length===0) { return; }
        return logger.info.apply(logger, args);
    };

    /**
     *
     * @static
     * @param {*} data
     */
    TraceUtils.warn= function(data) {
        var args = Array.prototype.slice.call(arguments);
        if (args.length===0) { return; }
        return logger.warn.apply(logger, args);
    };

    /**
     *
     * @static
     * @param {...*} data
     */
    TraceUtils.debug = function(data) {
        var args = Array.prototype.slice.call(arguments);
        if (args.length===0) { return; }
        return logger.debug.apply(logger, args);
    };

/**
 * @class
 * @constructor
 */
function RandomUtils() {
        //
    }

    /**
     * Returns a random string based on the length specified
     * @param {Number} length
     */
    RandomUtils.randomChars = function(length) {
        length = length || 8;
        var chars = "abcdefghkmnopqursuvwxz2456789ABCDEFHJKLMNPQURSTUVWXYZ";
        var str = "";
        for(var i = 0; i < length; i++) {
            str += chars.substr(this.randomInt(0, chars.length-1),1);
        }
        return str;
    };

    /**
     * Returns a random integer between a minimum and a maximum value
     * @param {number} min
     * @param {number} max
     */
    RandomUtils.randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Returns a random string based on the length specified
     * @static
     * @param {number} length
     * @returns {string}
     */
    RandomUtils.randomHex = function(length) {
        length = (length || 8)*2;
        var str = "";
        for(var i = 0; i < length; i++) {
            str += HEX_CHARS.substr(this.randomInt(0, HEX_CHARS.length-1),1);
        }
        return str;
    };

/**
 * @class
 * @constructor
 */
function NumberUtils() {
        //
    }

    /**
     * Converts a base-26 formatted string to the equivalent integer
     * @static
     * @param {string} s A base-26 formatted string e.g. aaaaaaaa for 0, baaaaaaa for 1 etc
     * @return {number} The equivalent integer value
     */
    NumberUtils.fromBase26 = function(s) {
        var num = 0;
        if (!/[a-z]{8}/.test(s)) {
            throw new Error('Invalid base-26 format.');
        }
        const a = 'a'.charCodeAt(0);
        for (var i = 7; i >=0; i--) {
            num = (num * 26) + (s[i].charCodeAt(0) - a);
        }
        return num;
    };

    /**
     * Converts an integer to the equivalent base-26 formatted string
     * @static
     * @param {number} x The integer to be converted
     * @return {string} The equivalent string value
     */
    NumberUtils.toBase26 = function(x) {
        //noinspection ES6ConvertVarToLetConst
        var num = parseInt(x);
        if (num<0) {
            throw new Error('A non-positive integer cannot be converted to base-26 format.');
        }
        if (num>208827064575) {
            throw new Error('A positive integer bigger than 208827064575 cannot be converted to base-26 format.');
        }
        var out = "";
        var length= 1;
        const a = 'a'.charCodeAt(0);
        while(length<=8)
        {
            out += String.fromCharCode(a + (num % 26));
            num = Math.floor(num / 26);
            length += 1;
        }
        return out;
    };

/**
 * @class
 * @constructor
 */
function PathUtils() {

    }

/**
 *
 * @param {...string} part
 * @returns {string}
 */
PathUtils.join = function (part) {
    // Split the inputs into a list of path commands.
    var parts = [], i, l;
    for (i = 0, l = arguments.length; i < l; i++) {
        parts = parts.concat(arguments[i].split("/"));
    }
// Interpret the path commands to get the new resolved path.
    var newParts = [];
    for (i = 0, l = parts.length; i < l; i++) {
        var part1 = parts[i];
        // Remove leading and trailing slashes
        // Also remove "." segments
        if (!part1 || part1 === ".") continue;
        // Interpret ".." to pop the last segment
        if (part1 === "..") newParts.pop();
        // Push new path segments.
        else newParts.push(part1);
    }
// Preserve the initial slash if there was one.
    if (parts[0] === "") newParts.unshift("");
// Turn back into a single string path.
    return newParts.join("/") || (newParts.length ? "/" : ".");
};


if (typeof exports !== 'undefined') {
    module.exports.ArgumentError = ArgumentError;
    module.exports.Args = Args;
    module.exports.UnknownPropertyDescriptor = UnknownPropertyDescriptor;
    module.exports.LangUtils = LangUtils;
    module.exports.NumberUtils = NumberUtils;
    module.exports.RandomUtils = RandomUtils;
    module.exports.TraceUtils = TraceUtils;
    module.exports.TextUtils = TextUtils;
    module.exports.PathUtils = PathUtils;
}
