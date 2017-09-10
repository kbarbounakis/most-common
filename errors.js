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
var LangUtils = require("./utils").LangUtils;
var _ = require('lodash');
var errors = require('./resources/http-error-codes.json');
/**
 * @classdesc Thrown when an application tries to call an abstract method.
 * @class
 * @param {string=} msg
 * @constructor
 * @extends Error
 */
function AbstractMethodError(msg) {
    AbstractMethodError.super_.bind(this)(msg);
    this.message = msg || 'Class does not implement inherited abstract method.';
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
    }
}
LangUtils.inherits(AbstractMethodError, Error);

/**
 * @classdesc Thrown when an application tries to instantiate an abstract class.
 * @class
 * @param {string=} msg
 * @constructor
 * @extends Error
 */
function AbstractClassError(msg) {
    AbstractClassError.super_.bind(this)(msg);
    this.message = msg || 'An abstract class cannot be instantiated.';
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
    }
}
LangUtils.inherits(AbstractClassError, Error);

/**
 * @classdesc Represents an error with a code.
 * @class
 * @param {string} msg
 * @param {string} code
 * @constructor
 * @extends Error
 */
function CodedError(msg, code) {
    CodedError.super_.bind(this)(msg);
    this.message = msg;
    this.code = code;
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
    }
}
LangUtils.inherits(CodedError, Error);

/**
 * @classdesc Thrown when an application tries to access a file which does not exist.
 * @class
 * @param {string=} msg
 * @constructor
 * @extends CodedError
 */
function FileNotFoundError(msg) {
    FileNotFoundError.super_.bind(this)(msg, "EFOUND");
}
LangUtils.inherits(FileNotFoundError, CodedError);

/**
 * @classdesc Represents an HTTP error.
 * @class
 * @param {number} status
 * @param {string=} message
 * @param {string=} innerMessage
 * @constructor
 * @extends CodedError
 */
function HttpError(status, message, innerMessage) {
    HttpError.super_.bind(this)(message, "EHTTP");
    var hstatus = _.isNumber(status) ? status : 500;
    const err = _.find(errors, function(x) {
        return x.status === hstatus;
    });
    if (err) {
        this.title = err.title;
        this.message = message || err.message;
        this.status = err.status;
    }
    else {
        this.title = 'Internal Server Error';
        this.message = message || 'The server encountered an internal error and was unable to complete the request.';
        this.status = hstatus
    }
    if (typeof innerMessage !== 'undefined') {
        this.innerMessage = innerMessage;
    }
}
LangUtils.inherits(HttpError, CodedError);

/**
 * @classdesc Represents a 400 HTTP Bad Request error.
 * @class
 * @param {string=} message
 * @param {string=} innerMessage
 * @constructor
 * @extends HttpError
 */
function HttpBadRequestError(message, innerMessage) {
    HttpBadRequestError.super_.bind(this)(400, message, innerMessage);
}
LangUtils.inherits(HttpBadRequestError, HttpError);

/**
 * @classdesc Represents a 404 HTTP Not Found error.
 * @class
 * @param {string=} message
 * @param {string=} innerMessage
 * @constructor
 * @extends HttpError
 */
function HttpNotFoundError(message, innerMessage) {
    HttpNotFoundError.super_.bind(this)(404, message, innerMessage);
}
LangUtils.inherits(HttpNotFoundError, HttpError);

/**
 * @classdesc Represents a 405 HTTP Method Not Allowed error.
 * @class
 * @param {string=} message
 * @param {string=} innerMessage
 * @constructor
 * @extends HttpError
 */
function HttpMethodNotAllowedError(message, innerMessage) {
    HttpMethodNotAllowedError.super_.bind(this)(405, message, innerMessage);
}
LangUtils.inherits(HttpMethodNotAllowedError, HttpError);

/**
 * @classdesc Represents a 401 HTTP Unauthorized error.
 * @class
 * @param {string=} message
 * @param {string=} innerMessage
 * @constructor
 * @extends HttpError
 */
function HttpUnauthorizedError(message, innerMessage) {
    HttpUnauthorizedError.super_.bind(this)(401, message, innerMessage);
}
LangUtils.inherits(HttpUnauthorizedError, HttpError);

/**
 * @classdesc Represents a 403 HTTP Forbidden error.
 * @class
 * @param {string=} message
 * @param {string=} innerMessage
 * @constructor
 * @extends HttpError
 */
function HttpForbiddenError(message, innerMessage) {
    HttpForbiddenError.super_.bind(this)(403, message, innerMessage);
}
LangUtils.inherits(HttpForbiddenError, HttpError);

/**
 * @classdesc Represents a 500 HTTP Internal Server error.
 * @class
 * @param {string=} message
 * @param {string=} innerMessage
 * @constructor
 * @extends HttpError
 */
function HttpServerError(message, innerMessage) {
    HttpServerError.super_.bind(this)(500, message, innerMessage);
}
LangUtils.inherits(HttpServerError, HttpError);

/**
 * @classdesc Extends Error object for throwing exceptions on data operations
 * @class
 * @param {string=} code - A string that represents an error code
 * @param {string=} message - The error message
 * @param {string=} innerMessage - The error inner message
 * @param {string=} model - The target model
 * @param {string=} field - The target field
 * @param {*} additionalData - Additional data associated with this error
 * @constructor
 * @property {string} code - A string that represents an error code e.g. EDATA
 * @property {string} message -  The error message.
 * @property {string} innerMessage - The error inner message.
 * @property {number} status - A number that represents an error status. This error status may be used for throwing the approriate HTTP error.
 * @property {*} additionalData - Additional data associated with this error
 * @augments CodedError
 */
function DataError(code, message, innerMessage, model, field, additionalData) {
    DataError.super_.bind(this)(message, code);
    this.code  = code || 'EDATA';
    if (typeof model !== 'undefined') {
        this.model = model;
    }
    if (typeof field !== 'undefined') {
        this.field = field;
    }
    this.message = message || 'A general data error occured.';
    if (typeof innerMessage !== 'undefined') {
        this.innerMessage = innerMessage;
    }
    this.additionalData = additionalData;
}
LangUtils.inherits(DataError, CodedError);

/**
 * Thrown when an application attempts to access a data object that cannot be found.
 * @param {string=} message - The error message
 * @param {string=} innerMessage - The error inner message
 * @param {string=} model - The target model
 * @constructor
 * @extends DataError
 */
function DataNotFoundError(message, innerMessage, model) {
    DataNotFoundError.super_.bind(this)('EFOUND', message || 'The requested data was not found.', innerMessage, model);
}
LangUtils.inherits(DataNotFoundError, DataError);

/**
 * Thrown when an application attempts to use null in a case where an object is required.
 * @param {string=} message - The error message
 * @param {string=} innerMessage - The error inner message
 * @param {string=} model - The target model
 * @param {string=} field - The target field
 * @param {*=} additionalData - Additional data associated with this error
 * @constructor
 * @extends DataError
 */
function DataNotNullError(message, innerMessage, model, field, additionalData) {
    DataNotNullError.super_.bind(this)('ENULL', message || 'A value is required', innerMessage, model, field, additionalData);
}
LangUtils.inherits(DataNotNullError, DataError);

/**
 * Thrown when a data object operation is denied
 * @param {string=} message - The error message
 * @param {string=} innerMessage - The error inner message
 * @param {string=} model - The target model
 * @constructor
 * @extends DataError
 */
function DataAccessDeniedError(message, innerMessage, model) {
    DataAccessDeniedError.super_.bind(this)('EACCESS', ('Access Denied' || message) , innerMessage, model);
}
LangUtils.inherits(DataAccessDeniedError, DataError);

/**
 * Thrown when a unique constraint is being violated
 * @param {string=} message - The error message
 * @param {string=} innerMessage - The error inner message
 * @param {string=} model - The target model
 * @constructor
 * @extends DataError
 */
function DataUniqueConstraintError(message, innerMessage, model) {
    DataUniqueConstraintError.super_.bind(this)('EUNQ', message || 'A unique constraint violated', innerMessage, model);
}
LangUtils.inherits(DataUniqueConstraintError, DataError);

if (typeof exports !== 'undefined') {
    module.exports.AbstractMethodError = AbstractMethodError;
    module.exports.AbstractClassError = AbstractClassError;
    module.exports.FileNotFoundError = FileNotFoundError;
    module.exports.HttpError = HttpError;
    module.exports.HttpBadRequestError = HttpBadRequestError;
    module.exports.HttpNotFoundError = HttpNotFoundError;
    module.exports.HttpMethodNotAllowedError = HttpMethodNotAllowedError;
    module.exports.HttpUnauthorizedError = HttpUnauthorizedError;
    module.exports.HttpForbiddenError = HttpForbiddenError;
    module.exports.HttpServerError = HttpServerError;
    module.exports.DataError = DataError;
    module.exports.DataNotFoundError = DataNotFoundError;
    module.exports.DataNotNullError = DataNotNullError;
    module.exports.DataAccessDeniedError = DataAccessDeniedError;
    module.exports.DataUniqueConstraintError = DataUniqueConstraintError;
}