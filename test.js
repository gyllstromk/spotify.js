describe('Test suite', function() {
    var spotty = require('./spotty');

    it('Has albums', function(done) {
        spotty.albums('doolittle', function(err, results) {
            console.log(results);
            done(err);
        });
    });
});
