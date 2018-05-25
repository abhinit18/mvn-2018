/**
 * Updated by Prakhar Srivastava. on 01-12-2017.
 */
angular.module('OMSApp.export', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/export/', {
        name: '/export/',
        url: '/export/',
        views: {
            "main": {
                controller: 'exportController',
                templateUrl: 'wops/export/export.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'export'}
    })

}).controller('exportController',['$scope' , "$http", "$location", "MavenAppConfig",  "$window", "Upload", "pagerService", "$q",   "$cookies",

function exportController($scope,$http, $location, MavenAppConfig, $window, Upload, pagerService, $q,  $cookies) {

    $scope.searchSuccessClicked = false;

    $scope.filePathUrl =MavenAppConfig.baseUrlSource+MavenAppConfig.commonPathUrl;
    $scope.selectedTab = 0;

    $scope.startSuccess = 0;
    $scope.sizeSuccess = 5;
    $scope.startError = 0;
    $scope.sizeError = 5;
    $scope.isUserAdmin = localStorage.getItem('isadmin');
    $scope.isUserVendor = localStorage.getItem('isvendor');

    if ($cookies.get('DownloadExportData'))
    {
        $scope.defaultState = $cookies.get('DownloadExportData');
        $scope.activeTab = $cookies.get('ActiveTab');
        /*if($rootScope.growlmessage) {
            $rootScope.growlmessage.destroy();
        }*/

    }
    else
    {
        $scope.defaultState = "orders";
        $scope.activeTab = "Orders";
      /*  if($rootScope.growlmessage) {
            $rootScope.growlmessage.destroy();
        }*/
    }

    $scope.onLoad= function() {
        $scope.LoadExportData($scope.defaultState);
        // $scope.loadBulkCounting(0,'sku');
    };

    $scope.isActive = function(tab) {
        if ($scope.activeTab == tab) {
            return true;
        }
        return false;
    };

    $scope.toggleSearchSuccessUploads = function() {
        $scope.searchSuccessClicked = !$scope.searchSuccessClicked;
    };


    //fetching list of customers count
    $scope.loadExportCounting = function(page,state) {
        var successCountUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/export/filtercount?status=success&entity='+state;
        var inprogressCountUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/export/filtercount?status=inprogress&entity='+state;
        console.log("SUCCESS COUNT URL");
        console.log(successCountUrl);

        console.log("INPROGRESS COUNT URL");
        console.log(inprogressCountUrl);

        $http.get(successCountUrl).success(function(successData) {
            console.log(successData);
            $scope.successCount = successData;
            if(successData)
            {
                var vm = this;

                vm.dummyItemsSuccess = _.range(0, $scope.successCount); // dummy array of items to be paged
                vm.pagerSuccess = {};
                // vm.setPage = setPage;
                function setPageSuccess(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pagerSuccess = pagerService.GetPager(vm.dummyItemsSuccess.length, page);
                    console.log(vm.pagerSuccess);
                    $scope.vmPagerSuccess = vm.pagerSuccess;
                    console.log($scope.vmPagerSuccess);
                    $scope.startSuccess = (vm.pagerSuccess.currentPage - 1) * 5;
                    $scope.sizeSuccess = $scope.startSuccess + 5;
                    console.log($scope.startSuccess);
                    console.log($scope.sizeSuccess);

                }
                if (page == undefined) {
                    setPageSuccess(1);
                }
                if (page != undefined) {
                    setPageSuccess(page);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };
    $scope.ExportModeState = '';
    $scope.LoadExportData = function(state){
        console.log(state);
        $scope.ExportModeState = state;
        $scope.state = state;
        $scope.loadExportSuccessData(state);
        $scope.loadExportProgressData(state);
    };

    $scope.loadExportSuccessData = function(exportState){
        var successUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/export?start=0&size=5&status=success&entity='+exportState;
        console.log(successUrl);
        $http.get(successUrl).success(function(successdata) {
            console.log(successdata);
            $cookies.remove('DownloadExportData');
            $cookies.remove('ActiveTab');
            $scope.successdata = successdata;
        });
    };

    $scope.loadExportProgressData = function(exportState){
        var inprogressUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/export?start=0&size=5&status=inprogress&entity='+exportState;
        $http.get(inprogressUrl).success(function(inProgressData) {
            console.log(inProgressData);
            $scope.inProgressData = inProgressData;
        });
    }
}]);
