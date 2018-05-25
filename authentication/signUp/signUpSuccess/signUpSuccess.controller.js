angular.module('MavenApp.signupsucess', []).config(function config($stateProvider) {
    $stateProvider.state('/signUpSuccess', {
        name: '/signUpSuccess',
        url: '/signUpSuccess',
        views: {
            "main": {
                controller: 'signUpSuccessController',
                templateUrl: 'authentication/signUp/signUpSuccess/signUpSuccess.view.html'
            }
        },
        data: {pageTitle: 'Sign Up Success'}
    })

}).controller ('signUpSuccessController',['$scope', '$http', '$location','$sce',

function signUpSuccessController($scope, $http, $location,$sce) {
    //============================================ terms and conditions modal as well as Privacy pollicy =========== //
    $scope.OpenTnC = function(){
        $('#TnC').modal('show');
        var termsnConditions = "https://s3.ap-south-1.amazonaws.com/glmetadata1/pdf/Maven+Terms+of+Service.pdf#page=1&zoom=100";
        $scope.TnC = $sce.trustAsResourceUrl(termsnConditions);
    };
    $scope.PrivacyModal = function(){
        $('#privacy').modal('show');
        var privacyPolicyUrl = "https://s3.ap-south-1.amazonaws.com/glmetadata1/pdf/MavenPrivacy+Policy.pdf#page=1&zoom=100";
        $scope.privacyPolicy = $sce.trustAsResourceUrl(privacyPolicyUrl);
    };


}]);