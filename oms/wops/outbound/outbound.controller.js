/**
 * Updated by Prakhar Srivastava.  on 01-12-2016.
 */
angular.module('OMSApp.outbound', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/outbound/', {
        name: '/outbound/',
        url: '/outbound/',
        views: {
            "main": {
                controller: 'outbound',
                templateUrl: 'wops/outbound/outbound.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'outbound'}
    })

}).controller('outbound', ['$scope','$window', '$location',

function outbound($scope,$window, $location) {
    console.log('outbound controller found');
    $scope.setActiveTab = function (tab) {
        $scope.activeTab = tab;
    }
    if($window.localStorage.getItem("outboundTab") !== null){
        var tab = $window.localStorage.getItem("outboundTab");
        $scope.setActiveTab(tab);
    }
    else {
        $scope.activeTab = 'tab1';
    }

    $scope.activateTab = function (tab) {
        console.log('found');
        $window.localStorage.setItem('outboundTab',tab);
    }
    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('outboundTab');
    });
}]);
