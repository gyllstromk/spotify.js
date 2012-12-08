require('nock')('http://ws.spotify.com:80')
  .get('/search/1/artist.json?q=pixies%20doolittle&page=1')
  .reply(200, "{\"info\": {\"num_results\": 0, \"limit\": 100, \"offset\": 0, \"query\": \"pixies doolittle\", \"type\": \"artist\", \"page\": 1}, \"artists\": []}");
