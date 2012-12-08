# Spotify.js: Spotify search in the browser and node.

## Getting started (browser)

Use with either requirejs or raw include.

### Requirejs

Jquery is required, so use the `require-jquery` approach:

```html
<script data-main="/path/to/spotty.js" src="/path/to/require-jquery.js"></script>
<script>
  require(['spotty'], function(spotty) {
    spotty.albums('doolittle', function(err, albums) {
       console.log(albums);
    });
  });
</script>
```

### Simple script include (requires jQuery)

```html
<script src="jquery.min.js" type="text/javascript"></script>
<script src="/path/to/spotty.js" type="text/javascript"></script>
<script type="text/javascript">
    spotty.albums('doolittle', function(err, albums) {
       console.log(albums);
    });
</script>
```

## Node

```js
    var spotify = require('spotify.js');

    spotty.albums(query, function(err, albums) {
        console.log(albums);
    });
```
