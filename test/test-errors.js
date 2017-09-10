var _ =require('lodash');
var FileNotFoundError = require('./../errors').FileNotFoundError;
var HttpError = require('./../errors').HttpError;
var assert = require('chai').assert;
var expect = require('chai').expect;
describe('utils unit test', function() {

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