var assert = require('assert'),
    async = require('async');

assert.namesEqual = function(results, expected) {
    this.deepEqual(results.map(function(each) {
        return each.name;
    }), expected);
};

describe('Album search', function() {
    var spotty = require('../spotify.js');

    var query = 'pixies doolittle';
    var expectedAlbums = [ 'Doolittle', 'Pixies\' Doolittle Tribute' ];
    var expectedTracks = [ 'Here Comes Your Man', 'Debaser',
                           'Wave Of Mutilation', 'Hey', 'La La Love You',
                           'Monkey Gone To Heaven', 'Tame', 'I Bleed',
                           'Gouge Away', 'Mr. Grieves', 'Dead', 'No 13 Baby',
                           'Crackity Jones', 'There Goes My Gun', 'Silver',
                           'Hey', 'Wave of Mutilation', 'Here Comes Your Man',
                           'Crackity Jones', 'Debaser', 'Tame', 'I Bleed',
                           'Mr. Grieves', 'Monkey Gone to Heaven', 'Silver',
                           'Gouge Away', 'Dead', 'La La Love You',
                           'No. 13 Baby', 'There Goes My Gun' ];

    it('Correct albums in array results', function(done) {
        require('./nock/albums')();
        spotty.albums(query, function(err, results) {
            assert.namesEqual(results, expectedAlbums);
            done(err);
        });
    });

    it('Correct artists in array results', function(done) {
        require('./nock/artists');

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
        require('./nock/albums')();

        spotty.albums(query).forEach(function(result) {
            if (result === null) {
                done();
            } else {
                assert.equal(result.name, expectedAlbums[0]);
                expectedAlbums.shift();
            }
        });
    });

    it('Requests are throttled', function(done) {
        var before = Date.now();
        async.forEach([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], function(each, callback) {
            require('./nock/albums')();
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
