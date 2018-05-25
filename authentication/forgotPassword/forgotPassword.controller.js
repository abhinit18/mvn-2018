angular.module('MavenApp.forgotpassword', []).config(function config($stateProvider) {
    $stateProvider.state('/forgotPassword', {
        name: '/forgotPassword',
        url: '/forgotPassword',
        views: {
            "main": {
                controller: 'forgotPasswordController',
                templateUrl: 'authentication/forgotPassword/forgotPassword.view.html'
            }
        },
        data: {pageTitle: 'Forgot Password'}
    })

}).controller ('forgotPasswordController',['$scope', '$http', '$location', '$q','$sce' ,'MavenAppConfig',

function forgotPasswordController($scope, $http, $location, $q,$sce , MavenAppConfig) {

    $scope.onLoad=function() {
        $scope.emailValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.emailValidateWrongStyle = {
            'display': 'none'
        };

    };

    $scope.clearEmailCheck = function() {
        $scope.emailValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.emailValidateWrongStyle = {
            'display': 'none'
        };
        $scope.displayEmailMessage = "";
    };

    $scope.checkEmail = function(email) {
        var q = $q.defer();

        $http.get(MavenAppConfig.apigatewayauth + "/authservice/webapi/signup/checkemail?email=" + email).success(function(data) {
            if (data == true) {
                $scope.emailValidateCorrectStyle = {
                    'display': 'block'
                };
                q.resolve(true);
            } else {
                $scope.emailValidateWrongStyle = {
                    'display': 'block'
                };
                $scope.displayEmailMessage = "Email is not registered";
                q.resolve(false);
            }
        }).error(function(error) {
            console.log("error message");
        });
        return q.promise;
    };

    $scope.resetPassword = function() {
        $scope.displayEmailMessage = "";
        $scope.emailValidateWrongStyle = {
            'display': 'none'
        };
        $scope.emailValidateCorrectStyle = {
            'display': 'none'
        };

        if (!$scope.email) {
            $scope.displayEmailMessage = "Please enter an Email ID";
            $scope.emailValidateWrongStyle = {
                'display': 'block'
            };
            return;
        } else {
            $scope.checkEmail($scope.email).then(
                function(v) {
                    if (v) {
                        $http.get(MavenAppConfig.apigatewayauth + "/authservice/webapi/login/forgotpassword?email=" + $scope.email).success(function(data) {
                            console.log(data);
                            if (data == true) {
                                $scope.forgotlink = true;
                                $scope.linked = true;
                            }
                        }).error(function(error,status) {
                            if(status == 400){
                                $scope.displayEmailMessage = error.errorMessage;
                            }
                            else
                            {
                                $scope.displayEmailMessage = "Failed sending mail";
                            }
                            $scope.emailValidateWrongStyle = {
                                'display': 'block'
                            };
                            $scope.emailValidateCorrectStyle = {
                                'display': 'none'
                            };
                        });
                    }
                },
                function(err) {

                }
            );
        }
    };

    $scope.resendLink = function() {
        $http.get(MavenAppConfig.apigatewayauth + "/authservice/webapi/login/forgotpassword?email=" + $scope.email).success(function(data) {
            console.log(data);
            if (data == true) {
                $scope.forgotlink = true;
                $scope.linked = true;
               $scope.notify("Password change link has been sent again",'success');
            }
        }).error(function(data) {
            console.log(data);
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

//--------------------------------------- circleAdmin ---------------------------------------//