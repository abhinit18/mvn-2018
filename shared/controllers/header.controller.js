/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 22-11-2017.
 */
angular.module('MavenApp.header', [ ]).config(function config($stateProvider) {
/* $stateProvider.state('/', {
        name: '/',
        url: '/',
        views: {
            "main": {
                controller: 'dashboardCtrl',
                templateUrl: '/oms/dashboard/dashboard.newview.html'
            },
            "header":{
                controler:'headerCtrl',
                templateUrl:'/shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Dashboard'}
    })*/

}).controller('headerCtrl', ['$rootScope','$scope', '$cookies', '$http','$state', '$localStorage','headerService', '$location','MavenAppConfig',
    function ($rootScope,$scope, $cookies,$http, $state, $localStorage,headerService, $location,MavenAppConfig) {

        $scope.isClicked = [];
        $scope.userNavData = $cookies.get("username");
        $scope.menu=[];
  /*Start headerCtrl*/
        /*Get Menu*/
        $scope.onLoad=function () {
            $scope.createMenu();
            if($rootScope.clientprofile.length==0){
            $scope.getClientProfile();
            }
        }

        $scope.$on('menuChanged', function(event, obj) {
            headerService.getMenuData(function (data)
            {
                console.log(data);
                if (data) {
                    $scope.menu = data;
                    $localStorage.menu=data;
                    if($rootScope.clientprofile.tableClientProfilePricingModel == 1){
                        $scope.isPricing = true;
                    }else{
                        $scope.isPricing = false;
                    }
                }
            });
        });


$scope.createMenu=function(){

    if($scope.menuData.length>0) {

       $scope.menu=$scope.menuData;
    }else{
        headerService.getMenuData(function (data)
        {
            console.log(data);
            if (data) {
                $scope.menu = data;
                $localStorage.menu=data;

            }
        });
    }
    $scope.isActive = function (path) {
        if(path.href){
            return $location.path() === path.href;
        }
        else if(path.subMenu){
            var found = false;
            path.subMenu.forEach(function (v) {
                if($location.path() === v.href){
                    found = true;
                }
            });
            return found;
        }

    }

        }

        $scope.logout = function() {
           var leftUrl = "/authservice/webapi/session/logout";
            $http({
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                data:{},
                url: MavenAppConfig.apigatewayauth + leftUrl
            }).success(function(res) {
                console.log(res);
                localStorage.clear();
                $cookies.put('isLoggedIn', false);
                window.location=window.location.origin+"/#/login";

            }).error(function(error) {
                console.log(error)
            });

  /*use it when we return something from backend*/
 /* headerService.logoutUser(function (data) {
debugger
window.location='/localhost/login';
  });*/
        }

        $scope.showHideDropdown = function(index) {
            if($scope.isClicked[index] == undefined || $scope.isClicked[index] == false){
                $scope.isClicked = [];
                $scope.isClicked[index] = true;
            }
            else{
                $scope.isClicked = [];
                $scope.isClicked[index] = false;
            }
        };

        $scope.hideDropdown = function(index) {
            $scope.isClicked[index] = false;
        };

        $(window).on("click.Bst", function(event){      
            if ($(".dropdown").has(event.target).length == 0 && !$(".dropdown").is(event.target)){
                $scope.isClicked = [];
                $scope.$digest();
            }
        });

  /*end headerCtrl*/



        $scope.getClientProfile = function()
        {
            headerService.getClientData(function (data) {

                if (data.length > 0)
                {
                    $rootScope.clientprofile = data[0];
                    if($rootScope.clientprofile.tableClientProfilePricingModel == 1){
                        $scope.isPricing = true;
                    }else{
                        $scope.isPricing = false;
                    }

                }
            })
        }

        !$rootScope.clientprofile || !$rootScope.clientprofile.idtableClientProfileId?$scope.getClientProfile():null;

    }]);

