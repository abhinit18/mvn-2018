angular.module('OMSApp.saleschannels', []).config(function config($stateProvider) {

    $stateProvider.state('/saleschannels/', {
        name: '/saleschannels/',
        url: '/saleschannels/',
        views: {
            "main": {
                controller: 'saleschannelsCtrl',
                templateUrl: 'settings/saleschannels/saleschannels.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'saleschannels'}
    })

}).controller('saleschannelsCtrl', ['$scope', '$http', '$location', 'MavenAppConfig','$cookies','$controller',

function saleschannelsController($scope, $http, $location, MavenAppConfig,$cookies,$controller) {

    $controller('categorybaseController', { $scope: $scope });

    $scope.addNewSaleChannelClicked = false;
    $scope.showVerifyIntegration = false;
    $scope.integrationVerified = false;
    $scope.integrationNotVerified = false;

    $scope.saleChannelMode = 'add';

    $scope.verificationmessage = '';

    $scope.genericData = {};
    $scope.returnTypes = [];
    $scope.animatePopover = [];

    $scope.returnTypes.push(
        {
            "returnTypeString" : 'valuebased',
            "returnTypeDisplayString" : '% Value'
        },
        {
            "returnTypeString" : 'quantitybased',
            "returnTypeDisplayString" : '% Quantity'
        }
    )

    $scope.genericData.returnType = "";

    $scope.checkNumber = checkNumber;

    $scope.selectedwarehouse = {};

    $scope.formbutton = {};

    $scope.toggleSaleChannelRow = function() {
        console.log($scope.addNewSaleChannelClicked);
        $scope.addNewSaleChannelClicked = !$scope.addNewSaleChannelClicked;
    }

    $scope.clientprofile = {}
    $scope.getClientProfile = function(){
        var clientProfileUrl =MavenAppConfig.baseUrlSource +"/omsservices/webapi/clientprofiles/1"
        $http.get(clientProfileUrl).success(function(data) {
            $scope.clientprofile = data;
        }).error(function(error, status) {
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to get client profile")
            }
            console.log(error);

        });
    }

    $scope.onload= function() {
        $scope.listOfSaleChannel();
        $scope.getClientProfile();
    };

    $scope.cancelAddNewSalesChannelDialog = function(form){
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.pullProductChecked = false;
        $scope.categoryMaster = {};
        $scope.selectedSku = null;
        $scope.skuClientCode = null;
        $scope.selectedwarehouse = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
      $('#AddNewSalesChannelDialog').modal('hide');
    };

    // fetching list of sale channels from RestAPI OMS
    $scope.listOfSaleChannel = function() {
        var saleChannelUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannelmetadata";
        $http.get(saleChannelUrl).success(function(data) {
            $scope.saleChannelData = data;
            console.log(data);
        }).error(function(error, status) {

            console.log(error);

        });
    }

    $scope.isActive = function(clickedSalesChannel) {
        if ($scope.channelName == clickedSalesChannel) {
            return true;
        }
        return false;
    };
    $scope.categoryMaster = {};
    $scope.pullProductSelected = function()
    {
        if($scope.subChannelData.tableSalesChannelValueInfoPullProduct == true || $scope.subChannelData.tableSalesChannelValueInfoFbaEnabled == true)
        {
            $scope.pullProductChecked = true;
            $scope.categoryMaster.tableClientProfileCategoryMaster = 'All';
        }
        else
        {
            $scope.pullProductChecked = false;
            $scope.categoryMaster = {};
        }
    };


    $scope.updateCategoryMaster = function ()
    {
        var setCategoryMasterURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles/categorymaster?option=" + $scope.categoryMaster.tableClientProfileCategoryMaster;

        $http({
            method: 'PUT',
            url: setCategoryMasterURL,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response)
        {
            if( $scope.categoryMaster.tableClientProfileCategoryMaster == 'All') {
                $scope.notify('Standard Categories have been appended with Amazon Categories','success');
            }
            else if($scope.categoryMaster.tableClientProfileCategoryMaster == 'Amazon') {
                $scope.notify("Now your Category Master is Amazon and All Skus with Standard Category have been updated with 'UNDEFINED' Category",'success');
            }

            $scope.categoryMaster = {};
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

    $scope.listOfSubSaleChannels = function(channelData) {
        $scope.showVerifyIntegration = false;
        $scope.integrationVerified = false;
        $scope.integrationNotVerified = false;
        console.log(channelData);
        $scope.channelData = channelData;
        $scope.subChannelData = [];
        $scope.addNewSaleChannelClicked = false;
        console.log(channelData);
        $scope.metaInfoValues = [];
        $scope.metaChannelData = [];
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField1);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField2);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField3);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField4);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField5);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField6);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField7);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField8);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField9);
        $scope.metaInfoValues.push(channelData.tableSalesChannelMetaInfoField10);
        console.log($scope.metaInfoValues);
        for (var i = 0; i < $scope.metaInfoValues.length; i++) {
            if ($scope.metaInfoValues[i] != null) {
                $scope.metaChannelData.push({
                    tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                    tableSalesChannelValueInfoValue: null
                })
            }
        }
        $scope.isKeyEntered = [];
        for (var i = 0; i < $scope.metaChannelData.length; i++) {
            if ($scope.metaChannelData[i].tableSalesChannelValueMetaValue) {
                $scope.isKeyEntered[i] = false;
            }
        }
        $scope.channelName = channelData.tableSalesChannelMetaInfoName;
        var subSaleChannelUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannelmetadata/" + channelData.idtableSalesChannelMetaInfoId + "/saleschannels";
        $http.get(subSaleChannelUrl).success(function(data) {
            $scope.subSaleChannelData = data;
            console.log(data);
        }).error(function(error, status) {

            console.log(error);

        });
    }

    $scope.channelNameEntered = function(tableSalesChannelValueInfoName) {
        if (!tableSalesChannelValueInfoName) {
            $scope.isChannelNameEntered = true;
        } else {
            $scope.isChannelNameEntered = false;
        }
    };

    $scope.saleschannelexist = true;
    $scope.isSalesChannelExist = function(){
        var name = $scope.subChannelData.tableSalesChannelValueInfoName;
        if(!name){
            
            return;
        }
        var mode = $scope.saleChannelMode;
        if(mode == 'add'){
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/checkname?name='+name,
                data : '',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if(res == true){
                   $scope.notify("Sales Channel already exist with the name "+name);
                    $scope.saleschannelexist = true;
                }
                else{
                    $scope.saleschannelexist = false;
                }
            }).error(function(error, status) {

                console.log(error);
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }else {
                   $scope.notify("Failed to check sales channel exists");
                }
            });
        }
    }
    $scope.setFormButtonValue =  function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitSalesChannelForm =  function (subChannelData,channelData,metaChannelData,form) {
        $scope.formbutton.disablebutton = true;
        if($scope.saleChannelMode=='add' && $scope.channelData.idtableSalesChannelMetaInfoId != 5 && $scope.submitActionButton == 'add'){
            $scope.saveSubChannel(subChannelData,channelData,metaChannelData,form);
        }
        else if($scope.saleChannelMode=='add' && $scope.channelData.idtableSalesChannelMetaInfoId == 5  && $scope.submitActionButton == 'add1'){
            $scope.saveSubChannelMetaId5(subChannelData,channelData,metaChannelData,form);
        }
        else if($scope.saleChannelMode=='edit' && $scope.channelData.idtableSalesChannelMetaInfoId != 5  && $scope.submitActionButton == 'update'){
            $scope.saveSubChannel(subChannelData,channelData,metaChannelData,form);
        }
        else if($scope.saleChannelMode=='edit' && $scope.channelData.idtableSalesChannelMetaInfoId == 5 && $scope.submitActionButton == 'update1'){
            $scope.updateSubChannelMetaId5(subChannelData,channelData,form);
        }
        $scope.formbutton.disablebutton = false;
    }
    $scope.saveSubChannel = function(subChannelData, channelData, metaChannelData,form) {

        var isOkToSave = true;

        if (!$scope.subChannelData) {
           $scope.notify("Please Enter the Channel Name");
            $scope.isChannelNameEntered = true;
            isOkToSave = false;
        } else if (!$scope.subChannelData.tableSalesChannelValueInfoName) {
           $scope.notify("Please Enter the Channel Name");
            $scope.isChannelNameEntered = true;
            isOkToSave = false;
        } else if ($scope.subChannelData.tableSalesChannelValueInfoName.length > 45) {
           $scope.notify("Channel Name is exceeding the 45 characters limit!");
            $scope.isChannelNameEntered = true;
            isOkToSave = false;
        }
        if($scope.subChannelData.tableSalesChannelValueInfoReturnValue != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnValue != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnValue > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnValue < 0)){
           $scope.notify("Return value percentage can not be more than 100 OR less than 0");
            return;
        }

        if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity < 0)){
           $scope.notify("Return Quantity percentage can not be more than 100 OR less than 0");
            return;
        }

        if (isOkToSave) {
            if (!$scope.metaChannelData) {
               $scope.notify("Please enter the " + $scope.metaChannelData[0].tableSalesChannelValueMetaValue + "!");
                $scope.isKeyEntered[0] = true;
                isOkToSave = false;
            } else if ($scope.metaChannelData.length > 0) {
                for (var i = 0; i < $scope.metaChannelData.length; i++) {
                    if (!$scope.metaChannelData[i].tableSalesChannelValueInfoValue)
                    {
                        //Skip user name and password for Amazon
                        if(channelData.idtableSalesChannelMetaInfoId == 1 || channelData.idtableSalesChannelMetaInfoId == 6) //Amazon - skip username and password checks
                        {
                            if($scope.metaChannelData[i].tableSalesChannelValueMetaValue == "User Name" || $scope.metaChannelData[i].tableSalesChannelValueMetaValue == "Password")
                            {
                                continue;
                            }
                        }
                       $scope.notify("Please enter the " + $scope.metaChannelData[i].tableSalesChannelValueMetaValue + "!");
                        $scope.isKeyEntered[i] = true;
                        isOkToSave = false;
                        break;
                    }
                }
            }
        }
        if (isOkToSave) {
            if($scope.genericData.returnType == 'quantitybased'){
                subChannelData.tableSalesChannelValueInfoReturnValue = null;
            }else if($scope.genericData.returnType == 'valuebased'){
                subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
            }
            if (channelData.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                if ($scope.saleChannelMode == "add") {
                    $scope.saveSubChannelData(subChannelData, channelData, metaChannelData,form);
                } else if ($scope.saleChannelMode == "edit") {
                    $scope.editSubChannel(subChannelData, channelData, metaChannelData,form);
                }
            } else if ($scope.showVerifyIntegration) {
               $scope.notify("Please verify the integration!");
            } else if ($scope.integrationNotVerified) {
               $scope.notify("Verification has failed! Please verify the integration again!");
                $scope.showVerifyIntegration = true;
                $scope.integrationNotVerified = false;
                $scope.integrationVerified = false;
            } else if ($scope.integrationVerified) {

                if(subChannelData.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 1 || subChannelData.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 4)
                {
                    if(!subChannelData.tableWarehouseSalesChannelMaps)
                    {
                        subChannelData.tableWarehouseSalesChannelMaps =[];
                    }
                    if(subChannelData.tableWarehouseSalesChannelMaps.length == 0)
                    {
                        $scope.selectedwarehouse.tableWarehouseSalesChannelMapIsDefault = false;
                        $scope.subChannelData.tableWarehouseSalesChannelMaps.push($scope.selectedwarehouse);
                    }
                    else
                    {
                        var flag = true;
                        for(var i=0;i< subChannelData.tableWarehouseSalesChannelMaps.length ; i++)
                        {
                            if(subChannelData.tableWarehouseSalesChannelMaps[i].tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId != 3)
                            {
                                flag = false;
                                $scope.subChannelData.tableWarehouseSalesChannelMaps[i].tableWarehouseDetails =  $scope.selectedwarehouse.tableWarehouseDetails;
                                break;
                            }
                        }
                        if(flag == true)
                        {
                            $scope.selectedwarehouse.tableWarehouseSalesChannelMapIsDefault = false;
                            $scope.subChannelData.tableWarehouseSalesChannelMaps.push($scope.selectedwarehouse);
                        }
                    }
                }

                if ($scope.saleChannelMode == "add") {
                    $scope.saveSubChannelData(subChannelData, channelData, metaChannelData,form);
                } else if ($scope.saleChannelMode == "edit") {
                    $scope.editSubChannel(subChannelData, channelData, metaChannelData,form);
                }
            }
        }
    };

    $scope.saveSubChannelData = function(subChannelData, channelData, metaChannelData,form) {
        console.log(metaChannelData);
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;
        if (metaChannelData.length == 1) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[i].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 2) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 3) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 4) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 5) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 6) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 7) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 8) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 9) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 10) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue10 = metaChannelData[9].tableSalesChannelValueInfoValue;
        }


        console.log(postSubChannelData);

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels',
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                if($scope.categoryMaster.tableClientProfileCategoryMaster)
                {
                    $scope.updateCategoryMaster();
                }
                $scope.subChannelData = null;
                subChannelData = null;
                $scope.notify("New Sales Channel Added for " + channelData.tableSalesChannelMetaInfoName,'success');
                $scope.listOfSubSaleChannels(channelData);
                $scope.addNewSaleChannelClicked = false;
                $scope.cancelAddNewSalesChannelDialog(form);
            }
        }).error(function(error, status) {
            $scope.cancelAddNewSalesChannelDialog(form);
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else {
               $scope.notify("Sale Channel Cannot Be Added");
            }
        });
    };
    $scope.subChannelData = {};
    $scope.openChannel = function() {
        $scope.subChannelData = {};
        $scope.subChannelData.tableSalesChannelValueInfoIsEditable = true;
        $scope.addNewSaleChannelClicked = true;
        $scope.genericData.returnType = "";
        $scope.saleChannelMode = 'add';
        $scope.metaChannelData = [];
        $scope.integrationVerified = false;
        $scope.isChannelNameEntered = false;

        if($scope.channelData.idtableSalesChannelMetaInfoId == 6)
        {
            $scope.amazonusfba = true;
            $scope.pullProductChecked = true;
            $scope.subChannelData.tableSalesChannelValueInfoFbaEnabled = true;
            $scope.categoryMaster.tableClientProfileCategoryMaster = 'All';
        }
        else
        {
            $scope.amazonusfba = false;
        }

        for (var i = 0; i < $scope.metaInfoValues.length; i++) {
            if ($scope.metaInfoValues[i] != null) {
                $scope.metaChannelData.push({
                    tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                    tableSalesChannelValueInfoValue: null
                })
            }
        }
        $scope.showVerifyIntegration = false;
        $scope.isKeyEntered = [];
        for (var i = 0; i < $scope.metaChannelData.length; i++) {
            if ($scope.metaChannelData[i].tableSalesChannelValueMetaValue) {
                $scope.isKeyEntered[i] = false;
            }
        }
        $('#AddNewSalesChannelDialog').modal('show');
    };

    $scope.changeReturnType = function(){
        if($scope.genericData.returnType == 'quantitybased')
        {
            $scope.subChannelData.tableSalesChannelValueInfoReturnValue = null;
        }
        if($scope.genericData.returnType == 'valuebased')
        {
            $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
        }
    };

    $scope.editSaleChannelConfig = function(configid) {
        $scope.saleChannelMode = 'edit';
        //$scope.authTokenEntered(0);
        $scope.integrationVerified = true;
        $scope.verificationmessage = "Verified";
        $scope.addNewSaleChannelClicked = true;
        $scope.showVerifyIntegration = false;
        var saleChannelConfigUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels/" + configid;
        $http.get(saleChannelConfigUrl).success(function(data)
        {
            if (data != null)
            {
                $scope.subChannelData = data;
                $scope.genericData.returnType = "";
                if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity)
                {
                    $scope.genericData.returnType = 'quantitybased';
                }
                if($scope.subChannelData.tableSalesChannelValueInfoReturnValue)
                {
                    $scope.genericData.returnType = 'valuebased';
                }

                console.log(data);
                $scope.metaInfoValues = [];
                $scope.metaChannelData = [];
                $scope.metaValues = [];
                console.log(data.tableSalesChannelMetaInfo);
                if($scope.subChannelData.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 1 || $scope.subChannelData.tableSalesChannelMetaInfo.idtableSalesChannelMetaInfoId == 4)
                {
                    for(var i=0;i< $scope.subChannelData.tableWarehouseSalesChannelMaps.length ; i++)
                    {
                        if($scope.subChannelData.tableWarehouseSalesChannelMaps[i].tableWarehouseDetails.tableWarehouseType.idtableWarehouseTypeId != 3)
                        {
                            $scope.selectedwarehouse = $scope.subChannelData.tableWarehouseSalesChannelMaps[i];
                            break;
                        }
                    }

                }

                $scope.metaValues.push(data.tableSalesChannelValueInfoValue1);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue2);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue3);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue4);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue5);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue6);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue7);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue8);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue9);
                $scope.metaValues.push(data.tableSalesChannelValueInfoValue10);

                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField1);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField2);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField3);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField4);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField5);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField6);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField7);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField8);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField9);
                $scope.metaInfoValues.push(data.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField10);


                console.log($scope.metaInfoValues);
                for (var i = 0; i < $scope.metaInfoValues.length; i++) {
                    if ($scope.metaInfoValues[i] != null) {
                        $scope.metaChannelData.push({
                            tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                            tableSalesChannelValueInfoValue: $scope.metaValues[i]
                        })
                    }
                }
                $scope.isKeyEntered = [];
                for (var i = 0; i < $scope.metaChannelData.length; i++) {
                    if ($scope.metaChannelData[i].tableSalesChannelValueMetaValue) {
                        $scope.isKeyEntered[i] = false;
                    }
                }
                $('#AddNewSalesChannelDialog').modal('show');
            }
        }).error(function(error, status) {

            console.log(error);
            console.log(status);

        });
    }

    $scope.editSubChannel = function(subChannelData, channelData, metaChannelData,form) {
        console.log(metaChannelData);
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;
        if (metaChannelData.length == 1) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 2) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 3) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 4) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 5) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 6) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 7) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 8) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 9) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
        } else if (metaChannelData.length == 10) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue10 = metaChannelData[9].tableSalesChannelValueInfoValue;
        }

        console.log(postSubChannelData);

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/' + subChannelData.idtableSalesChannelValueInfoId,
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                if($scope.categoryMaster.tableClientProfileCategoryMaster)
                {
                    $scope.updateCategoryMaster();
                }
                $scope.subChannelData = null;
                subChannelData = null;
                $scope.notify("Sale Channel Updated for " + channelData.tableSalesChannelMetaInfoName,'success');
                $scope.listOfSubSaleChannels(channelData);
                $scope.addNewSaleChannelClicked = false;
                $scope.cancelAddNewSalesChannelDialog(form);
            }
        }).error(function(error, status) {
            $scope.cancelAddNewSalesChannelDialog(form);
            console.log(error);

            if(status == 400)
            {
               $scope.notify(error.errorMessage);
                return;
            }
            else
            {
               $scope.notify("Sales channel cannot be updated");
            }
        });
    }

    $scope.authTokenEntered = function(index) {
        if($scope.saleschannelexist == false || $scope.saleChannelMode == 'edit'){
            $scope.showVerifyIntegration = true;
            $scope.integrationVerified = false;
            $scope.integrationNotVerified = false;
            $scope.isKeyEntered[index] = false;
        }
        else{
            $scope.showVerifyIntegration = true;
        }
    };
    $scope.cancelData = function(channelData) {
        $scope.addNewSaleChannelClicked = false;
        $scope.saleChannelMode = 'add';
        $scope.listOfSubSaleChannels(channelData)
    }

    $scope.verifyIntegration = function(subChannelData, channelData, metaChannelData) {
        console.log(metaChannelData);
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;


        if (metaChannelData.length == 1) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[i].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 2) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 3) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 4) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 5) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 6) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;

        }

        if (metaChannelData.length == 7) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 8) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 9) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
        }

        if (metaChannelData.length == 10) {
            postSubChannelData.tableSalesChannelValueInfoValue1 = metaChannelData[0].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue2 = metaChannelData[1].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue3 = metaChannelData[2].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue4 = metaChannelData[3].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue5 = metaChannelData[4].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue6 = metaChannelData[5].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue7 = metaChannelData[6].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue8 = metaChannelData[7].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue9 = metaChannelData[8].tableSalesChannelValueInfoValue;
            postSubChannelData.tableSalesChannelValueInfoValue10 = metaChannelData[9].tableSalesChannelValueInfoValue;
        }


        console.log(postSubChannelData);

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/checkserviceavailability',
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            if (res != null) {
                $scope.showVerifyIntegration = false;
                console.log(res);
                if (res) {
                    $scope.integrationVerified = true;
                    $scope.verificationmessage = 'Verified Successfully';
                    $scope.notify("Verified Successfully!",'success');
                }
                if (!res) {
                    $scope.integrationNotVerified = true;
                   $scope.notify("Verification Failed!");
                }
            }
        }).error(function(error, status) {

            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else {
               $scope.notify("Sale Channel could not Be updated at this time");
            }
        });
    }

    $scope.openHelpModal = function(channelId) {
        console.log(channelId);

        if (channelId == 1) {
            $('#helpAmazonModal').modal('show');
        }
        if (channelId == 3) {
            $('#helpMagentoModal').modal('show');
        }
        if (channelId == 4) {
            $('#helpFlipkartModal').modal('show');
        }
        if (channelId == 5) {
            $('#helpftpModal').modal('show');
        }
    }

    $scope.clearHelpDialog = function() {
        $('#helpMagentoModal').modal('hide');
        $('#helpAmazonModal').modal('hide');
        $('#helpftpModal').modal('hide');
        $('#helpFlipkartModal').modal('hide');
        $('#viewCredentials').modal('hide');
    }

    $scope.viewftpcred = function(){
        $scope.metaRESChannelData = [];
        console.log($scope.metaInfoValues);
        for (var i = 0; i < $scope.metaInfoValues.length; i++) {
            if ($scope.metaInfoValues[i] != null) {
                $scope.metaRESChannelData.push({
                    tableSalesChannelValueMetaValue: $scope.metaInfoValues[i],
                    tableSalesChannelValueInfoValue: $scope.metaValues[i]
                })
            }
        }

        console.log($scope.metaRESChannelData);

        $('#viewCredentials').modal('show');
    }
    $scope.saveSubChannelMetaId5 = function(subChannelData,channelData,metaChannelData,form){
        console.log(subChannelData,channelData,metaChannelData);
        if (!$scope.subChannelData.tableSalesChannelValueInfoName) {
           $scope.notify("Please Enter the Channel Name");
            return;
        }
        if($scope.genericData.returnType == 'quantitybased'){
            subChannelData.tableSalesChannelValueInfoReturnValue = null;
        }else if($scope.genericData.returnType == 'valuebased'){
            subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
        }
        if($scope.subChannelData.tableSalesChannelValueInfoReturnValue != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnValue != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnValue > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnValue < 0)){
           $scope.notify("Return value percentage can not be more than 100 OR less than 0");
            return;
        }

        if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity < 0)){
           $scope.notify("Return Quantity percentage can not be more than 100 OR less than 0");
            return;
        }


        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;

        console.log(postSubChannelData);

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels',
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.subChannelData = null;
                subChannelData = null;
                $scope.notify("New Sales Channel Added for " + channelData.tableSalesChannelMetaInfoName,'success');
                $scope.listOfSubSaleChannels(channelData);
                
                $scope.metaRESValues = [];
                $scope.metaRESInfoValues = [];
                $scope.metaRESChannelData = [];

                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue1);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue2);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue3);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue4);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue5);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue6);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue7);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue8);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue9);
                $scope.metaRESValues.push(res.tableSalesChannelValueInfoValue10);

                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField1);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField2);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField3);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField4);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField5);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField6);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField7);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField8);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField9);
                $scope.metaRESInfoValues.push(res.tableSalesChannelMetaInfo.tableSalesChannelMetaInfoField10);


                console.log($scope.metaRESInfoValues);
                for (var i = 0; i < $scope.metaRESInfoValues.length; i++) {
                    if ($scope.metaRESInfoValues[i] != null) {
                        $scope.metaRESChannelData.push({
                            tableSalesChannelValueMetaValue: $scope.metaRESInfoValues[i],
                            tableSalesChannelValueInfoValue: $scope.metaRESValues[i]
                        })
                    }
                }
                $scope.cancelAddNewSalesChannelDialog(form);
                console.log($scope.metaRESChannelData);

                $('#viewCredentials').modal('show');
            }
        }).error(function(error, status) {
            $scope.cancelAddNewSalesChannelDialog(form);
            console.log(error);
            if(status == 400){
               $scope.notify(error.errorMessage);
            }else {
               $scope.notify("Sale Channel Cannot Be Added");
            }
        });        

    }

    $scope.updateSubChannelMetaId5 = function(subChannelData,channelData,form){
        if(!$scope.subChannelData.tableSalesChannelValueInfoName){
           $scope.notify("Please Enter the Channel Name");
            return;
        }
        if($scope.genericData.returnType == 'quantitybased'){
            subChannelData.tableSalesChannelValueInfoReturnValue = null;
        }else if($scope.genericData.returnType == 'valuebased'){
            subChannelData.tableSalesChannelValueInfoReturnQuantity = null;
        }
        if($scope.subChannelData.tableSalesChannelValueInfoReturnValue != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnValue != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnValue > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnValue < 0)){
           $scope.notify("Return value percentage can not be more than 100 OR less than 0");
            return;
        }

        if($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != 'undefined' && $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity != null && ($scope.subChannelData.tableSalesChannelValueInfoReturnQuantity > 100 || $scope.subChannelData.tableSalesChannelValueInfoReturnQuantity < 0)){
           $scope.notify("Return Quantity percentage can not be more than 100 OR less than 0");
            return;
        }
        var postSubChannelData = subChannelData;
        postSubChannelData.tableSalesChannelMetaInfo = channelData;
        console.log(postSubChannelData);

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/saleschannels/' + subChannelData.idtableSalesChannelValueInfoId,
            data: postSubChannelData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.subChannelData = null;
                subChannelData = null;
                $scope.saleChannelMode = "add";
                $scope.notify("Sales Channel Updated for " + channelData.tableSalesChannelMetaInfoName,'success');
                $scope.listOfSubSaleChannels(channelData);
            }
            $scope.cancelAddNewSalesChannelDialog(form);
        }).error(function(error, status)
        {
            $scope.cancelAddNewSalesChannelDialog(form);
            $scope.saleChannelMode = "add";
            console.log(error);
            if(status == 400)
            {
               $scope.notify(error.errorMessage);
                return;
            }
            else
            {
               $scope.notify("Sales channel cannot be updated");
            }
        });

    }

    $scope.wareHousesLists = [];
    $scope.listOfWareHouses = function() {
        var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses?size=-1&option=towithoutfba&uipagename="+$scope.pagename;
        $http.get(wareHousesListUrl).success(function(data) {
            console.log(data);
            $scope.wareHousesLists = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.listOfWareHouses();

}]);
