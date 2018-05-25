/**
 * @author Prakhar
 *
 */
angular.module('MavenApp.authentication', []).config(function config($stateProvider) {
    $stateProvider.state('/login', {
        name: '/login',
        url: '/login',
        views: {
            "main": {
                controller: 'loginCtrl',
                templateUrl: 'authentication/login.view.html'
            }
        },
        data: {pageTitle: 'Login'}
    })

}).controller('loginCtrl', ['$rootScope','$scope','$http', '$cookies', 'MavenAppConfig','$state', '$localStorage', 'authenticationService', 'validationService', '$location','headerService',
    function ($rootScope,$scope,$http, $cookies,MavenAppConfig, $state, $localStorage, authenticationService, validationService, $location,headerService) {

        /*login start*/
        $scope.user = {email: "", password: ""};
        $scope.errorMsg = {email: '', password: ''};
        $scope.isVerified=false;
        $scope.validateEmail = function () {
            if (validationService.isNotValidData($scope.user.email)) {
                $scope.errorMsg.email = "Please enter an email address.";
                return false

            }
            else if (validationService.notValidEmail($scope.user.email)) {
                $scope.errorMsg.email = "Please enter valid email address.";
                return false;
            }

            else {

                $scope.errorMsg.email = "";

              return  true;
            }
        }
        $scope.validatePassword = function () {
            if (validationService.isNotValidData($scope.user.password)) {
                $scope.errorMsg.password = "Please enter the password.";
                return false;
            }
            else {
                $scope.errorMsg.password = "";
                return true;
            }
        }

        $scope.login = function () {
            if (!$scope.validateEmail() || (!$scope.validatePassword())) {

            } else {


                        /*start*/
                        authenticationService.login($scope.user, function (data) {
                            if(data.status==401){
                                $scope.notify('Your email address or password might be incorrect.','danger');

                            }
                            else if(data && data.tableUserIsEmailVerified==false){
                                $('#loginError').modal('show');
                            }
                            else if(data.tableUserStatusType.idtableUserStatusTypeId!=1){
                                $scope.notify("Your account is not active. Please contact admin.",'danger')
                            }
                            else {
                                $cookies.put("username", data.tableUserFirstName);
                                $cookies.put("userphone", data.tableUserPhoneNo);
                                $cookies.put("userfullname", data.tableFullName);
                                $cookies.put("useremail", data.tableUserEmailId);
                                $cookies.put('isLoggedIn', true);
                                $cookies.put('timezone',data.tableClient.tableClientTimeZone);
                                headerService.getMenuData(function (menu) {
                                    $rootScope.menu=menu;
                                   $state.go('/apps');
                                });
                                }

                        });

                        /*end*/


            }
        }

        $scope.resendActivationLink = function() {
            $http.get(MavenAppConfig.apigatewayauth +"/authservice/webapi/login/resend?email=" + $scope.user.email).success(function(data) {
                console.log(data);
                if (data == true) {
                    $scope.showAnchor = false;
                    $('#loginError').modal('hide');
                    $scope.notify("Activation link has been sent successfully to your email address provided during registration.",'success');
                }
            }).error(function(error, status) {
                if(status == 400)
                {
                    $scope.notify(error.errorMessage,'danger');
                }
                else if (status == 401) {
                    $scope.notify('Your Email ID or Password might be incorrect.','danger');
                }
                else{
                    $scope.notify('Failed to send mail','danger');
                }
            });
        }

        /*login end*/
    }]);
