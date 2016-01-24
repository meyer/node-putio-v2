# node-putio-v2

## what

```js
var PutIO = require('node-putio-v2');

var putioAPI = new PutIO(oauth_token);

putioAPI.files.list(0, function(data){
  for (var i in data.files){
    console.log(data.files[i].name);
  }
});

putioAPI.transfers.add('http://superfancytorrentsite.com/legal-torrents/the-entire-internet.torrent');
```

Everything with the exception of `files.download` is asynchronous. Callbacks are optional. Any pluralised parameter accepts both single values and arrays.

## Available API Methods

### Files

```js
  api.files.list(parent_id=0, callback);
  api.files.search(query, page=1, callback);
  api.files.createFolder(name, parent_id=0, callback);
  api.files.get(id, callback);
  api.files.delete(file_ids, callback);
  api.files.rename(file_id, name, callback);
  api.files.move(file_ids, parent_id=0, callback);
  api.files.make_mp4(id, callback);
  api.files.get_mp4(id, callback);
  api.files.download(id);
```

### Transfers

```js
  api.transfers.list(callback);
  api.transfers.add(url, parent_id=0, extract=false, callback);
  api.transfers.get(id, callback);
  api.transfers.cancel(transfer_ids, callback);
```
### Friends

```js
api.friends.list(callback);
api.friends.waitingRequests(callback);
api.friends.request(username, callback);
api.friends.deny(username, callback);
```