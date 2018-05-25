angular.module('MavenApp.forgotpasswordsuccess', []).config(function config($stateProvider) {
    $stateProvider.state('/forgotPasswordSuccess', {
        name: '/forgotPasswordSuccess',
        url: '/forgotPasswordSuccess',
        views: {
            "main": {
                controller: 'forgotPwdSuccessController',
                templateUrl: 'authentication/forgotPassword/forgotPasswordSuccess/forgotPasswordSuccess.view.html'
            }
        },
        data: {pageTitle: 'Forgot Password Success'}
    })
    }).controller('forgotPwdSuccessController', ['$scope', '$http', '$location',

function forgotPwdSuccessController($scope, $http, $location) {
    $scope.$on('$routeChangeSuccess', function () {
//        $scope.displayEmail = $location.search().email;
        $scope.displayEmail = 'abc@example.com';
    });
}]);