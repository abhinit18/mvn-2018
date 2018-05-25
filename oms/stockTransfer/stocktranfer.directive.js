/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 30-11-2017.
 */

angular.module('OMSApp.stocktranferDirective', []).directive('uniquest', ['$parse', 'STorderNumberService' , function($parse,STorderNumberService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.uniquest = function(){
                return STorderNumberService.getStockTranferOrder(ngModel.$viewValue, scope.singleorderData.systemOrderNo);
            };
        }
    };
}]);