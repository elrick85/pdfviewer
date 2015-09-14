/**
 * Created by Zaur_Ismailov on 9/14/2015.
 */

module.exports = function($, kendo){
    return kendo.data.Model.define({
        showUpload: function(e){
            e.preventDefault();

            var model = {
                code: this.code
            };

            var winCont = $("<div></div>");
            var html = kendo.template($("#uploadTmpl").html())(model);

            winCont.html(html);

            var win = winCont.kendoWindow({
                animation: false,
                appendTo: "body",
                modal: true,
                resizable: false,
                width: 500,
                height: 300
            }).data("kendoWindow");

            win.center().open();

            $(window).on("resize", function(){
                win.center();
            });
        },

        showExport: function(e){
            e.preventDefault();
        }
    });
};