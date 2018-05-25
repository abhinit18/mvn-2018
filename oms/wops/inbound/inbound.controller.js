/**
 * Updated by Prakhar Srivastava. on 01-12-2017.
 */
angular.module('OMSApp.inbound', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/inbound/', {
        name: '/inbound/',
        url: '/inbound/',
        views: {
            "main": {
                controller: 'inbound',
                templateUrl: 'wops/inbound/inbound.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'inBound'}
    })

}).controller('inbound',['$scope','$window', '$http', '$location','$mdDialog',

function inbound($scope,$window, $http, $location, $mdDialog) {

    $scope.setActiveTab = function (tab) {
        $scope.activeTab = tab;
    }
    if($window.localStorage.getItem("inboundTab") !== null){
        var tab = $window.localStorage.getItem("inboundTab");
        $scope.setActiveTab(tab);
    }
    else {
        $scope.activeTab = 'tab1';
    }

    $scope.activateTab = function (tab) {
        $window.localStorage.setItem('inboundTab',tab);
    }
    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('inboundTab');
    });
}]);
