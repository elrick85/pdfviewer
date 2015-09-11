/**
 * Created by Zaur_Ismailov on 9/11/2015.
 */
var rp = require("./js/repositoryProvider");
var fs = require("fs");
var _ = require("lodash");
var Q = require("q");
var FileModel = require("./js/Models/FileModel").FileModel;

(function(window, $, kendo) {
    var model = kendo.observable({
        title: "File list",
        actions: [
            { name: "Upload", code: "upload" },
            { name: "Download", code: "download" }
        ]
    });

    var configContent = fs.readFileSync("./config.json");
    var config = $.parseJSON(configContent);

    var promises = _.map(config.paths, function(v) {
        var defer = Q.defer();

        rp.repositoryFile(config.projectId, v.path, config.branch, config.pk, function(err, data) {
            if(err) {
                defer.reject({
                    code: v.code,
                    err: err,
                    data: {}
                });
            } else {
                defer.resolve({
                    code: v.code,
                    err: "",
                    data: data
                });
            }
        });

        return defer.promise;
    });

    Q.allSettled(promises)
        .then(function(results) {
            var files = [];

            results.forEach(function(result) {
                var data = {};

                if(result.state === "fulfilled") {
                    data = result.value;
                } else {
                    data = result.reason;
                }

                files.push(new FileModel(data.code, data.data, data.err));
            });

            return files;
        })
        .then(function(files){
            var tmpl = $("#containerTmpl").html();

            model.set("filesList", files);
            $("#main-view").html(kendo.template(tmpl)(model));
            kendo.bind($("#main-view"), model);
        });

})(window, kendo.jQuery, kendo);