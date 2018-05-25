/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 22-11-2017.
 */
angular.module('MavenApp.appsService', []).factory(
    'appsService', ['httpService', 'MavenAppConfig', '$timeout',
        function (httpService, MavenAppConfig, $timeout) {
            var appsService = {};
            appsService.apps = '';
            /***@description this is used for user authentication (login)*/

            appsService.getUserApps = function (callback) {
                httpService.getRequest(MavenAppConfig.apigatewayauth + "/authservice/webapi/session/apps", function (responseData) {

                    appsService.apps = responseData;
                    callback(appsService.apps);
                });
            }

            appsService.omsClientFirstTimeResp = '';
            appsService.checkOmsClientFirstTime = function (email, callback) {
                httpService.getRequest(MavenAppConfig.apigatewayoms + "/omsservices/webapi/clients/clientfirsttime?email=" + email, function (responseData) {

                    appsService.omsClientFirstTimeResp = responseData;
                    callback(appsService.omsClientFirstTimeResp);
                });
            }

            appsService.omsUserFirstTimeResp = '';
            appsService.checkOmsUserFirstTime = function (email, callback) {
                httpService.getRequest(MavenAppConfig.apigatewayoms + "/omsservices/webapi/omsusers/checkfirsttime?emailId=" + email, function (responseData) {

                    appsService.omsUserFirstTimeResp = responseData;
                    callback(appsService.omsUserFirstTimeResp);
                });
            }


            return appsService;
        }]);
