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
var _ = require('lodash');
// eslint-disable-next-line no-unused-vars
var HTML_START_CHAR = '<';
var HTML_END_CHAR = '>';
var HTML_FULL_END_STRING = ' />';
var HTML_SPACE_CHAR = ' ';
var HTML_ATTR_STRING = '%0="%1"';
var HTML_START_TAG_STRING = '<%0';
var HTML_END_TAG_STRING = '</%0>';
/**
 * @classdesc HtmlWriter class represents a helper class for rendering HTML content.
 * @class
 * @constructor
 */
function HtmlWriter() {
    /**
     * @private
     * @type {Array}
     */
    this.bufferedAttributes=[];
    /**
     * @private
     * @type {Array}
     */
    this.bufferedTags = [];
    /**
     * @private
     * @type {String}
     */
    this.buffer = '';
    /**
     * @private
     * @type {Integer}
     */
    this.indent = true;
}
// noinspection JSUnusedGlobalSymbols
/**
 * Writes an attribute to an array of attributes that is going to be used in writeBeginTag function
 * @param {String} name - The name of the HTML attribute
 * @param {String} value - The value of the HTML attribute
 * @returns {HtmlWriter}
 */
HtmlWriter.prototype.writeAttribute = function(name, value)
{
    this.bufferedAttributes.push({name:name, value:value});
    return this;
};
// noinspection JSUnusedGlobalSymbols
/**
 * Writes an array of attributes to the output buffer. This attributes are going to be rendered after writeBeginTag or WriteFullBeginTag function call.
 * @param {Array|Object} obj - An array of attributes or an object that represents an array of attributes
 * @returns {HtmlWriter}
 */
HtmlWriter.prototype.writeAttributes = function(obj)
{
    if (obj===null)
        return this;
    if (_.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            this.bufferedAttributes.push( { name:obj[i].name, value:obj[i].value } );
        }
    }
    else {
        for (var prop in obj)
        {
            if (obj.hasOwnProperty(prop)) {
                if (obj[prop]!==null) {
                    this.bufferedAttributes.push( { name:prop, value:obj[prop] } );
                }
            }
        }
    }
    return this;
};
// noinspection JSUnusedGlobalSymbols
/**
 * @param {String} tag
 * @returns {HtmlWriter}
 */
HtmlWriter.prototype.writeBeginTag = function(tag) {
    //write <TAG
    if (this.indent)
    {
        //this.buffer += '\n';
        this.buffer +=_.repeat('\t', this.bufferedTags.length);
    }
    this.buffer += HTML_START_TAG_STRING.replace(/%0/, tag);
    this.bufferedTags.push(tag);
    if (this.bufferedAttributes.length>0)
    {
        var s = '';
        _.forEach(this.bufferedAttributes, function(attr) {
            //write attribute='value'
            s += HTML_SPACE_CHAR;
            s += HTML_ATTR_STRING.replace(/%0/,attr.name).replace(/%1/, _.escape(attr.value));
        });
        this.buffer += s;
    }
    this.bufferedAttributes.splice(0,this.bufferedAttributes.length);
    this.buffer += HTML_END_CHAR;
    return this;
};
// noinspection JSUnusedGlobalSymbols
/**
 * Writes a full begin HTML tag (e.g <div/>).
 * @param {String} tag
 * @returns {HtmlWriter}
 */
HtmlWriter.prototype.writeFullBeginTag = function(tag) {
    //write <TAG
    if (this.indent)
    {
        this.buffer += '\n';
        this.buffer +=_.repeat('\t', this.bufferedTags.length);
    }
    this.buffer += HTML_START_TAG_STRING.replace(/%0/, tag);
    if (this.bufferedAttributes.length>0)
    {
        var s = '';
        _.forEach(this.bufferedAttributes, function(attr) {
            //write attribute='value'
            s += HTML_SPACE_CHAR;
            s += HTML_ATTR_STRING.replace(/%0/,attr.name).replace(/%1/, _.escape(attr.value));
        });
        this.buffer += s;
    }
    this.bufferedAttributes.splice(0,this.bufferedAttributes.length);
    this.buffer += HTML_FULL_END_STRING;
    return this;
};
// noinspection JSUnusedGlobalSymbols
/**
 * Writes an end HTML tag (e.g </div>) based on the current buffered tags.
 * @returns {HtmlWriter}
 */
HtmlWriter.prototype.writeEndTag = function()
{
    var tagsLength = this.bufferedTags ? this.bufferedTags.length : 0;
    if (tagsLength===0)
        return this;
    if (this.indent)
    {
        this.buffer += '\n';
        this.buffer +=_.repeat('\t', tagsLength-1);
    }
    this.buffer += HTML_END_TAG_STRING.replace(/%0/,this.bufferedTags[tagsLength-1]);
    this.bufferedTags.splice(tagsLength-1,1);
    return this;
};
// noinspection JSUnusedGlobalSymbols
/**
 *
 * @param {String} s
 * @returns {HtmlWriter}
 */
HtmlWriter.prototype.writeText = function(s) {
    if (!s)
        return this;
    if (this.indent)
    {
        this.buffer += '\n';
        this.buffer +=_.repeat('\t', this.bufferedTags.length);
    }
    this.buffer += _.escape(s);
    return this;
};
/**
 *
 * @param {String} s
 * @returns {HtmlWriter}
 */
HtmlWriter.prototype.write = function(s) {
    this.buffer += s;
    return this;
};
/**
 * @returns {String}
 */
HtmlWriter.prototype.toString = function() {
    return this.buffer;
};
// noinspection JSUnusedGlobalSymbols
/**
 * @param {function} fn
 */
HtmlWriter.prototype.writeTo = function(fn)
{
    if (typeof fn === 'function') {
        //call function
        fn(this.buffer);
        //and clear buffer
        this.buffer='';
        //and clear buffered tags
        this.bufferedTags.splice(0,this.bufferedTags.length);
    }
};

if (typeof exports !== 'undefined') {
    module.exports.HtmlWriter = HtmlWriter;
}