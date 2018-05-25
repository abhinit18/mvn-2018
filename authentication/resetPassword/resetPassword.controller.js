angular.module('MavenApp.resetPassword', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/resetpassword', {
        name: '/resetpassword',
        url: '/resetpassword',
        views: {
            "main": {
                controller: 'resetPasswordController',
                templateUrl: '/authentication/resetPassword/resetPassword.view.html'
            }
        },
        data: {pageTitle: 'resetPassword'}
    })

}).controller('resetPasswordController', ['$scope', '$http', '$location', 'MavenAppConfig','$sce' ,

function resetPasswordController($scope, $http, $location,MavenAppConfig ,$sce) {

    var PasswordPattern = new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,14}$");

    $scope.reset = true;

    $scope.FPwdValidateStyle = {
        'display': 'none'
    };
    $scope.helpIcon = false;
    $scope.displayFPwdMessage = "";

    $scope.RemoveCheckMessage = function(){
        $scope.MismatchPassword = false;
    };
    $scope.checkCPwd = function() {

        var pwd = $scope.pwd;
        var cPwd = $scope.cPwd;
        $scope.clearCPwdCheck();

        if (pwd != cPwd) {
            $scope.MismatchPassword = true;
            $scope.cPwdValidateStyle = {
                'display': 'block'
            };
            return false;
        }
        return true;
    };


    $scope.clearFPwdCheck = function () {
        $scope.displayFPwdMessage = "";
        $scope.FPwdValidateStyle = {

            'display': 'none'
        };
        $scope.helpIcon = false;
    };

    $scope.checkFPwd = function() {

        if($scope.pwd == null || $scope.pwd == undefined || $scope.pwd == "")
        {
            return;
        }

        var pwd = $scope.pwd;
        $scope.clearFPwdCheck();

        var matched = PasswordPattern.test(pwd);
        if(matched == false)
        {
            $scope.FPwdValidateStyle = {
                'display': 'block'
            };
            $scope.helpIcon = true;
            $scope.displayFPwdMessage = 'Password must be at least 8 characters long and should contain one letter,one character and one special character';
            return false;
        }
        else
        {
            $scope.FPwdValidateStyle = {
                'display': 'none'
            };
            $scope.displayFPwdMessage = "";
        }

        return true;
    };

    $scope.clearCPwdCheck = function() {
        $scope.displayCPwdMessage = "";
        $scope.cPwdValidateStyle = {
            'display': 'none'
        };
    };

    $scope.userEmail = $location.search().email;
    $scope.hash = $location.search().hashcode;
    $scope.reset = false;
    $scope.resetsuccess = false;

    $scope.resetPass = function() {
        if ($scope.checkFPwd()) {
            if ($scope.checkCPwd()) {
                var data={
                    email:$scope.userEmail,
                    newpassword:$scope.pwd,
                    hashcode:$scope.hash
                }
                $http({
                    method: 'PUT',
                    url:MavenAppConfig.apigatewayauth + '/authservice/webapi/login/resetpwd',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(data) {
                    console.log(data);
                    if (data == true) {
                        $scope.reset = false;
                        $scope.resetsuccess = true;
                    }

                    //$location.path('/login');
                }).error(function(data, status) {
                    if(status == 400){
                        if(data.errorMessage != null)
                           $scope.notify(data.errorMessage);
                        else
                           $scope.notify(data.documentation);
                    }
                    else{
                       $scope.notify("Failed to reset password");
                    }
                    return;
                })
            }
        }
    };

    $scope.UserVerification = function(){
        $scope.loading=false;
        $http({
            method: 'GET',
            url: MavenAppConfig.apigatewayauth + '/authservice/webapi/login/verifyforgotpasswordhashcode?email='+$scope.userEmail+'&hashcode='+$scope.hash
        }).success(function(data){
            console.log(data);
            if(data == true){
                $scope.reset = true;
            }else{
                $scope.verifiedfailed = true;
                $scope.resendlink = false;
                $scope.reset = false;
            }
            $scope.loading = true;
        }).error(function(error,status){
            console.log(error);
            $scope.verifiedfailed = true;
            $scope.resendlink = false;
            $scope.reset = false;
            if(status == 400){
                $scope.errorMessage = error.errorMessage;
                $scope.documentation = error.documentation;
            }
            else{
                $scope.errorMessage = "Verification failed";
                $scope.documentation = "";
            }
        });
    }

    $scope.UserVerification();

    $scope.ResendLink = function(){
        $http({
            method: 'GET',
            url: MavenAppConfig.apigatewayauth + '/authservice/webapi/login/resendforgotpassword?email='+$scope.userEmail
        }).success(function(data){
            console.log(data);
            $scope.resendlink = true;
            $scope.reset = false;
            $scope.verifiedfailed = false;
            $scope.loading = true;
        }).error(function(data){
            console.log(data);
            $scope.verifiedfailed = true;
            $scope.resendlink = false;
            $scope.reset = false;
        });
    }


    //============================================ terms and conditions modal as well as Privacy policy =========== //
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