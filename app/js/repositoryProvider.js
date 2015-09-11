/**
 * Created by Zaur_Ismailov on 9/10/2015.
 */
var https = require("https");
var querystring = require('querystring');
var _ = require("lodash");
var fs = require("fs");

var sendRequest = function(options, sendData, callback) {
    options["hostname"] = "git.epam.com";
    options["method"] = options.method || "GET";
    options["headers"] = _.extend({
        "Content-Type": "application/x-www-form-urlencoded"
    }, (options.headers || {}));

    if(typeof sendData === "function"){
        callback = sendData;
    }

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');

        var str = "";
        res.on('data', function(chunk) {
            str += chunk;
        });

        res.on('end', function() {
            var data, err;

            try {
                data = JSON.parse(str);
            }
            catch(e) {
                err = e;
            }

            callback(err, data);
        });
    });

    if(options.method !== "GET") {
        var postData = querystring.stringify(sendData);
        req.write(postData);
    }

    req.on('error', function(e) {
        callback(e, null);
    });

    req.end();
};

var fileToBuffer = function(path){
    var stat = fs.statSync(path);
    var fd = fs.openSync(path, "r");
    var buffer = new Buffer(stat.size);
    var num = fs.readSync(fd, buffer, 0, stat.size, 0);
    return buffer.toString('base64', 0, num);
};

module.exports = {
    projects: function(privateKey, callback) {
        var options = {
            path: "/api/v3/projects",
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        sendRequest(options, callback);
    },

    repositoryTree: function(id, path, privateKey, callback) {
        var options = {
            path: "/api/v3/projects/" + id + "/repository/tree?path=" + path,
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        sendRequest(options, callback);
    },

    repositoryFile: function(id, path, ref, privateKey, callback) {
        var data = {
            ref: ref,
            file_path: path
        };

        var query = querystring.stringify(data);

        var options = {
            path: "/api/v3/projects/" + id + "/repository/files?" + query,
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        sendRequest(options, callback);
    },

    createRepositoryFile: function(id, path, sendData, privateKey, callback) {
        var options = {
            path: "/api/v3/projects/" + id + "/repository/files",
            method: "POST",
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        var content = fileToBuffer(sendData.path);

        var data = {
            file_path: path,
            branch_name: sendData.branch || "master",
            encoding: "base64",
            content: content,
            commit_message: sendData.comment
        };

        sendRequest(options, data, callback);
    },

    updateRepositoryFile: function(id, path, sendData, privateKey, callback) {
        var options = {
            path: "/api/v3/projects/" + id + "/repository/files",
            method: "PUT",
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        var content = fileToBuffer(sendData.path);

        var data = {
            file_path: path,
            branch_name: sendData.branch || "master",
            encoding: "base64",
            content: content,
            commit_message: sendData.comment
        };

        sendRequest(options, data, callback);
    },

    removeRepositoryFile: function(id, path, sendData, privateKey, callback) {
        var options = {
            path: "/api/v3/projects/" + id + "/repository/files",
            method: "DELETE",
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        var data = {
            file_path: path,
            branch_name: sendData.branch || "master",
            commit_message: sendData.comment
        };

        sendRequest(options, data, callback);
    },
};