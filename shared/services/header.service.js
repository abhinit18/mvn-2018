/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 22-11-2017.
 */
angular.module('MavenApp.headerService', []).factory(
    'headerService', ['httpService', 'MavenAppConfig', '$timeout',
        function (httpService, MavenAppConfig, $timeout) {
            var headerService = {};
            headerService.menuData = '';
            headerService.logoutData = '';
            headerService.isSession = '';
            headerService.clientData='';
            /***@description this is used for user authentication (login)*/

            headerService.getMenuData = function (callback)
            {
                httpService.getRequest(MavenAppConfig.apigatewayoms + "/omsservices/webapi/omsusers/menu", function (responseData)
                {
                    if(responseData.status && responseData.status == 500)
                    {
                        callback(undefined);
                    }
                    else
                    {
                        headerService.menuData = responseData;
                        callback(headerService.menuData);
                    }
                });
            }

            headerService.logoutUser = function (callback) {
                httpService.postRequest(MavenAppConfig.apigatewayauth + '/authservice/webapi/session/logout', '', function (responseData) {
                    headerService.logoutData = responseData;
                    callback(headerService.logoutData);
                })

            }

            headerService.isSessionExpired = function (callback) {
                httpService.getRequest(MavenAppConfig.apigatewayauth + '/authservice/webapi/session?app=OMS', function (responseData) {
                headerService.isSession=responseData;
                    callback(headerService.isSession);
                });

            }
            headerService.getClientData = function (callback) {
                httpService.getRequest(MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles", function (responseData) {
                    headerService.clientData=responseData;
                    callback(headerService.clientData);
                });

            }

            return headerService;
        }]);
