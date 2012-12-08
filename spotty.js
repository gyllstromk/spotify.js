/**
 * spotty.js ~ spotify search for the browser/node.
 *
 * == Usage ==
 *
 * ~~ Browser ~~
 *
 * require.js:
 *
 *    <script data-main="/path/to/spotty.js" src="/path/to/require.js"></script>
 *    <script>
 *        require(['spotty'], function(spotty) {
 *            spotty.tracks('doolittle').forEach(function(track) {
 *                console.log(track);
 *            });
 *        });
 *    </script>
 *
 * without require.js
 *
 *    <script src="/path/to/spotty.js" type="text/javascript"></script>
 *    <script>
 *         spotty.tracks('doolittle').forEach(function(track) {
 *             console.log(track);
 *         });
 *    </script>
 */

if (typeof define === 'undefined') {
    // not using requirejs

    if (typeof module !== 'undefined') {
        // in node.js

        define = function(ignore, value) {
            module.exports = value(function(url, callback) {
                require('request')({
                    url: url,
                    json: {}
                }, function(err, resp, body) {
                    callback(null, body);
                });
            });
        };
    } else {
        // imported from browser w/o require.js

        ! jQuery; // throws reference error if jquery not defined

        define = function(ignore, value) {
            spotty = value($); // set spotty as global
        };
    }
}

define(['jquery'], function($) {
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
            // choose our url getter based on whether we're in node or browser
            var urlGetter = typeof module !== 'undefined' ?
                            $ :
                                
                function urlGetter(url, callback) {
                    $.getJSON(url, function(result) {
                        callback(null, result);
                    }).error(function(err) {
                        callback(err || {});
                    });
                };

            var url = 'http://ws.spotify.com/search/1/' + type + '.json?q=' +
                      query + '&page=' + page;

            urlGetter(url, callback);
        };

        this._forEach = function(callback) {
            if (! results) {
                search(type, query, page, function(err, result) {
                    if (err) {
                        throw new Error('could not retrieve results');
                    }

                    meta = result.info;
                    results = result[type + 's'];
                    return self._forEach(callback);
                });
            } else {
                results.forEach(callback);
                if (meta.offset + meta.limit < meta.num_results) {
                    page++;
                    results = null;
                    this.forEach(callback);
                }

                callback(null); // we're done
            }
        };

        this.toArray = function(callback) {
            var array = [];

            this._forEach(function(each) {
                if (each === null) {
                    return callback(null, array);
                }

                array[array.length] = each;
            });
        };
    };

    return {
        albums: function(query, callback) {
            /**
             * Search albums.
             */

            return new ResultIterator('album', query).toArray(callback);
        },

        artists: function(query) {
            /**
             * Search artists.
             */

            return new ResultIterator('artist', query);
        },

        tracks: function(query) {
            /**
             * Search tracks.
             */

            return new ResultIterator('track', query);
        }
    };
});
