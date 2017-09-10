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
var Symbol = require('symbol');
var LangUtils = require("./utils").LangUtils;
var Args = require('./utils').Args;
var TraceUtils = require('./utils').TraceUtils;
var PathUtils = require('./utils').PathUtils;
var AbstractClassError = require('./errors').AbstractClassError;

var configProperty = Symbol('config');
var currentConfiguration = Symbol('current');
var configPathProperty = Symbol('configurationPath');
var executionPathProperty = Symbol('executionPath');
var strategiesProperty = Symbol('strategies');
var watchersProperty = Symbol('watchers');

/**
 * @class Represents an application configuration
 * @param {string} configPath
 * @property {*} settings
 * @constructor
 */
function ConfigurationBase(configPath) {
    //init strategies
    this[strategiesProperty] = { };

    this[configPathProperty] = configPath || PathUtils.join(process.cwd(),'config');
    TraceUtils.debug('Initializing configuration under %s.', this[configPathProperty]);

    this[executionPathProperty] = PathUtils.join(this[configPathProperty],'..');
    TraceUtils.debug('Setting execution path under %s.', this[executionPathProperty]);

    //load default module loader strategy
    this.useStrategy(ModuleLoaderStrategy, DefaultModuleLoaderStrategy);

    //get configuration source
    var configSourcePath;
    try {
        var env = 'production';
        //node.js mode
        if (process && process.env) {
            env = process.env['NODE_ENV'] || 'production';
        }
        //browser mode
        else if (window && window.env) {
            env = window.env['BROWSER_ENV'] || 'production';
        }
        configSourcePath = PathUtils.join(this[configPathProperty], 'app.' + env + '.json');
        TraceUtils.debug('Validating environment configuration source on %s.', configSourcePath);
        this[configProperty] = require(configSourcePath);
    }
    catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            TraceUtils.log('The environment specific configuration cannot be found or is inaccesible.');
            try {
                configSourcePath = PathUtils.join(this[configPathProperty], 'app.json');
                TraceUtils.debug('Validating application configuration source on %s.', configSourcePath);
                this[configProperty] = require(configSourcePath);
            }
            catch(err) {
                if (err.code === 'MODULE_NOT_FOUND') {
                    TraceUtils.log('The default application configuration cannot be found or is inaccesible.');
                }
                else {
                    TraceUtils.error('An error occured while trying to open default application configuration.');
                    TraceUtils.error(err);
                }
                TraceUtils.debug('Initializing empty configuration');
                this[configProperty] = { };
            }
        }
        else {
            TraceUtils.error('An error occured while trying to open application configuration.');
            TraceUtils.error(err);
            //load default configuration
            this[configProperty] = { };
        }
    }
    //initialize settings object
    this[configProperty]['settings'] = this[configProperty]['settings'] || { };

    Object.defineProperty(this, 'settings',{ get: function() {
        return this[configProperty]['settings'];
    }, enumerable:true, configurable:false, writable:false});

}
//noinspection JSUnusedGlobalSymbols
/**
 * Returns the configuration source object
 * @returns {*}
 */
ConfigurationBase.prototype.getSource = function() {
    return this[configProperty];
};
//noinspection JSUnusedGlobalSymbols
/**
 * Returns the source configuration object based on the given path (e.g. settings.auth.cookieName or settings/auth/cookieName)
 * @param {string} p - A string which represents an object path
 * @returns {Object|Array}
 */
ConfigurationBase.prototype.getSourceAt = function(p) {
    return _.at(this[configProperty],p.replace(/\//,'.'))[0];
};
//noinspection JSUnusedGlobalSymbols
/**
 * Returns a boolean which indicates whether the specified  object path exists or not (e.g. settings.auth.cookieName or settings/auth/cookieName)
 * @param {string} p - A string which represents an object path
 * @returns {boolean}
 */
ConfigurationBase.prototype.hasSourceAt = function(p) {
    return _.isObject(_.at(this[configProperty],p.replace(/\//,'.'))[0]);
};
//noinspection JSUnusedGlobalSymbols
/**
 * Sets the config value to the specified object path (e.g. settings.auth.cookieName or settings/auth/cookieName)
 * @param {string} p - A string which represents an object path
 * @param {*} value
 * @returns {Object}
 */
ConfigurationBase.prototype.setSourceAt = function(p, value) {
    return _.set(this[configProperty], p, value);
};
//noinspection JSUnusedGlobalSymbols
/**
 * Sets the current execution path
 * @param {string} p
 * @returns ConfigurationBase
 */
ConfigurationBase.prototype.setExecutionPath = function(p) {
    this[executionPathProperty] = p;
    return this;
};

/**
 * Gets the current execution path
 * @returns {string}
 */
ConfigurationBase.prototype.getExecutionPath = function() {
    return this[executionPathProperty];
};

/**
 * Gets the current configuration path
 * @returns {string}
 */
ConfigurationBase.prototype.getConfigurationPath = function() {
    return this[configPathProperty];
};

/**
 * Register a configuration strategy
 * @param {Function} configStrategyCtor
 * @param {Function} strategyCtor
 * @returns ConfigurationBase
 */
ConfigurationBase.prototype.useStrategy = function(configStrategyCtor, strategyCtor) {
    Args.notFunction(configStrategyCtor,"Configuration strategy constructor");
    Args.notFunction(strategyCtor,"Strategy constructor");
    this[strategiesProperty]["$".concat(configStrategyCtor.constructor.name)] = new strategyCtor(this);
    return this;
};
//noinspection JSUnusedGlobalSymbols
/**
 * Gets a configuration strategy
 * @param {Function} configStrategyCtor
 */
ConfigurationBase.prototype.getStrategy = function(configStrategyCtor) {
    Args.notFunction(configStrategyCtor,"Configuration strategy constructor");
    return this[strategiesProperty]["$".concat(configStrategyCtor.constructor.name)];
};

/**
 * Gets a configuration strategy
 * @param {Function} configStrategyCtor
 */
ConfigurationBase.prototype.hasStrategy = function(configStrategyCtor) {
    Args.notFunction(configStrategyCtor,"Configuration strategy constructor");
    return typeof this[strategiesProperty]["$".concat(configStrategyCtor.constructor.name)] !== 'undefined';
};

/**
 * Gets the current configuration
 * @returns ConfigurationBase - An instance of DataConfiguration class which represents the current data configuration
 */
ConfigurationBase.getCurrent = function() {
    if (_.isNil(ConfigurationBase[currentConfiguration])) {
        ConfigurationBase[currentConfiguration] = new ConfigurationBase();
    }
    return ConfigurationBase[currentConfiguration];
};
/**
 * Sets the current configuration
 * @param {ConfigurationBase} configuration
 * @returns ConfigurationBase - An instance of ApplicationConfiguration class which represents the current configuration
 */
ConfigurationBase.setCurrent = function(configuration) {
    if (configuration instanceof ConfigurationBase) {
        if (!configuration.hasStrategy(ModuleLoaderStrategy)) {
            configuration.useStrategy(ModuleLoaderStrategy, DefaultModuleLoaderStrategy);
        }
        ConfigurationBase[currentConfiguration] = configuration;
        return ConfigurationBase[currentConfiguration];
    }
    throw new TypeError('Invalid argument. Expected an instance of DataConfiguration class.');
};

/**
 * @class
 * @param {ConfigurationBase} config
 * @constructor
 * @abstract
 */
function ConfigurationStrategy(config) {
    Args.check(this.constructor.name !== ConfigurationStrategy, new AbstractClassError());
    Args.notNull(config, 'Configuration');
    this[configProperty] = config;
}

/**
 * @returns {ConfigurationBase}
 */
ConfigurationStrategy.prototype.getConfiguration = function() {
    return this[configProperty];
};

/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @extends ConfigurationStrategy
 */
function ModuleLoaderStrategy(config) {
    ModuleLoaderStrategy.super_.bind(this)(config);
}
LangUtils.inherits(ModuleLoaderStrategy, ConfigurationStrategy);

ModuleLoaderStrategy.prototype.require = function(modulePath) {
    Args.notEmpty(modulePath,'Module Path');
    if (!/^.\//i.test(modulePath)) {
        //load module which is not starting with ./
        return require(modulePath);
    }
    return require(PathUtils.join(this.getConfiguration().getExecutionPath(),modulePath));
};

/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @extends ModuleLoaderStrategy
 */
function DefaultModuleLoaderStrategy(config) {
    DefaultModuleLoaderStrategy.super_.bind(this)(config);
}
LangUtils.inherits(DefaultModuleLoaderStrategy, ModuleLoaderStrategy);

/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @extends ModuleLoaderStrategy
 */
function ActiveModuleLoaderStrategy(config) {
    ActiveModuleLoaderStrategy.super_.bind(this)(config);
    this[watchersProperty] = {};
}
LangUtils.inherits(ActiveModuleLoaderStrategy, ModuleLoaderStrategy);
//noinspection JSUnusedGlobalSymbols
/**
 * Returns the collection of active module watchers
 * @returns {*}
 */
ActiveModuleLoaderStrategy.prototype.getWatchers = function() {
    return this[watchersProperty];
};

/**
 * @param {string} modulePath
 * @returns {*}
 */
ActiveModuleLoaderStrategy.prototype.require = function(modulePath) {
    Args.notEmpty(modulePath,'Module Path');
    if (!/^.\//i.test(modulePath)) {
        //load module which is not starting with ./
        return require(modulePath);
    }
    const finalModulePath = PathUtils.join(this.getConfiguration().getExecutionPath(),modulePath);
    //try to load the given module
    const resultModule = require(finalModulePath);
    const resolvedModulePath = require.resolve(finalModulePath);
    if (this[watchersProperty].hasOwnProperty(resolvedModulePath)) {
        return resultModule;
    }
    //load fs module
    const fsModule = 'fs', fs = require(fsModule);
    //add file watcher
    TraceUtils.debug('Registering active module watcher for module %s.', resolvedModulePath);
    this[watchersProperty][resolvedModulePath] = fs.watch(resolvedModulePath, function(eventType, filename){
            TraceUtils.debug('Update active module cache for module %s.', resolvedModulePath);
        delete require.cache[require.resolve(resolvedModulePath)];
    });
    //and finally return the loaded module
    return resultModule;
};


if (typeof exports !== 'undefined') {
    module.exports.ConfigurationBase = ConfigurationBase;
    module.exports.ConfigurationStrategy = ConfigurationStrategy;
    module.exports.ModuleLoaderStrategy = ModuleLoaderStrategy;
    module.exports.DefaultModuleLoaderStrategy = DefaultModuleLoaderStrategy;
    module.exports.ActiveModuleLoaderStrategy = ActiveModuleLoaderStrategy;
}


