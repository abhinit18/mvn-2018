/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 24-11-2017.
 */
angular.module('OMSApp.skuService', []).factory(
    'skuService',['httpService','MavenAppConfig','$timeout',
        function(httpService,MavenAppConfig,$timeout) {
            var skuService = {};
            skuService.uploadFileToUrl = function(file, uploadUrl) {
                var fd = new FormData();
                fd.append('uploadFile', file);
                httpService.postRequestFileUpload(uploadUrl, fd, function () {

                });
            };
            return skuService;
        }]);
