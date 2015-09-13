/**
 * Created by Zaur_Ismailov on 9/11/2015.
 */
var rp = require("./js/repositoryProvider");
var fs = require("fs");
var _ = require("lodash");
var Q = require("q");

(function (window, $, kendo) {
    var model = kendo.observable({
        title: "File list",
        actions: [
            {name: "Upload", code: "upload"},
            {name: "Download", code: "download"}
        ]
    });

    var configContent = fs.readFileSync("./config.json"),
        config = $.parseJSON(configContent),
        $main = $("#main-view");

    kendo.ui.progress($main, true);

    rp.getList(config.paths, config.projectId, config.branch, config.pk)
        .then(function (files) {
            var tmpl = $("#containerTmpl").html();

            model.set("filesList", files);
            kendo.ui.progress($main, false);

            $main.html(kendo.template(tmpl)(model));
            kendo.bind($main, model);
        });

})(window, kendo.jQuery, kendo);