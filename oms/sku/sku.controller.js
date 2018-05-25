angular.module('OMSApp.sku', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/sku/', {
        name: '/sku/',
        url: '/sku/',
        views: {
            "main": {
                controller: 'skuController',
                templateUrl: 'sku/sku.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'SKU'}
    })

}).controller('skuController', ['$rootScope','$scope','$sce', '$http', '$location', 'skuService', 'Upload', 'pagerService', '$mdDialog','$q','$timeout','$cookies', 'MavenAppConfig', 'mastersService',

    function skuController($rootScope, $scope,$sce, $http, $location, skuService, Upload, pagerService,$mdDialog, $q,$timeout,$cookies,MavenAppConfig, mastersService) {
        $scope.productDimClicked = false;
        $scope.shelfLifeClicked = false;
        $scope.attributesClicked = false;
        $scope.propertiesClicked = false;
        $scope.kitDetailsClicked = false;
        $scope.virtualkitDetailsClicked = false;
        $scope.inventoryDetailsClicked = false;

        $scope.virtualKitEditable = false;
        $scope.genericData = {};
        $scope.genericData.enableSorting = true;

        $scope.selectedCategory = {};
        $scope.attributeListBindArray = [];
        $scope.attributeListSelectedValuesArray = {};

        $scope.dialogBoxSkuMode = "add";
        $scope.dialogBoxKitMode = "add";
        $scope.dialogBoxVirtualKitMode = "add";

        $scope.searchSKUClicked = false;
        $scope.searchNormalSKUClicked = false;
        $scope.searchKitSKUClicked = false;
        $scope.searchVKitSKUClicked = false;
        $scope.skuClassificationArray = [];

        $scope.skuData = {};
        $scope.skuKitList = [];
        $scope.skuvirtualKitList = [];
        $scope.kitData = {};
        $scope.virtualkitData = {};
        $scope.shelfTypeID = "";
        $scope.start = 0;
        $scope.recordsPerPage = [5,10,15];
        $scope.skuSize = $scope.recordsPerPage[0];
        $scope.normalSkuStart = 0;
        $scope.normalSkuSize = $scope.recordsPerPage[0];
        $scope.kitSkuStart = 0;
        $scope.kitSkuSize = $scope.recordsPerPage[0];
        $scope.virtualKitStart = 0;
    	$scope.abstractSkusStart = 0;
        $scope.virtualKitSize = $scope.recordsPerPage[0];
    	$scope.abstractSkusSize = $scope.recordsPerPage[0];
        $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
        $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
        $scope.items = ["Poisonous", "Stackable", "Fragile", "Saleable", "USN required" , "Consumable", "Hazardous", "High value", "QC required", "Temperature controlled", "Returnable"];
        $scope.selected = [];
        $scope.brandName = "";
        $scope.categoryName = "";

        $scope.skuSalesChannelMapFilterObject = {
            "allSalesChannelSelected" : false,
            "allSkuSelected" : false,
            "tableSalesChannelExclusions": [],
            "tableSkuExclusions": []
        };

        $scope.modeSku = "normal";
        $scope.modeNormalSku = "normal";
        $scope.modeKitSku = "normal";
        $scope.modeVKitSku = "normal";

        $scope.downloadSkuTemplateUrl = MavenAppConfig.s3+ MavenAppConfig.downloadSkuTemplateUrl;

        // $scope.genericData.downloadSkuSalesChannelMapTemplateUrl = MavenAppConfig.downloadSkuSalesChannelMapTemplateUrl
        $scope.skuImageArray = [null,null,null,null];
        $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
        $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
        $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
        $scope.skuImgUrl4 = "images/svg/add_image_active.svg";

        $scope.img1PresentId = 0;
        $scope.img2PresentId = 0;
        $scope.img3PresentId = 0;
        $scope.img4PresentId = 0;
        $scope.fromDelete1 = false;
        $scope.fromDelete2 = false;
        $scope.fromDelete3 = false;
        $scope.fromDelete4 = false;

        $scope.isSubmitDisabledAll = true;
        $scope.isResetDisabledAll = true;
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = true;
        $scope.isSubmitDisabledKit = true;
        $scope.isResetDisabledKit = true;
        $scope.isSubmitDisabledVkit = true;
        $scope.isResetDisabledVkit = true;

        $scope.isProductSelected = false;
        $scope.isQuantityEntered = false;

        $scope.buttonBrandSaveDisable = false;
        $scope.showNormalSkuTab = true;
        $scope.showKitSkuTab = true;
        $scope.showVirtualkitSkuTab = true;
        $scope.selectedTab = "All";

        $scope.getSalesChannels = function () {
            $scope.salesChannels = [];
            var channelListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels";
            $http.get(channelListUrl).success(function (data) {
                console.log(data);
                $scope.salesChannels = data;
                $scope.onLoad();
            }).error(function (error, status) {
                console.log(error);
                console.log(status);

            });
        };
        $scope.getSalesChannels();

        $scope.addSalesChannelToList = function () {

            console.log($scope.genericData.selectedSalesChannel);
            if ($scope.genericData.selectedSalesChannel == "" || $scope.genericData.selectedSalesChannel == undefined) {
                $scope.notify('Select a sales channel first','danger');
            } else {
                var salesChannelListing = true;
                angular.forEach($scope.skuSalesChannelMapFilterObject.tableSalesChannelExclusions,function(value){
                    console.log(value);
                    if(value.idtableSalesChannelValueInfoId == $scope.genericData.selectedSalesChannel.idtableSalesChannelValueInfoId){
                        salesChannelListing = false;
                    }
                });
                if(salesChannelListing == false){
                    $scope.notify('Sales Channel is already added in the list.');
                    return;
                }
                $scope.skuSalesChannelMapFilterObject.tableSalesChannelExclusions.push($scope.genericData.selectedSalesChannel);
            }
        };

        $scope.searchedEntitySelected = function (selected) {
            if(selected!=null && selected !=undefined) {
                $scope.searchedSKU = selected.originalObject;
            }
        };

        $scope.addSkusToList = function () {

            console.log($scope.searchedSKU);
            if ($scope.searchedSKU == "" || $scope.searchedSKU == undefined) {
                $scope.notify('Select a SKU first');
            } else {
                var salesChannelListing = true;
                angular.forEach($scope.skuSalesChannelMapFilterObject.tableSkuExclusions,function(value){
                    console.log(value);
                    if(value.idtableSkuId == $scope.searchedSKU.idtableSkuId){
                        salesChannelListing = false;
                    }
                });
                if(salesChannelListing == false){
                    $scope.notify('SKU is already added in the list.');
                    return;
                }
                $scope.skuSalesChannelMapFilterObject.tableSkuExclusions.push($scope.searchedSKU);

                $scope.$broadcast("angucomplete-alt-long:clearInput", "skuForMapFilter");
            }
        };

        $scope.removeSkuFromList = function (removedSku) {

            $scope.skuSalesChannelMapFilterObject.tableSkuExclusions.splice(removedSku, 1);

        }

        $scope.removeSalesChannelFromList = function (removedSalesChannel) {

            $scope.skuSalesChannelMapFilterObject.tableSalesChannelExclusions.splice(removedSalesChannel, 1);

        }

        $scope.callDisabledAll = function (skuString) {
            $scope.isSubmitDisabledAll = false;
            !skuString?$scope.clearAllSkuAction():null;
        }

        $scope.callDisabledSku = function (skuString) {
            $scope.isSubmitDisabledSku = false;
            !skuString?$scope.clearNormalSkuAction():null;
        }

        $scope.callDisabledKit = function (skuString) {
            $scope.isSubmitDisabledKit = false;
            !skuString?$scope.clearKitSkuAction():null;
        }

        $scope.callDisabledVkit = function (skuString) {
            $scope.isSubmitDisabledVkit = false;
            !skuString?$scope.clearVkitSkuAction():null;
        }

        $scope.sortTypeAll = "tableSkuSystemNo";
        $scope.directionTypeAll = "desc";
        $scope.sortReverseAll = false;
        $scope.sortTypeNormal = "tableSkuSystemNo";
        $scope.directionTypeNormal = "desc";
        $scope.sortReverseNormal = false;
        $scope.sortTypeKit = "tableSkuSystemNo";
        $scope.directionTypeKit = "desc";
        $scope.sortReverseKit = false;
        $scope.sortTypeVKit = "tableSkuSystemNo";
        $scope.directionTypeVKit = "desc";
        $scope.sortReverseVKit = false;
    	$scope.sortReverseAbstractSkus = false;
    	$scope.directionTypeAbstractSkus = "desc";

        $scope.barcode = {};

        $scope.setClassifiactionvalues = function () {
            $scope.skuClassificationArray.push("A");
            $scope.skuClassificationArray.push("B");
            $scope.skuClassificationArray.push("C");
        }

        $scope.setClassifiactionvalues();

        $scope.skuClientCodeChanged = function (skuSellerId) {
            if (skuSellerId) {
                if ($scope.originalSellerSkuId == skuSellerId) {
                    $scope.sellerSkuIdChangedFlag = false;
                } else {
                    $scope.sellerSkuIdChangedFlag = true;
                }
                $scope.isSellerSkuIdEntered = false;
            } else {
                $scope.isSellerSkuIdEntered = true;
            }
        };

        $scope.skuNameChanged = function (skuName) {
            if (skuName) {
                $scope.isSkuNameEntered = false;
            } else {
                $scope.isSkuNameEntered = true;
            }
        };

        $scope.upcCodeChanged = function (upcCode) {
            if (upcCode) {
                if ($scope.originalupcCode == upcCode) {
                    $scope.upcCodeChangedFlag = false;
                } else {
                    $scope.upcCodeChangedFlag = true;
                }
                $scope.isUpcCodeEntered = false;
            }
        };

        $scope.skuCategoryChanged = function (catg) {
            $scope.selectedCategory = catg;
            if (catg) {
                $scope.isSkuCategorySelected = false;
                $scope.attributeArray();
                $scope.kitData.tableHsn = catg.tableHsn;
                $scope.skuData.tableHsn = catg.tableHsn;
                $scope.virtualkitData.tableHsn = catg.tableHsn;
            } else {
                $scope.isSkuCategorySelected = true;

            }
        };

        $scope.skuAttributeValueChanged = function (attribkey, attribval) {
            console.log(attribkey);
            console.log(attribval);
        var found = false;
        for(var counter =0; counter < $scope.attributeListBindArray.length; counter++)
        {
            if($scope.attributeListBindArray[counter].key.idattributeTypeId == attribkey.idattributeTypeId)
            {
                if(!attribval){
                    $scope.attributeListBindArray.splice(counter,1);
                    found = true;
                }else{
                    $scope.attributeListBindArray[counter].val = attribval;
                    found = true;
                }
                break;
            }
        }

        if(found == false) {
            $scope.attributeListBindArray.push(
                {
                    "key": attribkey,
                    "val": attribval
                })
        }
            $scope.attributeListSelectedValuesArray[attribkey.attributeTypeString] = attribval;
        };

        $scope.skuAttributeValueAdded = function (attribkey, attribval) {
            if (attribkey == null || attribkey == undefined || attribval == undefined || attribval == null) {
                return;
            }
            console.log(attribkey);
            console.log(attribval);
        var found = false;
        for(var counter =0; counter < $scope.attributeListBindArray.length; counter++)
        {
            if($scope.attributeListBindArray[counter].key.idattributeTypeId == attribkey.idattributeTypeId)
            {
                $scope.attributeListBindArray[counter].val = attribval;
                found = true;
                break;
            }
        }

        if(found == false) {
            $scope.attributeListBindArray.push(
                {
                    "key": attribkey,
                    "val": attribval
                })
        }
            $scope.attributeListSelectedValuesArray[attribkey.attributeTypeString] = attribval;
        };



        $scope.skuBrandChanged = function(brand) {
            if (brand) {
                $scope.isSkuBrandSelected = false;
            } else {
                $scope.isSkuBrandSelected = true;
            }
        };

        $scope.skuDescChanged = function(desc) {
            if (desc) {
                $scope.isSkuDescEntered = false;
            } else {
                $scope.isSkuDescEntered = true;
            }
        };

        $scope.skuHSNChanged = function(hsn){
            if (hsn) {
                $scope.isSellerHSNEntered = false;
            } else {
                $scope.isSellerHSNEntered = true;
            }
        }

        $scope.skuLengthChanged = function(len) {
            if (len) {
                $scope.isSkuLengthEntered = false;
            } else {
                $scope.isSkuLengthEntered = true;
            }
        };

        $scope.skuWidthChanged = function(width) {
            if (width) {
                $scope.isSkuWidthEntered = false;
            } else {
                $scope.isSkuWidthEntered = true;
            }
        };

        $scope.skuHeightChanged = function(height) {
            if (height) {
                $scope.isSkuHeightEntered = false;
            } else {
                $scope.isSkuHeightEntered = true;
            }
        };

        $scope.skuWeightChanged = function(weight) {
            if (weight) {
                $scope.isSkuWeightEntered = false;
            } else {
                $scope.isSkuWeightEntered = true;
            }
        };

        $scope.dimUnitChanged = function(dimUnit) {
            if (dimUnit) {
                $scope.isDimUnitSelected = false;
            } else {
                $scope.isDimUnitSelected = true;
            }
        };

        $scope.weightUnitChanged = function(weightUnit) {
            if (weightUnit) {
                $scope.isWeightUnitSelected = false;
            } else {
                $scope.isWeightUnitSelected = true;
            }
        };

        $scope.shelfTypeChanged = function(shelfType) {
            if (shelfType) {
                $scope.isShelfTypeSelected = false;
                $scope.shelfTypeID = shelfType.idtableSkuShelfLifeTypeId;
            } else {
                $scope.isShelfTypeSelected = true;
            }
        };

        $scope.skuMrpChanged = function(mrp) {
            if (mrp) {
                $scope.isSkuMrpEntered = false;
            } else {
                $scope.isSkuMrpEntered = true;
            }
        };

        $scope.skuMspChanged = function(msp) {
            if (msp) {
                $scope.isSkuMspEntered = false;
            } else {
                $scope.isSkuMspEntered = true;
            }
        };

        $scope.batchNoChanged = function(batchNo) {
            if (batchNo) {
                $scope.isBatchNoEntered = false;
            } else {
                $scope.isBatchNoEntered = true;
            }
        };

        $scope.mfgDateSelected = function(mfgDate) {
            if (mfgDate) {
                $scope.isMfgDateSelected = false;
            } else {
                $scope.isMfgDateSelected = true;
            }
        };

        $scope.expDateSelected = function(expDate) {
            if (expDate) {
                $scope.isExpDateSelected = false;
            } else {
                $scope.isExpDateSelected = true;
            }
        };

        $scope.shelfLifeEntered = function(shelfLife) {
            if (shelfLife) {
                $scope.isShelfLifeEntered = false;
            } else {
                $scope.isShelfLifeEntered = true;
            }
        };

        $scope.onLoad= function() {

            $scope.isSellerSkuIdEntered = false;
            $scope.isSkuNameEntered = false;
            $scope.isUpcCodeEntered = false;
            $scope.isSkuCategorySelected = false;
            $scope.isSkuBrandSelected = false;
            $scope.isSellerHSNEntered = false;
            $scope.isSkuDescEntered = false;
            $scope.isSkuLengthEntered = false;
            $scope.isSkuWidthEntered = false;
            $scope.isSkuHeightEntered = false;
            $scope.isSkuWeightEntered = false;
            $scope.isDimUnitSelected = false;
            $scope.isWeightUnitSelected = false;
            $scope.isShelfTypeSelected = false;
            $scope.isSkuMrpEntered = false;
            $scope.isSkuMspEntered = false;
            $scope.isBatchNoEntered = false;
            $scope.isMfgDateSelected = false;
            $scope.isExpDateSelected = false;
            $scope.isShelfLifeEntered = false;
            $scope.sellerSkuIdChangedFlag = false;
            $scope.upcCodeChangedFlag = false;
            $scope.isNewCatgNameEntered = false;
            $scope.isNewBrandNameEntered = false;
            $scope.isNewAttributeNameEntered = false;
            $scope.originalSellerSkuId = "";
            $scope.originalupcCode = "";
            $scope.listOfSkusCount();
            $scope.listOfNormalSkusCount();
            $scope.listOfKitSkusCount();
            $scope.listOfVirtualKitSkusCount();
            $scope.dimensionsArray();
            $scope.weightArray();
            $scope.categoryTypeArray();
            $scope.shelfTypeArray();
            $scope.brandTypeArray();
            $scope.getClientProfile();
        };

        $scope.skuImageHover1 = function() {
            if ($scope.skuImgUrl1 == "images/svg/add_image_active.svg") {
                $scope.skuImgUrl1 = "images/svg/add_image_hover.svg";
            } else if ($scope.skuImgUrl1 == "images/svg/add_image_hover.svg") {
                $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
            }
        };

        $scope.skuImageHover2 = function() {
            if ($scope.skuImgUrl2 == "images/svg/add_image_active.svg") {
                $scope.skuImgUrl2 = "images/svg/add_image_hover.svg";
            } else if ($scope.skuImgUrl2 == "images/svg/add_image_hover.svg") {
                $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
            }
        };

        $scope.skuImageHover3 = function() {
            if ($scope.skuImgUrl3 == "images/svg/add_image_active.svg") {
                $scope.skuImgUrl3 = "images/svg/add_image_hover.svg";
            } else if ($scope.skuImgUrl3 == "images/svg/add_image_hover.svg") {
                $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
            }
        };

        $scope.skuImageHover4 = function() {
            if ($scope.skuImgUrl4 == "images/svg/add_image_active.svg") {
                $scope.skuImgUrl4 = "images/svg/add_image_hover.svg";
            } else if ($scope.skuImgUrl4 == "images/svg/add_image_hover.svg") {
                $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
            }
        };

        $scope.changeSkuImgUrl1 = function(input) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.skuImgUrl1 = e.target.result;
                $scope.skuImgFile1 = input;
                $scope.fromDelete1 = false;
                $scope.skuImageArray[0] = e.target.result;
            }
            if (input) {
                reader.readAsDataURL(input);
            }
        };

        $scope.changeSkuImgUrl2 = function(input) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.skuImgUrl2 = e.target.result;
                $scope.skuImgFile2 = input;
                $scope.fromDelete2 = false;
                $scope.skuImageArray[1] = e.target.result;
            }
            if (input) {
                reader.readAsDataURL(input);
            }
        };

        $scope.changeSkuImgUrl3 = function(input) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.skuImgUrl3 = e.target.result;
                $scope.skuImgFile3 = input;
                $scope.fromDelete3 = false;
                $scope.skuImageArray[2] = e.target.result;
            }
            if (input) {
                reader.readAsDataURL(input);
            }
        };

        $scope.changeSkuImgUrl4 = function(input) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.skuImgUrl4 = e.target.result;
                $scope.skuImgFile4 = input;
                $scope.fromDelete4 = false;
                $scope.skuImageArray[3] = e.target.result;
            }
            if (input) {
                reader.readAsDataURL(input);
            }
        };

        $scope.showAddSkuModal = function ()
        {
            if($scope.categoryTypeLists.length == 0)
            {
                $scope.notify("First select category using category master",'warning');
                return;
            }
            $scope.attributeListArray = [];
            $("#addSkuModal").modal('show');
        }

        $scope.closeBulkUploadDialog = function(){
            $("#addSkuModal").modal('hide');
            $cookies.put('BulkUploadData','sku');
            $cookies.put('ActiveTab','SKU');
            $timeout(function() {
                $location.path('/bulkuploads');
                console.log('update with timeout fired')
            }, 1000);
        }
        $scope.disableBulkUpload = false;
        $scope.uploadBulkOrderFile = function(form) {
            $scope.disableBulkUpload = true;
            $scope.notify("Upload is being processed in the background",'info');
            file = $scope.bulkOrderUploadfile;
            if (file) {
                if (!file.$error) {
                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/skubulkupload';

                    var fd = new FormData();
                    fd.append('uploadFile', file);
                    var upload = Upload.http({
                        url: uploadUrl,
                        method: 'POST',
                        data: fd,
                        headers: {
                            'Content-Type': undefined
                        }
                    });
                    upload.then(function(resp) {
                        console.log(resp);
                        if ($scope.modeSku == 'normal') {
                            $scope.listOfSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeSku == 'mutual') {
                            $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeNormalSku == 'normal') {
                            $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                        }
                        if ($scope.modeNormalSku == 'mutual') {
                            $scope.listOfNormalMutualSkusCount($scope.vmPagerNormal.currentPage);
                        }
                        $cookies.put('BulkUploadData','sku');
                        $cookies.put('ActiveTab','SKU');
                        $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);

                        $scope.dialogBoxSkuMode = "add";
                        $scope.bulkOrderUploadfile =  null;
                        $scope.cancelSkuData(form);
                        $scope.disableBulkUpload = false;
                    }, function(resp) {
                        console.log(resp);
                        $scope.bulkOrderUploadfile =  null;
                        $scope.cancelSkuData(form);
                        $scope.disableBulkUpload = false;
                        $scope.notify(resp.data.errorMessage);

                    }, function(evt) {
                        // progress notify
                    });
                }
            }
        };

        $scope.callShelfId = function(shelfiD) {
            var a = JSON.parse(shelfiD);
            $scope.shelfTypeID = a.idtableSkuShelfLifeTypeId;
        };

        $scope.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }
        };

        $scope.exists = function(item, list) {
            return list.indexOf(item) > -1;
        };

        // fetching list of skus from RestAPI OMS
        $scope.listOfSkus = function(start) {
            var skuListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus?start=" + start + "&size="+$scope.skuSize+"&sort="+$scope.sortTypeAll+"&direction=" + $scope.directionTypeAll;
            console.log(skuListUrl);
            $http.get(skuListUrl).success(function(data) {
                console.log(data);
                $scope.skuLists = data;
                $scope.end = $scope.start + data.length;
                $scope.showLoader = false;
            }).error(function(error, status) {
                $scope.showLoader = false;

            });
        };
        //fetching all skus code ends here

        //fetching list of skus count
        $scope.onRecordsPerPageChange = function (orderSize) {
            $scope.start = 0;
            $scope.skuSize = orderSize;
            $scope.end = 0;
            $scope.skuLists = [];
            if ($scope.modeSku == 'normal') {
            $scope.listOfSkusCount(1);
            }
            if ($scope.modeSku == 'mutual') {
            $scope.listOfMutualSkusCount(1);
            }
        }
        $scope.listOfSkusCount = function(page) {
            var skuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype";
            $http.get(skuMainCountUrl).success(function(data) {
                $scope.skuMainCount = data;
                $scope.skuLists = [];
                $scope.showLoader = true;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.skuSize);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * $scope.skuSize;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfSkus($scope.start);
                }
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.skuMainCount); // dummy array of items to be paged
                    vm.pager = {};


                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        //fetching list of skus from mutually exlusive search SKU
        $scope.listOfMutualSkus = function(start) {
            var skuListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch;
            skuListUrl += "&start=" + start + "&size="+$scope.skuSize+"&sort="+$scope.sortTypeAll+"&direction="+$scope.directionTypeAll;
            console.log(skuListUrl);
            $http.get(skuListUrl).success(function(data) {
                $scope.skuLists = data;
                $scope.end = $scope.start + data.length;
            }).error(function(error, status) {

            });
        };

        //fetching list of mutual skus count
        $scope.listOfMutualSkusCount = function(page) {
            var skuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype";
            $http.get(skuMainCountUrl).success(function(data) {
                $scope.skuMainCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.skuMainCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.skuSize);
                        $scope.vmPager = vm.pager;

                        $scope.start = (vm.pager.currentPage - 1) * $scope.skuSize;
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfMutualSkus($scope.start);
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        $scope.submitMainSkuAction = function(wordSearch) {
            // $scope.sortTypeAll = "tableSkuClientSkuCode";
            if(wordSearch == null || wordSearch == undefined || wordSearch == '')
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            if(wordSearch.length < 3)
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            $scope.genericData.enableSorting = false;
            $scope.directionTypeAll = "desc";
            $scope.sortReverseAll = false;
            $scope.wordSearch = wordSearch;
            $scope.modeSku = "mutual";
            // $scope.listOfMutualSkus();
            $scope.isSubmitDisabledAll = true;
            $scope.isResetDisabledAll = false;
            var page = undefined;
            $scope.listOfMutualSkusCount(page);
        };

        //clear filter for clearing applied filters
        $scope.clearAllSkuAction = function() {
            $scope.genericData.enableSorting = true;
            $scope.sortTypeAll = "tableSkuSystemNo";
            $scope.directionTypeAll = "desc";
            $scope.modeSku = "normal";
            $scope.wordSearch = null;
            $scope.sortReverseAll = false;
            $scope.isSubmitDisabledAll = true;
            $scope.isResetDisabledAll = false;
            $scope.listOfSkusCount(1);
        }

        $scope.clearNormalSkuAction = function() {
            $scope.genericData.enableSorting = true;
            $scope.sortTypeNormal = "tableSkuSystemNo";
            $scope.directionTypeNormal = "desc";
            $scope.sortReverseNormal = false;
            $scope.modeNormalSku = "normal";
            $scope.wordSearch = null;
            $scope.isSubmitDisabledSku = true;
            $scope.isResetDisabledSku = false;
            $scope.listOfNormalSkusCount(1);
        }

        $scope.clearKitSkuAction = function() {
            $scope.genericData.enableSorting = true;
            $scope.sortTypeKit = "tableSkuSystemNo";
            $scope.directionTypeKit = "desc";
            $scope.sortReverseKit = false;
            $scope.modeKitSku = "normal";
            $scope.wordSearch = null;
            $scope.isSubmitDisabledKit = true;
            $scope.isResetDisabledKit = false;
            $scope.listOfKitSkusCount(1);
        }

        $scope.clearVkitSkuAction = function() {
            $scope.genericData.enableSorting = true;
            $scope.sortTypeVKit = "tableSkuSystemNo";
            $scope.directionTypeVKit = "desc";
            $scope.sortReverseVKit = false;
            $scope.modeVKitSku = "normal";
            $scope.wordSearch = null;
            $scope.isSubmitDisabledVkit = true;
            $scope.isResetDisabledVkit = false;
            $scope.listOfVirtualKitSkusCount(1);
        }


        $scope.toggleAllSkuSearchRow = function() {
            $scope.searchSKUClicked = !$scope.searchSKUClicked;
        };

        //Fetching Normal SKU List from Normal SKU Rest API OMS
        $scope.listOfNormalSkus = function(start) {
            var normalskuListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus?type=normal&start=" + start + "&size="+$scope.normalSkuSize+"&sort="+$scope.sortTypeNormal+"&direction="+$scope.directionTypeNormal;
            $http.get(normalskuListUrl).success(function(data) {
                $scope.normalSkuLists = data;
                $scope.normalSkuEnd = $scope.normalSkuStart + data.length;
                $scope.showLoader = false;
            }).error(function(error, status) {
                $scope.showLoader = false;
            });
        };
        //Fetching Normal SKU List from Normal SKU Rest API OMS Ends Here

        //fetching list of skus count
        $scope.onRecordsPerPageChangeForNormalSku = function (orderSize) {
            $scope.normalSkuStart = 0;
            $scope.normalSkuSize = orderSize;
            $scope.normalSkuEnd = 0;
            $scope.normalSkuLists = [];
            if ($scope.modeNormalSku == 'normal') {
                $scope.listOfNormalSkusCount(1);
            }
            if ($scope.modeNormalSku == 'mutual') {
                $scope.listOfNormalMutualSkusCount(1);
            }
        }
        $scope.listOfNormalSkusCount = function(page) {
            var normalskuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype?type=normal";
            $http.get(normalskuMainCountUrl).success(function(data) {
                $scope.normalskuMainCount = data;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.normalSkuSize);
                    $scope.vmPagerNormal = vm.pager;

                    $scope.normalSkuStart = (vm.pager.currentPage - 1) * $scope.normalSkuSize;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfNormalSkus($scope.normalSkuStart);
                }
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.normalskuMainCount); // dummy array of items to be paged
                    vm.pager = {};
                    $scope.normalSkuLists = [];
                    $scope.showLoader = true;

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        //fetching list of skus from mutually exlusive search SKU
        $scope.listOfNormalMutualSkus = function(start) {
            var normalskuListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch + "&skutype=1";
            normalskuListUrl += "&start=" + start + "&size="+$scope.normalSkuSize+"&sort="+$scope.sortTypeNormal+"&direction="+$scope.directionTypeNormal;
            $http.get(normalskuListUrl).success(function(data) {
                $scope.normalSkuLists = data;
                $scope.normalSkuEnd = $scope.normalSkuStart + data.length;
            }).error(function(error, status) {

            });
        };

        //fetching list of mutual skus count
        $scope.listOfNormalMutualSkusCount = function(page) {
            var normalskuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype?type=normal";
            $http.get(normalskuMainCountUrl).success(function(data) {
                $scope.normalskuMainCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.normalskuMainCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.normalSkuSize);
                        $scope.vmPagerNormal = vm.pager;

                        $scope.normalSkuStart = (vm.pager.currentPage - 1) * $scope.normalSkuSize;
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfNormalMutualSkus($scope.normalSkuStart);
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        $scope.submitNormalMainSkuAction = function(wordSearch) {
            if(wordSearch == null || wordSearch == undefined || wordSearch == '')
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            if(wordSearch.length < 3)
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            $scope.genericData.enableSorting = false;
            $scope.wordSearch = wordSearch;
            $scope.modeNormalSku = "mutual";
            // $scope.listOfNormalMutualSkus();
            $scope.isSubmitDisabledSku = true;
            $scope.isResetDisabledSku = false;
            var page = undefined;
            $scope.listOfNormalMutualSkusCount(page);
        };

        $scope.toggleNormalSkuSearchRow = function() {
            $scope.searchNormalSKUClicked = !$scope.searchNormalSKUClicked;
        };

        //Fetching Kit List from Kit SKU Rest API OMS
        $scope.listOfKitSkus = function(start) {
            var kitListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus?type=kit&start=" + start + "&size="+$scope.kitSkuSize+"&sort="+$scope.sortTypeKit+"&direction="+$scope.directionTypeKit;
            $http.get(kitListUrl).success(function(data) {
                $scope.kitSkuLists = data;
                $scope.kitSkuEnd = $scope.kitSkuStart + data.length;
                $scope.showLoader = false;
            }).error(function(error, status) {

            });
        };
        //Fetching Kit List from Kit SKU Rest API OMS Ends Here

        //fetching list of kit count
        $scope.onRecordsPerPageChangeForKitSku = function (orderSize) {
            $scope.kitSkuStart = 0;
            $scope.kitSkuSize = orderSize;
            $scope.kitSkuEnd = 0;
            $scope.kitSkuLists = [];
            if ($scope.modeKitSku == 'normal') {
                $scope.listOfKitSkusCount(1);
            }
            if ($scope.modeKitSku == 'mutual') {
                $scope.listOfKitMutualSkusCount(1);
            }
        }
        $scope.listOfKitSkusCount = function(page) {
            var kitskuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype?type=kit";
            $http.get(kitskuMainCountUrl).success(function(data) {
                $scope.kitskuMainCount = data;
                $scope.kitSkuLists = [];
                $scope.showLoader = true;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.kitSkuSize);
                    $scope.vmPagerKit = vm.pager;

                    $scope.kitSkuStart = (vm.pager.currentPage - 1) * $scope.kitSkuSize;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfKitSkus($scope.kitSkuStart);
                }
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.kitskuMainCount); // dummy array of items to be paged
                    vm.pager = {};


                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        //fetching list of skus from mutually exlusive search SKU
        $scope.listOfKitMutualSkus = function(start) {
            var kitskuListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch + "&skutype=2";
            kitskuListUrl += "&start=" + start + "&size="+$scope.kitSkuSize+"&sort="+$scope.sortTypeKit+"&direction="+$scope.directionTypeKit;
            $http.get(kitskuListUrl).success(function(data) {
                $scope.kitSkuLists = data;
                $scope.kitSkuEnd = $scope.kitSkuStart + data.length;
            }).error(function(error, status) {

            });
        };

        //fetching list of mutual skus count
        $scope.listOfKitMutualSkusCount = function(page) {
            var kitskuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype?type=kit";
            $http.get(kitskuMainCountUrl).success(function(data) {
                $scope.kitskuMainCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.kitskuMainCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.kitSkuSize);
                        $scope.vmPagerKit = vm.pager;

                        $scope.kitSkuStart = (vm.pager.currentPage - 1) * $scope.kitSkuSize;
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfKitMutualSkus($scope.kitSkuStart);
                    }
                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        $scope.submitKitMainSkuAction = function(wordSearch) {
            if(wordSearch == null || wordSearch == undefined || wordSearch == '')
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            if(wordSearch.length < 3)
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            $scope.genericData.enableSorting = false;
            $scope.wordSearch = wordSearch;
            $scope.modeKitSku = "mutual";
            // $scope.listOfKitMutualSkus();
            $scope.isSubmitDisabledKit = true;
            $scope.isResetDisabledKit = false;
            var page = undefined;
            $scope.listOfKitMutualSkusCount(page);
        };

        $scope.toggleKitSearchRow = function() {
            $scope.searchKitSKUClicked = !$scope.searchKitSKUClicked;
        };

        //Fetching Virtual Kit List from Virtual Kit SKU Rest API OMS
        $scope.listOfVirtualKitSkus = function(start) {
            var virtualkitListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus?type=virtualkit&start=" + start + "&size="+$scope.virtualKitSize+"&sort="+$scope.sortTypeVKit+"&direction="+$scope.directionTypeVKit;
            $http.get(virtualkitListUrl).success(function(data) {
                $scope.virtualkitSkuLists = data;
                $scope.virtualKitEnd = $scope.virtualKitStart + data.length;
                $scope.showLoader = false;
            }).error(function(error, status) {

            });
        };
        //Fetching Virtual Kit List from Virtual Kit SKU Rest API OMS Ends Here

        //fetching list of virtual kit count
        $scope.onRecordsPerPageChangeForVirtualKitSku = function (orderSize) {
            $scope.virtualKitStart = 0;
            $scope.virtualKitSize = orderSize;
            $scope.virtualKitEnd = 0;
            $scope.virtualkitSkuLists = [];
            if ($scope.modeVKitSku == 'normal') {
                $scope.listOfVirtualKitSkusCount(1);
            }
            if ($scope.modeVKitSku == 'mutual') {
                $scope.listOfVirtualKitMutualSkusCount(1);
            }
        }
        $scope.listOfVirtualKitSkusCount = function(page) {
            var virtualkitskuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype?type=virtualkit";
            $http.get(virtualkitskuMainCountUrl).success(function(data) {
                $scope.virtualkitskuMainCount = data;
                $scope.virtualkitSkuLists = [];
                $scope.showLoader = true;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.virtualKitSize);
                    $scope.vmPagerVKit = vm.pager;

                    $scope.virtualKitStart = (vm.pager.currentPage - 1) * $scope.virtualKitSize;
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfVirtualKitSkus($scope.virtualKitStart);
                }
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.virtualkitskuMainCount); // dummy array of items to be paged
                    vm.pager = {};


                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }
            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        //fetching list of virtual kit from mutually exlusive search SKU
        $scope.listOfVirtualKitMutualSkus = function(start) {
            var virtualkitskuListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/search?search=" + $scope.wordSearch + "&skutype=3";
            virtualkitskuListUrl += "&start=" + start + "&size="+$scope.virtualKitSize+"&sort="+$scope.sortTypeVKit+"&direction="+$scope.directionTypeVKit;
            $http.get(virtualkitskuListUrl).success(function(data) {
                $scope.virtualkitSkuLists = data;
                $scope.virtualKitEnd = $scope.virtualKitStart + data.length;
            }).error(function(error, status) {

            });
        };

        //fetching list of mutual skus count
        $scope.listOfVirtualKitMutualSkusCount = function(page) {
            var virtualkitskuMainCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/countbytype?type=virtualkit";
            $http.get(virtualkitskuMainCountUrl).success(function(data) {
                $scope.virtualkitskuMainCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.virtualkitskuMainCount); // dummy array of items to be paged
                    vm.pager = {};
                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.virtualKitSize);
                        $scope.vmPagerVKit = vm.pager;

                        $scope.virtualKitStart = (vm.pager.currentPage - 1) * $scope.virtualKitSize;
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfVirtualKitMutualSkus($scope.virtualKitStart);
                    }

                    if (page == undefined) {
                        setPage(1);
                    }

                    if (page != undefined) {
                        setPage(page);
                    }
                }

            }).error(function(error, status) {

            });
        };
        //fetchng list of skus count ends here

        $scope.submitVirtualKitMainSkuAction = function(wordSearch) {
            if(wordSearch == null || wordSearch == undefined || wordSearch == '')
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            if(wordSearch.length < 3)
            {
                $scope.notify('At least 3 characters are required for search');
                return;
            }
            $scope.genericData.enableSorting = false;
            $scope.wordSearch = wordSearch;
            $scope.modeVKitSku = "mutual";
            // $scope.listOfVirtualKitMutualSkus();
            $scope.isSubmitDisabledVkit = true;
            $scope.isResetDisabledVkit = false;
            var page = undefined;
            $scope.listOfVirtualKitMutualSkusCount(page);
        };

        $scope.toggleVirtualKitSearchRow = function() {
            $scope.searchVKitSKUClicked = !$scope.searchVKitSKUClicked;
        };

        // dialog box to add new sku
        $scope.showskuAddBox = function(ev,mode) {

            $scope.dialogBoxSkuMode = mode;
            if(mode == "add")
            {
                $scope.skuData = {};
            }
            if($scope.categoryTypeLists.length == 0)
            {
                $scope.notify("First select category using category master",'warning');
                return;
            }
            $scope.productDimClicked = true;
            $scope.shelfLifeClicked = true;
            $scope.attributesClicked = true;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
            if ($scope.dialogBoxSkuMode == 'add') {
                $scope.skuClientCode = "";
                $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
            }
            $scope.showNormalSkuTab = true;
            $scope.attributeListArray = [];
            $('#addNormalSkuDialog').on('show.bs.modal' , function (e){
                $( "#normalSkuTab a:first"  ).tab('show');
            });
            $('#addNormalSkuDialog').modal('show');

        };

        //dialog box to choose sku type
        $scope.showskuTypeBox = function(ev) {
            //prakhar
            /*    $mdDialog.show({
             templateUrl: 'dialog10.tmpl.html',
             parent: angular.element(document.body),
             targetEvent: ev,
             clickOutsideToClose: false,
             scope: $scope.$new()
             })*/

        };
        //generic cancel to call everywhere.
        $scope.cancelGeneric = function() {
            $mdDialog.hide();
        };

        function initializeDropdowns(lists, prop, code) {
            lists = lists || [];
            for (var i = 0; i < lists.length; i++) {
                var list = lists[i];
                if (list[prop] === code) {
                    return list;
                }
            };
            return null;
        };

        $scope.getNormalSku = function(id) {
            var q = $q.defer();

            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + id).success(function(response) {
                $scope.skuData = response;
                $scope.skuClientCode = response.idtableSkuId;
                $scope.originalSellerSkuId = response.idtableSkuId;
                $scope.originalupcCode = response.tableSkuPrimaryUpcEan;
                // $scope.skuData.tableSkuNode = initializeDropdowns($scope.categoryTypeLists, 'idskuNodeId', response.tableSkuNode.idskuNodeId);
                $scope.skuData.tableSkuBrandCode = initializeDropdowns($scope.brandTypeLists, 'idtableSkuBrandCodeId', response.tableSkuBrandCode.idtableSkuBrandCodeId);
                if(response.tableSkuUodmType){
                    $scope.skuData.tableSkuUodmType = initializeDropdowns($scope.dimLists, 'idtableSkuUodmTypeId', response.tableSkuUodmType.idtableSkuUodmTypeId);
                }
                else{
                    $scope.skuData.tableSkuUodmType = null;
                }
                if(response.tableSkuUowmType){
                    $scope.skuData.tableSkuUowmType = initializeDropdowns($scope.weightLists, 'idtableSkuUowmTypeId', response.tableSkuUowmType.idtableSkuUowmTypeId);
                }
                else{
                    $scope.skuData.tableSkuUowmType = null;
                }
                $scope.skuData.tableSkuShelfLifeType = initializeDropdowns($scope.shelfTypeLists, 'idtableSkuShelfLifeTypeId', response.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId);
                $scope.skuData.tableSkuAbcClassification = response.tableSkuAbcClassification;
                $scope.attributeListArray = [];
                var attrUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.skuData.tableSkuNode.idskuNodeId;
                $http.get(attrUrl).success(function(data)
                {
                    $scope.attributeListArray = data;

                    if (response.tableSkuAttributeses != null && response.tableSkuAttributeses.length != 0)
                    {
                        for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                        {
                            var found = false;
                            for (var i = 0; i < response.tableSkuAttributeses.length; i++)
                            {
                                if ($scope.attributeListArray[superCount].idattributeTypeId == response.tableSkuAttributeses[i].tableSkuNodeAttributeType.idattributeTypeId)
                                {
                                    found = true;
	                                if(response.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeType == "select")
	                                {
	                                    $scope.attributeListBindArray.push(
	                                        {
	                                            "key": response.tableSkuAttributeses[i].tableSkuNodeAttributeType,
	                                            "val": response.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues
	                                        }
	                                    );
	                                }
	                                if(response.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeType == "text")
	                                {
	                                    $scope.attributeListBindArray.push(
	                                        {
	                                            "key": response.tableSkuAttributeses[i].tableSkuNodeAttributeType,
	                                            "val": response.tableSkuAttributeses[i].tableSkuAttributesString
	                                        }
	                                    );
	                                }

	                                if(response.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeType == "select")
	                                {
	                                    for(var possibleValueCounter = 0 ; possibleValueCounter < $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses.length ; possibleValueCounter++) {
	                                        if (response.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues != null) {
	                                            if ($scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter].idnodeAttributePossibleValuesId == response.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues.idnodeAttributePossibleValuesId) {
	                                                $scope.attributeListSelectedValuesArray[response.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeTypeString] = $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter];
	                                                break;
	                                            }
	                                        }
	                                    }
	                                }
	                                if(response.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeType == "text")
	                                {
	                                    $scope.attributeListSelectedValuesArray[response.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeTypeString] = response.tableSkuAttributeses[i].tableSkuAttributesString;
	                                    break;
	                                }


                                }

                            }
                            if(found == false)
                            {
                                $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = null;
                            }
                        }
                    }

                    if (response.tableSkuAttributeses == null || (response.tableSkuAttributeses != null  && response.tableSkuAttributeses.length == 0)) {

                        for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                        {
                            $scope.attributeListSelectedValuesArray[!$scope.attributeListArray[superCount].tableSkuNodeAttributeType ? 0 : $scope.attributeListArray[superCount].tableSkuNodeAttributeType.attributeTypeString] = null;

                        }
                    }

                    $scope.pushPropertiesToArray(response);

                }).error(function(error, status)
                {

                });
                q.resolve(true);
            }).error(function(error) {
                q.reject(false);
            });
            return q.promise;
        };

        $scope.pushPropertiesToArray = function(response){
            if (response.tableSkuIsPoisonous == true) {
                $scope.selected.push("Poisonous");
            }

            if (response.tableSkuIsStackable == true) {
                $scope.selected.push("Stackable");
            }

            if (response.tableSkuIsFragile == true) {
                $scope.selected.push("Fragile");
            }

            if (response.tableSkuIsSaleable == true) {
                $scope.selected.push("Saleable");
            }

            if (response.tableSkuIsUsnRequired == true) {
                $scope.selected.push("USN required");
            }

            if (response.tableSkuIsConsumable == true) {
                $scope.selected.push("Consumable");
            }

            if (response.tableSkuIsHazardous == true) {
                $scope.selected.push("Hazardous");
            }

            if (response.tableSkuIsHighValue == true) {
                $scope.selected.push("High value");
            }

            if (response.tableSkuIsQcRequired == true) {
                $scope.selected.push("QC required");
            }

            if (response.tableSkuIsReturnable == true) {
                $scope.selected.push("Returnable");
            }

            if (response.tableSkuIsTemperatureControlled == true) {
                $scope.selected.push("Temperature controlled");
            }
        }

        $scope.getSkuImages = function(id) {
            var q = $q.defer();

            $scope.skuImgUrl1 = "images/svg/add_image_active.svg"
            $scope.skuImgUrl2 = "images/svg/add_image_active.svg"
            $scope.skuImgUrl3 = "images/svg/add_image_active.svg"
            $scope.skuImgUrl4 = "images/svg/add_image_active.svg"

            $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/" + id + "/images").success(function(responseImages) {
                if (responseImages != null) {
                    if (responseImages[0] != null) {
                        $scope.skuImgUrl1 = responseImages[0].tableSkuImageUrl;
                        $scope.img1PresentId = responseImages[0].idtableSkuImageImageId;
                        $scope.skuImageArray[0] = $scope.skuImgUrl1;
                    }
                    if (responseImages[1] != null) {
                        $scope.skuImgUrl2 = responseImages[1].tableSkuImageUrl;
                        $scope.img2PresentId = responseImages[1].idtableSkuImageImageId;
                        $scope.skuImageArray[1] = $scope.skuImgUrl2;
                    }
                    if (responseImages[2] != null) {
                        $scope.skuImgUrl3 = responseImages[2].tableSkuImageUrl;
                        $scope.img3PresentId = responseImages[2].idtableSkuImageImageId;
                        $scope.skuImageArray[2] = $scope.skuImgUrl3;
                    }
                    if (responseImages[3] != null) {
                        $scope.skuImgUrl4 = responseImages[3].tableSkuImageUrl;
                        $scope.img4PresentId = responseImages[3].idtableSkuImageImageId;
                        $scope.skuImageArray[3] = $scope.skuImgUrl4;
                    }
                    q.resolve(true);
                }
            }).error(function(error) {
                q.reject(false);
            });
            return q.promise;
        };

        $scope.getKit = function(id)
        {
            var q = $q.defer();

            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/kit/' + id).success(function(response)
            {
                $scope.kitData = response.parentSku;
                $scope.skuClientCode = response.parentSku.idtableSkuId;
                $scope.originalSellerSkuId = response.parentSku.idtableSkuId;
                $scope.originalupcCode = response.parentSku.tableSkuPrimaryUpcEan;
                $scope.kitData.tableSkuNode = initializeDropdowns($scope.categoryTypeLists, 'idskuNodeId', response.parentSku.tableSkuNode.idskuNodeId);
                $scope.kitData.tableSkuBrandCode = initializeDropdowns($scope.brandTypeLists, 'idtableSkuBrandCodeId', response.parentSku.tableSkuBrandCode.idtableSkuBrandCodeId);
                if(response.parentSku.tableSkuUodmType){
                    $scope.kitData.tableSkuUodmType = initializeDropdowns($scope.dimLists, 'idtableSkuUodmTypeId', response.parentSku.tableSkuUodmType.idtableSkuUodmTypeId);
                }
                else{
                    $scope.kitData.tableSkuUodmType = null;
                }
                if(response.parentSku.tableSkuUowmType){
                    $scope.kitData.tableSkuUowmType = initializeDropdowns($scope.weightLists, 'idtableSkuUowmTypeId', response.parentSku.tableSkuUowmType.idtableSkuUowmTypeId);
                }
                else{
                    $scope.kitData.tableSkuUowmType = null;
                }
                $scope.kitData.tableSkuShelfLifeType = initializeDropdowns($scope.shelfTypeLists, 'idtableSkuShelfLifeTypeId', response.parentSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId);
                $scope.kitData.tableSkuAbcClassification = response.parentSku.tableSkuAbcClassification;
                $scope.attributeListArray = [];
                var attrUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.kitData.tableSkuNode.idskuNodeId;
                $http.get(attrUrl).success(function(data)
                {
                    $scope.attributeListArray = data;

                    if (response.parentSku.tableSkuAttributeses != null && response.parentSku.tableSkuAttributeses.length != 0)
                    {
                        for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                        {
                            var found = false;
                            for (var i = 0; i < response.parentSku.tableSkuAttributeses.length; i++)
                            {
                                if ($scope.attributeListArray[superCount].idattributeTypeId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.idattributeTypeId)
                                {
                                    found = true;
                                    if(response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeType === "select"){
                                        $scope.attributeListBindArray.push(
                                            {
                                                "key": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType,
                                                "val": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues
                                            }
                                        );
                                    }
                                    if(response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeType === "text"){
                                        $scope.attributeListBindArray.push(
                                            {
                                                "key": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType,
                                                "val": response.parentSku.tableSkuAttributeses[i].tableSkuAttributesString
                                            }
                                        );
                                    }
                                    if($scope.attributeListArray[superCount].attributeType === "select"){
                                        for(var possibleValueCounter = 0 ; $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses.length ; possibleValueCounter++)
                                        {
                                            if($scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter].idnodeAttributePossibleValuesId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues.idnodeAttributePossibleValuesId)
                                            {
                                                $scope.attributeListSelectedValuesArray[response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.attributeTypeString] = $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter];
                                                break;
                                            }
                                        }
                                    }
                                    if($scope.attributeListArray[superCount].attributeType === "text" && $scope.attributeListArray[superCount].idattributeTypeId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.idattributeTypeId){
                                        $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = response.parentSku.tableSkuAttributeses[i].tableSkuAttributesString;
                                    }
                                }

                            }
                            if(found == false)
                            {
                                $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = null;
                            }
                        }
                    }

                    if (response.parentSku.tableSkuAttributeses == null || (response.parentSku.tableSkuAttributeses != null  && response.parentSku.tableSkuAttributeses.length == 0)) {

                        for(var superCount = 0; superCount < $scope.attributeListArray.length ; superCount++)
                        {
                            $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = null;

                        }
                    }

                    if (response.tableSkuIsPoisonous == true) {
                        $scope.selected.push("Poisonous");
                    }

                    if (response.tableSkuIsStackable == true) {
                        $scope.selected.push("Stackable");
                    }

                    if (response.tableSkuIsFragile == true) {
                        $scope.selected.push("Fragile");
                    }

                    if (response.tableSkuIsSaleable == true) {
                        $scope.selected.push("Saleable");
                    }

                    if (response.tableSkuIsUsnRequired == true) {
                        $scope.selected.push("USN required");
                    }

                    if (response.tableSkuIsConsumable == true) {
                        $scope.selected.push("Consumable");
                    }

                    if (response.tableSkuIsHazardous == true) {
                        $scope.selected.push("Hazardous");
                    }

                    if (response.tableSkuIsHighValue == true) {
                        $scope.selected.push("High value");
                    }

                    if (response.tableSkuIsQcRequired == true) {
                        $scope.selected.push("QC required");
                    }

                    if (response.tableSkuIsReturnable == true) {
                        $scope.selected.push("Returnable");
                    }

                    if (response.tableSkuIsTemperatureControlled == true) {
                        $scope.selected.push("Temperature controlled");
                    }

                    //
                    for (var i = 0; i < response.skuKitList.length; i++) {
                        $scope.skuKitList.push({
                            sku: {tableSkuName: response.skuKitList[i].skuname,
                                    idtableSkuId: response.skuKitList[i].skuid
                                },
                            quantity: response.skuKitList[i].quantity
                        });
                    }

                }).error(function(error) {

                });
                q.resolve(true);
            }).error(function(error) {
                q.reject(false);
            });
            return q.promise;
        }


        $scope.getVirtualKit = function(id) {
            var q = $q.defer();

            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/virtualkit/' + id).success(function (response) {
                $scope.virtualkitData = response.parentSku;
                $scope.virtualKitEditable = response.editable;
                $scope.skuClientCode = response.parentSku.idtableSkuId;
                $scope.originalSellerSkuId = response.parentSku.idtableSkuId;
                $scope.originalupcCode = response.parentSku.tableSkuPrimaryUpcEan;
                $scope.virtualkitData.tableSkuNode = initializeDropdowns($scope.categoryTypeLists, 'idskuNodeId', response.parentSku.tableSkuNode.idskuNodeId);
                $scope.virtualkitData.tableSkuBrandCode = initializeDropdowns($scope.brandTypeLists, 'idtableSkuBrandCodeId', response.parentSku.tableSkuBrandCode.idtableSkuBrandCodeId);
                if($scope.virtualkitData.tableSkuUodmType){
                    $scope.virtualkitData.tableSkuUodmType = initializeDropdowns($scope.dimLists, 'idtableSkuUodmTypeId', response.parentSku.tableSkuUodmType.idtableSkuUodmTypeId);
                }
                else{
                    $scope.virtualkitData.tableSkuUodmType = null;
                }
                if($scope.virtualkitData.tableSkuUowmType){
                    $scope.virtualkitData.tableSkuUowmType = initializeDropdowns($scope.weightLists, 'idtableSkuUowmTypeId', response.parentSku.tableSkuUowmType.idtableSkuUowmTypeId);
                }
                else{
                    $scope.virtualkitData.tableSkuUowmType = null;
                }
                $scope.virtualkitData.tableSkuShelfLifeType = initializeDropdowns($scope.shelfTypeLists, 'idtableSkuShelfLifeTypeId', response.parentSku.tableSkuShelfLifeType.idtableSkuShelfLifeTypeId);
                $scope.virtualkitData.tableSkuAbcClassification  = response.parentSku.tableSkuAbcClassification;
                $scope.attributeListArray = [];
                var attrUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.virtualkitData.tableSkuNode.idskuNodeId;
                $http.get(attrUrl).success(function (data) {
                    $scope.attributeListArray = data;

                    if (response.parentSku.tableSkuAttributeses != null && response.parentSku.tableSkuAttributeses.length != 0) {
                        for (var superCount = 0; superCount < $scope.attributeListArray.length; superCount++) {
                            var found = false;
                            for (var i = 0; i < response.parentSku.tableSkuAttributeses.length; i++) {
                                if ($scope.attributeListArray[superCount].idattributeTypeId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType.idattributeTypeId) {
                                    found = true;
                                    $scope.attributeListBindArray.push(
                                        {
                                            "key": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributeType,
                                            "val": response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues
                                        }
                                    );

                                    for (var possibleValueCounter = 0; $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses.length; possibleValueCounter++) {
                                        if ($scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter].idnodeAttributePossibleValuesId == response.parentSku.tableSkuAttributeses[i].tableSkuNodeAttributePossibleValues.idnodeAttributePossibleValuesId) {
                                            $scope.attributeListSelectedValuesArray[response.parentSku.tableSkuAttributeses[superCount].tableSkuNodeAttributeType.attributeTypeString] = $scope.attributeListArray[superCount].tableSkuNodeAttributePossibleValueses[possibleValueCounter];
                                            break;
                                        }
                                    }


                                }

                            }
                            if (found == false) {
                                $scope.attributeListSelectedValuesArray[$scope.attributeListArray[superCount].attributeTypeString] = null;
                            }
                        }
                    }

                    if (response.parentSku.tableSkuAttributeses == null || (response.parentSku.tableSkuAttributeses != null && response.parentSku.tableSkuAttributeses.length == 0)) {

                        for (var superCount = 0; superCount < $scope.attributeListArray.length; superCount++) {
                            $scope.attributeListSelectedValuesArray[!$scope.attributeListArray[superCount].tableSkuNodeAttributeType ? 0 : $scope.attributeListArray[superCount].tableSkuNodeAttributeType.attributeTypeString] = null;

                        }
                    }

                    if (response.parentSku.tableSkuIsPoisonous == true) {
                        $scope.selected.push("Poisonous");
                    }

                    if (response.parentSku.tableSkuIsStackable == true) {
                        $scope.selected.push("Stackable");
                    }

                    if (response.parentSku.tableSkuIsFragile == true) {
                        $scope.selected.push("Fragile");
                    }

                    if (response.parentSku.tableSkuIsSaleable == true) {
                        $scope.selected.push("Saleable");
                    }

                    if (response.parentSku.tableSkuIsUsnRequired == true) {
                        $scope.selected.push("USN required");
                    }

                    if (response.parentSku.tableSkuIsConsumable == true) {
                        $scope.selected.push("Consumable");
                    }

                    if (response.parentSku.tableSkuIsHazardous == true) {
                        $scope.selected.push("Hazardous");
                    }

                    if (response.parentSku.tableSkuIsHighValue == true) {
                        $scope.selected.push("High value");
                    }

                    if (response.parentSku.tableSkuIsQcRequired == true) {
                        $scope.selected.push("QC required");
                    }

                    if (response.parentSku.tableSkuIsReturnable == true) {
                        $scope.selected.push("Returnable");
                    }

                    if (response.parentSku.tableSkuIsTemperatureControlled == true) {
                        $scope.selected.push("Temperature controlled");
                    }
                    $scope.skuvirtualKitList = response.skuKitList;

                    if (response.parentSku.tableSkuShelfLifeType == 1) {
                        $scope.shelfTypeID = 1;

                    }

                    if (response.parentSku.tableSkuShelfLifeType == 2) {
                        $scope.shelfTypeID = 2;
                    }

                    $scope.virtualkitData.tableSkuInventory = {};

                    $scope.virtualkitData.tableSkuInventory.tableSkuInventoryMaxRetailPrice = response.tableSkuInventory.tableSkuInventoryMaxRetailPrice;
                    $scope.virtualkitData.tableSkuInventory.tableSkuInventoryMinSalePrice = response.tableSkuInventory.tableSkuInventoryMinSalePrice;
                    $scope.virtualkitData.tableSkuInventory.tableSkuInventoryBatchNo = response.tableSkuInventory.tableSkuInventoryBatchNo;
                    $scope.virtualkitData.tableSkuInventory.tableSkuInventoryShelfLifeInDays = response.tableSkuInventory.tableSkuInventoryShelfLifeInDays;
                    $scope.virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate = response.tableSkuInventory.tableSkuInventoryMfgDate;
                    $scope.virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate = response.tableSkuInventory.tableSkuInventoryExpiryDate;

                }).error(function (error)
                {

                });
                q.resolve(true);
            }).error(function(error) {
                q.reject(false);
            });
            return q.promise;
        }

        // dialog box to edit sku by id
        $scope.editSku = function(ev, id, type) {

            if (type == "Normal") {

                $scope.attributeListBindArray = [];
                $scope.getNormalSku(id).then(
                    function(v) {
                        $scope.getSkuImages(id).then(
                            function(v) {
                                if (Object.keys($scope.skuData).length > 0) {
                                    $scope.pushPropertiesToArray($scope.skuData);
                                    $scope.showskuAddBox(ev,'edit');
                                }
                            },
                            function(err) {}
                        );
                    },
                    function(err) {}
                );
            }

            if (type == 'Kit') {
                $scope.dialogBoxKitMode = "edit";
                $scope.attributeListBindArray = [];
                $scope.getKit(id).then(
                    function(v) {
                        $scope.getSkuImages(id).then(
                            function(v) {
                                if (Object.keys($scope.kitData).length > 0) {
                                    $scope.pushPropertiesToArray($scope.kitData);
                                    $scope.showkitAddBox(ev, 'edit');
                                }
                            },
                            function(err) {}
                        );
                    },
                    function(err) {}
                );
            }

            if (type == 'VirtualKit') {
                $scope.dialogBoxVirtualKitMode = "edit";
                $scope.attributeListBindArray = [];
                $scope.getVirtualKit(id).then(
                    function(v) {
                        $scope.getSkuImages(id).then(
                            function(v) {
                                if (Object.keys($scope.virtualkitData).length > 0) {
                                    $scope.pushPropertiesToArray($scope.virtualkitData);
                                    $scope.showvirtualKitAddBox(ev, 'edit');
                                }
                            },
                            function(err) {}
                        );
                    },
                    function(err) {}
                );
            }
        };

        // dialog box to add new kit
        $scope.showkitAddBox = function(ev) {
            if($scope.categoryTypeLists.length == 0)
            {
                $scope.notify("First select category using category master",'warning');
                return;
            }
            $scope.productDimClicked = false;
            $scope.shelfLifeClicked = false;
            $scope.attributesClicked = false;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;

            if ($scope.dialogBoxKitMode == 'add') {
                $scope.skuKitList = [];
                $scope.skuClientCode = "";
                $scope.selected = [];
                $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
            }
            $scope.showKitSkuTab = true;
            $scope.attributeListArray = [];
            $('#addKitDialog').on('show.bs.modal' , function (e){
                $( "#kitSkuTab a:first"  ).tab('show');
            });

            $('#addKitDialog').modal('show');

        };

        $scope.expDateMin = new Date();
        // dialog box to add new virtual kit
        $scope.showvirtualKitAddBox = function(ev) {
            if($scope.categoryTypeLists.length == 0)
            {
                $scope.notify("First select category using category master",'warning');
                return;
            }
            var todayDate = new Date();
            $scope.mfgDateMax = new Date(
                todayDate.getFullYear(),
                todayDate.getMonth(),
                todayDate.getDate()
            );
            $scope.productDimClicked = false;
            $scope.shelfLifeClicked = false;
            $scope.attributesClicked = false;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
            if ($scope.dialogBoxVirtualKitMode == 'add') {
                $scope.skuClientCode = "";
                $scope.selected = [];
                $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
                $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
            }
            $scope.showVirtualkitSkuTab = true;
            $scope.attributeListArray = [];
            $('#addVirtualKitDialog').on('show.bs.modal' , function (e){
                $( "#virtualkitSkuTab a:first"  ).tab('show');
            });

            $('#addVirtualKitDialog').modal('show');

        };

        //getting the dimensions from backend
        $scope.dimensionsArray = function() {
            var dimUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuuodmtypes"
            $http.get(dimUrl).success(function(data) {
                $scope.dimLists = data;
            }).error(function(error, status) {

            });
        };
        //ends here getting the dimensions from backend

        //getting the weight units from backend
        $scope.weightArray = function() {
            var wieghtUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuuowmtypes"
            $http.get(wieghtUrl).success(function(data) {
                $scope.weightLists = data;
            }).error(function(error, status) {

            });
        };
        //ends here - getting the weight unit from backend

        //getting the attributes from backend
        $scope.attributeArray = function() {
            var deferred = $q.defer();
            $scope.attributeListArray = [];
            var attrUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.selectedCategory.idskuNodeId;
            $http.get(attrUrl).success(function(data) {
                $scope.attributeListArray = data;
                deferred.resolve(data);
            }).error(function(error, status) {
                deferred.reject(false);

            });

            return deferred.promise;

        };
        //ends here - getting the attributes from backend

        //getting the shelf types from backend
        $scope.shelfTypeArray = function() {
            var shelfTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skushelflifetypes"
            $http.get(shelfTypeUrl).success(function(data) {
                $scope.shelfTypeLists = data;
            }).error(function(error, status) {

            });
        };
        //ends here - getting the shelf types from backend

        //getting category types from backend
        $scope.categoryTypeArray = function() {
            var categoryTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode?selected=true";
            $http.get(categoryTypeUrl).success(function(data) {
                $scope.categoryTypeLists = data;
            }).error(function(error, status) {

            });
        };
        //ends here - getting the category types from backend

        //getting brand types from backend
        $scope.brandTypeArray = function() {
            var brandTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skubrandcodes";
            $http.get(brandTypeUrl).success(function(data) {
                $scope.brandTypeLists = data;
            }).error(function(error, status) {

            });
        };
        //ends here - getting the category types from backend

        //get client data
        $scope.getClientProfile = function() {
            var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles";
            $http.get(clientProfileUrl).success(function(data){
                if(data.length > 0 && data[0].tableGstType){
                    $scope.clientGstType = data[0].tableGstType.tableGstTypeName;
                    $scope.clientInvoiceEnabled = data[0].tableClientProfileEnableInvoice

                }
                else{
                    $scope.clientGstType = null;
                    $scope.clientInvoiceEnabled = null;
                }
            }).error(function(error, status) {
                $scope.clientGstType = null;
                $scope.clientInvoiceEnabled = null;
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }
                else{
                    $scope.notify("Failed to load client profile");
                }
            });
        }

        //opening and closing search accordian for different properties and accordian
        $scope.productDiminvRow = function() {
            $scope.productDimClicked = !$scope.productDimClicked;
            $scope.shelfLifeClicked = false;
            $scope.attributesClicked = false;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
        };

        $scope.attributesinvRow = function() {
            $scope.attributesClicked = !$scope.attributesClicked;
            $scope.productDimClicked = false;
            $scope.shelfLifeClicked = false;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
        };

        $scope.shelfLifeinvRow = function() {
            $scope.shelfLifeClicked = !$scope.shelfLifeClicked;
            $scope.productDimClicked = false;
            $scope.attributesClicked = false;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
        };

        $scope.propinvRow = function() {
            $scope.propertiesClicked = !$scope.propertiesClicked;
            $scope.productDimClicked = false;
            $scope.shelfLifeClicked = false;
            $scope.attributesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
        };


        $scope.kitDetinvRow = function() {
            $scope.kitDetailsClicked = !$scope.kitDetailsClicked;
            $scope.productDimClicked = false;
            $scope.shelfLifeClicked = false;
            $scope.attributesClicked = false;
            $scope.propertiesClicked = false;
            $scope.virtualkitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
        };

        $scope.virtualkitDetinvRow = function() {
            $scope.virtualkitDetailsClicked = !$scope.virtualkitDetailsClicked;
            $scope.productDimClicked = false;
            $scope.shelfLifeClicked = false;
            $scope.attributesClicked = false;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.inventoryDetailsClicked = false;
        };

        $scope.inventoryDetinvRow = function() {
            $scope.inventoryDetailsClicked = !$scope.inventoryDetailsClicked;
            $scope.productDimClicked = false;
            $scope.shelfLifeClicked = false;
            $scope.attributesClicked = false;
            $scope.propertiesClicked = false;
            $scope.kitDetailsClicked = false;
            $scope.virtualkitDetailsClicked = false;
        };

        //opening and closing search accordian for different properties and accordian ends here

        //dynamic upload file code
        $scope.uploadFile = function() {
            var file = $scope.myFile;
        };

        $scope.onFilesSelected = function(files) {
            $scope.myFile = files[0];
        };

        $scope.onFilesSelected1 = function(files) {
            $scope.myFile1 = files[0];
        };

        $scope.onFilesSelected2 = function(files) {
            $scope.myFile2 = files[0];
        };

        $scope.onFilesSelected3 = function(files) {
            $scope.myFile3 = files[0];
        };
        //ends here dynamic file code ends here

        //code for adding kit details in table
        $scope.addKitDetails = function(tableSku, tableSaleOrderSkusSkuQuantity, id) {

            console.log(tableSku);
            if (!tableSku) {
                $scope.notify("Please select a Product first!");
                $scope.isProductSelected = true;
            } else if (!tableSaleOrderSkusSkuQuantity) {
                $scope.notify("Please enter the Product's Quantity!");
                $scope.isQuantityEntered = true;
            } else if (tableSaleOrderSkusSkuQuantity < 1) {
                $scope.notify("Please enter a valid Product's Quantity!");
                $scope.isQuantityEntered = true;
            }else{
                var dirty = false;

                for (var i = 0; i < $scope.skuKitList.length; i++) {
                    if ($scope.skuKitList[i].sku.idtableSkuId == tableSku.originalObject.idtableSkuId) {
                        dirty = true;
                    }
                }

                if (dirty) {
                    $scope.notify("The selected SKU is already part of the current kits. Delete the existing item first to add new kit.");
                    $scope.isProductSelected = true;
                }

                else{
                    $scope.skuKitList.push({
                        sku: tableSku.originalObject,
                        quantity: tableSaleOrderSkusSkuQuantity
                    });

                    $scope.$broadcast('angucomplete-alt:clearInput', 'kits');
                    tableSku = null;
                    tableSaleOrderSkusSkuQuantity = null;
                    $scope.isProductSelected = false;
                    $scope.isQuantityEntered = false;
                }
            }



        }; //ends here


        //code for adding kit details in table
        $scope.addVirtualKitDetails = function(tableSku, tableSaleOrderSkusSkuQuantity, id) {

            console.log(tableSku);
            if (!tableSku) {
                $scope.notify("Please select a Product first!");
                $scope.isProductSelected = true;
            } else if (!tableSaleOrderSkusSkuQuantity) {
                $scope.notify("Please enter the Product's Quantity!");
                $scope.isQuantityEntered = true;
            } else if (tableSaleOrderSkusSkuQuantity < 1) {
                $scope.notify("Please enter a valid Product's Quantity!");
                $scope.isQuantityEntered = true;
            }else{
                var dirty = false;

                for (var i = 0; i < $scope.skuvirtualKitList.length; i++) {
                    if ($scope.skuvirtualKitList[i].skuid == tableSku.originalObject.idtableSkuId) {
                        dirty = true;
                    }
                }

                if (dirty) {
                    $scope.notify("The selected SKU is already part of the current virtual kits. Delete the existing item first to add new virtual kit.");
                    $scope.isProductSelected = true;
                }

                else{
                    $scope.skuvirtualKitList.push({
                        skuid: tableSku.originalObject.idtableSkuId,
                        quantity: tableSaleOrderSkusSkuQuantity,
                        skuname:tableSku.originalObject.tableSkuName
                    });

                    $scope.$broadcast('angucomplete-alt:clearInput', 'virtualkits');
                    tableSku = null;
                    tableSaleOrderSkusSkuQuantity = null;
                    $scope.isProductSelected = false;
                    $scope.isQuantityEntered = false;

                }
            }



        }; //ends here

        //code for saving the sku data in skuspi to backend
        $scope.saveSkuDataInDb = function(skuData,form) {
            $scope.tableSkuAttributeses = [];

            for (var attribCounter = 0;  attribCounter < $scope.attributeListBindArray.length ; attribCounter++)
            {
                if($scope.attributeListBindArray[attribCounter].key.attributeType == "select") {
                    $scope.tableSkuAttributeses.push({
                        "tableSkuNodeAttributePossibleValues": $scope.attributeListBindArray[attribCounter].val,
                        "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                    })
                }
                if($scope.attributeListBindArray[attribCounter].key.attributeType == "text") {
                    $scope.tableSkuAttributeses.push({
                        "tableSkuAttributesString": $scope.attributeListBindArray[attribCounter].val,
                        "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                    })
                }
            }
            $scope.bindProperties();

            var postSkuData = skuData;
            if(!postSkuData.tableSkuUodmType){
                postSkuData.tableSkuLength = null ;
                postSkuData.tableSkuWidth = null;
                postSkuData.tableSkuHeight = null;
            }
            if(!postSkuData.tableSkuUowmType){
                postSkuData.tableSkuWeight = null ;
            }

            postSkuData.tableSkuIsPoisonous = $scope.tableSkuIsPoisonous;
            postSkuData.tableSkuIsStackable = $scope.tableSkuIsStackable;
            postSkuData.tableSkuIsFragile = $scope.tableSkuIsFragile;
            postSkuData.tableSkuIsSaleable = $scope.tableSkuIsSaleable;
            postSkuData.tableSkuIsUsnRequired = $scope.tableSkuIsUsnRequired;
            postSkuData.tableSkuIsConsumable = $scope.tableSkuIsConsumable;
            postSkuData.tableSkuIsHazardous = $scope.tableSkuIsHazardous;
            postSkuData.tableSkuIsHighValue =  $scope.tableSkuIsHighValue;
            postSkuData.tableSkuIsQcRequired = $scope.tableSkuIsQcRequired;
            postSkuData.tableSkuIsTemperatureControlled = $scope.tableSkuIsTemperatureControlled;
            postSkuData.tableSkuIsReturnable = $scope.tableSkuIsReturnable;
            postSkuData.tableSkuAttributeses = $scope.tableSkuAttributeses;
            postSkuData.tableSkuStatusType = {
                "idtableSkuStatusTypeId": 1,
                "tableSkuStatusTypeString": "Active"
            };
            postSkuData.tableSkuType = {
                "idtableSkuTypeId": 1,
                "tableSkuTypeString": "Normal"
            }




            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus',
                data: postSkuData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {

                if (res) {
                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + res.idtableSkuId + '/images/';
                    $scope.uploadSkuImages(uploadUrl).then(
                        function(v) {
                            if ($scope.modeSku == 'normal') {
                                // $scope.listOfSkus();
                                $scope.listOfSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeSku == 'mutual') {
                                // $scope.listOfMutualSkus();
                                $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeNormalSku == 'normal') {
                                // $scope.listOfNormalSkus();
                                $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                            }
                            if ($scope.modeNormalSku == 'mutual') {
                                // $scope.listOfNormalMutualSkus();
                                $scope.listOfNormalMutualSkusCount($scope.vmPagerNormal.currentPage);
                            }
                            $scope.dialogBoxSkuMode = "add";
                            $scope.cancelSkuData(form);
                           $scope.notify("Normal SKU Added Successfully",'success');
                        },
                        function(err) {}
                    );
                }
            }).error(function(error, status) {
                $scope.cancelSkuData(form);
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Normal SKU Cannot Be Added");
                }
                $scope.dialogBoxSkuMode = "add";
            });
        };
        //ends here-code for saving the sku data in skuspi to backend

        $scope.cancelSkuData = function(form) {
            console.log($scope.skuKitTotalMode);

            if($scope.skuKitTotalMode=='new')
            {
                $scope.showAddKitDialog(ev);
            }
            $scope.skuData = {};
            $scope.bulkOrderUploadfile = null;

            $scope.kitData = {};
            $scope.virtualkitData = {};
            $scope.dialogBoxSkuMode = "add";
            $scope.dialogBoxKitMode = "add";
            $scope.dialogBoxVirtualKitMode = "add";
            $scope.selected = [];
            $scope.skuvirtualKitList = [];
            $scope.skuImageArray = [null,null,null,null];
            $scope.selectedCategory = {};

            $scope.img1PresentId = 0;
            $scope.img2PresentId = 0;
            $scope.img3PresentId = 0;
            $scope.img4PresentId = 0;

            $scope.skuImgFile1 = undefined;
            $scope.skuImgFile2 = undefined;
            $scope.skuImgFile3 = undefined;
            $scope.skuImgFile4 = undefined;

            $scope.isSellerSkuIdEntered = false;
            $scope.isSkuNameEntered = false;
            $scope.isUpcCodeEntered = false;
            $scope.isSkuCategorySelected = false;
            $scope.isSellerHSNEntered = false;
            $scope.isSkuBrandSelected = false;
            $scope.isSkuDescEntered = false;
            $scope.isSkuLengthEntered = false;
            $scope.isSkuWidthEntered = false;
            $scope.isSkuHeightEntered = false;
            $scope.isSkuWeightEntered = false;
            $scope.isDimUnitSelected = false;
            $scope.isWeightUnitSelected = false;
            $scope.isShelfTypeSelected = false;
            $scope.isSkuMrpEntered = false;
            $scope.isSkuMspEntered = false;
            $scope.isBatchNoEntered = false;
            $scope.isMfgDateSelected = false;
            $scope.isExpDateSelected = false;
            $scope.isShelfLifeEntered = false;
            $scope.sellerSkuIdChangedFlag = false;
            $scope.upcCodeChangedFlag = false;
            $scope.attributeListSelectedValuesArray={};
            $scope.originalSellerSkuId = "";
            $scope.originalupcCode = "";
            $scope.skuKitList = [];

            if(form){
                var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
                for (var name in controlNames) {
                    var control = form[name];
                    control.$setViewValue(undefined);
                }
                form.$setPristine();
                form.$setUntouched();
            }
            $('#deactivateSKUDialog').modal('hide');
            $('#viewSKUMapDialog').modal('hide');
            $('#activateSKUDialog').modal('hide');
            $('#addNormalSkuDialog').modal('hide');
            $('#addVirtualKitDialog').modal('hide');
            $('#addKitDialog').modal('hide');
            $('#skuBulkUpload').modal('hide');
        };

        $scope.saveKitData = function(kitData,form) {
            if (kitData) {
                if (kitData.tableSkuClientSkuCode) {
                    $scope.checkClientCode(kitData.tableSkuClientSkuCode, "kit").then(
                        function(v) {
                            if (v) {
                                if (!kitData.tableSkuName) {
                                    $scope.notify("Please enter the Name");
                                    $scope.isSkuNameEntered = true;
                                } else {
                                    $scope.checkUpcCode(kitData.tableSkuPrimaryUpcEan, "kit").then(
                                        function(v) {
                                            if (v) {
                                                if (!kitData.tableSkuNode) {
                                                    $scope.notify("Please select a Category");
                                                    $scope.isSkuCategorySelected = true;
                                                } else {
                                                    if( $scope.clientInvoiceEnabled && ($scope.clientGstType =='Composition GST' || $scope.clientGstType =='Regular GST'))
                                                    {
                                                        if((kitData.tableHsn) && (!kitData.tableHsn.tableHsnCode) ){
                                                            $scope.isSellerHSNEntered = true;
                                                            $scope.notify("Enter HSN Number");
                                                            return;
                                                        }
                                                    }
                                                    if (kitData.tableSkuUodmType) {
                                                        if (!kitData.tableSkuLength) {
                                                            $scope.productDimClicked = true;
                                                            $scope.shelfLifeClicked = false;
                                                            $scope.attributesClicked = false;
                                                            $scope.propertiesClicked = false;
                                                            $scope.notify("Please enter the SKU Length");
                                                            $scope.isSkuLengthEntered = true;
                                                            return;
                                                        }
                                                        else if (!kitData.tableSkuWidth) {
                                                            $scope.productDimClicked = true;
                                                            $scope.shelfLifeClicked = false;
                                                            $scope.attributesClicked = false;
                                                            $scope.propertiesClicked = false;
                                                            $scope.notify("Please enter the SKU Width");
                                                            $scope.isSkuWidthEntered = true;
                                                            return;
                                                        }
                                                        else if (!kitData.tableSkuHeight) {
                                                            $scope.productDimClicked = true;
                                                            $scope.shelfLifeClicked = false;
                                                            $scope.attributesClicked = false;
                                                            $scope.propertiesClicked = false;
                                                            $scope.notify("Please enter the SKU Height");
                                                            $scope.isSkuHeightEntered = true;
                                                            return;
                                                        }
                                                    }
                                                    if (kitData.tableSkuUowmType) {
                                                        if (!kitData.tableSkuWeight) {
                                                            $scope.productDimClicked = true;
                                                            $scope.shelfLifeClicked = false;
                                                            $scope.attributesClicked = false;
                                                            $scope.propertiesClicked = false;
                                                            $scope.kitDetailsClicked = false;
                                                            $scope.notify("Please enter the SKU Weight");
                                                            $scope.isSkuWeightEntered = true;
                                                            return;
                                                        }
                                                    }
                                                    if (!kitData.tableSkuShelfLifeType) {
                                                        $scope.productDimClicked = false;
                                                        $scope.shelfLifeClicked = true;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.notify("Please select the Shelf Type");
                                                        $scope.isShelfTypeSelected = true;
                                                    }
                                                    else if (!kitData.tableSkuBrandCode) {
                                                        $scope.notify("Please select a Brand");
                                                        $scope.isSkuBrandSelected = true;
                                                    }
                                                    else if (!kitData.tableSkuDescription) {
                                                        $scope.notify("Please enter the Description");
                                                        $scope.isSkuDescEntered = true;
                                                    }
                                                    else {
                                                        if ($scope.dialogBoxKitMode == "add") {
                                                            $scope.saveKitDataInDb(kitData,form);
                                                        } else if ($scope.dialogBoxKitMode == "edit") {
                                                            $scope.updateKitData(kitData, $scope.skuClientCode,form);
                                                        }
                                                    }

                                                }
                                            }

                                        },
                                        function(err) {}
                                    );

                                }
                            }
                        },
                        function(err) {}
                    );
                } else {
                    $scope.notify("Please enter the Seller SKU ID");
                    $scope.isSellerSkuIdEntered = true;
                }
            } else {
                $scope.notify("Please enter the Seller SKU ID");
                $scope.isSellerSkuIdEntered = true;
            }
        };

        //code for saving the kit data in kitapi to backend
        $scope.saveKitDataInDb = function(kitData,form) {
            $scope.setSkuAttributes();
            $scope.bindProperties();
            $scope.kitDetList = [];

            if(!$scope.skuKitList.length){
                $scope.notify("Please add a product in kit details");
                return;
            }

            for (var i = 0; i < $scope.skuKitList.length; i++) {
                $scope.kitDetList.push({
                    skuid: $scope.skuKitList[i].sku.idtableSkuId,
                    quantity: parseInt($scope.skuKitList[i].quantity)
                });
            }

            var postKitData = {};
            postKitData.parentSku = kitData;
            if(!postKitData.parentSku.tableSkuUodmType){
                postKitData.parentSku.tableSkuLength = null ;
                postKitData.parentSku.tableSkuWidth = null;
                postKitData.parentSku.tableSkuHeight = null;
            }
            if(!postKitData.parentSku.tableSkuUowmType){
                postKitData.parentSku.tableSkuWeight = null ;
            }
            postKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
            postKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
            postKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
            postKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
            postKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
            postKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
            postKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
            postKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
            postKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
            postKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
            postKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
            postKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
            postKitData.parentSku.tableSkuStatusType ={
                "idtableSkuStatusTypeId": 1,
                "tableSkuStatusTypeString": "Active"
            };
            postKitData.parentSku.tableSkuType = {
                "idtableSkuTypeId": 2,
                "tableSkuTypeString": "Kit"
            };

            postKitData.skuKitList = $scope.kitDetList;


            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/kit',
                data: postKitData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {
                    kitData = null;
                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + res.parentSku.idtableSkuId + '/images/';
                    $scope.uploadSkuImages(uploadUrl).then(
                        function(v) {
                            $scope.skuKitList = [];
                            if ($scope.modeSku == 'normal') {
                                $scope.listOfSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeSku == 'mutual') {
                                $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeKitSku == 'normal') {
                                $scope.listOfKitSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeKitSku == 'mutual') {
                                $scope.listOfKitMutualSkusCount($scope.vmPager.currentPage);
                            }
                            $scope.dialogBoxKitMode = "add";
                            $scope.cancelSkuData(form);
                           $scope.notify("Kit Added Successfully",'success');
                        },
                        function(err) {}
                    );
                }
            }).error(function(error, status) {
                $scope.cancelSkuData(form);
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Kit cannot be Added");
                }
                $scope.dialogBoxKitMode = "add";
            });
        };
        //ends here-code for saving the kit data in kitapi to backend

        $scope.setSkuAttributes = function () {
            $scope.tableSkuAttributeses = [];

            for (var attribCounter = 0;  attribCounter < $scope.attributeListBindArray.length ; attribCounter++)
            {
                if($scope.attributeListBindArray[attribCounter].key.attributeType == "select") {
                    $scope.tableSkuAttributeses.push({
                        "tableSkuNodeAttributePossibleValues": $scope.attributeListBindArray[attribCounter].val,
                        "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                    })
                }
                if($scope.attributeListBindArray[attribCounter].key.attributeType == "text") {
                    $scope.tableSkuAttributeses.push({
                        "tableSkuAttributesString": $scope.attributeListBindArray[attribCounter].val,
                        "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                    })
                }
            }
        }

        $scope.addVirtualKitToDb = function(virtualkitData,form) {
            // save virtual kit
            var mfgDate = "";
            var expDate = "";
            $scope.setSkuAttributes();

            if (virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate != null) {
                mfgDate = moment(virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate).format("YYYY-MM-DD");
            }
            if (virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate != null) {
                expDate = moment(virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate).format("YYYY-MM-DD");
            }


            $scope.bindProperties();

            var postvirtualKitData = {};
            postvirtualKitData.parentSku = virtualkitData;
            if(!postvirtualKitData.parentSku.tableSkuUodmType){
                postvirtualKitData.parentSku.tableSkuLength = null ;
                postvirtualKitData.parentSku.tableSkuWidth = null;
                postvirtualKitData.parentSku.tableSkuHeight = null;
            }
            if(!postvirtualKitData.parentSku.tableSkuUowmType){
                postvirtualKitData.parentSku.tableSkuWeight = null ;
            }

            postvirtualKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
            postvirtualKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
            postvirtualKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
            postvirtualKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
            postvirtualKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
            postvirtualKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
            postvirtualKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
            postvirtualKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
            postvirtualKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
            postvirtualKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
            postvirtualKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
            postvirtualKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
            postvirtualKitData.tableSkuInventory = postvirtualKitData.parentSku.tableSkuInventory;
            postvirtualKitData.parentSku.tableSkuInventory = undefined;
            postvirtualKitData.parentSku.tableSkuStatusType = {
                "idtableSkuStatusTypeId": 1,
                "tableSkuStatusTypeString": "Active"
            };
            postvirtualKitData.parentSku.tableSkuType = {
                "idtableSkuTypeId": 3,
                "tableSkuTypeString": "VirtualKit"
            };

            postvirtualKitData.skuKitList = $scope.skuvirtualKitList;
            postvirtualKitData.tableSkuInventory.tableSkuInventoryMfgDate = mfgDate;
            postvirtualKitData.tableSkuInventory.tableSkuInventoryExpiryDate = expDate;
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/virtualkit',
                data: postvirtualKitData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {

                if (res) {
                    virtualkitData = null;
                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + res.parentSku.idtableSkuId + '/images/';
                    $scope.uploadSkuImages(uploadUrl).then(
                        function(v) {
                            if ($scope.modeSku == 'normal') {
                                $scope.listOfSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeSku == 'mutual') {
                                $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeVKitSku == 'normal') {
                                $scope.listOfVirtualKitSkusCount($scope.vmPager.currentPage);
                            }
                            if ($scope.modeVKitSku == 'mutual') {
                                $scope.listOfVirtualKitMutualSkusCount($scope.vmPager.currentPage);
                            }
                            $scope.dialogBoxVirtualKitMode = "add";
                            $scope.cancelSkuData(form);
                            $scope.notify("Virtual Kit Added Successfully",'success');
                        },
                        function(err) {}
                    );
                }
            }).error(function(error, status) {
                $scope.cancelSkuData(form);
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Virtual Kit Cannot Be Added");
                }
                $scope.dialogBoxVirtualKitMode = "add";
            });
        };

        //code for saving the virtual kit data in virtualkitapi to backend
        $scope.savevirtualKitData = function(virtualkitData,form) {
            if (virtualkitData) {
                if (virtualkitData.tableSkuClientSkuCode) {
                    $scope.checkClientCode(virtualkitData.tableSkuClientSkuCode, "virtual").then(
                        function(v) {
                            if (v) {
                                if (!virtualkitData.tableSkuName) {
                                    $scope.notify("Please enter the Name");
                                    $scope.isSkuNameEntered = true;
                                } else {
                                    $scope.checkUpcCode(virtualkitData.tableSkuPrimaryUpcEan, "virtual").then(
                                        function(v) {
                                            if (v) {
                                                if($scope.clientInvoiceEnabled && ($scope.clientGstType =='Composition GST' || $scope.clientGstType =='Regular GST'))
                                                {
                                                    if((virtualkitData.tableHsn) && (!virtualkitData.tableHsn.tableHsnCode) ){
                                                        $scope.isSellerHSNEntered = true;
                                                        $scope.notify("Enter HSN Number");
                                                        return;
                                                    }

                                                }
                                                if (virtualkitData.tableSkuUodmType) {
                                                    if (!virtualkitData.tableSkuLength) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        $scope.virtualkitDetailsClicked = false;
                                                        $scope.inventoryDetailsClicked = false;
                                                        $scope.notify("Please enter the SKU Length");
                                                        $scope.isSkuLengthEntered = true;
                                                        return;
                                                    }
                                                    else if (!virtualkitData.tableSkuWidth) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        $scope.virtualkitDetailsClicked = false;
                                                        $scope.inventoryDetailsClicked = false;
                                                        $scope.notify("Please enter the SKU Width");
                                                        $scope.isSkuWidthEntered = true;
                                                        return;
                                                    }
                                                    else if (!virtualkitData.tableSkuHeight) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        $scope.virtualkitDetailsClicked = false;
                                                        $scope.inventoryDetailsClicked = false;
                                                        $scope.notify("Please enter the SKU Height");
                                                        $scope.isSkuHeightEntered = true;
                                                        return;
                                                    }
                                                }
                                                if (virtualkitData.tableSkuUowmType) {
                                                    if (!virtualkitData.tableSkuWeight) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        $scope.virtualkitDetailsClicked = false;
                                                        $scope.inventoryDetailsClicked = false;
                                                        $scope.notify("Please enter the SKU Weight");
                                                        $scope.isSkuWeightEntered = true;
                                                        return;
                                                    }
                                                }
                                                if (!virtualkitData.tableSkuNode) {
                                                    $scope.notify("Please select a Category");
                                                    $scope.isSkuCategorySelected = true;
                                                }
                                                else if (!virtualkitData.tableSkuShelfLifeType) {
                                                    $scope.productDimClicked = false;
                                                    $scope.shelfLifeClicked = true;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.kitDetailsClicked = false;
                                                    $scope.virtualkitDetailsClicked = false;
                                                    $scope.inventoryDetailsClicked = false;
                                                    $scope.notify("Please select the Shelf Type");
                                                    $scope.isShelfTypeSelected = true;
                                                }
                                                else if (!virtualkitData.tableSkuBrandCode) {
                                                    $scope.notify("Please select a Brand");
                                                    $scope.isSkuBrandSelected = true;
                                                }
                                                else if (!virtualkitData.tableSkuDescription) {
                                                    $scope.notify("Please enter the Description");
                                                    $scope.isSkuDescEntered = true;
                                                }
                                                else {
                                                    if (virtualkitData.tableSkuInventory || $scope.dialogBoxVirtualKitMode == "edit") {
                                                        if (virtualkitData.tableSkuInventory && !virtualkitData.tableSkuInventory.tableSkuInventoryMaxRetailPrice && $scope.dialogBoxVirtualKitMode == "add") {
                                                            $scope.productDimClicked = false;
                                                            $scope.shelfLifeClicked = false;
                                                            $scope.attributesClicked = false;
                                                            $scope.propertiesClicked = false;
                                                            $scope.kitDetailsClicked = false;
                                                            $scope.virtualkitDetailsClicked = false;
                                                            $scope.inventoryDetailsClicked = true;
                                                            $scope.notify("Please enter the MRP");
                                                            $scope.isSkuMrpEntered = true;

                                                        } else {
                                                            if (!virtualkitData.tableSkuInventory.tableSkuInventoryMinSalePrice && $scope.dialogBoxVirtualKitMode == "add") {
                                                                $scope.productDimClicked = false;
                                                                $scope.shelfLifeClicked = false;
                                                                $scope.attributesClicked = false;
                                                                $scope.propertiesClicked = false;
                                                                $scope.kitDetailsClicked = false;
                                                                $scope.virtualkitDetailsClicked = false;
                                                                $scope.inventoryDetailsClicked = true;
                                                                $scope.notify("Please enter the MSP");
                                                                $scope.isSkuMspEntered = true;

                                                            } else {
                                                                if (!virtualkitData.tableSkuInventory.tableSkuInventoryBatchNo && $scope.dialogBoxVirtualKitMode == "add") {
                                                                    $scope.productDimClicked = false;
                                                                    $scope.shelfLifeClicked = false;
                                                                    $scope.attributesClicked = false;
                                                                    $scope.propertiesClicked = false;
                                                                    $scope.kitDetailsClicked = false;
                                                                    $scope.virtualkitDetailsClicked = false;
                                                                    $scope.inventoryDetailsClicked = true;
                                                                    $scope.notify("Please enter the Batch No.");
                                                                    $scope.isBatchNoEntered = true;

                                                                } else {
                                                                    if ($scope.shelfTypeID == 1 && !virtualkitData.tableSkuInventory.tableSkuInventoryMfgDate && $scope.dialogBoxVirtualKitMode == "add") {
                                                                        $scope.productDimClicked = false;
                                                                        $scope.shelfLifeClicked = false;
                                                                        $scope.attributesClicked = false;
                                                                        $scope.propertiesClicked = false;
                                                                        $scope.kitDetailsClicked = false;
                                                                        $scope.virtualkitDetailsClicked = false;
                                                                        $scope.inventoryDetailsClicked = true;
                                                                        $scope.notify("Please select the Mfg Date.");
                                                                        $scope.isMfgDateSelected = true;

                                                                    } else {
                                                                        if ($scope.shelfTypeID == 2 && !virtualkitData.tableSkuInventory.tableSkuInventoryExpiryDate && $scope.dialogBoxVirtualKitMode == "add") {
                                                                            $scope.productDimClicked = false;
                                                                            $scope.shelfLifeClicked = false;
                                                                            $scope.attributesClicked = false;
                                                                            $scope.propertiesClicked = false;
                                                                            $scope.kitDetailsClicked = false;
                                                                            $scope.virtualkitDetailsClicked = false;
                                                                            $scope.inventoryDetailsClicked = true;
                                                                            $scope.notify("Please select the Exp Date.");
                                                                            $scope.isExpDateSelected = true;

                                                                        } else {
                                                                            if ($scope.shelfTypeID == 1 && !virtualkitData.tableSkuInventory.tableSkuInventoryShelfLifeInDays && $scope.dialogBoxVirtualKitMode == "add") {
                                                                                $scope.productDimClicked = false;
                                                                                $scope.shelfLifeClicked = false;
                                                                                $scope.attributesClicked = false;
                                                                                $scope.propertiesClicked = false;
                                                                                $scope.kitDetailsClicked = false;
                                                                                $scope.virtualkitDetailsClicked = false;
                                                                                $scope.inventoryDetailsClicked = true;
                                                                                $scope.notify("Please enter the Shelf Life");
                                                                                $scope.isShelfLifeEntered = true;

                                                                            } else {
                                                                                if ($scope.dialogBoxVirtualKitMode == "add") {
                                                                                    $scope.addVirtualKitToDb(virtualkitData,form);
                                                                                } else if ($scope.dialogBoxVirtualKitMode == "edit") {
                                                                                    $scope.updatevirtualKitData(virtualkitData, $scope.skuClientCode,form);
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        $scope.productDimClicked = false;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        $scope.virtualkitDetailsClicked = false;
                                                        $scope.inventoryDetailsClicked = true;
                                                        $scope.notify("Please enter the MRP");
                                                        $scope.isSkuMrpEntered = true;
                                                    }
                                                }

                                            }
                                        },
                                        function(err) {}
                                    );
                                }
                            }
                        },
                        function(err) {}
                    );
                } else {
                    $scope.notify("Please enter the Seller SKU ID");
                    $scope.isSellerSkuIdEntered = true;
                }
            } else {
                $scope.notify("Please enter the Seller SKU ID");
                $scope.isSellerSkuIdEntered = true;
            }
        };
        //ends here-code for saving the kit data in kitapi to backend

        //code for saving the virtual kit data in virtualkitapi to backend
        $scope.saveSkuData = function(skuData,form) {
            if (skuData) {
                if (skuData.tableSkuClientSkuCode) {
                    $scope.checkClientCode(skuData.tableSkuClientSkuCode, "normal").then(
                        function(v) {
                            if (v) {
                                if (!skuData.tableSkuName) {
                                    $scope.notify("Please enter the Name");
                                    $scope.isSkuNameEntered = true;
                                } else {
                                    $scope.checkUpcCode(skuData.tableSkuPrimaryUpcEan, "normal").then(
                                        function(v) {
                                            if (v) {
                                                if($scope.clientInvoiceEnabled && ($scope.clientGstType =='Composition GST' || $scope.clientGstType =='Regular GST'))
                                                {
                                                    if((skuData.tableHsn) && (!skuData.tableHsn.tableHsnCode) ){
                                                        $scope.isSellerHSNEntered = true;
                                                        $scope.notify("Enter HSN Number");
                                                        return;
                                                    }
                                                }

                                                if (skuData.tableSkuUodmType) {
                                                    if (skuData.tableSkuLength<0) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.notify("Please enter the SKU Length");
                                                        $scope.isSkuLengthEntered = true;
                                                        return;
                                                    }
                                                    else if (skuData.tableSkuWidth<0) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.notify("Please enter the SKU Width");
                                                        $scope.isSkuWidthEntered = true;
                                                        return;
                                                    }
                                                    else if (skuData.tableSkuHeight<0) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.notify("Please enter the SKU Height");
                                                        $scope.isSkuHeightEntered = true;
                                                        return;
                                                    }
                                                }
                                                if (skuData.tableSkuUowmType) {
                                                    if (skuData.tableSkuWeight<0) {
                                                        $scope.productDimClicked = true;
                                                        $scope.shelfLifeClicked = false;
                                                        $scope.attributesClicked = false;
                                                        $scope.propertiesClicked = false;
                                                        $scope.kitDetailsClicked = false;
                                                        $scope.notify("Please enter the SKU Weight");
                                                        $scope.isSkuWeightEntered = true;
                                                        return;
                                                    }
                                                }
                                                if (!skuData.tableSkuNode) {
                                                    $scope.notify("Please select a Category");
                                                    $scope.isSkuCategorySelected = true;
                                                }
                                                else if (!skuData.tableSkuShelfLifeType) {
                                                    $scope.productDimClicked = false;
                                                    $scope.shelfLifeClicked = true;
                                                    $scope.attributesClicked = false;
                                                    $scope.propertiesClicked = false;
                                                    $scope.notify("Please select the Shelf Type");
                                                    $scope.isShelfTypeSelected = true;
                                                }
                                                else if(!skuData.tableSkuBrandCode) {
                                                    $scope.notify("Please select a Brand");
                                                    $scope.isSkuBrandSelected = true;
                                                }
                                                else if(!skuData.tableSkuDescription) {
                                                    $scope.notify("Please enter the Description");
                                                    $scope.isSkuDescEntered = true;
                                                }
                                                else{
                                                    if ($scope.dialogBoxSkuMode == "add") {
                                                        $scope.saveSkuDataInDb(skuData,form);
                                                    }
                                                    else if($scope.dialogBoxSkuMode == "edit") {
                                                        $scope.updateSkuData(skuData, $scope.skuClientCode,form);
                                                    }
                                                }
                                            }

                                        },
                                        function(err) {}
                                    );
                                }
                            }
                        },
                        function(err) {}
                    );
                } else {
                    $scope.notify("Please enter the Seller SKU ID");
                    $scope.isSellerSkuIdEntered = true;
                }
            } else {
                $scope.notify("Please enter the Seller SKU ID");
                $scope.isSellerSkuIdEntered = true;
            }
        };
        //ends here-code for saving the kit data in kitapi to backend

        $scope.addBrand = function(brandName,form) {
            $scope.buttonBrandSaveDisable = true;
            if (!brandName) {
                $scope.notify("Please enter the Brand Name");
                $scope.isNewBrandNameEntered = true;
                $scope.buttonBrandSaveDisable = false;
            } else {
                postBrandData = {
                    "tableSkuBrandCodeString": brandName
                }

                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skubrandcodes',
                    data: postBrandData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res) {
                    $scope.buttonBrandSaveDisable = false;
                    if (res) {
                        $scope.notify("New Brand Added Successfully",'success');
                        $scope.brandTypeArray();
                        $scope.closeBrandBox(form);
                    }
                }).error(function(error, status) {

                    $scope.buttonBrandSaveDisable = false;

                    if(status == 400)
                    {
                        $scope.showBackEndStatusMessage(error);
                        return;
                    }
                    $scope.closeBrandBox(form);
                });
            }
        };

        $scope.showBackEndStatusMessage = function(errorMessage){
            $scope.notify(errorMessage.errorMessage);
        }

        $scope.openBrandBox = function() {
            $scope.newBrand = {};
            $scope.newBrand.brandName = null;
            $("#addNewBrand").modal("show");
        }

        $scope.closeBrandBox = function(form) {
            $scope.buttonBrandSaveDisable = false;
            $scope.isNewBrandNameEntered = false;
            if(form){
                var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
                for (var name in controlNames) {
                    var control = form[name];
                    if (control) control.$setViewValue(undefined);
                }
                form.$setPristine();
                form.$setUntouched();
            }
            $("#addNewBrand").modal("hide");
        };

        $scope.newBrandNameChanged = function(brandName) {
            if (brandName) {
                $scope.isNewBrandNameEntered = false;
            } else {
                $scope.isNewBrandNameEntered = true;
            }
        };

        $scope.openCategoryBox = function() {
            $("#addNewCatg").modal("show");
        };

        $scope.closeCategoryBox = function() {
            $scope.isNewCatgNameEntered = false;
            $("#addNewCatg").modal("hide");
        };

        $scope.newCatgNameChanged = function(catgName) {
            if (catgName) {
                $scope.isNewCatgNameEntered = false;
            } else {
                $scope.isNewCatgNameEntered = true;
            }
        };

        $scope.openAttributeBox = function() {
            $("#addNewAttribute").modal("show");
        };

        $scope.closeAttributeBox = function() {
            $scope.isNewAttributeNameEntered = false;
            $("#addNewAttribute").modal("hide");
        };

        $scope.newAttributeNameChanged = function(attrName) {
            if (attrName) {
                $scope.isNewAttributeNameEntered = false;
            } else {
                $scope.isNewAttributeNameEntered = true;
            }
        };

        //check CLient Sku Code
        $scope.checkClientCode = function(sellerskuId, skuType) {
            var q = $q.defer();
            if (sellerskuId) {
                if (skuType == "virtual") {
                    if ($scope.sellerSkuIdChangedFlag || $scope.dialogBoxVirtualKitMode == "add") {
                        var checkClientUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/checkclientcode?clientcode=" + sellerskuId;
                        $http.get(checkClientUrl).success(function(data) {
                            if (data == true) {
                                $scope.notify("Seller SKU ID already exists.");
                                var myEl = angular.element(document.querySelector('#sellerSkuId'));
                                myEl.empty();
                                $scope.isSellerSkuIdEntered = true;
                                document.addVirtualKitSkuForm.sellerSkuId.focus();
                                q.resolve(false);
                            } else {
                                $scope.isSellerSkuIdEntered = false;
                                q.resolve(true);
                            }
                        });
                    } else {
                        q.resolve(true);
                    }
                } else if (skuType == "normal") {
                    if ($scope.sellerSkuIdChangedFlag || $scope.dialogBoxSkuMode == "add") {
                        var checkClientUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/checkclientcode?clientcode=" + sellerskuId;
                        $http.get(checkClientUrl).success(function(data) {
                            if (data == true) {
                                $scope.notify("Seller SKU ID already exists.");
                                var myEl = angular.element(document.querySelector('#sellerSkuId'));
                                myEl.empty();
                                $scope.isSellerSkuIdEntered = true;
                                document.addNormalSkuForm.sellerSkuId.focus();
                                q.resolve(false);
                            } else {
                                $scope.isSellerSkuIdEntered = false;
                                q.resolve(true);
                            }
                        });
                    } else {
                        q.resolve(true);
                    }
                } else if (skuType == "kit") {
                    if ($scope.sellerSkuIdChangedFlag || $scope.dialogBoxKitMode == "add") {
                        var checkClientUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/checkclientcode?clientcode=" + sellerskuId;
                        $http.get(checkClientUrl).success(function(data) {
                            if (data == true) {
                                $scope.notify("Seller SKU ID already exists.");
                                var myEl = angular.element(document.querySelector('#sellerSkuId'));
                                myEl.empty();
                                $scope.isSellerSkuIdEntered = true;
                                document.addKitSkuForm.sellerSkuId.focus();
                                q.resolve(false);
                            } else {
                                $scope.isSellerSkuIdEntered = false;
                                q.resolve(true);
                            }
                        });
                    } else {
                        q.resolve(true);
                    }
                }
            } else {
                if (skuType == "virtual") {
                    document.addVirtualKitSkuForm.sellerSkuId.focus();
                }
                if (skuType == "kit") {
                    document.addKitSkuForm.sellerSkuId.focus();
                }
                if (skuType == "normal") {
                    document.addNormalSkuForm.sellerSkuId.focus();
                }
                $scope.notify("Please enter the Seller SKU ID");
                $scope.isSellerSkuIdEntered = true;
                q.resolve(false);
            }
            return q.promise;
        };

        //check CLient UPC Code
        $scope.checkUpcCode = function(upcCode, skuType) {
            var q = $q.defer();
            if (upcCode) {
                if (skuType == "virtual") {
                    if ($scope.upcCodeChangedFlag || $scope.dialogBoxVirtualKitMode == "add") {
                        var checkUPCUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/checkupccode?upccode=" + upcCode;
                        $http.get(checkUPCUrl).success(function(data) {
                            if (data == true) {
                                $scope.notify("ISBN/UPC/EAN already exists.");
                                var myEl1 = angular.element(document.querySelector('#upc'));
                                myEl1.empty();
                                document.addVirtualKitSkuForm.upc.focus();
                                $scope.isUpcCodeEntered = true;
                                q.resolve(false);
                            } else {
                                $scope.isUpcCodeEntered = false;
                                q.resolve(true);
                            }
                        });
                    } else {
                        q.resolve(true);
                    }
                } else if (skuType == "normal") {
                    if ($scope.upcCodeChangedFlag || $scope.dialogBoxSkuMode == "add") {
                        var checkUPCUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/checkupccode?upccode=" + upcCode;
                        $http.get(checkUPCUrl).success(function(data) {
                            if (data == true) {
                                $scope.notify("ISBN/UPC/EAN already exists.");
                                var myEl1 = angular.element(document.querySelector('#upc'));
                                myEl1.empty();
                                document.addNormalSkuForm.upc.focus();
                                $scope.isUpcCodeEntered = true;
                                q.resolve(false);
                            } else {
                                $scope.isUpcCodeEntered = false;
                                q.resolve(true);
                            }
                        });
                    } else {
                        q.resolve(true);
                    }
                } else if (skuType == "kit") {
                    if ($scope.upcCodeChangedFlag || $scope.dialogBoxKitMode == "add") {
                        var checkUPCUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/checkupccode?upccode=" + upcCode;
                        $http.get(checkUPCUrl).success(function(data) {
                            if (data == true) {
                                $scope.notify("ISBN/UPC/EAN already exists.");
                                var myEl1 = angular.element(document.querySelector('#upc'));
                                myEl1.empty();
                                document.addKitSkuForm.upc.focus();
                                $scope.isUpcCodeEntered = true;
                                q.resolve(false);
                            } else {
                                $scope.isUpcCodeEntered = false;
                                q.resolve(true);
                            }
                        });
                    } else {
                        q.resolve(true);
                    }
                }
            } else {
                q.resolve(true);
                $scope.isUpcCodeEntered = false;
            }
            return q.promise;
        };

        $scope.deactivateSku = function(skuId, skuData, type, ev) {
            $scope.skuId = skuId;
            $scope.skuData = skuData;
            $scope.type = type;
            $('#deactivateSKUDialog').modal('show');

        };

        //deactiving sku code
        $scope.deactivateSkuApi = function(skuId, skuData, type) {

            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId + '/deactivate',
                data:'',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {
                    if (type == 'Normal') {
                        $scope.notify("Normal SKU Deactivated Successfully",'success');
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                        $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                    }
                    if (type == 'Kit') {
                        $scope.notify("Kit Deactivated Successfully",'success');
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                        $scope.listOfKitSkusCount($scope.vmPagerKit.currentPage);
                    }
                    if (type == 'VirtualKit') {
                        $scope.notify("Virtual Kit Deactivated Successfully",'success');
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                        $scope.listOfVirtualKitSkusCount($scope.vmPagerVKit.currentPage);
                    }
                    $('#deactivateSKUDialog').modal('hide');
                }
            }).error(function(error, status) {
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    if (type == 'Normal') {
                        $scope.notify("Normal SKU Cannot Be Deactivated");
                    }
                    if (type == 'Kit') {
                        $scope.notify("Kit Cannot Be Deactivated");
                    }
                    if (type == 'VirtualKit') {
                        $scope.notify("Virtual Kit Cannot Be Deactivated");
                    }
                }
                $('#deactivateSKUDialog').modal('hide');
            });
        };

        $scope.activateSku = function(skuId, skuData, type, ev) {
            $scope.skuId = skuId;
            $scope.skuData = skuData;
            $scope.type = type;
            $('#activateSKUDialog').modal('show');

        };

        $scope.SkuMapData = {};

        $scope.SkuMapping = function(DataValue,ev){
            console.log(DataValue);
            var checkMapUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/"+DataValue.idtableSkuId+"/vendorsaleschannelskumap";
            $http.get(checkMapUrl).success(function(data) {
                console.log(data);
                $scope.SkuDetailes = data;
                $scope.SkuMapDataTableChannel = data.salesChannels;
                $scope.SkuMapDataTableVendor = data.vendors;
                $scope.SkuMapData.SkudataModal = DataValue;
                $('#viewSKUMapDialog').modal('show');
            }).error(function(data){

                console.log(data);
            });

        }

        //deactiving sku code
        $scope.activateSkuApi = function(skuId, skuData, type) {

            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId + '/activate',
                data:'',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {
                    if (type == 'Normal') {
                        $scope.notify("Normal SKU Activated Successfully",'success');
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                        $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                    }
                    if (type == 'Kit') {
                        $scope.notify("Kit Activated Successfully",'success');
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                        $scope.listOfKitSkusCount($scope.vmPagerKit.currentPage);
                    }
                    if (type == 'VirtualKit') {
                        $scope.notify("Virtual Kit Activated Successfully",'success');
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                        $scope.listOfVirtualKitSkusCount($scope.vmPagerVKit.currentPage);
                    }
                    $('#activateSKUDialog').modal('hide');
                }
            }).error(function(error, status) {
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    if (type == 'Normal') {
                        $scope.notify("Normal SKU Cannot Be Deactivated");
                    }
                    if (type == 'Kit') {
                        $scope.notify("Kit Cannot Be Deactivated");
                    }
                    if (type == 'VirtualKit') {
                        $scope.notify("Virtual Kit Cannot Be Deactivated");
                    }
                }
                $('#activateSKUDialog').modal('hide');
            });
        };

        $scope.isFile1SelectDisabled = function() {
            if ($scope.isImg1Present()) {
                return true;
            } else if ($scope.fromDelete1) {
                $scope.fromDelete1 = false;
                return true;
            }
            return false;
        }

        $scope.isImg1Present = function() {
            if ($scope.img1PresentId != 0 || $scope.skuImgFile1) {
                return true;
            }
            return false;
        };

        $scope.isFile2SelectDisabled = function() {
            if ($scope.isImg2Present()) {
                return true;
            } else if ($scope.fromDelete2) {
                $scope.fromDelete2 = false;
                return true;
            }
            return false;
        }

        $scope.isImg2Present = function() {
            if ($scope.img2PresentId != 0 || $scope.skuImgFile2) {
                return true;
            }
            return false;
        };

        $scope.isFile3SelectDisabled = function() {
            if ($scope.isImg3Present()) {
                return true;
            } else if ($scope.fromDelete3) {
                $scope.fromDelete3 = false;
                return true;
            }
            return false;
        }

        $scope.isImg3Present = function() {
            if ($scope.img3PresentId != 0 || $scope.skuImgFile3) {
                return true;
            }
            return false;
        };

        $scope.isFile4SelectDisabled = function() {
            if ($scope.isImg4Present()) {
                return true;
            } else if ($scope.fromDelete4) {
                $scope.fromDelete4 = false;
                return true;
            }
            return false;
        }

        $scope.isImg4Present = function() {
            if ($scope.img4PresentId != 0 || $scope.skuImgFile4) {
                return true;
            }
            return false;
        };
        $scope.viewSkuImage = function (image) {
            $scope.showSkuImageContainer = true;
            $scope.viewedSkuImage = image;
        }
        $scope.closeSkuImageContainer = function () {
            $scope.showSkuImageContainer = false;
            $scope.viewedSkuImage = null;
        }
        $scope.changeSkuImage = function (image) {
            $scope.viewedSkuImage = null;
            $scope.viewedSkuImage = image;
        }
        $scope.nextSkuImage = function () {
            var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage), foundNext = false;
            $scope.skuImageArray.forEach(function (value,key) {
                if(value !== null && currentIndex < key && !foundNext){
                    $scope.viewedSkuImage= value;
                    foundNext = ! foundNext;
                }
            });
        }
        $scope.backSkuImage = function () {
            var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage), foundBack = false;
            $scope.skuImageArray.forEach(function (value,key) {
                if(value !== null && currentIndex > key ){
                    $scope.viewedSkuImage= value;
                    // foundBack = ! foundBack;
                }
            });

        }
        $scope.disableNextSku = function () {
            var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage),disableNext = false;
            if(currentIndex == 3){
                return  !disableNext;
            }
            for(var i =currentIndex;i<$scope.skuImageArray.length;i++){
                if($scope.skuImageArray[i] == null || (currentIndex == $scope.skuImageArray.length -1)){
                    disableNext = true;
                }
                else{
                    if(disableNext){
                        disableNext = false;
                        break;
                    }
                }
            }
            return  disableNext;
        }
        $scope.disableBackSku = function () {
            var currentIndex = $scope.skuImageArray.indexOf($scope.viewedSkuImage),disableBack = false;
            if(currentIndex == 0){
                return  !disableBack;
            }
            for(var i =$scope.skuImageArray.length - 1;i>=0;i--){
                if(currentIndex >= i){
                    if($scope.skuImageArray[i] == null){
                        disableBack = true;
                    }
                    else{
                        if(disableBack){
                            disableBack = false;
                            break;
                        }
                    }
                }
            }
            return  disableBack;
        }
        $scope.confirmDeleteSkuImage = function(index){
            $scope.deleteItemIndex = index;
            $('#masterDeleteDialogue').modal('show');
        }
        $scope.deleteSelectedItem = function(){
            $scope.deleteSkuImage($scope.deleteItemIndex);
            $scope.cancelmasterDeleteDialog();
            $scope.notify('Item deleted successfully.','success');
        };
        $scope.cancelmasterDeleteDialog = function(){
            $('#masterDeleteDialogue').modal('hide');
        };
        $scope.deleteSkuImage = function(imageNo) {
            var imgId = 0;
            if (imageNo == "1") {
                imgId = $scope.img1PresentId;
            } else if (imageNo == "2") {
                imgId = $scope.img2PresentId;
            } else if (imageNo == "3") {
                imgId = $scope.img3PresentId;
            } else if (imageNo == "4") {
                imgId = $scope.img4PresentId;
            }

            if (imgId != 0) {
                var delImgUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/" + $scope.skuClientCode + "/images/" + imgId;
                console.log(delImgUrl);
                $http.delete(delImgUrl).success(function(data) {
                    console.log(data);
                }).error(function(error, status) {

                });
            }
            if (imageNo == "1") {
                $scope.skuImgUrl1 = "images/svg/add_image_active.svg";
                $scope.skuImageArray[0] = null;
                $scope.img1PresentId = 0;
                $scope.skuImgFile1 = undefined;
                $scope.fromDelete1 = true;
            } else if (imageNo == "2") {
                $scope.skuImgUrl2 = "images/svg/add_image_active.svg";
                $scope.skuImageArray[1] = null;
                $scope.img2PresentId = 0;
                $scope.skuImgFile2 = undefined;
                $scope.fromDelete2 = true;
            } else if (imageNo == "3") {
                $scope.skuImgUrl3 = "images/svg/add_image_active.svg";
                $scope.skuImageArray[2] = null;
                $scope.img3PresentId = 0;
                $scope.skuImgFile3 = undefined;
                $scope.fromDelete3 = true;
            } else if (imageNo == "4") {
                $scope.skuImgUrl4 = "images/svg/add_image_active.svg";
                $scope.skuImageArray[3] = null;
                $scope.img4PresentId = 0;
                $scope.skuImgFile4 = undefined;
                $scope.fromDelete4 = true;
            }
        };

        $scope.deleteSkuImages = function(skuId) {
            var q = $q.defer();
            q.resolve(true);
            if ($scope.skuImgFile1 != undefined && $scope.img1PresentId != 0) {
                var delImgUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img1PresentId;
                $http.delete(delImgUrl).success(function(data) {
                    console.log(data);
                    q.resolve(true);
                }).error(function(error, status) {
                    q.reject(false);


                });
            }
            if ($scope.skuImgFile2 != undefined && $scope.img2PresentId != 0) {
                var delImgUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img2PresentId;
                $http.delete(delImgUrl).success(function(data) {
                    console.log(data);
                    q.resolve(true);
                }).error(function(error, status) {
                    q.reject(false);
                    if(status == 400){
                        $scope.notify(error.errorMessage);
                    }if (status == 401) {
                        $scope.notify("Your session has been expired. You need to Login again.");
                        $location.path("/login");
                        return;
                    }
                    else {
                        $scope.notify("Failed to delete image");
                    }

                });
            }
            if ($scope.skuImgFile3 != undefined && $scope.img3PresentId != 0) {
                var delImgUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img3PresentId;
                $http.delete(delImgUrl).success(function(data) {
                    console.log(data);
                    q.resolve(true);
                }).error(function(error, status) {

                    q.reject(false);
                    if(status == 400){
                        $scope.notify(error.errorMessage);
                    }
                    else
                    {
                        $scope.notify("Failed to delete image");
                    }

                });
            }
            if ($scope.skuImgFile4 != undefined && $scope.img4PresentId != 0) {
                var delImgUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/" + skuId + "/images/" + $scope.img4PresentId;
                $http.delete(delImgUrl).success(function(data) {
                    console.log(data);
                    q.resolve(true);
                }).error(function(error, status) {
                    q.reject(false);

                });
            }
            return q.promise;
        };

        $scope.uploadSkuImages = function(uploadUrl) {
            var q = $q.defer();
            if ($scope.skuImgFile1 != undefined) {
                skuService.uploadFileToUrl($scope.skuImgFile1, uploadUrl);
            }
            if ($scope.skuImgFile2 != undefined) {
                skuService.uploadFileToUrl($scope.skuImgFile2, uploadUrl);
            }
            if ($scope.skuImgFile3 != undefined) {
                skuService.uploadFileToUrl($scope.skuImgFile3, uploadUrl);
            }
            if ($scope.skuImgFile4 != undefined) {
                skuService.uploadFileToUrl($scope.skuImgFile4, uploadUrl);
            }
            q.resolve(true);
            return q.promise;
        };

        //update Normal Sku Functionality
        $scope.updateSkuData = function(skuData, skuId,form) {
            $scope.tableSkuAttributeses = [];

            for (var attribCounter = 0;  attribCounter < $scope.attributeListBindArray.length ; attribCounter++)
            {
                if($scope.attributeListBindArray[attribCounter].key.attributeType == "select") {
                    $scope.tableSkuAttributeses.push({
                        "tableSkuNodeAttributePossibleValues": $scope.attributeListBindArray[attribCounter].val,
                        "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                    })
                }
                if($scope.attributeListBindArray[attribCounter].key.attributeType == "text") {
                    $scope.tableSkuAttributeses.push({
                        "tableSkuAttributesString": $scope.attributeListBindArray[attribCounter].val,
                        "tableSkuNodeAttributeType": $scope.attributeListBindArray[attribCounter].key
                    })
                }
            }

            $scope.bindProperties();

            var putSkuData = skuData;
            if(!putSkuData.tableSkuUodmType){
                putSkuData.tableSkuLength = null ;
                putSkuData.tableSkuWidth = null;
                putSkuData.tableSkuHeight = null;
            }
            if(!putSkuData.tableSkuUowmType){
                putSkuData.tableSkuWeight = null ;
            }
            putSkuData.tableSkuIsPoisonous = $scope.tableSkuIsPoisonous;
            putSkuData.tableSkuIsStackable = $scope.tableSkuIsStackable;
            putSkuData.tableSkuIsFragile = $scope.tableSkuIsFragile;
            putSkuData.tableSkuIsSaleable = $scope.tableSkuIsSaleable;
            putSkuData.tableSkuIsUsnRequired = $scope.tableSkuIsUsnRequired;
            putSkuData.tableSkuIsConsumable = $scope.tableSkuIsConsumable;
            putSkuData.tableSkuIsHazardous = $scope.tableSkuIsHazardous;
            putSkuData.tableSkuIsHighValue = $scope.tableSkuIsHighValue;
            putSkuData.tableSkuIsQcRequired = $scope.tableSkuIsQcRequired;
            putSkuData.tableSkuIsReturnable = $scope.tableSkuIsReturnable;
            putSkuData.tableSkuIsTemperatureControlled = $scope.tableSkuIsTemperatureControlled;
            putSkuData.tableSkuAttributeses =$scope.tableSkuAttributeses;

            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId,
                data: putSkuData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {

                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId + '/images/';
                    $scope.deleteSkuImages(skuId).then(
                        function(v) {
                            $scope.uploadSkuImages(uploadUrl).then(
                                function(v) {
                                    skuData = null;
                                    if ($scope.modeSku == 'normal') {
                                        // $scope.listOfSkus();
                                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeSku == 'mutual') {
                                        // $scope.listOfMutualSkus();
                                        $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeNormalSku == 'normal') {
                                        // $scope.listOfNormalSkus();
                                        $scope.listOfNormalSkusCount($scope.vmPagerNormal.currentPage);
                                    }
                                    if ($scope.modeNormalSku == 'mutual') {
                                        // $scope.listOfNormalMutualSkus();
                                        $scope.listOfNormalMutualSkusCount($scope.vmPagerNormal.currentPage);
                                    }
                                    $scope.dialogBoxSkuMode = 'add';
                                    $scope.notify("SKU updated successfully",'success');
                                    $scope.cancelSkuData(form);
                                },
                                function(err) {}
                            );
                        },
                        function(err) {}
                    );
                }
            }).error(function(error, status) {
                $scope.cancelSkuData(form);
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else
                {
                    $scope.notify("Failed to update SKU");
                }
            });
        };

        $scope.updateKitData = function(kitData, skuId,form) {
            $scope.setSkuAttributes();
            $scope.kitDetList = [];
            if(!$scope.skuKitList.length){
                $scope.notify("Please add a product in kit details");
                return;
            }
            for (var i = 0; i < $scope.skuKitList.length; i++) {
                $scope.kitDetList.push({
                    skuid: $scope.skuKitList[i].sku.idtableSkuId,
                    quantity: parseInt($scope.skuKitList[i].quantity)
                });
            }
            $scope.bindProperties();
            var putKitData = {};
            putKitData.parentSku = kitData;
            if(!putKitData.parentSku.tableSkuUodmType){
                putKitData.parentSku.tableSkuLength = null ;
                putKitData.parentSku.tableSkuWidth = null;
                putKitData.parentSku.tableSkuHeight = null;
            }
            if(!putKitData.parentSku.tableSkuUowmType){
                putKitData.parentSku.tableSkuWeight = null ;
            }
            putKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
            putKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
            putKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
            putKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
            putKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
            putKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
            putKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
            putKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
            putKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
            putKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
            putKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
            putKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
            putKitData.parentSku.tableSkuStatusType ={
                "idtableSkuStatusTypeId": 1,
                "tableSkuStatusTypeString": "Active"
            };
            putKitData.parentSku.tableSkuType = {
                "idtableSkuTypeId": 2,
                "tableSkuTypeString": "Kit"
            };

            putKitData.skuKitList = $scope.kitDetList;
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/kit/' + skuId,
                data: putKitData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {
                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId + '/images/';
                    $scope.deleteSkuImages(skuId).then(
                        function(v) {
                            $scope.uploadSkuImages(uploadUrl).then(
                                function(v) {
                                    kitData = null;
                                    $scope.dialogBoxKitMode = "add";
                                    if ($scope.modeSku == 'normal') {
                                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeSku == 'mutual') {
                                        $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeKitSku == 'normal') {
                                        $scope.listOfKitSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeKitSku == 'mutual') {
                                        $scope.listOfNormalMutualSkusCount($scope.vmPager.currentPage);
                                    }
                                    $scope.notify("Kit Updated Successfully",'success');
                                    $scope.cancelSkuData(form);
                                },
                                function(err) {}
                            );
                        },
                        function(err) {}
                    );
                }
            }).error(function(error, status) {
                $scope.cancelSkuData(form);
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Kit cannot be Updated");
                }
            });
        };

        $scope.bindProperties = function() {
            $scope.tableSkuIsPoisonous = false;
            $scope.tableSkuIsUsnRequired = false;
            $scope.tableSkuIsStackable = false;
            $scope.tableSkuIsSaleable = false;
            $scope.tableSkuIsFragile = false;
            $scope.tableSkuIsHighValue = false;
            $scope.tableSkuIsTemperatureControlled = false;
            $scope.tableSkuIsHazardous = false;
            $scope.tableSkuIsConsumable = false;
            $scope.tableSkuIsQcRequired = false;
            $scope.tableSkuIsReturnable = false;


            for (var i = 0; i < $scope.selected.length; i++) {
                if ($scope.selected[i] == 'Poisonous') {
                    $scope.tableSkuIsPoisonous = true;
                }

                if ($scope.selected[i] == 'Stackable') {
                    $scope.tableSkuIsStackable = true;
                }

                if ($scope.selected[i] == 'Fragile') {
                    $scope.tableSkuIsFragile = true;
                }

                if ($scope.selected[i] == 'Saleable') {
                    $scope.tableSkuIsSaleable = true;
                }

                if ($scope.selected[i] == 'USN required') {
                    $scope.tableSkuIsUsnRequired = true;
                }

                if ($scope.selected[i] == 'Consumable') {
                    $scope.tableSkuIsConsumable = true;
                }

                if ($scope.selected[i] == 'Hazardous') {
                    $scope.tableSkuIsHazardous = true;
                }

                if ($scope.selected[i] == 'High value') {
                    $scope.tableSkuIsHighValue = true;
                }

                if ($scope.selected[i] == 'QC required') {
                    $scope.tableSkuIsQcRequired = true;
                }

                if ($scope.selected[i] == 'Returnable') {
                    $scope.tableSkuIsReturnable = true;
                }
                if ($scope.selected[i] == 'Temperature controlled') {
                    $scope.tableSkuIsTemperatureControlled = true;
                }
            }
        }

        $scope.updatevirtualKitData = function(kitData, skuId,form) {
            $scope.setSkuAttributes();
            $scope.bindProperties();
            var putKitData = {};
            putKitData.parentSku = kitData;
            if(!putKitData.parentSku.tableSkuUodmType){
                putKitData.parentSku.tableSkuLength = null ;
                putKitData.parentSku.tableSkuWidth = null;
                putKitData.parentSku.tableSkuHeight = null;
            }
            if(!putKitData.parentSku.tableSkuUowmType){
                putKitData.parentSku.tableSkuWeight = null ;
            }
            putKitData.parentSku.tableSkuIsPoisonous =$scope.tableSkuIsPoisonous;
            putKitData.parentSku.tableSkuIsStackable =$scope.tableSkuIsStackable;
            putKitData.parentSku.tableSkuIsFragile =$scope.tableSkuIsFragile;
            putKitData.parentSku.tableSkuIsSaleable =$scope.tableSkuIsSaleable;
            putKitData.parentSku.tableSkuIsUsnRequired =$scope.tableSkuIsUsnRequired;
            putKitData.parentSku.tableSkuIsConsumable =$scope.tableSkuIsConsumable;
            putKitData.parentSku.tableSkuIsHazardous =$scope.tableSkuIsHazardous;
            putKitData.parentSku.tableSkuIsHighValue =$scope.tableSkuIsHighValue;
            putKitData.parentSku.tableSkuIsQcRequired =$scope.tableSkuIsQcRequired;
            putKitData.parentSku.tableSkuIsReturnable =$scope.tableSkuIsReturnable;
            putKitData.parentSku.tableSkuIsTemperatureControlled =$scope.tableSkuIsTemperatureControlled;
            putKitData.parentSku.tableSkuAttributeses =$scope.tableSkuAttributeses;
            putKitData.tableSkuInventory = kitData.tableSkuInventory;
            putKitData.parentSku.tableSkuInventory = undefined;
            putKitData.parentSku.tableSkuStatusType = {
                "idtableSkuStatusTypeId": 1,
                "tableSkuStatusTypeString": "Active"
            };
            putKitData.parentSku.tableSkuType = {
                "idtableSkuTypeId": 3,
                "tableSkuTypeString": "VirtualKit"
            };

            putKitData.skuKitList = $scope.skuvirtualKitList;

            console.log(putKitData);
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/virtualkit/' + skuId,
                data: putKitData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (res) {

                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + skuId + '/images/';
                    $scope.deleteSkuImages(skuId).then(
                        function(v) {
                            $scope.uploadSkuImages(uploadUrl).then(
                                function(v) {
                                    kitData = null;
                                    $scope.dialogBoxVirtualKitMode = "add";
                                    if ($scope.modeSku == 'normal') {
                                        // $scope.listOfSkus();
                                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeSku == 'mutual') {
                                        // $scope.listOfMutualSkus();
                                        $scope.listOfMutualSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeKitSku == 'normal') {
                                        // $scope.listOfKitSkus();
                                        $scope.listOfVirtualKitSkusCount($scope.vmPager.currentPage);
                                    }
                                    if ($scope.modeKitSku == 'mutual') {
                                        // $scope.listOfNormalMutualSkus();
                                        $scope.listOfVirtualKitMutualSkusCount($scope.vmPager.currentPage);
                                    }
                                    $scope.cancelSkuData(form);
                                    $scope.notify("Virtual Kit Updated Successfully",'success');
                                },
                                function(err) {}
                            );;
                        },
                        function(err) {}
                    );
                }
            }).error(function(error, status) {
                $scope.cancelSkuData(form);
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Kit cannot be Updated");
                }
            });
        };

        //splicing the kit list
        $scope.removeKit = function(index) {
            $scope.skuKitList.splice(index, 1);
        };

        //splicing the virtual kit list
        $scope.removeVirtualKit = function(index) {
            $scope.skuvirtualKitList.splice(index, 1);
        };

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
            if($scope.wordSearch == null || $scope.wordSearch == undefined || $scope.wordSearch == '')
            {
                $scope.listOfSkusCount(page);
            }
            else
            {
                $scope.listOfMutualSkusCount(page);
            }

        }

        $scope.tableSortingNormal = function(sortTypeNormal, sortReverseNormal) {
            console.log(sortTypeNormal);
            console.log(sortReverseNormal);
            $scope.sortTypeNormal = sortTypeNormal;
            $scope.sortReverseNormal = sortReverseNormal;
            console.log($scope.directionTypeNormal);
            if (sortReverseNormal == true) {
                $scope.directionTypeNormal = 'desc';
            }
            if (sortReverseNormal == false) {
                $scope.directionTypeNormal = 'asc';
            }
            console.log($scope.directionTypeNormal);
            $scope.sortReverseNormal = !sortReverseNormal;

            var page = undefined;
            $scope.listOfNormalSkusCount(page);
        }

        $scope.tableSortingKit = function(sortTypeKit, sortReverseKit) {
            console.log(sortTypeKit);
            console.log(sortReverseKit);
            $scope.sortTypeKit = sortTypeKit;
            $scope.sortReverseKit = sortReverseKit;
            console.log($scope.directionTypeKit);
            if (sortReverseKit == true) {
                $scope.directionTypeKit = 'desc';
            }
            if (sortReverseKit == false) {
                $scope.directionTypeKit = 'asc';
            }
            console.log($scope.directionTypeKit);
            $scope.sortReverseKit = !sortReverseKit;

            var page = undefined;
            $scope.listOfKitSkusCount(page);
        }

        $scope.tableSortingVKit = function(sortTypeVKit, sortReverseVKit) {
            console.log(sortTypeVKit);
            console.log(sortReverseVKit);
            $scope.sortTypeVKit = sortTypeVKit;
            $scope.sortReverseVKit = sortReverseVKit;
            console.log($scope.directionTypeVKit);
            if (sortReverseVKit == true) {
                $scope.directionTypeVKit = 'desc';
            }
            if (sortReverseVKit == false) {
                $scope.directionTypeVKit = 'asc';
            }
            console.log($scope.directionTypeVKit);
            $scope.sortReverseVKit = !sortReverseVKit;

            var page = undefined;
            $scope.listOfVirtualKitSkusCount(page);
        }

        $scope.skuInventories = {};
        $scope.showInventory = function(skuid){
            var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/inventory?skuid="+skuid;
            $http.get(url).success(function(data) {
                if(data.length > 0){
                    $scope.skuInventories = data[0];
                    $("#showskuinventory").modal('show');
                }
                else{
                    $scope.notify("Inventory Not available");
                }
            });
        }

        $scope.generateSkuTemplate = function(){
            $("#generateTemp").modal('show');
        };

        $scope.cancelGenerateTemplateDialog = function(){
            $("#generateTemp").modal('hide');
        }

        $scope.showSkuSalesChannelMapModal = function(ev){
            $('#skuSalesChannelMapUploadDialog').modal('show');
            //$('#skuSaleChannelMapFilter').modal('show');
        };

        $scope.showSkuSalesChannelMapFilterModal = function(ev){

            $('#skuSaleChannelMapFilter').modal('show');
        };

        $scope.cancelSkuSalesChannelDialog = function(form){

            $scope.genericData.fileName = null;
            $scope.genericData.bulkOrderUploadfile = null;
            // $mdDialog.hide({
            //    templateUrl: 'skuSalesChannelMapUploadDialog.tmpl.html'});
            if(form){
                var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
                for (var name in controlNames) {
                    var control = form[name];
                    control.$setViewValue(undefined);
                }
                form.$setPristine();
                form.$setUntouched();
            }
            $('#skuSalesChannelMapUploadDialog').modal('hide');

        }

        $scope.BulkSKuSaleChannelMapUpload = function(bulkOrderUploadfile) {
            console.log(bulkOrderUploadfile);
            $scope.genericData.bulkOrderUploadfile = bulkOrderUploadfile;
            console.log($scope.genericData.bulkOrderUploadfile);
            console.log(bulkOrderUploadfile.fileName);
            $scope.genericData.fileName = bulkOrderUploadfile.name;
        };

        $scope.downloadSKUSalesChannelMaptemplate = function(object){

            console.log("################# Filter Object:");

            console.log(object);

            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource+MavenAppConfig.downloadSkuSalesChannelMapTemplateUrl,
                data: object,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType:'arraybuffer'
            }).success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_SKU_SalesChannelMap_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
                $('#skuSalesChannelMapUploadDialog').modal('hide');
                $('#skuSaleChannelMapFilter').modal('show');
            }).error(function(data){
                console.log(data);
            });



        };

        $scope.disableSkuSalesChannelBulkUpload = false;
        $scope.uploadSKUSalesChannelBulkUpload = function(bulkOrderUploadfile,form){
            //console.log(bulkOrderUploadfile);
            $scope.genericData.bulkOrderUploadfile = bulkOrderUploadfile;
            if ($scope.genericData.bulkOrderUploadfile) {
                $scope.disableSkuSalesChannelBulkUpload = true;
                if (!$scope.genericData.bulkOrderUploadfile.$error) {
                    console.log('file is ');
                    console.dir($scope.genericData.bulkOrderUploadfile);
                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/skusaleschannelmap';

                    var fd = new FormData();
                    fd.append('uploadFile', $scope.genericData.bulkOrderUploadfile);
                    console.log(uploadUrl);
                    console.log('uploadFile' + $scope.genericData.bulkOrderUploadfile);
                    console.log('fd' + fd);
                    var upload = Upload.http({
                        url: uploadUrl,
                        method: 'POST',
                        data: fd,
                        headers: {
                            'Content-Type': undefined
                        }
                    });
                    upload.then(function(resp) {
                        // file is uploaded successfully
                        console.log(resp);
                        console.log('file ' + $scope.genericData.fileName + 'is uploaded successfully. Response: ' + resp.data);
                        $cookies.put('BulkUploadData','skusaleschannelmap');
                        $cookies.put('ActiveTab','skuMap');
                       $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                        $scope.listOfSkusCount($scope.vmPager.currentPage);
                        $scope.cancelSkuSalesChannelDialog(form);
                        $scope.disableSkuSalesChannelBulkUpload = false;
                    }, function(resp) {
                        $scope.cancelSkuSalesChannelDialog(form);
                        console.log(resp);
                        $scope.notify(resp.data.errorMessage);
                        $scope.disableSkuSalesChannelBulkUpload = false;
                    }, function(evt) {
                        // progress notify
                        console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + $scope.genericData.fileName);
                    });
                }
            }
        };

        var skuStart=0,size=10;
        $scope.skuLoadBusy = false;
        $scope.stopSkuLoad = false;
        $scope.skuPagingFunction = function () {
            if($scope.stopSkuLoad){
                return;
            }
            $scope.skuLoadBusy = true;
            if($scope.skuPaginateCheck == false){
                mastersService.fetchSkusNext(MavenAppConfig.baseUrlSource,skuStart, size, function(data)
                {
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
            else{
                mastersService.fetchOnlySkusNext(MavenAppConfig.baseUrlSource,skuStart,size).then(function(data) {
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


        }


        $scope.masterSkuDialog = function(ev, check) {
            $scope.skuPaginateCheck = false;
            mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data) {
                $scope.genericData.skusListFiltered = data;
                $timeout(function() {
                    $("#dialogmastersku").modal('show');
                    $scope.skuLoadBusy = false;
                    $scope.stopSkuLoad = false;
                }, 200);
            });

            $scope.genericData.check = check;
        }

        $scope.masterSkuDialogVirtual = function(ev, check) {
            $scope.skuPaginateCheck = true;
            mastersService.fetchOnlySkus(MavenAppConfig.baseUrlSource).then(function(data) {
                $scope.genericData.skusListFiltered = data;
                $timeout(function() {
                    $("#dialogmastersku").modal('show');
                    $scope.skuLoadBusy = false;
                    $scope.stopSkuLoad = false;
                }, 200);
            });

            $scope.genericData.check = check;
        }

        $scope.masterSkuDialogForMapFilter = function(ev, check) {
            $scope.skuPaginateCheck = false;
            mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data) {
                $scope.genericData.skusListFiltered = data;
                $timeout(function() {
                    $("#dialogmastersku").modal('show');
                    $scope.skuLoadBusy = false;
                    $scope.stopSkuLoad = false;
                }, 200);
            });

            $scope.genericData.dialog = check;
        }

        $scope.selectSku = function(id, ev){
            $scope.stopSkuLoad = true;
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
                console.log(data);
                $scope.genericData.productObject = {};
                if ($scope.genericData.check == false) {
                    $scope.$broadcast("angucomplete-alt:changeInput", "virtualkits", data);
                } else {
                    $scope.$broadcast("angucomplete-alt:changeInput", "kits", data);
                    // $scope.productObject(data);
                }

                if($scope.genericData.dialog == 'map'){
                    $scope.$broadcast("angucomplete-alt-long:changeInput", "skuForMapFilter", data);
                }

            }).error(function(error, status) {
                console.log(error);

            });

            $scope.cancelmastersDialog(ev);

        }

        $scope.cancelmastersDialog = function(ev){
            skuStart=0;
            size=10;
            $scope.genericData.skusListFiltered = [];
            $scope.skuLoadBusy = true;
            $scope.stopSkuLoad = true;
            $("#dialogmastersku").modal('hide');
        }
        $scope.$on('$destroy', function () {
            $("#dialogmastersku").remove();
            $('.modal-backdrop').remove();
        });

        $scope.printbarcodeLabel = function(value){
            console.log(value);
            $scope.barcode.skuid = value;
            $scope.barcode.type = 'Standard';
            $('#barcodeprinting').modal('show');
        };

        $scope.submitPrintBarcodeForm = function(form){
            $scope.previewTemp = MavenAppConfig.baseUrlSource+'/omsservices/webapi/skus/'+$scope.barcode.skuid+'/printskubarcode?barcodetype='+$scope.barcode.type + '&quantity=' + $scope.barcode.quantity;
            window.open($scope.previewTemp);
            $http.get($scope.previewTemp, {
                responseType: 'arraybuffer'
            })
                .success(function(response) {
                    console.log(response);
                    var file = new Blob([(response)], {
                        type: 'application/pdf'
                    });
                    var fileURL = URL.createObjectURL(file);
                    $scope.content = $sce.trustAsResourceUrl(fileURL);
                    $('#barcodeprinting').modal('hide');
                    $scope.barcode = {};
                }).error(function(data){
                console.log(data);
            });

        };

        $scope.cancelPrintLabelModal = function(form)
        {
            $scope.barcode = {};
            $scope.NumberValidMsg = null;
            if(form){
                var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
                for (var name in controlNames) {
                    var control = form[name];
                    control.$setViewValue(undefined);
                }
                form.$setPristine();
                form.$setUntouched();
            }
            $('#barcodeprinting').modal('hide');
        }
$scope.clearAbstractSkuAction = function () {

    }

    $scope.skuAbstarctString = null;

    $scope.submitAbstractSkuAction = function (data) {

        $scope.skuAbstarctString = data;

    }

    $scope.tableSortingAbstractSkus = function(sortTypeAbstractSkus, sortReverseAbstractSkus) {
        console.log(sortTypeAbstractSkus);
        console.log(sortReverseAbstractSkus);
        $scope.sortTypeAbstractSkus = sortTypeAbstractSkus;
        $scope.sortReverseAbstractSkus = sortReverseAbstractSkus;
        console.log($scope.directionTypeAbstractSkus);
        if (sortReverseAbstractSkus == true) {
            $scope.directionTypeAbstractSkus = 'desc';
        }
        if (sortReverseAbstractSkus == false) {
            $scope.directionTypeAbstractSkus = 'asc';
        }
        console.log($scope.directionTypeAbstractSkus);
        $scope.sortReverseAbstractSkus = !sortReverseAbstractSkus;

        var page = undefined;
        $scope.listOfAbstractSkusCount(page);
    }

    $scope.categorySearchUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/search?search=";

    //========================On category selected ===========================//

    $scope.abstractSku = {};
    $scope.genericData.searchedCategory  = {};

    $scope.onCategorySelected = function ()
    {
        $scope.abstractSku.tableSkuNode = $scope.genericData.searchedCategory;
        $scope.searchSKUbyCategoryAndBrand();
    }

    $scope.onAbstractSkuBrandSelected = function ()
    {
        $scope.abstractSku.tableSkuBrandCode = $scope.genericData.abstractSkuBrand;
        $scope.searchSKUbyCategoryAndBrand();
    }

    //========================On category selected ===========================//

    $scope.listOfSkusSearchedByCategory = [];

    $scope.searchSKUbyCategoryAndBrand = function ()
    {
        if($scope.genericData.abstractSkuBrand == null || $scope.genericData.searchedCategory == null)
        {
            return;
        }
        $scope.listOfSkusSearchedByCategory = null;
        var q = $q.defer();
        var searchSkuUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/variantssearch?categoryid="+$scope.genericData.searchedCategory.idskuNodeId + "&brandid=" + $scope.genericData.abstractSkuBrand.idtableSkuBrandCodeId;
        $http.get(searchSkuUrl).success(function(data)
        {
            if(data!=null && data.length>0) {
                $scope.listOfSkusSearchedByCategory = data;
                q.resolve(true);
            }
            else
            {
                $scope.notify("There are no SKUs for selected brand and category combination");
                q.resolve(false);
            }
        }).error(function(error, status)
        {
            q.resolve(false);
        });
        return q.promise;
    }


    $scope.showAbstractSkuAddBox = function (event)
    {
        $scope.selectedSkuArray = [];
        $scope.genericData = {};
        $scope.abstractSku = {};
        $scope.listOfSkusSearchedByCategory = [];
        $scope.dialogBoxAbstractSkuMode = 'add';
        $scope.showAbstractSkuTab = true;
        $("#addAbstractSkuDialog").modal("show");
    }
    $scope.closeAbstractSkuDialog = function (form) {
        $("#addAbstractSkuDialog").modal("hide");
        $scope.selectedSkuArray = [];
        $scope.genericData = {};
        $scope.abstractSku = {};
        $scope.listOfSkusSearchedByCategory = [];

        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
    }

    $scope.selectedSkuArray = [];
    
    $scope.onCheckBoxClicked = function (data, index)
    {
        if(data.selected == true)
        {
            var skuCopy = angular.copy(data);
            delete skuCopy.selected;
            $scope.selectedSkuArray.push(skuCopy);
        }
        else
        {
            $scope.selectedSkuArray.splice(findWithAttr(data,'idtableSkuId',data.idtableSkuId),1);
        }
    }

    function findWithAttr(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }


    $scope.addAbstractSKU = function (data,form) {

        if($scope.selectedSkuArray == null)
        {
            $scope.notify("Please select at least one SKU");
            return;
        }
        if($scope.selectedSkuArray.length == 0)
        {
            $scope.notify("Please select at least one SKU");
            return;
        }
        $scope.abstractSku.tableSkus = $scope.selectedSkuArray;

        if($scope.dialogBoxAbstractSkuMode == 'add')
        {
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/abstractsku',
                data: $scope.abstractSku,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                if (res)
                {
                    $scope.notify("Abstract SKU added",'success');
                    $scope.closeAbstractSkuDialog(form);
                    $scope.listOfAbstractSkusCount(1);
                }
            }).error(function(error, status) {
                $scope.notify("There is some error in adding Abstract SKU");
                return;
            });
        }
        if($scope.dialogBoxAbstractSkuMode == 'edit')
        {
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/abstractsku',
                data: $scope.abstractSku,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                if (res)
                {
                    $scope.notify("Abstract SKU updated",'success');
                    $scope.closeAbstractSkuDialog(form);
                    $scope.listOfAbstractSkusCount(1);
                }
            }).error(function(error, status) {
                $scope.notify("There is some error in updating Abstract SKU");
                return;
            });
        }


    }

    //Fetching Abstract SKUs List from Abstract SKU Rest API OMS
    $scope.listOfAbstractSkus = function(start) {
        var abstractSkusUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/getallabstractskus?start=" + start + "&size="+$scope.abstractSkusSize;
        $http.get(abstractSkusUrl).success(function(data) {
            $scope.abstractSkus = data;
            $scope.abstarctSkusEnd = $scope.abstractSkusStart + data.length;
            $scope.showLoader = false;
        }).error(function(error, status) {

        });
    };
    //Fetching Abstract SKUs List from Abstract SKU Rest API OMS Ends Here

    $scope.listOfAbstractSkusCount = function(page) {
        var abstractSkusUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/getallabstractskus";
        $http.get(abstractSkusUrl).success(function(data) {
            $scope.abstractSkusCount = data.length;
            $scope.showLoader = true;
            function setPage(page) {
                if (page < 1 || page > vm.pager.totalPages) {
                    return;
                }

                // get pager object from service
                vm.pager = pagerService.GetPager(vm.dummyItems.length, page, $scope.abstractSkusSize);
                $scope.vmPagerVKit = vm.pager;

                $scope.abstractSkusStart = (vm.pager.currentPage - 1) * $scope.abstractSkusSize;
                // get current page of items
                vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                $scope.vmItems = vm.items;
                $scope.listOfAbstractSkus($scope.abstractSkusStart);
            }
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.abstractSkusCount); // dummy array of items to be paged
                vm.pager = {};


                if (page == undefined) {
                    setPage(1);
                }

                if (page != undefined) {
                    setPage(page);
                }
            }
        }).error(function(error, status) {

        });
    };
    $scope.listOfAbstractSkusCount(1);


    $scope.onRecordsPerPageChangeForAbstarctSku = function (orderSize) {
        $scope.abstractSkusStart = 0;
        $scope.abstractSkusSize = orderSize;
        $scope.abstarctSkusEnd = 0;
        $scope.abstractSkus = [];
        $scope.listOfAbstractSkus(1);
    }

    $scope.editAbstractSku = function(abstractSku)
    {
        $scope.abstractSku = abstractSku;
        $scope.genericData.searchedCategory =  $scope.abstractSku.tableSkuNode;
        $scope.genericData.abstractSkuBrand = $scope.abstractSku.tableSkuBrandCode;
        $scope.searchSKUbyCategoryAndBrand().then(function (resp)
        {
            if(resp == true)
            {
                for (var counter = 0; counter < $scope.listOfSkusSearchedByCategory.length; counter++) {
                    for (var skuIndex = 0; skuIndex < $scope.abstractSku.tableSkus.length; skuIndex++) {
                        if ($scope.abstractSku.tableSkus[skuIndex].idtableSkuId == $scope.listOfSkusSearchedByCategory[counter].idtableSkuId) {
                            $scope.listOfSkusSearchedByCategory[counter].selected = true;
                            $scope.onCheckBoxClicked($scope.listOfSkusSearchedByCategory[counter], counter)
                        }
                    }
                }
                $scope.dialogBoxAbstractSkuMode = 'edit';
                $scope.showAbstractSkuTab = true;
                $("#addAbstractSkuDialog").modal("show");
            }
        });


    }

    $scope.onSkuViewClicked = function (product) {
        $scope.SkuDataDetailedView = product;
        $("#SkuDetailedView").modal("show");
    }

    $scope.closeSkuView = function () {
        $("#SkuDetailedView").modal("hide");
    }

    $scope.exportSkuDataFile = function () {

        var exportUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/skus/exportskus';

        $http.get(exportUrl).success(function(response, status) {
            console.log(response);
            $cookies.put('DownloadExportData','sku');
            console.log($cookies.get('DownloadExportData'));
            $cookies.put('ActiveTab','SKU');

            if(status == 204){
                $scope.notify("No Records Available.");
            }else{
                $scope.notify("SKUs Export requested successfully.<br><a href='#/export/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View files</a>",'success');
            }
        }).error(function(error,status){
            if(status == 400){
                $scope.notify(data.errorMessage);
            }
            else{
                $scope.notify("SKUs Export request failed");
            }

        });

    }

    $scope.NumberValidMsg = null;
    $scope.validateNum = function(val){
        if(val>501){
            $scope.NumberValidMsg = "You can only print 500 barcode at once";
        }
        else if(val==0){
            $scope.NumberValidMsg = "Enter a number greater than 0";
        }
        else if(!val){
            $scope.NumberValidMsg = null;
        }else{
            $scope.NumberValidMsg = null;
        }
    }


}]);