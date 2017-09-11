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

var _utils  = require('./utils');
var _errors  = require('./errors');
var _emitter  = require('./emitter');
var _config  = require('./config');
var _html  = require('./html');

if (typeof exports !== 'undefined') {

    module.exports.ArgumentError  = _utils.ArgumentError;
    module.exports.Args  = _utils.Args;
    module.exports.UnknownPropertyDescriptor  = _utils.UnknownPropertyDescriptor;
    module.exports.LangUtils  = _utils.LangUtils;
    module.exports.NumberUtils  = _utils.NumberUtils;
    module.exports.RandomUtils  = _utils.RandomUtils;
    module.exports.TraceUtils  = _utils.TraceUtils;
    module.exports.TextUtils  = _utils.TextUtils;
    module.exports.PathUtils  = _utils.PathUtils;
    
    module.exports.AbstractMethodError  = _errors.AbstractMethodError;
    module.exports.AbstractClassError  = _errors.AbstractClassError;
    module.exports.FileNotFoundError  = _errors.FileNotFoundError;
    module.exports.HttpError  = _errors.HttpError;
    module.exports.HttpBadRequestError  = _errors.HttpBadRequestError;
    module.exports.HttpNotFoundError  = _errors.HttpNotFoundError;
    module.exports.HttpMethodNotAllowedError  = _errors.HttpMethodNotAllowedError;
    module.exports.HttpUnauthorizedError  = _errors.HttpUnauthorizedError;
    module.exports.HttpForbiddenError  = _errors.HttpForbiddenError;
    module.exports.HttpServerError  = _errors.HttpServerError;
    module.exports.DataError  = _errors.DataError;
    module.exports.DataNotFoundError  = _errors.DataNotFoundError;
    module.exports.DataNotNullError  = _errors.DataNotNullError;
    module.exports.DataAccessDeniedError  = _errors.DataAccessDeniedError;
    module.exports.DataUniqueConstraintError  = _errors.DataUniqueConstraintError;

    module.exports.SequentialEventEmitter  = _emitter.SequentialEventEmitter;

    module.exports.HtmlWriter  = _html.HtmlWriter;

    module.exports.ConfigurationBase  = _config.ConfigurationBase;
    module.exports.ConfigurationStrategy  = _config.ConfigurationStrategy;
    module.exports.ModuleLoaderStrategy  = _config.ModuleLoaderStrategy;
    module.exports.DefaultModuleLoaderStrategy  = _config.DefaultModuleLoaderStrategy;
    module.exports.ActiveModuleLoaderStrategy  = _config.ActiveModuleLoaderStrategy;
    
}
