angular.module('ngStepwise', []).directive('ngStepwise', ['$sce', '$document', '$timeout', function($sce, $document, $timeout) {
    console.log("[module.directive.ngStepwise]");
    return {
        link: function(scope, element, attrs) {
            /** Wire in methods to the host scope to make available to the directive template **/
            scope.getItemClass = function(thisStep, index) {
                var classes = [];
                if (angular.isObject(thisStep)) {
                    if (thisStep.active) {
                        scope.activeStepIndex = index;
                        classes.push('active-step');
                    } else {
                        classes.push('after-active-step');
                    }
                }
                return classes.join(' ');
            };
            scope.getItemCss = function(step, index) {
                if (angular.isObject(step)) {
                    return {
                        backgroundColor: step.hasOwnProperty('incompleteBgColor') ? step.incompleteBgColor : 'transparent',
                        borderColor: step.hasOwnProperty('incompleteBorderColor') ? step.incompleteBorderColor : 'transparent'
                    };
                }
            };
            element.on('mouseover', function() {
                if (attrs.url) {
                    // do something if there is a url for the task
                }
            });

        },
        restrict: 'AE',
        scope: {
            globalOptions: '=ngDefaultOptions',
            /** Still working on these **/
            steps: '=ngSteps' /** Channel in the steps attribute of the element to map to the scope array of steps **/
        },
        template: "\
            <div class='stepwise-frame'><ul class='stepwise'>\
                <li ng-repeat='step in steps' ng-attr-class='{{getItemClass(step, $index)}}'>\
                    <a ng-attr-title='{{step.tooltip}}' ng-style='getItemCss(step, $index)'>&nbsp;</a>\
                    <hr class='divider' />\
                    <label>{{step.title}}</label>\
                    <div style='width: 220px;height:180px;background:#F2F7F8;padding:10px;font-weight: 500;border-radius:5px;'>\
                        <table class='order-journey-dtls-tbl'>\
                            <tr>\
                                <td style='width: 25%;'>\
                                    <strong>Date:</strong>\
                                </td>\
                                <td style='width: 75%;'>\
                                    {{step.fulldate}}\
                                </td>\
                            </tr>\
                            <tr>\
                                <td colspan='2'>\
                                    <strong>Remarks:</strong>\
                                </td>\
                            </tr>\
                            <tr>\
                                <td colspan='2'>\
                                    <span style='white-space: normal;'><richtext class='text' body-text='step.remarks'></richtext></span>\
                                </td>\
                            </tr>\
                        </table>\
                    </div>\
                </li>\
            </ul></div>\
            "
    };

}]);
