/*** @author Prakhar */

angular
    .module(
        'MavenApp',
        ['ui.router', 'ngStorage', 'ngMaterial', 'ngCookies', 'MavenApp.httpService', 'MavenApp.custom-directve',
            'MavenApp.validationService', 'MavenApp.config', 'MavenApp.authentication',
            'MavenApp.forgotpassword', 'MavenApp.forgotpasswordsuccess', 'MavenApp.signup',
            'MavenApp.signupsucess', 'MavenApp.resetPassword', 'MavenApp.header', 'MavenApp.headerService',
            'MavenApp.authenticationService', 'MavenApp.apps',
            'MavenApp.appsService', 'MavenApp.verifyUser'])

    .config(
        function config($stateProvider, $urlRouterProvider, $httpProvider,
                        $provide) {
            $urlRouterProvider.otherwise('/login');
            $httpProvider.defaults.withCredentials = true;

            $provide.decorator('$exceptionHandler', function ($delegate) {

                return function (exception, cause) {
                    $delegate(exception, cause);
                    $('[data-notify="container"]').remove();
                    $.notify('Error occurred! Please contact admin.', {
                        type: 'danger',
                        placement: {align: "center"},
                        z_index: 1500
                    });
                };
            });
        })
    .run(
        function run($http) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

        })
    .filter('escape', function () {
        return window.escape;
    })

    .controller(
        'MavenAppCtrl',
        ['$rootScope',
            '$scope',
            '$state',
            'MavenAppConfig', 'headerService',
            function ($rootScope, $scope, $state,
                      MavenAppConfig, headerService) {
                $scope.pageTitle = MavenAppConfig.APP_NAME;
                $rootScope.menu = [];
                $scope.goTo = function (path) {
                    $state.go(path);

                }
                $scope.notify = function (msg, type, postion, icon) {
                    if (msg == null || msg == undefined) {
                        msg = 'An unknown error occurred.';
                        type = "danger";
                    }
                    if (type == null || type == undefined) {
                        type = 'danger';
                    }
                    if (postion == null || postion == undefined) {
                        postion = 'center';
                    }

                    if (icon == null || icon == undefined) {
                        switch (type) {
                            case 'success':
                                icon = 'glyphicon glyphicon-ok';
                                break;
                            case 'warning':
                                icon = 'glyphicon glyphicon-warning-sign';
                                break;
                            case 'danger':
                                icon = 'glyphicon glyphicon-exclamation-sign';
                                break;
                            case 'info':
                                icon = 'glyphicon glyphicon-info-sign';
                                break;
                        }
                    }
                    $('[data-notify="container"]').remove();
                    $.notify({icon: icon, message: msg}, {type: type, placement: {align: postion}, z_index: 1500});
                }

                $scope.isUserLogin = function () {
                    headerService.isSessionExpired(function (data) {
                        if (data.status == 401) {
                            $scope.notify('Your session is expired now ,We are redirecting you on login page', 'danger');
                            setTimeout(function () {
                                window.location = window.location.origin + "/#/login";
                            }, 4000)
                        }

                    })

                }

                /*speed test*/
                /*@author
                 * Prakhar Srivastava*/
                /*this code will be removed when find it on angular*/
                $scope.MeasureConnectionSpeed = function () {
                    var imageAddr = "https://s3-us-west-2.amazonaws.com/glmetadata/images/generic/sku_icon.svg";
                    var downloadSize = 3651; //bytes
                    var startTime, endTime;
                    var download = new Image();
                    startTime = (new Date()).getTime();
                    var cacheBuster = "?nnn=" + startTime;
                    download.src = imageAddr + cacheBuster;
                    download.onload = function () {
                        endTime = (new Date()).getTime();
                        var duration = (endTime - startTime) / 1000;
                        var bitsLoaded = downloadSize * 8;
                        var speedBps = (bitsLoaded / duration).toFixed(2);
                        var speedKbps = (speedBps / 1024).toFixed(2);
                        var speedMbps = (speedKbps / 1024).toFixed(2);
                        if (speedKbps < 10) {
                            console.log(
                                "Your connection speed is:",
                                speedBps + " bps",
                                speedKbps + " kbps",
                                speedMbps + " Mbps"
                            );
                            $scope.notify("Internet connection is too slow.", 'warning');
                        }

                    }

                }


                setInterval(function () {
                    if (!navigator.onLine) {
                        $scope.notify("Your device is not connected to internet.");
                        return;
                    }
                    $scope.MeasureConnectionSpeed();
                }, 10000);
                /*speed test end*/

            }]);
