var assert = require('chai').assert;
var ConfigurationBase = require('./../config').ConfigurationBase;
describe('test configuration', function() {
    it('should load configuration', function(done) {
        var config = new ConfigurationBase("./config");
        assert.isOk(config.hasSourceAt("settings/setting1"),"Expected string setting");
        return done();
    });
});