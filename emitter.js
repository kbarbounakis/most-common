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
var _ = require('lodash');
var HashMap = require('hashmap');
var async = require('async');
var Symbol = require('symbol');
const listenersProperty = Symbol('listeners');
/**
 * @classdesc SequentialEventEmitter class is an extension of node.js EventEmitter class where listeners are executing in series.
 * @class
 * @constructor
 */
function SequentialEventEmitter() {
    this[listenersProperty] = new HashMap();
}

SequentialEventEmitter.prototype.removeAllListeners = function() {
    this[listenersProperty].clear();
};

/**
 * Adds the listener function to the end of the listeners array for the specified event
 * @param {string} event
 * @param {Function} callback
 * @returns {SequentialEventEmitter}
 */
SequentialEventEmitter.prototype.addListener = function(event, callback) {
    this[listenersProperty].has(event) || this[listenersProperty].set(event, []);
    this[listenersProperty].get(event).push(callback);
    return this;
};

/**
 * Adds the listener function to the end of the listeners array for the specified event
 * @param {string} event
 * @param {Function} callback
 * @returns {SequentialEventEmitter}
 */
SequentialEventEmitter.prototype.on = function(event, callback) {
    return this.addListener(event, callback);
};

/**
 * Removes the specified listener from the listeners array
 * @param {string} type
 * @param {Function} callback
 * @returns {SequentialEventEmitter}
 */
SequentialEventEmitter.prototype.removeListener = function(type, callback) {
    var listeners = this[listenersProperty].get(type),
        index;
    if (listeners && listeners.length) {
        index = _.reduce(listeners, function(i, listener, index) {
            return (_.isFunction(listener) && listener === callback) ?
            i = index :
            i;
    }, -1);

        if (index > -1) {
            listeners.splice(index, 1);
            this[listenersProperty].set(type, listeners);
            return this;
        }
    }
    return this;
};

/**
 * Returns an array of listeners which are listening to the specified event
 * @param {string} type
 */
SequentialEventEmitter.prototype.listeners = function(type) {
    var listeners = this[listenersProperty].get(type);
    if (typeof listeners === 'undefined') {
        return [];
    }
    if (_.isArray(listeners)) {
        return listeners;
    }
    return [];
};

/**
 * Returns the number of listeners which are listening to the specified event
 * @param {string} event
 */
SequentialEventEmitter.prototype.listenerCount = function(event) {
    var listeners = this[listenersProperty].get(event);
    if (_.isArray(listeners)) { return listeners.length; }
    return 0;
};

/**
 * Raises the specified event and executes event listeners in series.
 * @param {String} event - The event that is going to be raised.
 * @param {*} args - An object that contains the event arguments.
 * @param {Function} callback - A callback function to be invoked after the execution.
 */
SequentialEventEmitter.prototype.emit = function(event, args, callback) {
    const self = this;
    ////example: call super class function
    //SequentialEventEmitter.super_.emit.call(this);
    //ensure callback
    callback = callback || function() {};
    //get listeners
    const listeners = self[listenersProperty].get(event);
    if (typeof listeners === 'undefined') {
        return callback.call(self);
    }
    //validate listeners
    if (listeners.length===0) {
        //exit emitter
        return callback.call(self);
    }
    //apply each series
    async.applyEachSeries(listeners, args, function(err) {
        callback.call(self, err);
    });
};

SequentialEventEmitter.prototype.once = function(type, listener) {
    const self = this;
    if (!_.isFunction(listener))
        throw TypeError('Listener must be a function');
    var fired = false;
    function g() {
        self.removeListener(type, g);
        if (!fired) {
            fired = true;
            listener.apply(this, arguments);
        }
    }
    g.listener = listener;
    self.on(type, g);
    return this;
};

if (typeof exports !== 'undefined') {
    module.exports.SequentialEventEmitter = SequentialEventEmitter;
}