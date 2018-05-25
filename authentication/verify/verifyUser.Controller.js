/**
 * Updated by Prakhar Srivastava. on 01-12-2017.
 */
//please change change as soon as possible.
angular.module('MavenApp.verifyUser', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/verifySuccess', {
        name: '/verifySuccess',
        url: '/verifySuccess',
        views: {
            "main": {
                controller: 'verifyUserController',
                templateUrl: '/authentication/verify/success.html'
            }
        },
        data: {pageTitle: 'verifyUserSuccess'}
    })
        .state('/verifyFail', {
            name: '/verifyFail',
            url: '/verifyFail',
            views: {
                    "main": {
                        controller: 'verifyUserController',
                        templateUrl: '/authentication/verify/failure.html'
                    }
                },
                data: {pageTitle: 'verifyUserFailed'}
            })


}).controller('verifyUserController',['$scope', '$http', '$location','$sce','MavenAppConfig',

function verifyUserController($scope, $http, $location,$sce, MavenAppConfig) {
    $scope.$on('$routeChangeSuccess', function () {
        //        $scope.displayEmail = $location.search().email;
        //$scope.displayEmail = 'abc@example.com';
    });

    console.log($location.search());
    $scope.userEmail = $location.search().email;
    $scope.hashcode = $location.search().hashcode;
    //{{url}}/omsservices/webapi/login/verify?email=abcd&hashcode=abcd

    $scope.UserVerification = function(){
        $scope.loading=false;
        $http({
            method: 'GET',
            url: MavenAppConfig.apigatewayauth+ '/authservice/webapi/login/verify?email='+$scope.userEmail+'&hashcode='+$scope.hashcode
        }).success(function(data){
            console.log(data);
            if(data == true){
                $scope.verifiedsuccess = true;
            }else{
                $scope.verifiedfailed = true;
                $scope.resendlink = false;
                $scope.verifiedsuccess = false;
            }
            $scope.loading = true;
        }).error(function(data){
            console.log(data);
            $scope.errorMessage = data.errorMessage;
            $scope.documentation = data.documentation;
            $scope.verifiedfailed = true;
            $scope.resendlink = false;
            $scope.verifiedsuccess = false;
        });
    }

    $scope.UserVerification();

    $scope.ResendLink = function(){
        $http({
            method: 'GET',
            url: MavenAppConfig.apigatewayauth + '/authservice/webapi/login/resend?email='+$scope.userEmail
        }).success(function(data){
            console.log(data);
            $scope.resendlink = true;
            $scope.verifiedsuccess = false;
            $scope.verifiedfailed = false;
            $scope.loading = true;
        }).error(function(data){
            console.log(data);
            $scope.verifiedfailed = true;
            $scope.resendlink = false;
            $scope.verifiedsuccess = false;
        });
    }

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