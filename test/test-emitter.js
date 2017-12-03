var SequentialEventEmitter = require('./../emitter').SequentialEventEmitter;
var LangUtils = require('./../utils').LangUtils;
describe('test sequential event emitter', function() {

    function MyEmitter() {
        MyEmitter.super_.bind(this)();
    }
    LangUtils.inherits(MyEmitter,SequentialEventEmitter);

    it('should use sequenial events', function(done) {

        var emitter = new MyEmitter();
        emitter.on('event', function(args, cb) {
            setTimeout(function() {
// eslint-disable-next-line no-console
                console.log('event #1');
                return cb();
            },2000);

        });

        emitter.once('event', function(args, cb) {
// eslint-disable-next-line no-console
            console.log('event once #1');
            return cb();
        });

        emitter.on('event', function(args, cb) {
// eslint-disable-next-line no-console
            console.log('event #2');
            return cb();
        });


        emitter.emit('event', null, function() {
            // eslint-disable-next-line no-console
            console.log('end');
            return done();
        });


    });

});