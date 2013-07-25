var assert = require('assert'),
    async = require('async');

assert.namesEqual = function(results, expected) {
    this.deepEqual(results.map(function(each) {
        return each.name;
    }), expected);
};

describe('Album search', function() {
    var spotty = require('../../spotify.js');

    var query = 'pixies doolittle';
    var expectedAlbums = [ 'Doolittle', 'Pixies\' Doolittle Tribute' ];

    require('./nock/albums');
    require('./nock/artists');
    require('nock').disableNetConnect();

    it('Correct albums in array results', function(done) {
        spotty.albums(query, function(err, results) {
            assert.namesEqual(results, expectedAlbums);
            done(err);
        });
    });

    it('Correct artists in array results', function(done) {
        spotty.artists(query, function(err, results) {
            assert.deepEqual(results, []);
            done(err);
        });
    });

    it('Correct tracks in array results', function(done) {
        var expectedTracks = require('./nock/tracks');

        spotty.tracks('doolittle').forEach(function(each) {
            if (each === null) {
                return done();
            }

            assert.equal(each.name, expectedTracks[0]);
            expectedTracks.shift();
        });
    });

    it('Correct albums in forEach results', function(done) {
        var expected = expectedAlbums.slice(0);

        spotty.albums(query).forEach(function(result) {
            if (result === null) {
                done();
            } else {
                assert.equal(result.name, expected[0]);
                expected.shift();
            }
        });
    });

    it('forEach breaks on return false', function(done) {
        spotty.albums(query).forEach(function(result) {
            assert.equal(result.name, expectedAlbums[0]);
            done();
            return false;
        });
    });

    describe('slice', function () {
        it('0 to 1', function (done) {
            var first = true;
            spotty.albums(query).slice(0, 1, function(result) {
                if (first) {
                    first = false;
                    assert.equal(result.name, expectedAlbums[0]);
                } else {
                    assert.equal(result, null);
                    done();
                }
            });
        });

        it('1 to 2', function (done) {
            var first = true;
            spotty.albums(query).slice(1, 2, function(result) {
                if (first) {
                    first = false;
                    assert.equal(result.name, expectedAlbums[1]);
                } else {
                    assert.equal(result, null);
                    done();
                }
            });
        });

        it('0 to 2', function (done) {
            var index = 0;
            spotty.albums(query).slice(0, 2, function(result) {
                if (index < 2) {
                    assert.equal(result.name, expectedAlbums[index]);
                    index += 1;
                } else {
                    assert.equal(result, null);
                    done();
                }
            });
        });
    });

    it('Requests are throttled', function(done) {
        var before = Date.now();
        async.forEach([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], function(each, callback) {
            spotty.albums(query, function(err, results) {
                assert.equal(results.length, 2);
                callback();
            });
        }, function(err) {
            assert(Math.abs((Date.now() - before) - 2000) < 10);
            done();
        });
    });
});
