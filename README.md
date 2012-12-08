# Spotify.js: Spotify search in the browser and node.

Spotify search capabilities with the following features:

 1.  Operate in the browser or node
 2.  Throttle requests as per the Spotify terms of service
 3.  Automatically traverse multi-page results
 4.  Tested in [...]

```js
spotify.artists('pixies', function(err, artists) {
    console.log('Artists results:', artists);

    spotify.albums('Doolittle', function(err, albums) {
        console.log('Album results:', albums);

        spotify.tracks('Debaser', function(err, tracks) {
            console.log('Track results:', tracks);
        });
    });
});

// Or, stream results as they arrive ...

spotify.tracks('love').forEach(function(track) {
    if (track === null) {
        // finished
    } else {
        console.log('Track result:', track);
    }
});
```

## Getting started (browser)

Use with either [requirejs](http://requirejs.org/) or raw include.

### Requirejs

jQuery is required, so use the [require-jquery](http://requirejs.org/docs/jquery.html) approach:

```html
<script data-main="/path/to/spotify.js" src="/path/to/require-jquery.js"></script>
<script>
  require(['spotify'], function(spotify) {
    spotify.albums('doolittle', function(err, albums) {
       console.log(albums);
    });
  });
</script>
```

### Simple script include (requires jQuery)

```html
<script src="jquery.min.js" type="text/javascript"></script>
<script src="/path/to/spotify.js" type="text/javascript"></script>
<script type="text/javascript">
    spotify.albums('doolittle', function(err, albums) {
       console.log(albums);
    });
</script>
```

## Node

```js
var spotify = require('spotify.js');

spotify.albums(query, function(err, albums) {
    console.log(albums);
});
```
