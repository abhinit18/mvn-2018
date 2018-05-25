angular.module('MavenApp.signup', []).config(function config($stateProvider) {
    $stateProvider.state('/signUp', {
        name: '/signUp',
        url: '/signUp',
        views: {
            "main": {
                controller: 'signUpController',
                templateUrl: 'authentication/signUp/signUp.view.html'
            }
        },
        data: {pageTitle: 'Sign Up'}
    })

}).controller ('signUpController', ['$scope', '$http', '$location' , '$q','$sce', 'MavenAppConfig',

function signUpController($scope, $http, $location , $q,$sce, MavenAppConfig) {

    $scope.onLoad= function () {

        $scope.clearCompanyCheck();
        $scope.clearEmailCheck();
        $scope.clearPhoneCheck();
        $scope.clearFNameCheck();
        $scope.clearLNameCheck();
        $scope.clearFPwdCheck();
        $scope.clearCPwdCheck();
    };
    $scope.isRegistered=false;
    $scope.termsCheck = false;
    var PasswordPattern = new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,14}$");



    /* ------------------------------------------------
                        COMPANY NAME
       ------------------------------------------------ */

    $scope.checkCompanyName = function () {

        if($scope.companyName) {
            var q = $q.defer();
            $scope.clearCompanyCheck();
            var companyName = $scope.companyName;
            $http.get(MavenAppConfig.apigatewayauth + "/authservice/webapi/signup/checkcompany?company=" + companyName).success(function (data) {
                if (data) {
                    $scope.companyStatus = data;
                    $scope.displayCompanyMessage = "Company already exists";
                    $scope.companyValidateWrongStyle = {
                        'display': 'block'
                    };
                    $scope.companyValidateCorrectStyle = {
                        'display': 'none'
                    };
                    q.resolve(false);
                }
                else {
                    $scope.companyValidateCorrectStyle = {
                        'display': 'block'
                    };
                    $scope.displayCompanyMessage = "";
                    $scope.companyValidateWrongStyle = {
                        'display': 'none'
                    };
                    q.resolve(true);
                }
            }).error(function (error) {
                console.log("error message");
                q.reject();
            });
            return q.promise;
        }
    };

    $scope.clearCompanyCheck = function () {
        $scope.companyValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.companyValidateWrongStyle = {
            'display': 'none'
        };
        $scope.displayCompanyMessage = "";
    };

    /* ------------------------------------------------
                            EMAIL 
       ------------------------------------------------ */
    $scope.checkEmail = function () {

        if($scope.email) {
            var q = $q.defer();
            var email = $scope.email;
            $scope.clearEmailCheck();

            $http.get(MavenAppConfig.apigatewayauth + "/authservice/webapi/signup/checkemail?email=" + email).success(function (data) {
                if (!data) {
                    $scope.emailValidateCorrectStyle = {
                        'display': 'block'
                    };
                    $scope.emailValidateWrongStyle = {
                        'display': 'none'
                    };
                    $scope.displayEmailMessage = "";
                    q.resolve(true);
                }
                else {
                    $scope.emailValidateWrongStyle = {
                        'display': 'block'
                    };
                    $scope.displayEmailMessage = "Email is already registered";
                    $scope.emailValidateCorrectStyle = {
                        'display': 'none'
                    };
                    q.resolve(false);
                }
            }).error(function (error) {
                q.reject();
            });
            return q.promise;
        }

    };

    $scope.clearEmailCheck = function () {
        $scope.emailValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.emailValidateWrongStyle = {
            'display': 'none'
        };
        $scope.displayEmailMessage = "";
    };

    /* ------------------------------------------------
                        PHONE NUMBER 
       ------------------------------------------------ */

    $scope.checkPhone = function () {

        if($scope.phone) {
            var q = $q.defer();
            var phone = $scope.phone;
            $scope.clearPhoneCheck();


            $http.get(MavenAppConfig.apigatewayauth + "/authservice/webapi/signup/checkphone?phone=" + phone).success(function (data) {
                if (!data) {
                    $scope.phoneValidateCorrectStyle = {
                        'display': 'block'
                    };
                    $scope.phoneValidateWrongStyle = {
                        'display': 'none'
                    };
                    $scope.displayPhoneMessage = "";
                    q.resolve(true);
                } else {
                    $scope.phoneValidateWrongStyle = {
                        'display': 'block'
                    };
                    $scope.phoneValidateCorrectStyle = {
                        'display': 'none'
                    };
                    $scope.displayPhoneMessage = "Phone number already exists";
                    q.resolve(false);
                }
            }).error(function (error) {
                alert("Service is down");
            });

            return q.promise;
        }
    };

    $scope.clearPhoneCheck = function () {
        $scope.phoneValidateCorrectStyle = {
            'display': 'none'
        };
        $scope.phoneValidateWrongStyle = {
            'display': 'none'
        };
        $scope.displayPhoneMessage = "";
    };

    /* ------------------------------------------------
                        FIRST NAME
       ------------------------------------------------ */


    $scope.clearFNameCheck = function () {
        $scope.fNameValidateStyle = {
            'display': 'none'
        };
        $scope.displayFNameMessage = "";
    };



    $scope.clearLNameCheck = function () {
        $scope.lNameValidateStyle = {
            'display': 'none'
        };
        $scope.displayLNameMessage = "";
    };

    /* ------------------------------------------------
                         PASSWORD 
       ------------------------------------------------ */

    $scope.checkFPwd = function () {

        var pwd = $scope.pwd;
        $scope.clearFPwdCheck();

        var matched = PasswordPattern.test(pwd);
        if(matched == false)
        {
            $scope.displayFPwdMessage = 'Password must be at least 8 characters long and should <br> contain one letter,one character and one special character';
            $scope.FPwdValidateStyle = {

                'display': 'block'
            };
            return false;
        }

        $scope.FPwdValidateStyle = {

            'display': 'none'
        };
        return true;
    };

    $scope.clearFPwdCheck = function () {
        $scope.displayFPwdMessage = "";
        $scope.FPwdValidateStyle = {

            'display': 'none'
        };
    };

    /* ------------------------------------------------
                         CONFIRM PASSWORD 
       ------------------------------------------------ */

    $scope.checkCPwd = function () {

        var pwd = $scope.pwd;
        var cPwd = $scope.cPwd;

        $scope.clearCPwdCheck();
        if (pwd != cPwd)
        {
            $scope.displayCPwdMessage = "Please re-enter the password, your passwords don't match";
            $scope.cPwdValidateStyle = {

                'display': 'block'
            };
            return false;
        }
        return true;
    };

    $scope.clearCPwdCheck = function () {
        $scope.displayCPwdMessage = "";
        $scope.cPwdValidateStyle = {
            'display': 'none'
        };
    };

    /* ------------------------------------------------
                         SIGNUP 
       ------------------------------------------------ */

    $scope.registerCompanyDetails = function ()
    {
        if ($scope.checkCompanyName().then( function (retval)
        {
            if(retval == false)
            {
                return false;
            }
            else
            {
                if ($scope.checkEmail().then(function (retval)
                {
                    if(retval == false)
                    {
                        return false;
                    }
                    else
                    {
                        if ($scope.checkPhone().then(function (retVal)
                        {
                            if(retVal == false)
                            {
                                return false;
                            }
                            else
                            {
                                var clientID = 0;
                                var postData = {
                                    "fname": $scope.fName,
                                    "lname": $scope.lName,
                                    "email": $scope.email,
                                    "password": $scope.pwd,
                                    "phone": $scope.phone,
                                    "domain" : $scope.domain,
                                    "timezone" : $scope.timezone,
                                    "company": $scope.companyName


                                };
                                $scope.isRegistered=true;
                                $http({
                                    method: 'POST',
                                    url: MavenAppConfig.apigatewayauth + '/authservice/webapi/signup/register',
                                    data: postData,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }).success(function (res) {
                                    $location.path('/signUpSuccess');
                                }).error(function (error) {
                                    console.log(error);
                                    $scope.isRegistered=false;
                                });

                            }
                        }));
                    }
                }));
            }
        }));
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

