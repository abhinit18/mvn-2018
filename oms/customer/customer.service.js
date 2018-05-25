myApp.service('customerService', ['$http', function ($http)
{
    this.insertCustomer = function (cust) {
        return $http.post(urlBase, cust);
    };


}]);
