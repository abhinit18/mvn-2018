angular.module('OMSApp.categorybase', []).config(function config($stateProvider) {

}).controller('categorybaseController',['$scope', '$http','MavenAppConfig',

function categorybaseController($scope, $http,MavenAppConfig) {

    $scope.categoryMasterTypes = [];

    $scope.categoryMasterTypes.push(
        {
            "tableCategoryMasterTypeString" : 'Standard'
        },
        {
            "tableCategoryMasterTypeString" : 'Amazon'
        },
        {
            "tableCategoryMasterTypeString" : 'All'
        }
    );


    $scope.onCategoryMasterSelected = function ()
    {
        var setCategoryMasterURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles/categorymaster?option=" + $scope.genericData.selectedCategoryMaster;

        $http({
            method: 'PUT',
            url: setCategoryMasterURL,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response)
        {
            $('#askCateogryMaster').modal('hide');
            if($scope.genericData.selectedCategoryMaster == 'Standard') {
               $scope.notify('GS1 ' + $scope.genericData.selectedCategoryMaster + ' has been configured as default category master','success');
            }
            else if($scope.genericData.selectedCategoryMaster == 'Amazon') {
               $scope.notify($scope.genericData.selectedCategoryMaster + ' has been configured as default category master','success');
            }
            else
            {
               $scope.notify('All GS1 and Amazon'+ ' has been configured as default category master','success');
            }
             if($scope.pagename == 'Category')
            {
                $scope.getParentNodes();
                $scope.LoadSelectedSkuNode();
            }
            else if($scope.pagename == 'Sales Channels')
            {
                $scope.listOfSubSaleChannels($scope.channelData);
                $scope.getClientProfile();
            }


        }).error(function(error,status)
        {
            if(status == 400)
            {
               $scope.notify(error.errorMessage);
            }
            else
            {
               $scope.notify('Failed to set ' + $scope.genericData.selectedCategoryMaster + ' as default category master  ');
            }
        });
    }

    /*$scope.getCategoryMasterFlag = function () {

        var getCategoryMasterFlagURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles/askcategorymaster";

        $http.get(getCategoryMasterFlagURL).success(function(data)
        {

            if(data == true)
            {
                $('#askCateogryMaster').modal('show');
            }
            else if($scope.pagename == 'Category')
            {
                $scope.getParentNodes();
                $scope.LoadSelectedSkuNode();
            }
            else if($scope.pagename == 'Sales Channels')
            {
                $scope.listOfSubSaleChannels($scope.channelData);
            }

        }).error(function(error, status)
        {
            if(status == 400)
            {
               $scope.notify(error.errorMessage);
            }
            else
            {
               $scope.notify("Failed to get category master");
            }
        });
    }*/

}]);
