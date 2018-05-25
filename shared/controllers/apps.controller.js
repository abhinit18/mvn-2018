/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 22-11-2017.
 */
angular.module('MavenApp.apps', []).config(function config($stateProvider) {
    $stateProvider.state('/apps', {
        name: '/apps',
        url: '/apps',
        views: {
            "main": {
                controller: 'appsCtrl',
                templateUrl: 'shared/templates/apps.html'
            }
        },
        data: {pageTitle: 'Apps'}
    })

}).controller('appsCtrl', ['$rootScope','$scope', '$cookies', '$state', '$localStorage', 'appsService', '$location', 'headerService',
    function ($rootScope,$scope, $cookies, $state, $localStorage, appsService, validationService, $location, headerService) {
        $scope.isUserLogin();
        $scope.userclientapps = [];


        $scope.getAppsByUser = function () {
            appsService.getUserApps(function (data)
            {
                $scope.userclientapps = data;
                if ($scope.userclientapps.length == 1)
                {
                    if($rootScope.menu != undefined) {
                        if ($rootScope.menu[0].href != undefined) {
                            window.location = $scope.userclientapps[0].app.name.toLowerCase() + "/#" + $rootScope.menu[0].href;
                        }
                        else {
                            window.location = $scope.userclientapps[0].app.name.toLowerCase() + "/#" + $rootScope.menu[0].subMenu[0].href;
                        }
                    }
                }
            })

        }
        setInterval(function () {

            $scope.isUserLogin();
        }, 15000);

        $scope.checkOmsClientFirstTime = function (email) {

            appsService.checkOmsClientFirstTime(email,function (data) {
                $scope.omsClientFirstTime = data;

                console.log(data);
            })


        }

        $scope.checkOmsUserFirstTime = function (email) {

            appsService.checkOmsUserFirstTime(email,function (data) {
                $scope.omsUserFirstTime = data;
                console.log(data);
            })
        }

        $scope.goTo = function (href) {


            if (href.indexOf("oms") !== -1) {
                $scope.checkOmsClientFirstTime($cookies.get('useremail'));
                $scope.checkOmsUserFirstTime($cookies.get('useremail'));
            }

            if($rootScope.menu != undefined)
            {
                if ($rootScope.menu[0].href != undefined) {
                    window.location = $scope.userclientapps[0].app.name.toLowerCase() + "/#" + $rootScope.menu[0].href;
                }
                else {
                    window.location = $scope.userclientapps[0].app.name.toLowerCase() + "/#" + $rootScope.menu[0].subMenu[0].href;

                }
            }
        }


    }]);