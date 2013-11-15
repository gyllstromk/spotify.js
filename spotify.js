/**
 * spotify.js ~ spotify search for the browser/node.
 */

(function() {
    if (typeof define === 'undefined') {
        // not using requirejs

        if (typeof module !== 'undefined' && module.exports) {
            // in node.js

            define = function(ignore, value) {
                module.exports = value(require('jquery'));
            };
        } else {
            // imported from browser w/o require.js

            if (typeof jQuery === 'undefined') {
                throw new ReferenceError('jQuery not defined');
            }

            var root = this;
            define = function(ignore, value) {
                root.spotify = value($); // set spotty as global
            };
        }
    }

    define(['jquery'], function($) {
        var Throttler = function(perSecond) {
            /**
             * Throttles requests at 10 per second.
             */

            var self = this,
                accesses = [],
                second = 1000;

            this.throttle = function(callback) {
                var now = Date.now();
                while (accesses.length > 0) {
                    if (now - accesses[0] <= second) {
                        break;
                    } 

                    accesses.shift();
                }

                if (accesses.length >= perSecond) {
                    setTimeout(function() {
                        self.throttle(callback);
                    }, second - (now - accesses[0]));
                    return;
                }

                accesses[accesses.length] = now;
                callback();
            };
        };

        var throttler = new Throttler(10, 1000);

        var ResultIterator = function(type, query) {
            /**
             * Allows full iteration over result lists, even if result list spans
             * multiple calls due to 100 limit.
             */

            var self = this;
            var results;
            var page = 1;
            var meta;

            var search = function(type, query, page, callback) {
                throttler.throttle(function() {
                    $.getJSON('http://ws.spotify.com/search/1/' + type, {
                        q: query,
                        page: page
                    }, function(result) {
                        callback(null, result);
                    }).error(function(err) {
                        callback(err || {});
                    });
                });
            };

            this.slice = function (start, end, callback) {
                var i = 0;
                this.forEach(function (each) {
                    if (i >= start) {
                        callback(each);
                    }

                    i += 1;
                    if (i === end) {
                        callback(null);
                        return false;
                    }
                });
            };

            this.forEach = function(callback) {
                /**
                 * Stream results; receive null on end of stream.
                 */

                if (! results) {
                    search(type, query, page, function(err, result) {
                        if (err) {
                            throw new Error('could not retrieve results');
                        }

                        meta = result.info;
                        results = result[type + 's'];
                        return self.forEach(callback);
                    });
                } else {
                    for (var i = 0, ii = results.length; i < ii; i++) {
                        if (callback(results[i]) === false) {
                            return;
                        }
                    }

                    if (meta.offset + meta.limit < meta.num_results) {
                        page++;
                        results = null;
                        this.forEach(callback);
                    } else {
                        callback(null); // we're done
                    }
                }
            };

            this.toArray = function(callback) {
                var array = [];

                this.forEach(function(each) {
                    if (each === null) {
                        return callback(null, array);
                    }

                    array[array.length] = each;
                });
            };
        };

        function getIterator(type, query, callback) {
            var iter = new ResultIterator(type, query);

            if (callback) {
                iter.toArray(callback);
            } else {
                return iter;
            }
        }

        return {
            albums: function(query, callback) {
                /**
                 * Search albums.
                 */

                return getIterator('album', query, callback);
            },

            artists: function(query, callback) {
                /**
                 * Search artists.
                 */

                return getIterator('artist', query, callback);
            },

            tracks: function(query, callback) {
                /**
                 * Search tracks.
                 */

                return getIterator('track', query, callback);
            }
        };
    });
})();
