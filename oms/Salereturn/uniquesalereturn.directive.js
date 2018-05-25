/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 30-11-2017.
 */
angular.module('OMSApp.uniqueSalereturnDirective', []).directive('uniquesr', [ 'saleReturnOrderNumberService' , function(saleReturnOrderNumberService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.uniquesr = function(){
                return saleReturnOrderNumberService.getSaleReturnOrder(ngModel.$viewValue, scope.singleorderReturnData.tableSaleReturnSystemOrderNo);
            };
        }
    };
}]);