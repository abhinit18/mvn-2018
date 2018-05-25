/*** @author Prakhar */
angular.module('MavenApp.authenticationService', []).factory(
    'authenticationService',['httpService','MavenAppConfig','$timeout',
        function(httpService,MavenAppConfig,$timeout) {
            var authenticationService = {};
            authenticationService.userData='';
            authenticationService.isNotLoginBefore='';
            authenticationService.userDetail='';
            authenticationService.menuData='';
            authenticationService.isVerified='';
            /***@description this is used for user authentication (login)*/

            authenticationService.login = function(data,callback) {
                authenticationService.userData='';

                httpService.postRequest(MavenAppConfig.apigatewayauth +"/authservice/webapi/login/authenticate",data, function(responseData){
                  authenticationService.userData=responseData;
                  callback(authenticationService.userData);
                });

            };

            authenticationService.isNotFirstTimeLogin = function(callback) {
                httpService.getRequest(MavenAppConfig.apigatewayoms +"/omsservices/webapi/clientprofiles/clientfirsttime", function(responseData){

                    authenticationService.isNotLoginBefore=responseData;
                    callback(authenticationService.isNotLoginBefore);
                });
            };
            authenticationService.getUserRole=function (callback) {
                httpService.getRequest(MavenAppConfig.apigatewayoms +"/omsservices/webapi/omsusers/omsusergroup", function(responseData){

                    authenticationService.userDetail=responseData;
                    callback(authenticationService.isNotLoginBefore);
                });
            }
          authenticationService.getMenuData=function (callback) {
                httpService.getRequest(MavenAppConfig.apigatewayoms +"/omsservices/webapi/omsusers/menu",function(responseData)
                {
                    if(responseData.status && responseData.status == 500)
                    {
                        callback(undefined);
                    }
                    else {

                        authenticationService.menuData = responseData;
                        callback(authenticationService.menuData);
                    }
                });
            }

        /*    authenticationService.isVerifiedEmail=function (email,callback) {
                httpService.getRequest(MavenAppConfig.apigatewayauth +"/authservice/webapi/signup/checkemail?email=" + email,function(responseData){

                    authenticationService.isVerified=responseData;
                    callback(authenticationService.isVerified);
                });
            }*/


            return authenticationService;
        }]);
