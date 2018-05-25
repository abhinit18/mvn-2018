/*** @author Prakhar */

angular
    .module(
        'OmsApp',
        ['ui.router', 'ngStorage', 'ngMaterial', 'ngCookies', 'angucomplete-alt', 'ngAnimate', 'angular-loading-bar',
            'angucomplete-alt-long', 'ngFileUpload', 'MavenApp.httpService', 'ngSanitize', 'ngStepwise',
            'MavenApp.config', 'nvd3', 'infinite-scroll', 'ngSanitize', 'ui.bootstrap', 'ui.sortable', 'ngCsvImport', 'rzModule', 'ui.select',
            'OMSApp.dashboard', 'MavenApp.header', 'MavenApp.pagerService',
            'MavenApp.headerService', 'OMSApp.analytics', 'OMSApp.customer',
            'OMSApp.mastersService', 'customerbaseController', 'OMSApp.sku',
            'OMSApp.skuService', 'MavenApp.file-model-directve', 'OMSApp.discount',
            'OMSApp.onfile-change-directve', 'OMSApp.categorybase', 'OMSApp.category',
            'OMSApp.vendor', 'OMSApp.po', 'OMSApp.uniqueOrderDirective', 'OMSApp.order', 'OMSApp.ordernumberservice',
            'OMSApp.uniqueOrderDirective', 'OMSApp.directinward', 'OMSApp.salereturn', 'OMSApp.saleReturnOrderNumberService',
            'OMSApp.uniqueSalereturnDirective', 'OMSApp.purchaseReturn', 'OMSApp.purchaseReturnOrderDirective',
            'OMSApp.purchaseReturnOrderNumberService', 'OMSApp.returnableGoods', 'OMSApp.returnableGoodsService',
            'OMSApp.returnableGoodsDirective', 'OMSApp.inventory', 'OMSApp.inventoryPassbook',
            'OMSApp.stockTransfer', 'OMSApp.STorderNumberService', 'OMSApp.stocktranferDirective', 'OMSApp.bulkuploads'
            , 'OMSApp.export', 'OMSApp.inbound', 'MavenApp.filter', 'OMSApp.outbound', 'OMSApp.wopsinventory', 'OMSApp.tally', 'OMSApp.taxation',
            'OMSApp.clientprofile', 'OMSApp.saleschannels', 'OMSApp.useradmin', 'OMSApp.warehouses', 'OMSApp.shippingpartners', 'do-calculate', 'OMSApp.templates', 'OMSApp.vas'])

    .config(
        function config($stateProvider, $urlRouterProvider, $httpProvider, $provide) {
            //$urlRouterProvider.otherwise('/Dashboard/');
            $httpProvider.defaults.withCredentials = true;
            // ----------------for unauthenticated user---------------------
            $httpProvider.interceptors.push('userUnautorizationHandler');

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
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            $http.defaults.headers.put['Content-Type'] = 'application/json';


        })
    .filter('escape', function () {
        return window.escape;
    })
    // ----------------for unauthenticated user---------------------
    .factory('userUnautorizationHandler', ['$q', '$rootScope', '$timeout', function($q, $rootScope, $timeout) {
        return {
            response: function(response) {
                return response;
            },
            responseError: function(rejection) {
                if(rejection.status === 401)window.location=window.location.origin+"/#/login";
                else if(rejection.status === 403){
                    $.notify('You are not authorized to use this feature!', {
                        type: 'danger',
                        placement: {align: "center"},
                        z_index: 1500
                    });
                }else{
                    return $q.reject(rejection);
                }
            }
        };
    }])

    .controller(
        'OmsAppCtrl',
        ['$rootScope',
            '$scope',
            '$state', 'headerService', '$cookies', '$timeout', '$http', 'MavenAppConfig', '$localStorage',
            function ($rootScope, $scope, $state, headerService, $cookies, $timeout, $http, MavenAppConfig, $localStorage)
            {
                $scope.menuData = [];
                if ($localStorage.pagename != null && $localStorage.pagename != undefined)
                    $scope.pagename = $localStorage.pagename;
                else
                    $scope.pagename = '';

                $rootScope.clientprofile = [];
                headerService.getMenuData(function (data) {
                    $scope.menuData = data;
                    $localStorage.menu = data;
                    if ($scope.menuData.length > 0) {
                        $scope.defineAccess(window.location.hash.slice(1));
                    }

                });
                $scope.currentUrl = "";
                $scope.goTo = function (path, evnt) {
                    $scope.currentUrl = path;
                    $scope.defineAccess(path);
                    if (evnt) {
                        if (evnt.ctrlKey) {
                            window.open("#" + path);
                        }
                        else {
                            $state.go(path);
                        }
                    }

                }
                $scope.access = {
                    'createAccess': false,
                    'deleteAccess': false,
                    'editAccess': false,
                    'readAccess': false
                };
                var isNext = true;
                $scope.defineAccess = function (href) {
                    var isNext = true;
                    angular.forEach($scope.menuData, function (value, key) {
                        if (isNext) {
                            if (value.subMenu) {
                                angular.forEach(value.subMenu, function (value, key) {
                                    if (isNext) {
                                        if (value.href == href) {
                                            $localStorage.pagename = value.name;
                                            $scope.pagename = value.name;

                                            $scope.access = {
                                                'createAccess': value.createAccess,
                                                'deleteAccess': value.deleteAccess,
                                                'editAccess': value.editAccess,
                                                'readAccess': value.readAccess
                                            };
                                            isNext = false;
                                        }
                                    }
                                });
                            }
                            else if (value.href == href) {
                                $scope.pagename = value.name;
                                $localStorage.pagename = value.name;
                                $scope.access = {
                                    'createAccess': value.createAccess,
                                    'deleteAccess': value.deleteAccess,
                                    'editAccess': value.editAccess,
                                    'readAccess': value.readAccess
                                };
                                isNext = false;
                            }
                        }

                    });
                    return !isNext;
                }

                $scope.initOmsUser = function () {
                    $http.get(MavenAppConfig.apigatewayoms + "/omsservices/webapi/omsusers/omsusergroup")
                        .success(function (data, status, headers)
                        {
                            if (data.tableOmsUserGroupName == 'ROLE_VENDOR') {
                                localStorage.setItem('isvendor', true);
                                localStorage.setItem('vendorid', headers()['vendorid']);
                            }
                            else {
                                localStorage.setItem('isvendor', false);
                            }
                            if (data.tableOmsUserGroupName == 'ROLE_ADMIN') {
                                localStorage.setItem('isadmin', true);
                            }
                            else {
                                localStorage.setItem('isadmin', false);
                            }
                        }).error(function (error, status) {
                        console.log("error occured to get user role")
                    });
                }

                $scope.notify = function (msg, type, postion, icon, delay) {
                    if (msg == null || msg == undefined || msg == '') {
                        msg = 'An unknown error occurred.';
                        type = "danger";
                    }
                    if (type == null || type == undefined || type == '') {
                        type = 'danger';
                    }
                    if (postion == null || postion == undefined || postion == '') {
                        postion = 'center';
                    }
                    if (delay == null || delay == undefined || delay == '') {
                        delay = 5000;
                    }

                    if (icon == null || icon == undefined || icon == '') {
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
                    $.notify({icon: icon, message: msg}, {
                        type: type,
                        placement: {align: postion},
                        z_index: 1500,
                        delay: delay
                    });
                }

                $scope.show = false;

                $scope.showHideCalculator = function () {

                    if ($scope.show) {

                        $scope.show = !$scope.show
                    }
                    else {
                        $scope.show = !$scope.show;
                    }
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

                setInterval(function () {
                    $scope.isUserLogin();
                }, 3000000);

                /*Client profile*/
                headerService.getClientData(function (data) {

                    if (data.length > 0) {
                        $rootScope.clientprofile = data[0];
                    }
                })

                $scope.initOmsUser();


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

