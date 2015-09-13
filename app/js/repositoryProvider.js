/**
 * Created by Zaur_Ismailov on 9/10/2015.
 */
var https = require("https");
var querystring = require('querystring');
var _ = require("lodash");
var fs = require("fs");
var Q = require("q");
var FileModel = require("./Models/FileModel").FileModel;
var CommitModel = require("./Models/CommitModel").CommitModel;
var UserModel = require("./Models/UserModel").UserModel;

var sendRequest = function (options, sendData, callback) {
    options["hostname"] = "git.epam.com";
    options["method"] = options.method || "GET";
    options["headers"] = _.extend({
        "Content-Type": "application/x-www-form-urlencoded"
    }, (options.headers || {}));

    if (typeof sendData === "function") {
        callback = sendData;
    }

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');

        var str = "";
        res.on('data', function (chunk) {
            str += chunk;
        });

        res.on('end', function () {
            var data, err;

            try {
                data = JSON.parse(str);
            }
            catch (e) {
                err = e;
            }

            callback(err, data);
        });
    });

    if (options.method !== "GET") {
        var postData = querystring.stringify(sendData);
        req.write(postData);
    }

    req.on('error', function (e) {
        callback(e, null);
    });

    req.end();
};

var fileToBuffer = function (path) {
    var stat = fs.statSync(path);
    var fd = fs.openSync(path, "r");
    var buffer = new Buffer(stat.size);
    var num = fs.readSync(fd, buffer, 0, stat.size, 0);
    return buffer.toString('base64', 0, num);
};

module.exports = {
    repositoryFile: function (id, path, ref, privateKey, callback) {
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

    createRepositoryFile: function (id, path, sendData, privateKey, callback) {
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

    updateRepositoryFile: function (id, path, sendData, privateKey, callback) {
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

    removeRepositoryFile: function (id, path, sendData, privateKey, callback) {
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

    commitInfo: function (id, sha, privateKey) {
        var options = {
            path: "/api/v3/projects/" + id + "/repository/commits/" + sha,
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        var defer = Q.defer();

        sendRequest(options, function (err, data) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(new CommitModel(data));
            }
        });

        return defer.promise;
    },

    members: function (id, privateKey) {
        var options = {
            path: "/api/v3/projects/" + id + "/members",
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        var defer = Q.defer();

        sendRequest(options, function (err, data) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(data);
            }
        });

        return defer.promise;

    },

    user: function (id, userId, privateKey) {
        var options = {
            path: "/api/v3/users/" + userId,
            headers: {
                "PRIVATE-TOKEN": privateKey
            }
        };

        var defer = Q.defer();

        sendRequest(options, function (err, data) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(new UserModel(data));
            }
        });

        return defer.promise;
    },

    userInfo: function (id, user_name, privateKey) {
        return this.members(id, privateKey)
            .then(function(data){
                return _.find(data, 'name', user_name);
            });
        /*
         var defer = Q.defer();

         sendRequest(options, function(err, data){
         if(err){
         defer.reject(err);
         } else {
         defer.resolve(new CommitModel(data));
         }
         });

         return defer.promise;*/
    },

    getList: function(paths, projectId, branch, privateKey){
        var that = this;

        var promises = _.map(paths, function (v) {
            var defer = Q.defer();

            that.repositoryFile(projectId, v.path, branch, privateKey, function (err, data) {
                if (err) {
                    defer.reject({
                        code: v.code,
                        err: err,
                        data: {}
                    });
                } else {
                    that.commitInfo(projectId, data.commit_id, privateKey)
                        .then(function (commit) {
                            return [commit, that.userInfo(projectId, commit.author_name, privateKey)];
                        })
                        .spread(function(commit, userInfo){
                            defer.resolve({
                                code: v.code,
                                err: "",
                                data: {
                                    file: data,
                                    commit: commit,
                                    user: userInfo
                                }
                            });
                        })
                        .fail(function (err) {
                            defer.reject({
                                code: v.code,
                                err: err,
                                data: {}
                            });
                        });
                }
            });

            return defer.promise;
        });

        return Q.allSettled(promises)
            .then(function (results) {
                var files = [];

                results.forEach(function (result) {
                    var data = {};

                    if (result.state === "fulfilled") {
                        data = result.value;
                    } else {
                        data = result.reason;
                    }

                    files.push(new FileModel(data.code, data.data, data.err));
                });

                return files;
            })
    }
};