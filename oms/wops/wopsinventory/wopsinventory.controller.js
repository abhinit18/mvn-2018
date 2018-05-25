/**
 * Updated by Prakhar Srivastava on 01-12-2017.
 */

angular.module('OMSApp.wopsinventory', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/wopsinventory/', {
        name: '/wopsinventory/',
        url: '/wopsinventory/',
        views: {
            "main": {
                controller: 'wopsinventory',
                templateUrl: 'wops/wopsinventory/wopsinventory.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'wopsinventory'}
    })

}).controller('wopsinventory',['$scope', '$http', '$location','$window', '$mdDialog', 'MavenAppConfig', 'pagerService', '$q', '$cookies', 'mastersService',

function wopsinventory($scope, $http, $location,$window, $mdDialog, MavenAppConfig, pagerService, $q, $cookies, mastersService) {

	$scope.genericData = {};
    $scope.sortType = "skuId"; // set the default sort type
    $scope.sortReverse = true; // set the default sort order
    $scope.directionTypeAll =  'desc';

    $scope.filterObjectData = {};
    $scope.selectedWarehouse  = {};
    $scope.disableAdjustQuantity = [];
    $scope.adjustmentTypeList = [];
    $scope.singleorderData = {};
    $scope.singleorderData.OtherReasonCommit = false;
    $scope.recordsPerPage = [5,10,15];
    $scope.start = 0;
    $scope.inventorySize = $scope.recordsPerPage[0];
    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource+ '/omsservices/webapi/skus/search?search=';

    $scope.onLoad= function () {
        $scope.listOfSkus($scope.start);
        $scope.listOfInventoriesCount();
        $scope.getVendors();
        $scope.getWarehouses();
    };



    //=============================== sorting table ========================== //


    $scope.sortTypeAll = "tableSkuClientSkuCode";
    $scope.directionTypeAll = "asc";
    $scope.sortReverseAll = true;


    $scope.tableSortingAll = function(sortTypeAll, sortReverseAll) {
        console.log(sortTypeAll);
        console.log(sortReverseAll);
        $scope.sortTypeAll = sortTypeAll;
        $scope.sortReverseAll = sortReverseAll;
        console.log($scope.directionTypeAll);
        if (sortReverseAll == true) {
            $scope.directionTypeAll = 'desc';
        }
        if (sortReverseAll == false) {
            $scope.directionTypeAll = 'asc';
        }
        console.log($scope.directionTypeAll);
        $scope.sortReverseAll = !sortReverseAll;

        var page = undefined;
        $scope.listOfInventoriesCount(page);
    }



    //================================= ends Here ============================//


    $scope.cancelSingleOrder = function(){
        $scope.singleorderData = null;
        $scope.modalendminDate = new Date();
        $scope.modalStartminDate = new Date();

    };

    $scope.cancelSingleOrders = function(){
        $mdDialog.hide();
    };

    $scope.modalStartminDate = new Date();
    $scope.modalendminDate = new Date();


    $scope.mainsendStartDate = function(date,value) {
        console.log(date);
        $scope.startDateData = new Date(date);
        if(value == 'blockInventory'){
            $scope.modalendminDate = new Date(
                $scope.startDateData.getFullYear(),
                $scope.startDateData.getMonth(),
                $scope.startDateData.getDate());
        }else{
            $scope.mainendminDate = new Date(
                $scope.startDateData.getFullYear(),
                $scope.startDateData.getMonth(),
                $scope.startDateData.getDate());
        }
        $scope.mainstartmaxDate = "";
    };




    $scope.mainsendEndDate = function(date,value) {
        console.log(date);
        $scope.endDateData = new Date(date);
        if(value == 'blockInventory'){
            $scope.modalStartmaxDate = new Date(
                $scope.endDateData.getFullYear(),
                $scope.endDateData.getMonth(),
                $scope.endDateData.getDate());
        }else{
            $scope.mainstartmaxDate = new Date(
                $scope.endDateData.getFullYear(),
                $scope.endDateData.getMonth(),
                $scope.endDateData.getDate());
        }
        $scope.mainstartminDate = "";
    };

    $scope.singleorderData = {};

    $scope.listOfSkus = function (start) {

        var sortData,directionData;
        if($scope.sortType == undefined || $scope.sortType == "" || $scope.sortType == null)
        {
            sortData = "skuId";
        }
        else
        {
            sortData = $scope.sortType;
        }

        if($scope.directionTypeAll == undefined || $scope.directionTypeAll == "" || $scope.directionTypeAll == null)
        {
            directionData = "asc";
        }
        else
        {
            directionData = $scope.directionTypeAll;
        }

        var inventoryListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/inventory?";
        inventoryListUrl += "start=" + start + '&size='+$scope.inventorySize+'&sort='+sortData+'&direction='+directionData;

        if ($scope.filterObjectData.tableWarehouseDetails) {
            inventoryListUrl += "&warehouseid=" + $scope.filterObjectData.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.skuid) {
            inventoryListUrl += "&skuid=" + $scope.skuid;
        }

        $http.get(inventoryListUrl).success(function (data) {
            console.log(data);
            $scope.inventoryLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.end = $scope.start + data.length;
            $scope.dayDataCollapseFn();

        }).error(function (error, status) {

        });
    };

    // getting the list of warehouses from backend
    $scope.getWarehouses = function () {
        $scope.wareHousesData = [];
        var warehouseUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses?size=-1";
        $http.get(warehouseUrl).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                $scope.wareHousesData.push(data[i]);
            }
        }).error(function (error, status) {



        });
    };

    // getting the list of vendors from backend
    $scope.getVendors = function () {
        $scope.vendorsData = [];
        var vendorsUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors";
        $http.get(vendorsUrl).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                $scope.vendorsData.push(data[i]);
            }
        }).error(function (error, status) {

        });
    };

    $scope.dayDataCollapseFn = function () {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.inventoryLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }

    };

    $scope.listOfSkus($scope.start);
    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.inventorySize = orderSize;
        $scope.end = 0;
        $scope.inventoryLists = [];
        $scope.listOfInventoriesCount(1);
    }

    $scope.listOfInventoriesCount = function (page) {
        var inventoryCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/inventory/filtercount?sort="+$scope.sortType+"&direction="+$scope.directionTypeAll;
        if ($scope.filterObjectData.tableWarehouseDetails) {
            inventoryCountUrl += "&warehouseid=" + $scope.filterObjectData.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if ($scope.skuid) {
            inventoryCountUrl += "&skuid=" + $scope.skuid;
        }

        $http.get(inventoryCountUrl).success(function (data) {
            function setPage(page) {
                if (page < 1 || page > vm.pager.totalPages) {
                    return;
                }

                // get pager object from service
                vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.inventorySize);

                $scope.vmPager = vm.pager;

                $scope.start = (vm.pager.currentPage - 1) * $scope.inventorySize;
                

                // get current page of items
                vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                $scope.vmItems = vm.items;
                $scope.listOfSkus($scope.start);
            }
            $scope.invCount = data;
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.invCount); // dummy array of items to be paged
                vm.pager = {};
                vm.setPage = setPage;

                if (page == undefined) {
                    function initController() {
                        // initialize to page 1
                        vm.setPage(1);
                    }
                    initController();
                }

                if (page != undefined) {
                    vm.setPage(page);

                }


            }
        }).error(function (error, status) {



        });
    };


    //================================= inventory search ========================== //

    $scope.callDisabled = function(){
        $scope.isSubmitDisabledInv = false;
    }
    $scope.searchedProductForFilter = function(selected) {
        if(selected != null && selected != undefined) {
            $scope.filterObjectData.sku = selected.originalObject;
            $scope.skuid = selected.originalObject.idtableSkuId;
            $scope.callDisabled();
        }
    }


    $scope.submitInventoryAction = function(wid, skuid, startDate, endDate) {
        if (wid != undefined) {
            $scope.warehouseid = wid;
        }
        if (skuid != undefined) {
            $scope.skuid = skuid;
        }
        if (startDate != undefined) {
            $scope.startDate = moment.utc(startDate).format();
        }
        if (endDate != undefined) {
            $scope.endDate = moment.utc(endDate).format();
        }
        $scope.start = 0;
        // $scope.listOfInventories();
        var page = undefined;
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = false;

        $scope.listOfInventoriesCount(page);
    }

    if ($window.localStorage.getItem("wopsinventoryFilter") !== null) {
        console.log($window.localStorage.getItem("wopsinventoryFilter"));
        var wopsinventoryField = JSON.parse($window.localStorage.getItem("wopsinventoryFilter"));
        $scope.filterObjectData.tableWarehouseDetails = wopsinventoryField.warehouse;
        $scope.filterObjectData.sku = wopsinventoryField.sku;
        $scope.skuid = wopsinventoryField.sku.idtableSkuId;
        $scope.submitInventoryAction();

    }
    //====================================== clear Filter  =================================== //
    $scope.isSubmitDisabledInv = true;
    $scope.isResetDisabledInv = true;

    $scope.clearActionInv = function() {
        $scope.warehouseid = undefined;
        $scope.filterObjectData = {};
        $scope.skuid = "";
        $scope.startDate = "";
        $scope.endDate = "";
        $scope.start1Date = undefined;
        $scope.end1Date = undefined;
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.start = 0;
        var page = undefined;
        $scope.isSubmitDisabledInv = true;
        $scope.isResetDisabledInv = false;
        $scope.listOfInventoriesCount(page);
        $window.localStorage.removeItem('wopsinventoryFilter');
    }

    $scope.newTab = function(){
        if($scope.filterObjectData.tableWarehouseDetails || $scope.filterObjectData.sku){
            var wopsinventoryField = {
                warehouse : $scope.filterObjectData.tableWarehouseDetails,
                sku : $scope.filterObjectData.sku
            }
            $window.localStorage.setItem('wopsinventoryFilter',JSON.stringify(wopsinventoryField))
        }
        console.log($location.absUrl());
        $window.open($location.absUrl(), "_blank");
        // $window.location.href = ('/inventory/');
    }

    $scope.LoadSkuData = function(SkuInventoryData)
    {
        console.log(SkuInventoryData);
        var inventorySkuListUrl =  MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/warehouseinventory?';
        if ($scope.filterObjectData.tableWarehouseDetails) {
            inventorySkuListUrl += "&warehouseid=" + $scope.filterObjectData.tableWarehouseDetails.idtableWarehouseDetailsId;
        }
        if (SkuInventoryData.skuId) {
            inventorySkuListUrl += "&skuid=" + SkuInventoryData.skuId;
        }
        $http.get(inventorySkuListUrl).success(function (data)
        {
            console.log(data);
            $scope.warehouseInventoryData = data;
        }).error(function(data){
            console.log(data);
        });
    }

    $scope.selectTableRow = function (index, storeId)
    {
        $scope.warehouseInventoryData = [];

        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }

        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "" && $scope.storeIdExpanded === "") {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.storeIdExpanded = storeId;
            $scope.dayDataCollapse[index] = true;

        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index && $scope.storeIdExpanded === storeId) {
                $scope.tableRowExpanded = false;
                $scope.tableRowIndexExpandedCurr = "";
                $scope.storeIdExpanded = "";
                $scope.dayDataCollapse[index] = false;

            } else {
                $scope.tableRowIndexExpandedPrev = $scope.tableRowIndexExpandedCurr;
                $scope.tableRowIndexExpandedCurr = index;
                $scope.storeIdExpanded = storeId;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedPrev] = false;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedCurr] = true;
            }
        }

    };

//    ========================================== edit Inventory ================================ //
    $scope.SkuInventoryPostDetails = {};

    $scope.EditSkuInventory = function(data){
        console.log(data);
        console.log($scope.SkuInventoryPostDetails.dataSku);
        var manufacturingDate = new Date($scope.SkuInventoryPostDetails.dataSku.tableSkuInventoryMfgDate);
        var mfg = moment(manufacturingDate.toString()).format('YYYY-DD-MM');
        var expiryDate = new Date($scope.SkuInventoryPostDetails.dataSku.tableSkuInventoryExpiryDate);
        var expiry = moment(expiryDate.toString()).format('YYYY-DD-MM');
        var EditSkuPost = {
            "idtableSkuInventoryId": $scope.SkuInventoryPostDetails.dataSku.idtableSkuInventoryId,
            "tableSkuInventoryMaxRetailPrice": data.MRP,
            "tableSkuInventoryBatchNo": data.batch,
            "tableSkuInventoryMfgDate": mfg,
            "tableSkuInventoryExpiryDate": expiry,
            "tableSkuInventoryShelfLifeInDays": data.shelf,
            "tableSkuInventoryMinSalePrice": $scope.SkuInventoryPostDetails.dataSku.tableSkuInventoryMinSalePrice,
            "tableSkuInventoryWhCount": data.wh,
            "tableSkuInventoryRackCount": $scope.SkuInventoryPostDetails.dataSku.tableSkuInventoryRackCount,
            "tableSkuInventoryAvailableCount": data.available,
            "tableSkuInventoryAllocatedCount": data.allocated,
            "tableSkuInventorySoldCount": $scope.SkuInventoryPostDetails.dataSku.tableSkuInventorySoldCount,
            "tableSkuInventoryBlockedCount": data.blockedCount,
            "tableSkuInventoryPutAwayBinCount":  $scope.SkuInventoryPostDetails.dataSku.tableSkuInventoryPutAwayBinCount,
            "tableSkuInventoryPickUpBinCount":$scope.SkuInventoryPostDetails.dataSku.tableSkuInventoryPickUpBinCount,
            "tableSkuInventoryInwardQcFailedCount": data.inward,
            "tableSkuInventoryOutwardQcFailedCount": data.outward,
            "tableSkuInventoryMismatchCount": $scope.SkuInventoryPostDetails.dataSku.tableSkuInventoryMismatchCount,
            "tableSkuInventoryCreationDate": data.tableSkuCreationDatetime
        };

        ///omsservices/webapi/inventory/1
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/inventory/'+$scope.SkuInventoryPostDetails.dataSku.idtableSkuInventoryId,
            data: EditSkuPost,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response){
            console.log(response);
            $scope.listOfInventoriesCount();
            $('#EditSku').modal('hide');
        }).error(function(response){
            console.log(response);
        });
    };

//    ========================================== Block Inventory =========================== //

    ///omsservices/webapi/skuinventoryadjustmentreason

    $scope.CheckBlockReason = function(data){
        console.log(data);
        console.log(typeof data);
        $scope.subReason = data;
    };
    $scope.listOfWareHouses = function() {
        $scope.wareHousesData = [];
        var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses?size=-1";
        // console.log(channelListUrl);
        $http.get(wareHousesListUrl).success(function(data) {
            console.log(data);
            $scope.wareHousesLists = data;

            for (var i = 0; i < $scope.wareHousesLists.length; i++) {
                $scope.wareHousesData.push($scope.wareHousesLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.getBlockedInventoryRecords =  function () {

        $scope.blockedRecords = [];


        var getBlockedInventoryURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/'
                                            + $scope.SkuInventoryPostDetails.idtableSkuInventoryId
                                            + '/skuadjustmentinventorymap' ;
        $http.get(getBlockedInventoryURL).success(function (data)
        {
            console.log(data);
            if(data.length == 0)
            {
                $scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType = null;
               $scope.notify('There are no records to unblock');
                return;
            }
            $scope.blockedRecords = data;

        }).error(function(data)
        {
            console.log(data);
        });

    }

    $scope.onAdjustmentTypeSelected= function()
    {
        if($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType == 2)
        {
            $scope.getBlockedInventoryRecords();
        }
        var adjustInventoryReasonURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuinventoryadjustmentreason?adjtype=' + $scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType;
        $http.get(adjustInventoryReasonURL).success(function (data) {
            console.log(data);
            $scope.adjustReasonList = data;
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.getAdjustmentTypeList = function(){
        var adjTypesUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuinventoryadjtype';
        $http.get(adjTypesUrl).success(function (data) {
            console.log(data);
            $scope.adjustmentTypeList = data;
        }).error(function(data){
            console.log(data);
        });
    };
    $scope.getAdjustmentTypeList();

    $scope.customerid = "";
    $scope.searchedCustomer = function(selected) {
        if (selected != null) {
            $scope.customerid = selected.originalObject;
        }
        $scope.callDisabled();
    }
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
    $scope.BlockInventoryDataTable = function (value,SkuValue) {
        console.log(value);
        console.log(SkuValue);
        $scope.selectedWarehouse = value;
      var  blockSkuInventoryDataTable = MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/sku/'+SkuValue.skuId+'/warehouse/'+value.warehouseId;

        $http.get(blockSkuInventoryDataTable).success(function (data) {
            console.log(data);
            $scope.blockedDataTableList = data;

            $scope.disableAdjustQuantity = [];
            for(var inventoryCounter = 0; inventoryCounter < $scope.blockedDataTableList.length; inventoryCounter++)
            {
                $scope.checkAdjustQuantity($scope.blockedDataTableList[inventoryCounter] , inventoryCounter)
            }

            $('#BlockQuantityDataTableList').modal('show');
        }).error(function(data){
            console.log(data);
        });

    };
    
    $scope.cancelBlockQuantityDataTableListDialog = function () {
        $scope.selectedWarehouse = {};
        $('#BlockQuantityDataTableList').modal('hide');

    }

    $scope.BlockInventory = function (value)
    {
        if(value.tableWarehouseDetails.tableWarehouseDetailsWmsId != null)
        {
            $scope.adjustmentTypeListFiltered = angular.copy($scope.adjustmentTypeList);
            $scope.adjustmentTypeListFiltered.splice(2,4);
        }
        else
        {
            $scope.adjustmentTypeListFiltered = angular.copy($scope.adjustmentTypeList);
        }
        console.log(value);
        $scope.$broadcast('angucomplete-alt:clearInput', 'customersMain');
        $scope.SkuInventoryPostDetails.idtableSkuInventoryId = value.idtableSkuInventoryId;
        $scope.SkuInventoryPostDetails.Post = value.idtableSkuInventoryId;
        $scope.SkuInventoryPostDetails.PostValue = value;
        //$('#BlockQuantityDataTableList').modal('hide');
        $('#AdjustQuantity').modal('show');
    };


    $scope.singleorderData = {};
	
	$scope.cancelBlockInventory = function(form){
		$scope.singleorderData.adjustQuantity = null;
		$scope.singleorderData.blockReason = null;
		$scope.singleorderData.OtherReason = null;
        $scope.singleorderData.OtherReasonCommit = false;
        $scope.searchStr = null;
		$scope.singleorderData.tableScheduledBlockStartDatetime = null;
		$scope.singleorderData.tableScheduledBlockEndDatetime = null;
		$scope.customerid = null;
		$scope.singleorderData.wareHousesData = null;		
		$scope.subReason = null;
        $scope.singleorderData.adjustmentType = null;
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#AdjustQuantity').modal('hide');
	}

    $scope.AdjustSkuQuantity = function(data,form)
    {
        console.log($scope.customerid);

        console.log($scope.SkuInventoryPostDetails.PostValue.tableSkuInventoryAvailableCount);
        console.log(data);
        if($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType != 2) {
            if (data.adjustQuantity == null || data.adjustQuantity == undefined || data.adjustQuantity == "") {
               $scope.notify("Enter block quantity");
                return;
            }
        }
		if(data.blockReason == null || data.blockReason == undefined || data.blockReason == ""){
			$scope.notify("Please select cancel reason");
			return;
		}
        var postData,BlockReasons,startDate,EndDate,customer,skuWarehouseData,NewReason;
		BlockReasons = data.blockReason;
		if(BlockReasons.idtableSkuInventoryAdjustmentReasonId == 1){ //Customer
		 if($scope.customerid == "" || $scope.customerid == null || $scope.customerid == undefined ){
			$scope.notify("Please select customer");
			return;
		 }
		}
		else if(BlockReasons.idtableSkuInventoryAdjustmentReasonId == 2){ // Stock Transfer
		 if($scope.singleorderData.wareHousesData == "" || $scope.singleorderData.wareHousesData == null || $scope.singleorderData.wareHousesData == undefined ){
			$scope.notify("Please select warehouse");
			return;
		 }
		}

		if(BlockReasons.tableSkuInventoryAdjustmentReasonString == "Other")
		{ //Other

             if($scope.singleorderData.OtherReason == "" || $scope.singleorderData.OtherReason == null || $scope.singleorderData.OtherReason == undefined )
             {
                   $scope.notify("Please enter adjustment reason");
                    return;
             }
             else if($scope.singleorderData.OtherReason.length > 128)
             {
                   $scope.notify("Reason should be less than or equal to 128 characters.")
                    return;
             }
		}

		if($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType == 1)
		{
            if (data.tableScheduledBlockStartDatetime == null || data.tableScheduledBlockStartDatetime == undefined || data.tableScheduledBlockStartDatetime == "") {
               $scope.notify("Start Date is mandatory");
                return;
            }
            if (data.tableScheduledBlockEndDatetime == null || data.tableScheduledBlockEndDatetime == undefined || data.tableScheduledBlockEndDatetime == "") {
               $scope.notify("End Date is mandatory");
                return;
            }

            EndDate = moment.utc(data.tableScheduledBlockEndDatetime).format();
            startDate = moment.utc(data.tableScheduledBlockStartDatetime).format();

            if(data.tableScheduledBlockStartDatetime > data.tableScheduledBlockEndDatetime)
            {
               $scope.notify('Start Date must not be greater than End time.');
                return;
            }
            if(data.tableScheduledBlockStartDatetime == data.tableScheduledBlockEndDatetime)
            {
               $scope.notify('Start Date must not be  equal to End time.');
                return;
            }
            if($scope.SkuInventoryPostDetails.PostValue.tableSkuInventoryAvailableCount < data.adjustQuantity)
            {
               $scope.notify('Blocked quantity must not be greater than available count');
                return;
            }
        }

        if($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType == 2)
        {
            for(var blockedRecordsCount = 0; blockedRecordsCount < $scope.blockedRecords.length ; blockedRecordsCount++)
            {
                if($scope.blockedRecords[blockedRecordsCount].unblockQuantity > $scope.blockedRecords[blockedRecordsCount].tableSkuAdjustmentInventoryMapAdjQuantity) {
                   $scope.notify('Unblock quantity must not be greater than blocked quantity');
                    return;
                }
            }
        }

        if($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType == 3)
        {
            if($scope.SkuInventoryPostDetails.PostValue.tableSkuInventoryInwardQcFailedCount + $scope.SkuInventoryPostDetails.PostValue.tableSkuInventoryOutwardQcFailedCount < data.adjustQuantity)
            {
               $scope.notify('Adjustment quantity must not be greater than bad quantity');
                return;
            }
        }

        if($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType == 4)
        {
            if($scope.SkuInventoryPostDetails.PostValue.tableSkuInventoryAvailableCount < data.adjustQuantity)
            {
               $scope.notify('Bad quantity must not be greater than available count');
                return;
            }
        }

        if($scope.customerid == "" || $scope.customerid == null || $scope.customerid == undefined ){
            customer = null;
        }else if($scope.customerid != "" && $scope.customerid != null && $scope.customerid != undefined){
            customer = $scope.customerid;
        }
        if($scope.singleorderData.wareHousesData == "" || $scope.singleorderData.wareHousesData == null || $scope.singleorderData.wareHousesData == undefined ){
            skuWarehouseData = null;
        }else if($scope.singleorderData.wareHousesData != "" && $scope.singleorderData.wareHousesData != null && $scope.singleorderData.wareHousesData != undefined){
            skuWarehouseData = $scope.singleorderData.wareHousesData;
        }
        if(data.OtherReason == "" || data.OtherReason == null || data.OtherReason == undefined ){
            NewReason = null;
        }else if(data.OtherReason != "" && data.OtherReason != null && data.OtherReason != undefined){
            NewReason = data.OtherReason;
        }

        if($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType == 2)
        {
            for(var blockedRecordsCount = 0; blockedRecordsCount < $scope.blockedRecords.length ; blockedRecordsCount++)
            {
                if ($scope.blockedRecords[blockedRecordsCount].unblockQuantity > 0) {
                    $scope.blockedRecords[blockedRecordsCount].tableSkuInventoryAdjustmentReason = BlockReasons,
                        $scope.blockedRecords[blockedRecordsCount].tableSkuInventoryAdjType = $scope.singleorderData.adjustmentType;
                    $scope.blockedRecords[blockedRecordsCount].unblockQuantity = $scope.blockedRecords[blockedRecordsCount].unblockQuantity;
                    postData = $scope.blockedRecords[blockedRecordsCount];
                    console.log(postData);
                    $scope.postInventoryAdjustmentData(postData,form);
                }
            }
        }
        else
        {
            postData =
                {
                    "tableSkuInventoryAdjustmentReason": BlockReasons,
                    "tableSkuAdjustmentInventoryMapBlockedOnDatetime": startDate,
                    "tableSkuAdjustmentInventoryMapBlockedTillDatetime": EndDate,
                    "tableSkuAdjustmentInventoryMapOtherRemarks": NewReason,
                    "tableWarehouseDetails": skuWarehouseData,
                    "tableCustomer": customer,
                    "tableSkuAdjustmentInventoryMapAdjQuantity": data.adjustQuantity,
                    "tableSkuInventoryAdjType": $scope.singleorderData.adjustmentType

                };

            console.log(postData);
            $scope.postInventoryAdjustmentData(postData,form)

        }
    }

    $scope.postInventoryAdjustmentData =  function (postData,form) {

	    var q = $q.defer();

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/' + $scope.SkuInventoryPostDetails.idtableSkuInventoryId + '/skuadjustmentinventorymap',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (response) {
            console.log(response);

            var successMessage = "";
            switch ($scope.singleorderData.adjustmentType.idtableSkuInventoryAdjType) {
                case 1:
                    successMessage = 'Sku blocked successfully';
                    break;
                case 2:
                    successMessage = 'Sku un-blocked successfully';
                    break;
                case 3:
                    successMessage = 'Sku marked good successfully';
                    break;
                case 4:
                    successMessage = 'Sku marked bad successfully';
                    break;

            }
            $scope.notify(successMessage,'success');
            if ($scope.singleorderData.OtherReasonCommit == true) {
                $scope.commitNewAdjustmentReason($scope.singleorderData.adjustmentType, $scope.singleorderData.OtherReason)
            }

            $scope.cancelBlockInventory(form);
            $scope.listOfInventoriesCount();
            $('#AdjustQuantity').modal('hide');
            $('#BlockQuantityDataTableList').modal('hide');
            q.resolve(true);

        }).error(function (error, status)
        {
            console.log(error);
            if (status == 400) {
               $scope.notify(error.errorMessage);
            }
            else {
               $scope.notify('There is some unknown error. Please contact system administrator');
            }
            q.resolve(false);
        });

        q.promise;

    }

    $scope.checkAdjustQuantity = function (SkuData, index) {
        $scope.disableAdjustQuantity[index] = true;
        if($scope.access.editAccess == true)
        {
            if(SkuData.tableSkuInventoryAvailableCount > 0)
                $scope.disableAdjustQuantity[index] = false;
            if(SkuData.tableSkuInventoryBlockedCount > 0)
                $scope.disableAdjustQuantity[index] = false;
            if(SkuData.tableSkuInventoryInwardQcFailedCount + SkuData.tableSkuInventoryOutwardQcFailedCount > 0)
                $scope.disableAdjustQuantity[index] = false;
            return true;
        }
    }


    $scope.commitNewAdjustmentReason = function (adjustmenttype, adjustmentreason) {

        var q = $q.defer();

        var postData = {
            "tableSkuInventoryAdjustmentReasonString" : adjustmentreason
        }

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuinventoryadjtype/'+adjustmenttype.idtableSkuInventoryAdjType+'/adjustmentreason',
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response) {
            console.log(response);
            $scope.notify("Added the new adjustment reason",'success');
            q.resolve(true);
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            q.resolve(false);
        });
        return q.promise;
    }

    //================================= table sorting ================================ //

    $scope.tableSorting = function(sortTypeAll, sortReverseAll) {
        console.log($scope.sortType);
        console.log(sortTypeAll);
        console.log(sortReverseAll);
        $scope.sortType = sortTypeAll;
        $scope.sortReverse = sortReverseAll;
        console.log($scope.directionTypeAll);
        if (sortReverseAll == true) {
            $scope.directionTypeAll = 'desc';
        }
        if (sortReverseAll == false) {
            $scope.directionTypeAll = 'asc';
        }
        console.log($scope.directionTypeAll);
        $scope.sortReverse = !sortReverseAll;

        var page = undefined;
        console.log($scope.sortType);
        $scope.listOfInventoriesCount(page);
    }

	$scope.cancelmastersDialog = function(){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');
		
	}

    var skuStart=0,size=10;
    $scope.skuLoadBusy = false;
    $scope.stopSkuLoad = false;
    $scope.skuPagingFunction = function () {
        if($scope.stopSkuLoad){
            return;
        }
        $scope.skuLoadBusy = true;
        mastersService.fetchSkusNext(MavenAppConfig.baseUrlSource,skuStart,size,function(data){
            if(data.length > 0){
                $scope.genericData.skusListFiltered = $scope.genericData.skusListFiltered.concat(data);
                skuStart += size;
                $scope.skuLoadBusy = false;
            }
            else{
                $scope.skuLoadBusy = true;
            }

        });

    }

	
	$scope.masterSkuDialog = function(ev, check){		
		
		mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data){
			$scope.genericData.skusListFiltered = data;
		})
		
        $('#dialogmastersku').modal('show');
        $scope.skuLoadBusy = false;
        $scope.stopSkuLoad = false;
		$scope.genericData.check = check;
		
	}
	
	$scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
		$http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
		$scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
		 
        }).error(function(error, status) {
            console.log(error);
			
        });	
		
		$scope.cancelmastersDialog();		
	}
    $scope.checkNumber = checkNumber;

    $scope.$on('$destroy', function () {
        $window.localStorage.removeItem('wopsinventoryFilter');
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });
}]);
