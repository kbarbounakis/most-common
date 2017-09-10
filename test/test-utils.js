var _ =require('lodash');
var Args = require('./../utils').Args;
var ArgumentError = require('./../utils').ArgumentError;
var FileNotFoundError = require('./../errors').FileNotFoundError;
var HttpError = require('./../errors').HttpError;
var assert = require('chai').assert;
var expect = require('chai').expect;
describe('utils unit test', function() {
    it('should use Args.notEmpty()', function(done) {
        var nullMessage = 'Value may not be null';
        expect(function() {
            Args.notEmpty('a','Value');
        }).to.not.throw();
        expect(function() {
            Args.notEmpty(null,'Value');
        }).to.throw(nullMessage);
        expect(function() {
            Args.notEmpty(undefined,'Value');
        }).to.throw(nullMessage);
        var emptyMessage = 'Value may not be empty';
        expect(function() {
            Args.notEmpty('','Value');
        }).to.throw(emptyMessage);
        expect(function() {
            Args.notEmpty(['a'],'Value');
        }).to.not.throw();
        expect(function() {
            Args.notEmpty([],'Value');
        }).to.throw(emptyMessage);
        return done();
    });

    it('should use Args.notString()', function(done) {
        expect(function() {
            Args.notString("a","Value");
        }).to.not.throw();
        expect(function() {
            Args.notString( { a:2 },"Value");
        }).to.throw("Value must be a string");
        return done();
    });

    it('should use Args.notFunction()', function(done) {
        expect(function() {
            Args.notFunction(function x() { return 1; },"Parameter");
        }).to.not.throw();
        expect(function() {
            Args.notFunction( { a:2 },"Parameter");
        }).to.throw("Parameter must be a function");
        return done();
    });

    it('should use Args.notNull()', function(done) {
        expect(function() {
            Args.notNull("a","Parameter");
        }).to.not.throw();
        expect(function() {
            Args.notNull( undefined,"Parameter");
        }).to.throw("Parameter may not be null or undefined");
        expect(function() {
            Args.notNull( null,"Parameter");
        }).to.throw("Parameter may not be null or undefined");
        return done();
    });

    it('should use Args.notNumber()', function(done) {
        expect(function() {
            Args.notNumber(5.4,"Parameter");
        }).to.not.throw();
        expect(function() {
            Args.notNumber(undefined,"Parameter");
        }).to.throw("Parameter must be number");
        expect(function() {
            Args.notNumber(NaN,"Parameter");
        }).to.throw("Parameter must be number");
        return done();
    });

    it('should use Args.notNegative()', function(done) {
        expect(function() {
            Args.notNegative(5.4,"Parameter");
        }).to.not.throw();
        expect(function() {
            Args.notNegative(-0.1,"Parameter");
        }).to.throw("Parameter may not be negative");
        expect(function() {
            Args.notNegative(NaN,"Parameter");
        }).to.throw("Parameter must be number");
        return done();
    });

    it('should use Args.positive()', function(done) {
        expect(function() {
            Args.positive(5.4,"Parameter");
        }).to.not.throw();
        expect(function() {
            Args.positive(-0.1,"Parameter");
        }).to.throw("Parameter may not be negative or zero");
        expect(function() {
            Args.positive(0,"Parameter");
        }).to.throw("Parameter may not be negative or zero");
        expect(function() {
            Args.positive(NaN,"Parameter");
        }).to.throw("Parameter must be number");
        return done();
    });

    it('should use Args.check()', function(done) {
        expect(function() {
            Args.check(/^Hello/.test("Goodnight Peter!"),"Parameter must be starts with 'Hello'");
        }).to.throw();
        expect(function() {
            Args.check(/^Hello/.test("Hello Peter"),"Parameter must be starts with 'Hello'");
        }).to.not.throw();
        expect(function() {
            Args.check(function() {
                return false;
            },"Expression failed");
        }).to.throw();
        expect(function() {
            Args.check(function() {
                return false;
            },new Error("Expression failed"));
        }).to.throw();
        expect(function() {
            Args.check(function() {
                return false;
            },new ArgumentError("Expression failed", "EEXPR"));
        }).to.throw();
        return done();
    });

    it('should raise FileNotFoundError', function (done) {
        expect(function() {
          throw new FileNotFoundError("File not Found");
        }).to.throw();
        var err = new FileNotFoundError();
        expect(err instanceof Error).to.equal(true,'FileNotFoundError must be a subclass of Error class');
        expect(err instanceof FileNotFoundError).to.equal(true,'err must be an instance of FileNotFoundError');
        expect(err.code).to.equal("EFOUND");
       return done();
    });

    it('should raise HttpError', function (done) {
        expect(function() {
            throw new HttpError(403);
        }).to.throw();
        var err = new HttpError(403);
        expect(err.status).to.equal(403);
        expect(err.title).to.equal("Forbidden");
        expect(err.message).to.equal("The server understood the request, but is refusing to fulfill it.");
        expect(err.code).to.equal("EHTTP");
        return done();
    });

});