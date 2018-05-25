/**
 * Project Name Maven
 * Created by Prakhar Srivastava on 04-12-2017.
 */
angular.module('MavenApp.custom-directve', [ ])
.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});