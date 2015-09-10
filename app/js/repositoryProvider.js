/**
 * Created by Zaur_Ismailov on 9/10/2015.
 */
var http = require("http");

providers || (providers = {});

providers.repositoryProvider = (function(){
    return {
        projects: function(privateKey){
            var options = {
                hostname: "git.epam.com",
                port: 443,
                path: "/api/v3/projects",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "PRIVATE-TOKEN": privateKey
                }
            };

            var req = http.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                });
                res.on('end', function() {
                    console.log('No more data in response.')
                })
            });

            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });

            req.end();
        }
    }
})();