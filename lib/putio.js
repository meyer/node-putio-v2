'use strict';

var https = require('https');
var urlLib = require('url');
var invariant = require('invariant');
var path = require('path');

var putioAPIPrefix = 'https://api.put.io/v2/';

function putioAPIRequest(apiToken, method, apiPath, query, callback) {
  if (typeof query == 'function') {
    callback = query;
    query = {};
  }

  callback = callback || function () {};
  query = query || {};

  var body = null;

  if (method === 'POST') {
    body = urlLib.format({ query: query }).substr(1);
    query = {};
  }

  query.oauth_token = apiToken;

  var parsedURL = urlLib.parse(path.join(putioAPIPrefix, apiPath));

  parsedURL.method = method;
  parsedURL.path += urlLib.format({ query: query });
  parsedURL.headers = {
    Accept: 'application/json'
  };

  if (body) {
    parsedURL.headers['Content-Length'] = body.length;
    parsedURL.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
  }

  var req = https.putioAPIRequest(parsedURL, function (res) {
    var data = '';

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function () {
      var jsonResults = undefined;

      try {
        jsonResults = JSON.parse(data);
        callback(jsonResults);
      } catch (e) {
        console.log('Got some weird data back:', data);
      }
    });
  });

  if (body) {
    req.write(body + '\n\n');
  }

  req.end();
}

function putioGET(path, query, callback) {
  putioAPIRequest('GET', path, query, callback);
}

function putioPOST(path, query, callback) {
  putioAPIRequest('POST', path, query, callback);
}

function PutIO(token) {
  apiToken = token;

  this.files = {
    list: function list(parent_id, callback) {
      parent_id = parent_id || 0;
      putioGET('files/list', { parent_id: parent_id }, callback);
    },

    search: function search(query, page, callback) {
      invariant(query, 'Missing query parameter');
      page = page || 1;

      putioGET('files/search/' + encodeURIComponent(query) + '/page/' + page, callback);
    },

    createFolder: function createFolder(name, parent_id, callback) {
      invariant(name, 'Missing name parameter');
      parent_id = parent_id || 0;

      putioPOST('files/create-folder', { parent_id: parent_id, name: name }, callback);
    },

    get: function get(id, callback) {
      invariant(id, 'Missing id parameter');
      putioGET('files/' + id, callback);
    },

    delete: function _delete(file_ids, callback) {
      invariant(file_ids, 'Missing file_ids parameter');
      file_ids = [].concat(file_ids).join(',');

      putioPOST('files/delete', { file_ids: file_ids }, callback);
    },

    rename: function rename(file_id, name, callback) {
      invariant(file_id, 'Missing file_id parameter');
      invariant(name, 'Missing name parameter');

      putioPOST('files/rename', { file_id: file_id, name: name }, callback);
    },

    move: function move(file_ids, parent_id, callback) {
      invariant(file_ids, 'Missing file_ids parameter');
      invariant(parent_id, 'Missing parent_id parameter');

      file_ids = [].concat(file_ids).join(',');

      putioPOST('files/move', { file_ids: file_ids, parent_id: parent_id }, callback);
    },

    make_mp4: function make_mp4(id, callback) {
      invariant(id, 'Missing id parameter');
      putioPOST('files/' + id + '/mp4', callback);
    },

    get_mp4: function get_mp4(id, callback) {
      invariant(id, 'Missing id parameter');
      putioGET('files/' + id + '/mp4', callback);
    },

    download: function download(id) {
      invariant(id, 'Missing id parameter');
      return path.join(putioAPIPrefix, 'files', id, 'download?oauth_token=' + apiToken);
    }
  };

  this.transfers = {
    list: function list(callback) {
      putioGET('transfers/list', callback);
    },

    add: function add(url, save_parent_id, extract, callback) {
      invariant(url, 'Missing url parameter');
      save_parent_id = save_parent_id || 0;
      extract = extract || false;

      putioPOST('transfers/add', { url: url, save_parent_id: save_parent_id, extract: extract }, callback);
    },

    get: function get(id, callback) {
      invariant(id, 'Missing id parameter');

      putioGET('transfers/' + id, callback);
    },

    cancel: function cancel(transfer_ids, callback) {
      invariant(transfer_ids, 'Missing transfer_ids parameter');
      transfer_ids = [].concat(transfer_ids).join(',');
      putioPOST('transfers/cancel', { transfer_ids: transfer_ids }, callback);
    }
  };

  this.friends = {
    list: function list(callback) {
      putioGET('friends/list', callback);
    },

    waitingRequests: function waitingRequests(callback) {
      putioGET('friends/waiting-requests', callback);
    },

    request: function request(username, callback) {
      invariant(username, 'Missing username parameter');
      putioPOST('friends/' + encodeURIComponent(username) + '/request', callback);
    },

    deny: function deny(username, callback) {
      invariant(username, 'Missing username parameter');
      putioPOST('friends/' + encodeURIComponent(username) + '/deny', callback);
    }
  };
}

module.exports = PutIO;