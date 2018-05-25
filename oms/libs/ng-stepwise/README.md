# This Is ngStepwise
This plugin is the designed to:
- Provide an easy to use wizard progress bar i.e. the "Here's where you are in this process" and "here's how much more stuff you need to do" type views on websites 
- Requires AngularJS (it's an AngularJS directive)
- Requires Bootstrap for the tooltip functionality 

## Limitations
If you have more than 6 or so steps in your workflow, you probably need to do something differently on your UI than trying to cram all of them into a slider bar. 

This tool is still super new. As I build on it, I'll be looking to add more functionality and handle more than a few steps

## Preview

Here's what a stepwise progress bar looks like:

![Markdown Image](https://storage.googleapis.com/com-larcity-static/shadowbox/ng-stepwise-example.png "Here's what an implementation looks like!")

## Features
- Customizable color cues for completed (green) and pending (gray) tasks
- Size hint for current step (larger than the others)
- Tooltip for each of the step buttons to hint the user on what is expected
- `url` configuration for each step to allow for redirection to complete 

For examples of these features implemented, check out the source code @ the demo page by using the **View Source** option in your Browser (you may be able to get to this menu option this by right-clicking in the page): [http://larcity.com/repo/angularjs/stepwise/example/](http://larcity.com/repo/angularjs/stepwise/example/ "Here's an example of ng-stepwise at work")

## Installation

Install via Bower: 

````javascript
bower install ng-stepwise
````

Your required components are:

- ng-stepwise.css (stylesheet for directive)
- ng-stepwise.js (directive code)

include these in your project as follows:

````html
<!-- CSS Stylesheet to be included within HEAD tag -->
<link rel="stylesheet" href="{project_root}/bower_components/ng-stepwise/ng-stepwise.css" />
<!-- JS script to be included before the close of your BODY tag -->
<script type="text/javascript" src="{project_root}/bower_components/ng-stepwise/ng-stepwise.js"></script>
````
## Configuration
This is the javascript sample code showing the configuration of the source step object within the ng controller. Review the 
entire script to see how the directive interacts with the controller / template. 

````html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="//larcity.com/assets/img/favicon.ico" rel="shortcut icon" /> 
        <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
        <title>Bootstrap 101 Template</title>
        <!-- Bootstrap -->
        <link href="libs/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
        <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
          <script src="//oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
          <script src="//oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->
        <script src="libs/angular/angular.min.js"></script>
        <script src="libs/angular-sanitize/angular-sanitize.min.js"></script>
        <!-- @IMPORTANT - include the stepwise stylesheet -->
        <link rel="stylesheet" href="libs/ng-stepwise/stepwise.css" />
        <!-- Some custom styling for the example app -->
        <style type="text/css">
            .centered {
                float: none;
                margin: 0 auto;
            }
            .jumbotron {
                background-color: transparent;
            }
        </style>
    </head>
    <body ng-app="ngStepwiseExample">
        
        <div class="row" ng-controller="ExampleCtrl">
            <article class="col-xs-10 col-sm-8 col-lg-6 centered jumbotron">
                <h1>An Example Using ngStepwise</h1>
                <p>Some Lorem Ipsumy Stuff here</p>
                
                <!-- Basic Stepwise Example -->
                <h2>Basic Usage</h2>
                <ng-stepwise ng-default-options="stepwiseOptions"></ng-stepwise>
                <ng-stepwise ng-steps="steps"></ng-stepwise>
                
                <h2>Getting Fancy</h2>
                <ng-stepwise ng-default-options="stepwiseOptions"></ng-stepwise>
                <ng-stepwise ng-steps="fancySteps"></ng-stepwise>
                
            </article>
        </div>

        <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <!-- Include all compiled plugins (below), or include individual files as needed -->
        <script src="libs/bootstrap/dist/js/bootstrap.min.js"></script>
        <!-- Include Stepwise Directive -->
        <script type="text/javascript" src="libs/ng-stepwise/ng-stepwise.js"></script>
        <script type="text/javascript">
            angular.module('ngStepwiseExample', [
                // 'ngStepwise', /** You can include stepwise for your entire app **/
                'ctrl.example'
            ]);
            // you could have this code included from an external file
            angular.module('ctrl.example', [
                'ngStepwise' /** Including stepwise JUST for this controller **/
            ]).controller('ExampleCtrl', [
                '$scope',
                function($scope) {
                    console.log("[module.controller.Example]");
                    
                    $scope.stepwiseOptions = {
                        
                    };
                    
                    $scope.steps = [
                        {
                            title: 'Step A',
                            complete: true
                        },
                        {
                            title: 'Step B',
                            complete: true,
                            tooltip: 'This is what step 2 should say on hover'
                        },
                        {
                            title: 'Step C',
                            active: true,
                            tooltip: 'Some helpful info on Step 3'
                        },
                        {
                            title: 'Step D',
                        }
                    ];
                    
                    $scope.fancySteps = [];
                    Array.prototype.push.apply($scope.fancySteps, $scope.steps);
                    Array.prototype.push.apply($scope.fancySteps, [
                        {
                            title: 'Step E',
                            url: 'http://twitter.com/larcityapps',
                            tooltip: 'This step redirects to my Twitter feed!',
                            newWindow: true
                        },
                        {
                            title: 'Step Final',
                            incompleteBgColor: 'purple',
                            incompleteBorderColor: 'pink'
                        }
                    ]);
                }
            ]);
        </script>
    </body>
</html>
````

## Demo

You can view a demo of working code here: [http://larcity.com/repo/angularjs/stepwise/example/](http://larcity.com/repo/angularjs/stepwise/example/ "Here's an example of ng-stepwise at work")