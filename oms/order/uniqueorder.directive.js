/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 28-11-2017.
 */

angular.module('OMSApp.uniqueOrderDirective', []).directive('unique', ['$parse', 'orderNumberService' , function($parse,orderNumberService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.unique = function(){
                return orderNumberService.getUniqueOrder(ngModel.$viewValue, scope.singleorderData.systemOrderNo);
            };
        }
    };
}]);
