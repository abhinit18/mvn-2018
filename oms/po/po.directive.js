/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 16-12-2017.
 */


angular.module('OMSApp.uniqueOrderDirective', []).
directive('uniquepo', ['$parse', 'PONumberService' , function($parse,PONumberService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            // ngModel.$asyncValidators.uniquepo = PONumberService;
            ngModel.$asyncValidators.uniquepo = function() {
                return PONumberService(ngModel.$viewValue, scope.singleorderData.systemOrderNo);
            };
        }
    };
}]);