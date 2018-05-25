angular.module('OMSApp.vendor', []).config(function config($stateProvider) {
    $stateProvider.state('/vendor/', {
        name: '/vendor/',
        url: '/vendor/',
        views: {
            "main": {
                controller: 'vendorController',
                templateUrl: 'vendor/vendor.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Vendor'}
    })

}).controller ('vendorController', ['$rootScope', '$scope', '$http','$mdDialog', '$location', 'MavenAppConfig', 'pagerService', '$q','Upload','$timeout','$cookies', 'mastersService',

function vendorController($rootScope, $scope, $http,$mdDialog, $location,  MavenAppConfig, pagerService, $q,Upload,$timeout,$cookies, mastersService) {

    $scope.genericData = {};
    $scope.genericData.tableGstType = {};
    $scope.genericData.tableGstType.tableGstTypeName = "Unknown";
	$scope.addressData = {};
    $scope.vendorAddress = {};
    $scope.genericData.enableSorting =  true;
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?skutype=1&search=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
    $scope.searchVendorClicked = false;
    $scope.singleVendorTab = true;
    $scope.singleVendorMode = "add";
    $scope.bulkVendorTab = false;
    //Vendor No
    $scope.firstVendorNo = 1;
    $scope.secVendorNo = 2;
    $scope.thirdVendorNo = 3;
    $scope.fourthVendorNo = 4;
    $scope.fifthVendorNo = 5;
    $scope.bulkOrderUploadfile=null;
    $scope.downloadVendorsTemplateUrl = MavenAppConfig.baseUrlSource+'/omsservices/webapi/vendors/vendorbulkuploadtemplate';

    $scope.vendorMode = "add";
    $scope.vendorAddressMode = "add";
    $scope.start = 0;
    $scope.recordsPerPage = [5,10,15];
    $scope.vendorstart = 0;
    $scope.vendorsize = $scope.recordsPerPage[0];

    $scope.uFirstMode = true;
    $scope.uSecMode = false;
    $scope.uThirdMode = false;
    $scope.uFourthMode = false;
    $scope.uFifthMode = false;
    $scope.pricingtierDetailsClicked = false;
    $scope.unitquantityClicked = false;
    $scope.pricingTiers = [];
    $scope.selectedList = [];
	$scope.mapList = [];
    $scope.vendorSkuMapMode = "add";

    $scope.companyNameEntered = false;
    $scope.personNameEntered = false;
    $scope.phoneNumberEntered = false;
    $scope.emailEntered = false;
	$scope.isVendorSkuCodeEntered = false;

    $scope.isSubmitDisabledMutual = true;
    $scope.isResetDisabledMutual = true;

    $scope.isSubmitDisabledSku = true;
    $scope.isResetDisabledSku = true;

    $scope.isOqmStringValid = false;
    $scope.isMultipierValid = false;
    $scope.isOqmTypeValid = false;

    $scope.sortType = "tableVendorSystemNo";
    $scope.directionType = "desc";
    $scope.sortReverse = false; // set the default sort order

    $scope.isProductSelected = false;
    $scope.vendorSkuCodeEntered = false;
    $scope.minOrderQtyEntered = false;
    $scope.leadTimeEntered = false;
    $scope.isPTMinQtyEntered = false;
    $scope.isPTMaxQtyEntered = false;
    $scope.isPTPriceEntered = false;
    $scope.leadTimeEntered = false;
    $scope.vendorTypeSelected = false;

    //Shipping/Billing Address Validators
    $scope.isvendorAddressNameValid = false;
    $scope.isvendorAddressEmailValid = false;
    $scope.isvendorAddressPhoneValid = false;
    $scope.isvendorAddressAdLine1Valid = false;
    $scope.isvendorAddressStateValid = false;
    $scope.isvendorAddressDistrictValid = false;
    $scope.isvendorAddressCityValid = false;
    $scope.isvendorAddressPinValid = false;
    $scope.isvendorAddressTinValid = false;
	$scope.isvendorAddressCountryValid = false;

    $scope.skuMapClicked = true;
    $scope.returnParamsClicked = true;
    $scope.shipAddrClicked = true;
    $scope.uploadedFile = {};
    $scope.genericData.returnType = "";
    $scope.searchSection = "vendor";

    var regex = new RegExp("^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][0-9]Z[A-Z0-9]");

    $scope.skuMapClickedRow = function(){
        $scope.skuMapClicked = !$scope.skuMapClicked;
    }
    $scope.returnParamsClickedRow = function() {
        $scope.returnParamsClicked = !$scope.returnParamsClicked;
    };

    $scope.returnTypes = [];

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


    $scope.callDisabledMutual = function(text) {
        $scope.isSubmitDisabledMutual = false;
        !text?$scope.listOfVendorsCount():null;
    }

    $scope.callDisabledSku = function() {
        $scope.isSubmitDisabledSku = false;
    }

    $scope.vendorSkuData = {
        tableVendorSystemSkuMapIsActive: false,
        tableVendorSystemSkuMapEnableBackOrder: false
    };


    $scope.onLoad= function() {
        // $scope.listOfVendors($scope.start);
        $scope.listOfVendorsCount();
       //$scope.regionsStatesData();
        $scope.qcTrueLists();
		$scope.countriesData();
    };

    $scope.pricingtierDetailRow = function() {
        console.log($scope.pricingtierDetailsClicked);
        $scope.pricingtierDetailsClicked = !$scope.pricingtierDetailsClicked;
    }

    $scope.unittierDetailRow = function() {
        console.log($scope.unitquantityClicked);
        $scope.unitquantityClicked = !$scope.unitquantityClicked;
    }

    $scope.modeVendor = "normal";

    $scope.searchLocation = {
        latitude: 28.6139391,
        longitude: 77.20902120000005
    }

    $scope.qcTrueLists = function() {
        $scope.oqmTypes = [];
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuuoqmtypes').success(function(response) {
            console.log(response);
            for (var i = 0; i < response.length; i++) {
                $scope.oqmTypes.push(response[i]);
            }
        });
    }

    $scope.searchedProduct = function(selected) {
        console.log(selected);
        $scope.skuSelected = {};
        $scope.optionsList = [];
        if (selected != null) {
            $scope.isProductSelected = false;
            $scope.skuSelected = selected;
            $scope.skuId = selected.originalObject.idtableSkuId;
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + $scope.skuSelected.originalObject.idtableSkuId + '/uoqmconfigs').success(function(response) {
                console.log(response);
                for (var i = 0; i < response.length; i++) {
                    $scope.optionsList.push({
                        oqmStr: response[i].tableSkuUoqmType.tableSkuUoqmTypeString,
                        oqmData: response[i]
                    });
                }
            });
            $scope.callDisabledSku();
        } else {
            $scope.isProductSelected = true;
        }
        
    }

    $scope.searchedProductForFilter = function(selected)
    {
        if (selected != null)
        {
            $scope.skuId = selected.originalObject.idtableSkuId;
        }

    }
	
	$scope.productObject = function(selected) {
        if (selected != null) {
            console.log(selected);
            $scope.isProductSelected = true;
            $scope.genericData.productObject = selected.originalObject;            
        } else {
            $scope.isProductSelected = false;
        }
    }
	
	//remove the product
    $scope.removeMap = function(index) {
        $scope.mapList.splice(index, 1);
    };
	
	// adding the product in table one by one
    $scope.createMap = function(tableSku, vendorSkuCode) {
		
		if (!$scope.isProductSelected) {
            $scope.notify("Please select a Product first!");
		} else{
	    if(!vendorSkuCode && vendorSkuCode!=undefined){
            $scope.isVendorSkuCodeEntered = true;
        }

		tableSku = $scope.genericData.productObject;
	
		var tempObject = {
                    
                    "tableSku": tableSku,
                    "tableVendor": null,
					"tableVendorSystemSkuMapVendorSkuCode": vendorSkuCode,
					"tableVendorSystemSkuMapMinOrderQty" : 0,
					"tableVendorSystemSkuMapLeadTime" : 0,
					"tableVendorSystemSkuMapIsActive" : true,
					"tableVendorSystemSkuMapEnableBackOrder" : false,
					"tableVendorSkuPricingTierses" : [],
					"tableVendorSkuUoqmses" : []					
                };
		
		
		var dirty = false;

            for (var i = 0; i < $scope.mapList.length; i++) {
                if ($scope.mapList[i].tableSku.idtableSkuId == tableSku.idtableSkuId) {
                    dirty = true;
                }
            }


            if (dirty) {
                $scope.notify("The selected SKU is already part of the current vendor.");
                $scope.isProductSelected = true;
            } else {
                $scope.mapList.push(tempObject);
                console.log($scope.mapList);
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                tableSku = null;
                $scope.genericData.productObj = null;
                $scope.genericData.vendorSkuCode = null;
                $scope.isProductSelected = false;
                $scope.isVendorSkuCodeEntered = false;
                $scope.genericData.productObject = undefined;
            }

		}
    };

    $scope.saveOqmConfig = function(m, t, s) {
        if (!m) {
            $scope.notify("Please enter the Oqm Config Multiplier Value.");
            $scope.isMultipierValid = true;
        } else {
            $scope.isMultipierValid = false;
            $scope.multiplier = m;
            if (!t) {
                $scope.notify("Please enter the Oqm Type.");
                $scope.isOqmTypeValid = true;
            } else {
                $scope.isOqmTypeValid = false;
                console.log(m, t, s);
                var data = {
                    "tableSkuUoqmConfigBaseMultiplier": m,
                    "tableSkuUoqmType": JSON.parse(t)
                }

                console.log(data);
                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/' + s.originalObject.idtableSkuId + '/uoqmconfigs',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res) {
                    console.log(res);
                    if (res != null) {
                        $scope.notify("New Configuraton Added Successfully",'success');
                        $scope.searchedProduct(s);
                    }
                    $('#myModal1').modal('hide');
                });
            }
        }
    }

    $scope.saveOqmString = function(oqmString) {
        if (!oqmString) {
            $scope.notify("Please enter the Oqm Type String");
            $scope.isOqmStringValid = true;
        } else {
            var data = {
                "tableSkuUoqmTypeString": oqmString
            }

            console.log(data);
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skuuoqmtypes',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res != null) {
                    $scope.notify("New Oqm Type Sting Added Successfully",'success');
                    $scope.isOqmStringValid = false;
                    $scope.qcTrueLists();
                }
                $('#myModal2').modal('hide');
            });
        }
    }

    $scope.addVendorSkuGetId = function(id) {
        $scope.vendorSkuMapMode = "add";
        $scope.PT = [];
        $scope.vendorId = id;
    };

    $scope.removeProduct = function(index) {
        $scope.pricingTiers.splice(index, 1);
    };

    $scope.addPricingtier = function() {
        if (!$scope.PT) {
            $scope.notify("Please enter the Minimum Quantity");
            $scope.isPTMinQtyEntered = true;
        } else {
            var min = $scope.PT.tableVendorSkuPricingTiersQtyMin;
            var max = $scope.PT.tableVendorSkuPricingTiersQtyMax;
            var price = $scope.PT.tableVendorSkuPricingTiersPrice;

            if (!min) {
                $scope.notify("Please enter the Minimum Quantity");
                $scope.isPTMinQtyEntered = true;
            } else if (min < 1) {
                $scope.notify("Minimum Quantity should be greater than 0");
                $scope.isPTMinQtyEntered = true;
            }else if (max < min) {
                $scope.notify("Maximum Quantity should be greater than the Minimum Quantity");
                $scope.isPTMaxQtyEntered = true;
            } else if (!price) {
                $scope.notify("Please enter the Price");
                $scope.isPTPriceEntered = true;
            } else if (price < 1) {
                $scope.notify("Price should be greater than 0");
                $scope.isPTPriceEntered = true;
            } else {
                $scope.pricingTiers.push({
                    "tableVendorSkuPricingTiersQtyMin": min,
                    "tableVendorSkuPricingTiersQtyMax": max,
                    "tableVendorSkuPricingTiersPrice": price
                });
                $scope.notify("Pricing Tier Added",'success');
                $scope.PT = [];
            }
        }
    };

    // fetching list of vendors from RestAPI OMS
    $scope.listOfVendors = function(start) {
        console.log($scope.start);
        var vendorsListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors";
        vendorsListUrl += "?start=" + start + "&size="+$scope.vendorsize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        console.log(vendorsListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            $scope.vendorsLists = data;
            console.log(data);
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.tableRowExpanded1 = false;
            $scope.tableRowIndexExpandedCurr1 = "";
            $scope.tableRowIndexExpandedPrev1 = "";
            $scope.storeIdExpanded1 = "";
            $scope.dayDataCollapse = [];
            $scope.end = $scope.vendorstart + data.length;

            for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
            $scope.showLoader = false;
        }).error(function(error, status) {
            console.log(error);

        });
    }
    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.start = 0;
        $scope.vendorsize = orderSize;
        $scope.end = 0;
        $scope.vendorsLists = [];
        if ($scope.modeVendor == "normal") {
            $scope.listOfVendorsCount(1);
        }
        if ($scope.modeVendor == "mutual") {
            $scope.listOfMutualVendorsCount(1);
        }
        if ($scope.modeVendor == "skumap") {
            $scope.listOfSkuMapVendorsCount(1);
        }
    }
    $scope.listOfVendorsCount = function(page) {
        console.log(page);
        var vendorCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/count";
        $http.get(vendorCountUrl).success(function(data) {
            $scope.vendorCount = data;
            console.log($scope.vendorCount);
            if (data != null) {
                var vm = this;

                vm.dummyItems = _.range(0, $scope.vendorCount); // dummy array of items to be paged
                vm.pager = {};
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }
                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.vendorsize);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.vendorstart = (vm.pager.currentPage - 1) * $scope.vendorsize;
                    console.log($scope.vendorstart);
                    console.log($scope.vendorsize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfVendors($scope.vendorstart);
                }
                $scope.vendorsLists=[];
                $scope.showLoader = true;
                if (page == undefined) {
                    setPage(1);
                }

                if (page != undefined) {
                    setPage(page);
                }
            }
        }).error(function(error, status) {
            console.log(error);

        });
    }


    //fetching list of mutual vendors from mutually exlusive search string vendor
    $scope.listOfMutualVendors = function(start) {
        var vendorsListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/search?search=" + $scope.wordSearch;
        vendorsListUrl += "&start=" + start + "&size="+$scope.vendorsize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        console.log(vendorsListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            console.log(data);
            $scope.vendorsLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.tableRowExpanded1 = false;
            $scope.tableRowIndexExpandedCurr1 = "";
            $scope.tableRowIndexExpandedPrev1 = "";
            $scope.storeIdExpanded1 = "";
            $scope.dayDataCollapse = [];
            $scope.end = $scope.vendorstart + data.length;
            for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
            $scope.showLoader=false;
        }).error(function(error, status) {
            $scope.showLoader=false;

        });
    }

    //fetching list of mutual vendors count
    $scope.listOfMutualVendorsCount = function(page) {
            var vendorCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/searchcount?search=" + $scope.wordSearch;
            console.log("Vendor MAIN COUNT URL");
            console.log(vendorCountUrl);
            $http.get(vendorCountUrl).success(function(data) {
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.vendorsize);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.vendorstart = (vm.pager.currentPage - 1) * $scope.vendorsize;
                    console.log($scope.vendorstart);
                    console.log($scope.vendorsize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfMutualVendors($scope.vendorstart);
                }
                $scope.vendorCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.vendorCount); // dummy array of items to be paged
                    vm.pager = {};
                    $scope.vendorsLists=[];
                    $scope.showLoader = true;
                    vm.setPage = setPage;

                    if (page == undefined) {
                        vm.setPage(1);
                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }


                }
            }).error(function(error, status) {
                console.log(error);

            });
        }
        //fetchng list of vendors mutual count ends here

    //fetching list of skumap vendors
    $scope.listOfSkuMapVendors = function(start) {
        var vendorsListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/0/skumap/" + $scope.skuId + "/vendorsearch";
        vendorsListUrl += "?start=" + start + "&size="+$scope.vendorsize+"&sort=" + $scope.sortType + "&direction=" + $scope.directionType;
        console.log(vendorsListUrl);
        $http.get(vendorsListUrl).success(function(data) {
            $scope.vendorsLists = data;
            $scope.tableRowExpanded = false;
            $scope.tableRowIndexExpandedCurr = "";
            $scope.tableRowIndexExpandedPrev = "";
            $scope.storeIdExpanded = "";
            $scope.tableRowExpanded1 = false;
            $scope.tableRowIndexExpandedCurr1 = "";
            $scope.tableRowIndexExpandedPrev1 = "";
            $scope.storeIdExpanded1 = "";
            $scope.dayDataCollapse = [];
            $scope.end = $scope.vendorstart + data.length;
            for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
            $scope.showLoader=false;
        }).error(function(error, status) {
            $scope.showLoader=false;

        });
    }

    //fetching list of skumap vendors count
    $scope.listOfSkuMapVendorsCount = function(page) {
            var vendorCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/0/skumap/" + $scope.skuId + "/vendorsearchcount";
            console.log("Vendor MAIN COUNT URL");
            console.log(vendorCountUrl);
            $http.get(vendorCountUrl).success(function(data) {
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.vendorsize);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.vendorstart = (vm.pager.currentPage - 1) * $scope.vendorsize;
                    console.log($scope.vendorstart);
                    console.log($scope.vendorsize);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfSkuMapVendors($scope.vendorstart);
                }
                $scope.vendorCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.vendorCount); // dummy array of items to be paged
                    vm.pager = {};
                    $scope.vendorsLists=[];
                    $scope.showLoader = true;
                    vm.setPage = setPage;

                    if (page == undefined) {
                        vm.setPage(1);
                    }

                    if (page != undefined) {
                        vm.setPage(page);
                    }


                }
            }).error(function(error, status) {
                console.log(error);

            });
        }
        //fetchng list of kumap vendors count ends here

    //clear action for vendor mutual search
    $scope.clearMutualVendorAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.vendorstart = 0;
        $scope.modeVendor = "normal";
        // $scope.listOfVendors($scope.vendorstart);
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfVendorsCount(page);
    }

    $scope.clearSkuMapVendorAction = function() {
        $scope.genericData.enableSorting =  true;
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false;
        $scope.vendorstart = 0;
        $scope.modeVendor = "normal";
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        var page = undefined;
        $scope.listOfVendorsCount(page);
    }

    //submit vendor action mutual sku
    $scope.submitvendorAction = function(wordSearch) {

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
        $scope.genericData.enableSorting =  false;
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false; // set the default sort order
        $scope.wordSearch = wordSearch;
        $scope.modeVendor = "mutual";
        // $scope.listOfMutualVendors();
        $scope.isSubmitDisabledMutual = true;
        $scope.isResetDisabledMutual = false;
        var page = undefined;
        $scope.listOfMutualVendorsCount(page);
    }

    $scope.submitSkuMapCendorAction = function(skuId)
    {
        if($scope.skuId == null || $scope.skuId == undefined)
        {
            $scope.notify('Select SKU first');
            return;
        }
        console.log(skuId);
        $scope.sortType = "tableVendorSystemNo";
        $scope.directionType = "desc";
        $scope.sortReverse = false; // set the default sort order
        $scope.skuId = skuId;
        $scope.modeVendor = "skumap";
        // $scope.listOfSkuMapVendors();
        $scope.isSubmitDisabledSku = true;
        $scope.isResetDisabledSku = false;
        var page = undefined;
        $scope.listOfSkuMapVendorsCount(page);
    }

    $scope.newChanged = function(str) {
        console.log(str);
        if (str) {
            $scope.isSubmitDisabledSku = true;
        }else{
            $scope.skuId = null;
            $scope.listOfVendorsCount();
        }
    }
        //opening and closing search accordian
    $scope.toggleSearchRow = function() {
            console.log($scope.searchVendorClicked);
            $scope.searchVendorClicked = !$scope.searchVendorClicked;
        }
        //opening and closing search accordian ends here

    //expansion and collapsing of vendor rows data
    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";
    
    $scope.tableRowExpanded1 = false;
    $scope.tableRowIndexExpandedCurr1 = "";
    $scope.tableRowIndexExpandedPrev1 = "";
    $scope.storeIdExpanded1 = "";

    $scope.dayDataCollapseFn = function() {
        $scope.dayDataCollapse = [];

        for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };

    $scope.selectTableRow = function(index, storeId) {
        console.log(storeId);
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
    //expansion and collapsing of vendor rows data ends here
	$scope.regionsStatesArray = [];
    //Regions Data from region generic API
    $scope.regionsStatesData = function(countryid) {        
        var regionsStatesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+countryid+"/states";
        $http.get(regionsStatesUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.regionsStatesArray.push(data[i]);
            }
            console.log($scope.regionsStatesArray);
        }).error(function(error, status) {
            console.log(error);

        });
    };
	
	 $scope.countriesData = function() {
        $scope.countriesArray = [];
        var countriesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries";
        $http.get(countriesUrl).success(function(data) {
            for (var i = 0; i < data.length; i++) {
                $scope.countriesArray.push(data[i]);
            }
            console.log($scope.countriesArray);
        }).error(function(error, status) {
            console.log(error);

        });
    };

	$scope.countriesStatesData = function(countryData){
	    if(!countryData){
            $scope.countryChanged(countryData);
        }
        else{
            $scope.countryChanged(countryData);
            $scope.countryChanged(countryData);
            $scope.regionsStatesArray = [];
            $scope.regionsStatesDistrictArray = [];
            $scope.regionsStatesDistrictsCityArray = [];

            $scope.regionsStatesData(countryData.idtableCountryId);
        }

	}
	
	$scope.regionsStatesDistrictArray = [];
    //Regions Data from region states generic API
    $scope.regionsStatesDistrictData = function(stateData,vendorId) {
        if(!stateData){
            $scope.stateChanged(stateData);
        }
        else{
            $scope.stateChanged(stateData);
            $scope.state = stateData.tableStateLongName;
            $scope.regionsStatesDistrictArray = [];
            $scope.regionsStatesDistrictsCityArray = [];
            $scope.getLatitudeLongitude($scope.showResult ).then(function(v) {
                    if (v || !v) {
                        console.log(v);
                        console.log(stateData);
                        $scope.stateId = stateData.idtableStateId;

                        var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
                        $http.get(regionsStatesDistrictUrl).success(function(data) {
                            if (data != null) {
                                for (var i = 0; i < data.length; i++) {
                                    $scope.regionsStatesDistrictArray.push(data[i]);
                                }
                                console.log($scope.regionsStatesDistrictArray);
                                $scope.vendorAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', stateData.idtableDistrictId);
                                console.log($scope.vendorAddress.districtData);
                                if(vendorId) $scope.getTinNo(vendorId, stateData);

                            }
                        }).error(function(error, status) {
                            console.log(error);
                            console.log(status);

                        });
                    }
                },
                function(err) {}
            );
        }

    };
	$scope.regionsStatesDistrictsCityArray = [];
    //Regions Data from region states distict generic API
    $scope.regionsStatesDistrictsCityData = function(stateData, districtData) {
        if (districtData) {
            $scope.districtChanged(districtData);
            $scope.district = districtData.tableDistrictLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {
                    console.log(v);
                    if (v || !v) {
                        console.log(districtData);
                        
                        $scope.districtId = districtData.idtableDistrictId;
                        var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
                        $http.get(regionsStatesDistrictsCityUrl).success(function(data) {
                            for (var i = 0; i < data.length; i++) {
                                $scope.regionsStatesDistrictsCityArray.push(data[i]);
                            }
                            console.log($scope.regionsStatesDistrictsCityArray);

                        }).error(function(error, status) {
                            console.log(error);

                        });
                    }
                },
                function(err) {}
            );
        }
        else{
            $scope.regionsStatesDistrictsCityArray = [];
            $scope.districtChanged(districtData);
        }
    };

    $scope.changeCity = function(city) {
        if (city) {
            $scope.cityChanged(city);
            $scope.cityVal = city.tableCityLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {},
                function(err) {}
            );
        }
        else{
            $scope.cityChanged(city);
        }
    };

    //vendor add dialog box
    $scope.showvendorAddBox = function(ev) {
        $scope.singleVendorTab = true;
        $scope.bulkVendorTab = false;
        $scope.companyNameEntered = false;
        $scope.personNameEntered = false;
        $scope.phoneNumberEntered = false;
        $scope.skuMapClicked = true;
        $scope.returnParamsClicked = true;
        $scope.shipAddrClicked = true;
        $scope.emailEntered = false;
        $scope.genericData = {};
        if ($scope.vendorMode == 'add') {
            $scope.genericData = {};
            $scope.genericData.tableGstType = {};
            $scope.genericData.tableGstType.tableGstTypeName = "Unknown";
            $scope.vendorsData = {};
        }

        $scope.disableSaveButton = false;
        $('#addNewVendorDialog').modal('show');

    };
	
	$scope.showVendorAddressEntityDialog = function(ev, entity){
        var check = 0;

        if(entity == 'State' && $scope.vendorAddress.countryData == null){
			$scope.notify("Select country first.");
			check = 1;
		}else if(entity == 'District' && $scope.vendorAddress.stateData == null){
			$scope.notify("Select state first.");
			check = 1;
		}else if(entity == 'City' && $scope.vendorAddress.districtData == null){
			$scope.notify("Select district first.");
			check = 1;
		}
			
		if(check == 0){
		
			$scope.addressEntity = entity;
		
            $('#addAddressModal').modal('show');
		}
	}
	
	$scope.saveAddressEntity = function(addressData,form){

        if (addressData == null || addressData.entity == null || addressData.entity.length == 0) {
            $scope.notify($scope.addressEntity + " can't be empty.");
        } else {
            if ($scope.addressEntity == 'Country') {
                var countryObj = {
                    "idtableCountryId": 1,
                    "tableCountryShortName": $scope.addressData.entity,
                    "tableCountryLongName": $scope.addressData.entity,
                    "tableSkus": [],
                    "tableStates": []
                }

                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/countries',
                    data: countryObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        $scope.notify("Country added successfully.",'success');

                        $scope.regionsStatesArray = [];
                        $scope.regionsStatesDistrictArray = [];
                        $scope.regionsStatesDistrictsCityArray = [];

                        $scope.addressData.countryObjectID = res.idtableCountryId;

                        $scope.countriesArray.push(res);
                        $scope.vendorAddress.countryData = res;

                    }
                    $scope.cancelAddressData(form);
                }).error(function (error, status) {
                    $scope.cancelAddressData(form);
                    if (status == 400)
                    {
                        $scope.notify(error.errorMessage);
                    }
                    else {
                        $scope.notify("There is some error in adding country. Please try again!");
                    }
                });

            }
            else if ($scope.addressEntity == 'State') {

                if ($scope.vendorAddress.countryData == null) {
                    $scope.notify("Please select country first.");
                }

                var stateObj = {
                    "idtableStateId": 1,
                    "tableCountry": $scope.vendorAddress.countryData,
                    "tableStateShortName": $scope.addressData.entity,
                    "tableStateLongName": $scope.addressData.entity,
                    "tableStateTags": null,
                    "tableDistricts": [],
                    "tableClientWarehouseStateMappings": [],
                    "tableVendorStateWiseVats": [],
                    "tableClientStateWiseVats": [],
                    "tableTaxClasses": []
                }

                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/countries/1/states',
                    data: stateObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        $scope.notify("State added successfully.",'success');

                        $scope.regionsStatesDistrictArray = [];
                        $scope.regionsStatesDistrictsCityArray = [];

                        $scope.addressData.stateObjectID = res.idtableStateId;

                        $scope.regionsStatesArray.push(res);
                        $scope.vendorAddress.stateData = res;
                        $scope.cancelAddressData();
                    }

                }).error(function (error, status) {
                    if (status == 400) {
                        $scope.notify(error.errorMessage);
                    }
                    else {
                        $scope.notify("There is some error in adding state. Please try again!");
                    }
                });
            }
            else if ($scope.addressEntity == 'District') {

                if ($scope.vendorAddress.stateData == null) {
                    $scope.notify("Please select state first.");
                }

                var districtObj = {
                    "idtableDistrictId": 1,
                    "tableState": $scope.vendorAddress.stateData,
                    "tableDistrictShortName": $scope.addressData.entity,
                    "tableDistrictLongName": $scope.addressData.entity,
                    "tableDistrictTags": null,
                    "tableCities": []
                }

                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/countries/1/states/1/districts',
                    data: districtObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        $scope.notify("District added successfully.",'success');

                        $scope.regionsStatesDistrictsCityArray = [];

                        $scope.addressData.districtObjectID = res.idtableDistrictId;

                        $scope.regionsStatesDistrictArray.push(res);
                        $scope.vendorAddress.districtData = res;
                        $scope.cancelAddressData();
                    }

                }).error(function (error, status) {
                    if (status == 400) {
                        $scope.notify(error.errorMessage);
                    }
                    else {
                        $scope.notify("There is some error in adding district. Please try again!");
                    }
                });

            }
            else if ($scope.addressEntity == 'City')
            {
                if ($scope.vendorAddress.districtData == null) {
                    $scope.notify("Please select district first.");
                }

                var cityObj = {
                    "idtableCityId": 1,
                    "tableDistrict": $scope.vendorAddress.districtData,
                    "tableCityShortName": $scope.addressData.entity,
                    "tableCityLongName": $scope.addressData.entity,
                    "tableCityTags": null,
                    "tableAddresses": [],
                    "tablePincodes": []
                }

                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/countries/1/states/1/districts/1/cities',
                    data: cityObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if (res != null) {
                        $scope.notify("City added successfully.",'success');

                        $scope.addressData.cityObjectID = res.idtableCityId;

                        $scope.regionsStatesDistrictsCityArray.push(res);
                        $scope.vendorAddress.city = res;
                        $scope.cancelAddressData();
                    }

                }).error(function (error, status) {
                    if (status == 400)
                    {
                        $scope.notify(error.errorMessage);
                    }
                    else {
                        $scope.notify("There is some error in adding City. Please try again!");
                    }
                });

            }

            $scope.addressData.entity = '';
            // $('#vendorAddressModal').modal('show');
        }
	}
	
	$scope.cancelAddressData = function(form){
		
		$scope.addressData = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
		
		$('#addAddressModal').modal('hide');

	}
	
	$scope.showSkuMapWithVendorDialog = function(ev, vendorId, indexOfvendor){
		$scope.genericData.vendorId = vendorId;
		$scope.genericData.index = indexOfvendor;
		$('#addVendorSkuModal').modal('show');
	}
	
    //vendor add dialog box ends here

    $scope.companyNameChanged = function(val) {
        if (val) {
            $scope.companyNameEntered = false;
        } else {
            $scope.companyNameEntered = true;
        }
    };

    $scope.vendorTypeChanged = function(val) {
        if (val) {
            $scope.vendorTypeSelected = false;
        } else {
            $scope.vendorTypeSelected = true;
        }
    };

    $scope.personNameChanged = function(val) {
        if (val) {
            $scope.personNameEntered = false;
        } else {
            $scope.personNameEntered = true;
        }
    };

    $scope.phoneNumberChanged = function(val) {
        if (val) {
            $scope.phoneNumberEntered = false;
        } else {
            $scope.phoneNumberEntered = true;
        }
    };
    $scope.addressLineChanged = function(val) {
        if (val) {
            $scope.addressLineEntered = false;
        } else {
            $scope.addressLineEntered = true;
        }
    };
    $scope.countryChanged = function(val) {
        if (val) {
            $scope.countryEntered = false;
        } else {
            $scope.countryEntered = true;
        }
    };
    $scope.stateChanged = function(val) {
        $scope.onStateChanged();
        if (val) {
            $scope.stateEntered = false;
        } else {
            $scope.stateEntered = true;
        }
    };
    $scope.districtChanged = function(val) {
        if (val) {
            $scope.districtEntered = false;
        } else {
            $scope.districtEntered = true;
        }
    };
    $scope.cityChanged = function(val) {
        if (val) {
            $scope.cityEntered = false;
        } else {
            $scope.cityEntered = true;
        }
    };
    $scope.pincodeChanged = function(val) {
        if (val) {
            $scope.pincodeEntered = false;
        } else {
            $scope.pincodeEntered = true;
        }
    };
    $scope.tinnoChanged = function(val) {
        if (val) {
            $scope.tinnoEntered = false;
        } else {
            $scope.tinnoEntered = true;
        }
    };

    $scope.leadTimeChanged = function(val) {
        if (val) {
            $scope.leadTimeEntered = false;
        } else {
            $scope.leadTimeEntered = true;
        }
    }

    $scope.emailChanged = function(val) {
        if (val) {
            $scope.emailEntered = false;
        } else {
            $scope.emailEntered = true;
        }
    };

    //add vendor data to database OMS Api
    $scope.savevendorData = function(vendorsData,form)
    {
        $scope.disableSaveButton = true;
        if (!vendorsData)
        {
            $scope.notify("Please enter Vendor Details!");
            $scope.disableSaveButton = false;
            return;
        }
        else
        {
            $scope.checkVendorCode(vendorsData.tableVendorClientVendorCode).then(
                function(v)
                {
                    if (v)
                    {
                        if (!vendorsData.tableVendorName)
                        {
                            $scope.companyNameEntered = true;
                            $scope.notify("Please enter a Company Name!");
                            $scope.disableSaveButton = false;
                            return;
                        }
                        else
                        {
                            $scope.checkCompany(vendorsData.tableVendorName).then(
                                function(v)
                                {
                                    if (v)
                                    {
                                        if (!vendorsData.tableVendorType) {
                                            $scope.notify("Please select Vendor Type!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!vendorsData.tableVendorContactPerson)
                                        {
                                            $scope.personNameEntered = true;
                                            $scope.notify("Please enter a Contact Person Name!");
                                            $scope.disableSaveButtern = false;
                                            return;
                                        }
                                         else if (!vendorsData.tableVendorEmailId)
                                         {
                                            $scope.emailEntered = true;
                                            $scope.notify("Please enter Valid Email Id!");
                                             $scope.disableSaveButton = false;
                                             return;
                                        }
                                        else if (!vendorsData.tableVendorPhoneNumber)
                                        {
                                            $scope.phoneNumberEntered = true;
                                            $scope.notify("Please enter a valid 10-12 digit Phone Number!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (vendorsData.tableVendorPhoneNumber.length < 10 || vendorsData.tableVendorPhoneNumber.length > 12)
                                        {
                                            $scope.phoneNumberEntered = true;
                                            $scope.notify("Please enter a valid 10-12 digit Phone Number!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!vendorsData.tableVendorType)
                                        {
                                            $scope.vendorTypeSelected = true;
                                            $scope.notify("Please select vendor type!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!$scope.vendorAddress.adLine1 && $scope.vendorMode != 'edit')
                                        {
                                            $scope.addressLineEntered = true;
                                            $scope.notify("Please enter a valid address!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!$scope.vendorAddress.countryData && $scope.vendorMode != 'edit')
                                        {
                                            $scope.countryEntered = true;
                                            $scope.notify("Please select your country!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!$scope.vendorAddress.stateData && $scope.vendorMode != 'edit')
                                        {
                                            $scope.stateEntered = true;
                                            $scope.notify("Please select your state!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!$scope.vendorAddress.districtData && $scope.vendorMode != 'edit')
                                        {
                                            $scope.districtEntered = true;
                                            $scope.notify("Please select your district!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!$scope.vendorAddress.city && $scope.vendorMode != 'edit')
                                        {
                                            $scope.cityEntered = true;
                                            $scope.notify("Please select your city!");
                                            $scope.disableSaveButton = false;
                                            return;
                                        }
                                        else if (!$scope.vendorAddress.pincode && $scope.vendorMode != 'edit')
                                        {//check here for alphanumeric pincode
                                            $scope.pincodeEntered = true;
                                            $scope.notify("Please enter Pin Code!");
                                            $scope.disableSaveButton = false;
                                            return;

                                            //$scope.isvendorAddressPinValid = true;
                                        }
                                        // else if (!$scope.vendorAddress.tinNo && $scope.vendorMode != 'edit'
                                        //                                 && vendorsData.tableGstType.tableGstTypeName != 'Non Registered'
                                        //                                 && vendorsData.tableGstType.tableGstTypeName != 'GST Exempt'
                                        //                                 && $scope.vendorsData.tableGstType.tableGstTypeName != 'Unknown') {
                                        //      $scope.tinnoEntered = true;
                                        //      $scope.notify("Please enter valid GSTIN");
                                        //     //$scope.isvendorAddressTinValid = true;
                                        // }
                                        //else if (!vendorsData.tableVendorDefaultLeadTimeDays) {
                                        //     $scope.leadTimeEntered = true;
                                        //     $scope.notify("Please enter a valid Lead Time in Days!");
                                        // } 
                                        else
                                        {
                                            $scope.checkPhone(vendorsData.tableVendorPhoneNumber).then(
                                                function(v)
                                                {
                                                    if (v) {
                                                        if(vendorsData.tableVendorReturnValuePercentage != 'undefined' && vendorsData.tableVendorReturnValuePercentage != null && (vendorsData.tableVendorReturnValuePercentage > 100 || vendorsData.tableVendorReturnValuePercentage < 0)){
                                                            $scope.notify("Return value percentage can not be more than 100 OR less than 0");
                                                            $scope.disableSaveButton = false;
                                                            return;
                                                        }

                                                        if(vendorsData.tableVendorReturnQuantity != 'undefined' && vendorsData.tableVendorReturnQuantity != null && (vendorsData.tableVendorReturnQuantity > 100 || vendorsData.tableVendorReturnQuantity < 0))
                                                        {
                                                            $scope.notify("Return Quantity percentage can not be more than 100 OR less than 0");
                                                            $scope.disableSaveButton = false;
                                                            return;
                                                        }
                                                        if ($scope.vendorMode == "add") {
                                                            $scope.saveVendor(vendorsData,form);
                                                        } else if ($scope.vendorMode == "edit") {
                                                            $scope.editVendorData(vendorsData,form);
                                                        }
                                                    }
                                                },
                                                function(err)
                                                {
                                                    $scope.disableSaveButton = false;
                                                    return;
                                                }
                                            );
                                        }
                                    }
                                },
                                function(err)
                                {
                                    $scope.disableSaveButton = false;
                                    return;
                                }
                            );
                        }
                    }
                },
                function(err)
                {
                    $scope.disableSaveButton = false;
                    return;
                }
            );
        }

    };
    //add vendor data to database OMS Api ends here

    $scope.getAllVendorTypes = function () {
        $scope.vendorsTypes = [];
        var vendorsTypeListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/vendortypes/";
        // console.log(channelListUrl);
        $http.get(vendorsTypeListUrl).success(function(data) {
            console.log(data);
            $scope.vendorsTypesLists = data;
            for (var i = 0; i < $scope.vendorsTypesLists.length; i++) {
                $scope.vendorsTypes.push($scope.vendorsTypesLists[i]);
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
        });
    }

    $scope.getAllVendorTypes();

    $scope.vendorsTypeData = {};

    $scope.saveVendor = function(vendorsData,form)
    {
        var postVendorData = vendorsData;
        postVendorData.tableCreditDays= {
                "idtableCreditDaysId": 1,
                "tableCreditDaysString": "1 week",
                "tableCreditDaysNoOfDays": 7
            };
        postVendorData.tableCurrencyCode= {
                "idtableCurrencyCodeId": 1,
                "tableCurrencyCodeShortname": "INR",
                "tableCurrencyCodeLongname": "Indian Rupee"
            };
        postVendorData.tableVendorStatusType = {
                "idtableVendorStatusTypeId": 1,
                "tableVendorStatusTypeString": "Active"
            };



        $scope.vendorAddress.contactPersonName = postVendorData.tableVendorContactPerson;
        $scope.vendorAddress.contactEmail = postVendorData.tableVendorEmailId;
        $scope.vendorAddress.contactPhone = postVendorData.tableVendorPhoneNumber;


        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors',
            data: postVendorData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                console.log($scope.vendorstart);
                $scope.vendorMode = 'add';

                $scope.notify("New Vendor Added Successfully",'success')
                if ($scope.modeVendor == "normal") {
                    // $scope.listOfVendors($scope.vendorstart);`
                    $scope.listOfVendorsCount($scope.vmPager.currentPage);
                }
                if ($scope.modeVendor == "mutual") {
                    // $scope.listOfMutualVendors($scope.vendorstart);
                    $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                }
                if ($scope.modeVendor == "skumap") {
                    // $scope.listOfSkuMapVendors($scope.vendorstart);
                    $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                }
               
				$scope.genericData.vendorObject = res;

                if($scope.mapList.length != 0) {
                    $scope.makeSkusMapWithVendor($scope.genericData.vendorObject.idtableVendorId, $scope.mapList);
                }
                $scope.vendorId = $scope.genericData.vendorObject.idtableVendorId;



                $scope.saveShippingAddressData();
				$scope.cancelvendorData(form);

            }
        }).error(function(error, status)
        {
            console.log(error);
            $scope.disableSaveButton = false;

        });
    };
	
	$scope.makeSkusMapWithVendor = function(vendorId, listOfSkusObjects){
		 
		 //alert(listOfSkusObjects);
		 
		 $http({
						method: 'POST',
						url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/'+$scope.genericData.vendorObject.idtableVendorId+'/skumap/createmaps',
						data: listOfSkusObjects,
						headers: {
									'Content-Type': 'application/json'
								}
						}).success(function(res) {

             $scope.notify("New Vendor SKU created Successfully",'success');
						
						});
						
						
	}
	
	$scope.makeSkusMapWithVendor2 = function(vendorId, listOfSkusObjects, index,form){
		 
		 //alert(listOfSkusObjects);
		 
		 $http({
						method: 'POST',
						url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/'+vendorId+'/skumap/createnewmaps',
						data: listOfSkusObjects,
						headers: {
									'Content-Type': 'application/json'
								}
						}).success(function(res) {

             $scope.notify("New Vendor SKU created Successfully",'success');
						
						$scope.cancelvendorData(form);
						$scope.selectTableRow(index, vendorId);

         }).error(function (error, status) {
             console.log(error);
             $scope.cancelvendorData(form);
            $scope.notify(error.errorMessage);
         });
						
						
	}
	
	

    //opening dialog box in edit mode
    $scope.editVendor = function(ev, vendorId) {

            $scope.vendorMode = "edit";
            $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + vendorId).success(function(response)
            {
                console.log(response);

                $scope.vendorsData = response;


                if($scope.vendorsData.tableVendorReturnQuantity)
                {
                    $scope.genericData.returnType = 'quantitybased';
                }
                if($scope.vendorsData.tableVendorReturnValuePercentage)
                {
                    $scope.genericData.returnType = 'valuebased';
                }
                if(!$scope.vendorsData.tableVendorReturnValuePercentage && !$scope.vendorsData.tableVendorReturnQuantity)
                {
                    $scope.genericData.returnType = "";
                }
                $scope.mapList = response.tableVendorSystemSkuMaps;
                $scope.originalVendorCode = response.tableVendorClientVendorCode;
                $scope.originalCompanyName = response.tableVendorName;
                $scope.originalContactPersonName = response.tableVendorContactPerson;
                $scope.originalPhoneNumber = response.tableVendorPhoneNumber;
                if ($scope.vendorsData != null) {
                    $scope.showvendorAddBox(ev);
                }
            });
        }
        //opening dialog box in edit mode ends here

    // Edit Vendor Data when clicking on update button to backend OMS Customer API
    $scope.editVendorData = function(vendorsData,form) {

        vendorsData.tableVendorAddresses = [];
        vendorsData.tableVendorStateWiseVats = [];
        vendorsData.tableVendorWarehouseLists = [];
        vendorsData.tableVendorDocLists = [];
        vendorsData.tableSkuInventories = [];
        vendorsData.tablePurchaseOrders = [];
        vendorsData.tableVendorSystemSkuMaps = [];
        var putVendorData = vendorsData;
        putVendorData.tableCreditDays= {
            "idtableCreditDaysId": 1,
            "tableCreditDaysString": "1 week",
            "tableCreditDaysNoOfDays": 7
        };
        putVendorData.tableCurrencyCode= {
            "idtableCurrencyCodeId": 1,
            "tableCurrencyCodeShortname": "INR",
            "tableCurrencyCodeLongname": "Indian Rupee"
        };
        putVendorData.tableVendorStatusType = {
            "idtableVendorStatusTypeId": 1,
            "tableVendorStatusTypeString": "Active"
        };


            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + vendorsData.idtableVendorId,
                data: putVendorData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res) {
                    $scope.vendorMode = 'add';
                    $scope.vendorsData = null;
                    $scope.notify("Vendor Edited Successfully",'success');
                    if ($scope.modeVendor == "normal") {
                        // $scope.listOfVendors($scope.vendorstart);`
                        $scope.listOfVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "mutual") {
                        // $scope.listOfMutualVendors($scope.vendorstart);
                        $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "skumap") {
                        // $scope.listOfSkuMapVendors($scope.vendorstart);
                        $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                    }

                    $scope.genericData.vendorObject = res;

                    if($scope.mapList.length != 0) {
                        $scope.makeSkusMapWithVendor($scope.genericData.vendorObject.idtableVendorId, $scope.mapList);
                    }
                    $scope.cancelvendorData(form);
                }
            }).error(function(error, status) {
                console.log(error);

            });
        }
        // Edit Vendor Data when clicking on update button to backend OMS Customer API ends here

    $scope.cancelvendorData = function(form) {
        $scope.vendorMode = 'add';
        // $scope.vendorsData = null;
		$scope.genericData.vendorId = null;
		$scope.genericData.index = null;
		$scope.mapList = [];
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.isProductSelected = false;
        $scope.vendorAddress = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addAddressModal').modal('hide');
        $('#addVendorSkuModal').modal('hide');
        $('#addNewVendorDialog').modal('hide');
    }

    //VENDOR ADDRESS SCREEN CONTROLLER CODE

    //dialog box to add new shipping address
    $scope.addAddress = function(vendorId) {
        console.log(vendorId);

        $scope.vendorAddress = {};
        $scope.state = "";
        $scope.district = "";
        $scope.cityVal = "";

        $scope.genericData = {};
        $scope.genericData.tableGstType = {};
        $scope.genericData.tableGstType.tableGstTypeName = "Unknown";



        $scope.vendorId = vendorId;
        if ($scope.vendorAddressMode == 'add') {
            var customersByIDUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/" + vendorId;
            $http.get(customersByIDUrl).success(function(data) {
                $scope.vendorsData = data;
                $scope.vendorId = data.idtableVendorId;
                $scope.vendorAddress.contactPersonName = data.tableVendorContactPerson;
                $scope.vendorAddress.contactEmail = data.tableVendorEmailId;
                $scope.vendorAddress.contactPhone = data.tableVendorPhoneNumber;
            }).error(function(error, status) {
                console.log(error);

            });
        }
        $('#vendorAddressModal').modal('show');
    }

    $scope.validateGSTIN = function (vatNo,stateData) {

        if (!vatNo)
        {
            $scope.notify("GSTIN not entered",'warning');
            return false;
        }

        var m = null;
        if(vatNo!= null && vatNo.length > 0)
        {
            m = regex.exec(vatNo);
            if(m == null)
            {
                $scope.notify("Provided GST doesn't seem to match the prescribed format");
                return false;
            }
            else
            {
                var stateCode = vatNo.substr(0,2);
                if($scope.vendorAddress && $scope.vendorAddress.stateData && $scope.vendorAddress.stateData.tableStateCode != stateCode)
                {
                    $scope.notify("State code provided in GSTIN does not match the state code of selected state. Select the state again");
                    return;
                }
                if(stateData && stateData.tableStateCode != stateCode)
                {
                    $scope.notify("State code provided in GSTIN does not match the state code of selected state. Select the state again");
                    return;
                }

            }
        }
    }

    $scope.setFormButtonValue = function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddVendorAddressForm =  function (form) {
        if($scope.vendorAddressMode=='add' && $scope.submitActionButton == 'add'){
            $scope.saveShippingAddressData(form);
        }
        else if($scope.vendorAddressMode=='edit'  && $scope.submitActionButton == 'edit'){
            $scope.editShippingAddressData(form);

        }

    }

    //saving shipping address data based on customer id
    $scope.saveShippingAddressData = function(form) {
        var latitude = $scope.searchLocation.latitude;
        var longitude = $scope.searchLocation.longitude;
        var tinMode = 'post';
        var vatNo = $scope.vendorAddress.tinNo;
        var stateData = $scope.vendorAddress.stateData;
		
		var countryData = $scope.vendorAddress.countryData;
		
        console.log(tinMode);
        if (!$scope.vendorAddress) {
            $scope.notify("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactPersonName) {
            $scope.notify("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactEmail) {
            $scope.notify("Please enter a valid Email Address");
            $scope.isvendorAddressEmailValid = true;
        } else if (!$scope.vendorAddress.contactPhone) {
            $scope.isvendorAddressPhoneValid = true;
            $scope.notify("Please enter a valid 10-12 digit Phone Number!");
        } else if ($scope.vendorAddress.contactPhone.length < 10 || $scope.vendorAddress.contactPhone.length > 12) {
            $scope.isvendorAddressPhoneValid = true;
            $scope.notify("Please enter a valid 10-12 digit Phone Number!");
        } else if (!$scope.vendorAddress.adLine1) {
            $scope.notify("Please enter a valid Address");
            $scope.isvendorAddressAdLine1Valid = true;
        } else if (!$scope.vendorAddress.stateData) {
            $scope.notify("Please choose state from the available states!");
            $scope.isvendorAddressStateValid = true;
        } else if (!$scope.vendorAddress.districtData) {
            $scope.notify("Please choose district from the available districts!");
            $scope.isvendorAddressDistrictValid = true;            
        } else if (!$scope.vendorAddress.city) {
            $scope.notify("Please choose city from the available cities!");
            $scope.isvendorAddressCityValid = true;            
        } else if (!$scope.vendorAddress.pincode) {//check here for alphanumeric pincode
            $scope.notify("Please enter Pin Code!");
            $scope.isvendorAddressPinValid = true;            
        }

        else 
        {
            var postShippingAddressData = {
                "tableAddress": {
                    "tableAddress1": $scope.vendorAddress.adLine1,
                    "tableAddress2": $scope.vendorAddress.adLine2,
                    "tableAddress3": $scope.vendorAddress.adLine3,
                    "tableAddress4": null,
                    "tableAddressPin": $scope.vendorAddress.pincode,
                    "tableAddressFax": null,
                    "tableAddressContactPerson1": $scope.vendorAddress.contactPersonName,
                    "tableAddressPhone1": $scope.vendorAddress.contactPhone,
                    "tableAddressEmail1": $scope.vendorAddress.contactEmail,
                    "tableAddressLatitude": latitude,
                    "tableAddressLongitude": longitude,
                    "tableAddressType": {
                        "idtableAddressTypeId": 1,
                        "tableAddressTypeString": "Shipping"
                    },
                    "tableCity": $scope.vendorAddress.city
                }
            }


            var vendorAddressWithGst = {};
            vendorAddressWithGst.tableVendorAddress = postShippingAddressData;

            if(vatNo)
            {
                if ($scope.validateGSTIN(vatNo, stateData) != false)
                {
                    var tinPostData = {
                        "tableVendorStateWiseVatNo": vatNo,
                        "tableState": stateData,
                        "tableGstType" : $scope.genericData.tableGstType
                    }
                    vendorAddressWithGst.tableVendorStateWiseVat = tinPostData;
                }
            }

            console.log(postShippingAddressData);

            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + $scope.vendorId + '/address/withgst',
                data: vendorAddressWithGst,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res)
                {
                    $scope.vendorsData = {};
                    $scope.notify("Address added successfully",'success');
                    $scope.cancelAddress(form);
                    $scope.state = "";
                    $scope.district = "";
                    $scope.cityVal = "";
                    $scope.vendorAddressMode = "add";
                    if ($scope.modeVendor == "normal") {
                        $scope.listOfVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "mutual") {
                        $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "skumap") {
                        $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                    }
                }
            }).error(function(error, status) {
                $scope.cancelAddress(form);

            });

        }
        $('#addAddressModal').modal('hide');
    }


    //EDIT shipping address data based on customer id and ship address id
    $scope.editShippingAddressData = function(form) {
        var latitude = $scope.searchLocation.latitude;
        var longitude = $scope.searchLocation.longitude;
        console.log($scope.tinMode);
        var tinMode = $scope.tinMode;
        console.log($scope.vendorAddress.tinNo);
        var vatNo = $scope.vendorAddress.tinNo;
        console.log($scope.vendorAddress.stateData);
        var stateData = $scope.vendorAddress.stateData;
        console.log(tinMode);
        if (!$scope.vendorAddress) {
            $scope.notify("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactPersonName) {
            $scope.notify("Please enter the Contact Person Name");
            $scope.isvendorAddressNameValid = true;
        } else if (!$scope.vendorAddress.contactEmail) {
            $scope.notify("Please enter a valid Email Address");
            $scope.isvendorAddressEmailValid = true;
        } else if (!$scope.vendorAddress.contactPhone) {
            $scope.isvendorAddressPhoneValid = true;
            $scope.notify("Please enter a valid 10-12 digit Phone Number!");
        } else if ($scope.vendorAddress.contactPhone.length < 10 || $scope.vendorAddress.contactPhone.length > 12) {
            $scope.isvendorAddressPhoneValid = true;
            $scope.notify("Please enter a valid 10-12 digit Phone Number!");
        } else if (!$scope.vendorAddress.adLine1) {
            $scope.notify("Please enter a valid Address");
            $scope.isvendorAddressAdLine1Valid = true;
        } else if (!$scope.vendorAddress.countryData) {
            $scope.notify("Please choose a country from the available countries!");
            //$scope.isvendorAddressAdLine1Valid = true;
        } else if (!$scope.vendorAddress.stateData) {
            $scope.notify("Please choose state from the available states!");
            $scope.isvendorAddressStateValid = true;            
        } else if (!$scope.vendorAddress.districtData) {
            $scope.notify("Please choose district from the available districts!");
            $scope.isvendorAddressDistrictValid = true;            
        } else if (!$scope.vendorAddress.city) {
            $scope.notify("Please choose city from the available cities!");
            $scope.isvendorAddressCityValid = true;            
        } else if (!$scope.vendorAddress.pincode) {
            $scope.notify("Please enter valid 6 digit Pin Code!");
            $scope.isvendorAddressPinValid = true;            
        } else if ($scope.vendorAddress.pincode.length < 6) {
            $scope.notify("Please enter atleast 6 digit Pin Code!");
            $scope.isvendorAddressPinValid = true;            
        }
        // else if ($scope.vendorsData && $scope.vendorsData.tableGstType.tableGstTypeName != 'Non Registered'
        //     && $scope.vendorsData.tableGstType.tableGstTypeName != 'GST Exempt' && $scope.vendorsData.tableGstType.tableGstTypeName != 'Unknown' && !$scope.vendorAddress.tinNo) {
        //     $scope.notify("Please enter valid GSTIN!");
        //     $scope.isvendorAddressTinValid = true;
        // }
        else {
            var putShippingAddressData = {
                "tableAddress": {
                    "idtableAddressId": $scope.vendorAddress.addressId,
                    "tableAddress1": $scope.vendorAddress.adLine1,
                    "tableAddress2": $scope.vendorAddress.adLine2,
                    "tableAddress3": $scope.vendorAddress.adLine3,
                    "tableAddress4": null,
                    "tableAddressPin": $scope.vendorAddress.pincode,
                    "tableAddressFax": null,
                    "tableAddressContactPerson1": $scope.vendorAddress.contactPersonName,
                    "tableAddressPhone1": $scope.vendorAddress.contactPhone,
                    "tableAddressEmail1": $scope.vendorAddress.contactEmail,
                    "tableAddressLatitude": latitude,
                    "tableAddressLongitude": longitude,
                    "tableAddressType": {
                        "idtableAddressTypeId": 1,
                        "tableAddressTypeString": "Shipping"
                    },
                    "tableCity": $scope.vendorAddress.city
                }
            }
            putShippingAddressData.tableAddress.tableCity.tableDistrict = $scope.vendorAddress.districtData;
            putShippingAddressData.tableAddress.tableCity.tableDistrict.tableState = $scope.vendorAddress.stateData;
            putShippingAddressData.tableAddress.tableCity.tableDistrict.tableState.tableCountry = $scope.vendorAddress.countryData;
            console.log(putShippingAddressData);

            var vendorAddressWithGst = {};
            vendorAddressWithGst.tableVendorAddress = putShippingAddressData;

            if ($scope.validateGSTIN(vatNo) != false) {


                    var tinPostData = {
                        "tableVendorStateWiseVatNo": vatNo,
                        "tableState": stateData,
                        "tableGstType" : $scope.genericData.tableGstType
                    }
                vendorAddressWithGst.tableVendorStateWiseVat = tinPostData;

            }

            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + $scope.vendorId + '/address/withgst/' + $scope.addressId,
                data: vendorAddressWithGst,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                console.log(res);
                if (res)
                {
                    $scope.vendorAddress = {};
                    $scope.notify("Address updated successfully",'success');
                    $scope.cancelAddress(form);
                    $scope.state = "";
                    $scope.district = "";
                    $scope.cityVal = "";
                    $scope.vendorAddressMode = "add";
                    if ($scope.modeVendor == "normal") {
                        $scope.listOfVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "mutual") {
                        $scope.listOfMutualVendorsCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeVendor == "skumap") {
                        $scope.listOfSkuMapVendorsCount($scope.vmPager.currentPage);
                    }
                }
            }).error(function(error, status) {
                $scope.cancelAddress(form);
                console.log(error);
        });

        }
    }

    $scope.editShippingAddressVendor = function(vendorId, addressId,vendorData) {
	    $scope.vendorsData = vendorData;
	    var addressResponse = {};
        $scope.vendorAddressMode = 'edit';
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + vendorId + '/address/' + addressId)
        .then(function(response) {
            addressResponse = response.data;
            return $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/");
        })
        .then(function(response) {
            $scope.countriesArray = [];
            $scope.vendorAddress = {};
            $scope.countriesArray = response.data;
            $scope.vendorAddress.countryData = initializeDropdowns($scope.countriesArray, 'idtableCountryId', addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId);
            return $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId+"/states");
        })
        .then(function (response) {
            $scope.regionsStatesArray = [];
            $scope.regionsStatesArray = response.data;
            $scope.addressId = addressId;
            $scope.vendorId = vendorId;
            $scope.vendorAddress.addressId = addressResponse.tableAddress.idtableAddressId;
            $scope.vendorAddress.contactPersonName = addressResponse.tableAddress.tableAddressContactPerson1;
            $scope.vendorAddress.contactEmail = addressResponse.tableAddress.tableAddressEmail1;
            $scope.vendorAddress.contactPhone = addressResponse.tableAddress.tableAddressPhone1;
            $scope.vendorAddress.adLine1 = addressResponse.tableAddress.tableAddress1;
            $scope.vendorAddress.adLine2 = addressResponse.tableAddress.tableAddress2;
            $scope.vendorAddress.adLine3 = addressResponse.tableAddress.tableAddress3;
            $scope.vendorAddress.pincode = parseInt(addressResponse.tableAddress.tableAddressPin);
            $scope.vendorAddress.stateData = initializeDropdowns($scope.regionsStatesArray, 'idtableStateId', addressResponse.tableAddress.tableCity.tableDistrict.tableState.idtableStateId);
            $scope.district = addressResponse.tableAddress.tableCity.tableDistrict.tableDistrictLongName;
            $scope.state = addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableStateLongName;

            return $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId+"/states/" + addressResponse.tableAddress.tableCity.tableDistrict.tableState.idtableStateId + "/districts");

        })
        .then(function (response) {
            $scope.regionsStatesDistrictArray = [];
            $scope.regionsStatesDistrictArray = response.data;
            console.log($scope.regionsStatesDistrictArray);
            $scope.vendorAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', addressResponse.tableAddress.tableCity.tableDistrict.idtableDistrictId);
            console.log($scope.vendorAddress.districtData);

            return $http.get(MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+addressResponse.tableAddress.tableCity.tableDistrict.tableState.tableCountry.idtableCountryId+"/states/" + $scope.vendorAddress.stateData.idtableStateId + "/districts/" + addressResponse.tableAddress.tableCity.tableDistrict.idtableDistrictId + "/cities");
        })
        .then(function (response) {
            $scope.regionsStatesDistrictsCityArray = [];
            $scope.regionsStatesDistrictsCityArray = response.data;

            console.log($scope.regionsStatesDistrictsCityArray);
            $scope.vendorAddress.city = initializeDropdowns($scope.regionsStatesDistrictsCityArray, 'idtableCityId', addressResponse.tableAddress.tableCity.idtableCityId);
            console.log($scope.vendorAddress.city);
            $scope.cityVal = $scope.vendorAddress.city.tableCityLongName;


            if(vendorId) $scope.getTinNo(vendorId, $scope.vendorAddress.stateData);


            $scope.searchLocation = {
                latitude: addressResponse.tableAddress.tableAddressLatitude,
                longitude: addressResponse.tableAddress.tableAddressLongitude
            }

            $('#vendorAddressModal').modal('show');
        });
    }

    $scope.cancelAddress = function(form) {
        $scope.vendorAddressMode = 'add';

        $scope.state = "";
        $scope.district = "";
        $scope.cityVal = "";

        $scope.vendorAddress = {};
        // $scope.vendorsData = {};
        $scope.isvendorAddressNameValid = false;
        $scope.isvendorAddressEmailValid = false;
        $scope.isvendorAddressPhoneValid = false;
        $scope.isvendorAddressAdLine1Valid = false;
        $scope.isvendorAddressStateValid = false;
        $scope.isvendorAddressDistrictValid = false;
        $scope.isvendorAddressCityValid = false;
        $scope.isvendorAddressPinValid = false;
        $scope.isvendorAddressTinValid = false;
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }

        $('#vendorAddressModal').modal('hide');
    }

    $scope.validateEmail = function(emailCase) {
        if (emailCase == false) {
            $scope.notify("Please Enter Valid Email Id");
            document.vendForm.vendEmail.focus();
        }
    }

    //Number Validation not allowing -,+,e
    $scope.Num = function(event) {
        var keys = {
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            '+': 43
        };
        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    };

    $scope.getTinNo = function(vendorId, stateData) {
        console.log(vendorId);
        console.log(stateData.idtableStateId);
        var getTinurl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/" + vendorId + "/vats/checkvat/" + stateData.idtableStateId;
        $http.get(getTinurl).success(function(data1) {
            console.log(data1);
            if (data1) {
                $scope.tinMode = "put";
                if (!$scope.vendorAddress) {
                    $scope.vendorAddress = {};
                }
                $scope.tinVatId = data1.idtableVendorStateWiseVatId;
                $scope.vendorAddress.tinNo = data1.tableVendorStateWiseVatNo;
                $scope.genericData.tableGstType = data1.tableGstType;
            }
            if(data1==''){
                console.log('hi');
                $scope.tinMode = "post";
            }
        }).error(function(error) {
            // console.log(error);
        });
    }

    function initializeDropdowns(lists, prop, code) {
        lists = lists || [];
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            if (list[prop] === code) {
                return list;
            }
        };
        return null;
    }

    $scope.checkPhone = function(phone) {
        var q = $q.defer();
        if ($scope.vendorMode == "edit") {
            if ($scope.originalPhoneNumber == phone) {
                q.resolve(true);
            } else {
                var checkPhone = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/checkphone?phone=" + phone;
                $http.get(checkPhone).success(function(data) {
                    console.log(data);
                    if (data.status == false) {
                        $scope.notify(data.statusMessage);
                        $scope.phoneNumberEntered = true;
                        q.resolve(false);
                    } else if (data.status == true) {
                        $scope.phoneNumberEntered = false;
                        q.resolve(true);
                    }
                });
            }
        } else if ($scope.vendorMode == "add") {
            var checkPhone = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/checkphone?phone=" + phone;
            $http.get(checkPhone).success(function(data) {
                console.log(data);
                if (data.status == false) {
                    $scope.notify(data.statusMessage);
                    $scope.phoneNumberEntered = true;
                    q.resolve(false);
                } else if (data.status == true) {
                    $scope.phoneNumberEntered = false;
                    q.resolve(true);
                }
            });
        }
        return q.promise;
    };

    $scope.checkCompany = function(company) {
        var q = $q.defer();
        if ($scope.vendorMode == "edit") {
            if ($scope.originalCompanyName == company) {
                q.resolve(true);
            } else {
                var checkCompany = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/checkcompany?company=" + company;
                $http.get(checkCompany).success(function(data) {
                    console.log(data);
                    if (data.status == false) {
                        $scope.notify(data.statusMessage);
                        $scope.companyNameEntered = true;
                        q.resolve(false);
                    } else if (data.status == true) {
                        $scope.companyNameEntered = false;
                        q.resolve(true);
                    }
                });
            }
        } else if ($scope.vendorMode == "add") {
            var checkCompany = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/checkcompany?company=" + company;
            $http.get(checkCompany).success(function(data) {
                console.log(data);
                if (data.status == false) {
                    $scope.notify(data.statusMessage);
                    $scope.companyNameEntered = true;
                    q.resolve(false);
                } else if (data.status == true) {
                    $scope.companyNameEntered = false;
                    q.resolve(true);
                }
            });
        }
        return q.promise;
    };

    $scope.checkVendorCode = function(vendorcode) {
        var q = $q.defer();
        if(vendorcode == "" || vendorcode == undefined || vendorcode == null){
            q.resolve(true);
        }
        else{
            if ($scope.vendorMode == "edit") {
                if ($scope.originalVendorCode == vendorcode) {
                    q.resolve(true);
                } else {
                    var checkVendorCode = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/checkvendorcode?vendorcode=" + vendorcode;
                    console.log(checkVendorCode);
                    $http.get(checkVendorCode).success(function(data) {
                        console.log(data);
                        if (data.status == false) {
                            $scope.notify(data.statusMessage);
                            q.resolve(false);
                        } else if (data.status == true) {
                            q.resolve(true);
                        }
                    });
                }
            } else if ($scope.vendorMode == "add") {
                var checkVendorCode = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/checkvendorcode?vendorcode=" + vendorcode;
                console.log(checkVendorCode);
                $http.get(checkVendorCode).success(function(data) {
                    console.log(data);
                    if (data.status == false) {
                        $scope.notify(data.statusMessage);
                        q.resolve(false);
                    } else if (data.status == true) {
                        q.resolve(true);
                    }
                });
            }
        }
        return q.promise;
    };

    $scope.callVendorSkuMapRepeatData = function(vendorId) {
        console.log(vendorId);
        var callSkuMapUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/" + vendorId + "/skumap/";
        $http.get(callSkuMapUrl).success(function(data) {

            if (data != null) {
                $scope.skuMapData = data;
                console.log($scope.skuMapData);
            }
        })
    }

    $scope.editVendorSkuMap = function(vendorId, skuMapId) {
        $scope.vendorSkuMapMode = "edit";
        var editSkuMapUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/" + vendorId + "/skumap/" + skuMapId;
        $http.get(editSkuMapUrl).success(function(data) {
            if (data != null) {
                $scope.pricingTiers = [];
                $scope.PT = [];
                $scope.vendorSkuData = data;
                $scope.vendorId = vendorId;
                console.log($scope.vendorSkuData);
                $scope.$broadcast("angucomplete-alt:changeInput", "products", data.tableSku.tableSkuName);
                $scope.skuSelected = {
                    originalObject: data.tableSku
                };
                for (var i = 0; i < data.tableVendorSkuPricingTierses.length; i++) {
                    $scope.pricingTiers.push({
                        "tableVendorSkuPricingTiersQtyMin": data.tableVendorSkuPricingTierses[i].tableVendorSkuPricingTiersQtyMin,
                        "tableVendorSkuPricingTiersQtyMax": data.tableVendorSkuPricingTierses[i].tableVendorSkuPricingTiersQtyMax,
                        "tableVendorSkuPricingTiersPrice": data.tableVendorSkuPricingTierses[i].tableVendorSkuPricingTiersPrice
                    })
                }
                for (var i = 0; i < data.tableVendorSkuUoqmses.length; i++) {
                    $scope.selectedList.push({
                        oqmStr: data.tableVendorSkuUoqmses[i].tableSkuUoqmConfig.tableSkuUoqmType.tableSkuUoqmTypeString,
                        oqmData: data.tableVendorSkuUoqmses[i].tableSkuUoqmConfig
                    });
                }
                $('#addVendorSku').modal('show');
            }
        })
    };

    $scope.cancelCleanData = function() {
        // $scope.vendorSkuData = null;
        $scope.pricingTiers = [];
        $scope.selectedList = [];
        $scope.pricingtierDetailsClicked = false;
        $scope.unitquantityClicked = false;
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.isProductSelected = false;
        $scope.vendorSkuCodeEntered = false;
        $scope.minOrderQtyEntered = false;
        $scope.leadTimeEntered = false;
        $scope.isPTMinQtyEntered = false;
        $scope.isPTMaxQtyEntered = false;
        $scope.isPTPriceEntered = false;
        $scope.skuSelected = null;
        $('#addVendorSku').modal('hide');
    }

    $scope.vendorSkuCodeChanged = function(val) {
        if (val) {
            $scope.vendorSkuCodeEntered = false;
        } else {
            $scope.vendorSkuCodeEntered = true;
        }
    };

    $scope.minOrderQtyChanged = function(val) {
        if (val) {
            $scope.minOrderQtyEntered = false;
        } else {
            $scope.minOrderQtyEntered = true;
        }
    };

    $scope.leadTimeChanged = function(val) {
        if (val) {
            $scope.leadTimeEntered = false;
        } else {
            $scope.leadTimeEntered = true;
        }
    };

    $scope.PTMinQtyChanged = function(val) {
        if (val) {
            $scope.isPTMinQtyEntered = false;
        } else {
            $scope.isPTMinQtyEntered = true;
        }
    };

    $scope.PTMaxQtyChanged = function(val) {
        if (val) {
            $scope.isPTMaxQtyEntered = false;
        } else {
            $scope.isPTMaxQtyEntered = true;
        }
    };

    $scope.PTPriceChanged = function(val) {
        if (val) {
            $scope.isPTPriceEntered = false;
        } else {
            $scope.isPTPriceEntered = true;
        }
    };


    //===================== add bulk vendor tab action ========== //

    $scope.singleVendorTabMode = function() {
        $scope.singleVendorTab = true;
        $scope.bulkVendorTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkVendorTabMode = function() {
        $scope.singleVendorTab = false;
        $scope.bulkVendorTab = true;
    }

    //====================== ends here ============================== //



    $scope.saveVendorSkuMap = function() {

        if (!$scope.skuSelected) {
            $scope.notify("Please select a Product");
            $scope.isProductSelected = true;
        } else if (!$scope.skuSelected.originalObject) {
            $scope.notify("Please select a Product");
            $scope.isProductSelected = true;
        }
        // else if (!$scope.vendorSkuData.tableVendorSystemSkuMapVendorSkuCode) {
        //     $scope.notify("Please enter the Vendor SKU Code");
        //     $scope.vendorSkuCodeEntered = true;
        // }
        // else if (!$scope.vendorSkuData.tableVendorSystemSkuMapMinOrderQty) {
        //     $scope.notify("Please enter the Minimum Order Quantity");
        //     $scope.minOrderQtyEntered = true;
        // }
        // else if (!$scope.vendorSkuData.tableVendorSystemSkuMapLeadTime) {
        //     $scope.notify("Please enter the Lead Time (In Days)");
        //     $scope.leadTimeEntered = true;
        // }
        else {

            if ($scope.vendorSkuMapMode == "add") {
                var data = $scope.vendorSkuData;
                data.tableSku = $scope.skuSelected.originalObject;
                $scope.oqmses = [];
                console.log($scope.selectedList);
                for (var i = 0; i < $scope.selectedList.length; i++) {
                    $scope.oqmses.push({
                        'tableSkuUoqmConfig': $scope.selectedList[i].oqmData
                    });
                }
                data.tableVendorSkuPricingTierses = $scope.pricingTiers;
                data.tableVendorSkuUoqmses = $scope.oqmses;
                console.log(data);
                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + $scope.vendorId + '/skumap',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(res) {
                    console.log(res);
                    if (res != null)
                    {
                        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                        $scope.notify("New Vendor Sku Map Added Successfully",'success');
                        $scope.vendorSkuMapMode = "add";
                        $scope.callVendorSkuMapRepeatData($scope.vendorId);
                        $scope.cancelCleanData();
                    }
                }).error(function(error, status) {
                    $scope.notify(error.errorMessage);
                });
            } else if ($scope.vendorSkuMapMode == "edit") {
                $scope.updateVendorSkuMap();
            }
        }
    };

    $scope.updateVendorSkuMap = function() {
        var data = $scope.vendorSkuData;
        data.tableSku = $scope.skuSelected.originalObject;
        $scope.oqmses = [];
        console.log($scope.selectedList);
        for (var i = 0; i < $scope.selectedList.length; i++) {
            $scope.oqmses.push({
                'tableSkuUoqmConfig': $scope.selectedList[i].oqmData
            });
        }
        data.tableVendorSkuPricingTierses = $scope.pricingTiers;
        data.tableVendorSkuUoqmses = $scope.oqmses;
        console.log(data);
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/' + $scope.vendorId + '/skumap/' + data.idtableVendorSystemSkuMapId,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res != null)
            {
                $scope.$broadcast('angucomplete-alt:clearInput', 'products');
                $scope.notify("Vendor Sku Updated Successfully",'success');
                $scope.vendorSkuMapMode = "add";
                $scope.callVendorSkuMapRepeatData($scope.vendorId);
                $scope.cancelCleanData();
            }
        });
    };

    $scope.showResult = function(result) {
        console.log(result);
        // $scope.searchLocation = null;
        if(result!=undefined)
        {
            $scope.searchLocation = {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
            }
            console.log($scope.searchLocation);
        }
        return true;
    };

    $scope.getLatitudeLongitude = function(callback) {
        var q = $q.defer();
        var address = "";
        if ($scope.vendorAddress) {
            if ($scope.vendorAddress.adLine1) {
                address = address + $scope.vendorAddress.adLine1;
            }
            if ($scope.vendorAddress.adLine2) {
                if (address != "") {
                    address = address + ", " + $scope.vendorAddress.adLine2;
                } else {
                    address = $scope.vendorAddress.adLine2;
                }
            }
            if ($scope.vendorAddress.adLine3) {
                if (address != "") {
                    address = address + ", " + $scope.vendorAddress.adLine3;
                } else {
                    address = $scope.vendorAddress.adLine3;
                }
            }
            if ($scope.cityVal && !$scope.vendorAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.cityVal;
                } else {
                    address = $scope.cityVal;
                }
            }
            if ($scope.district && (!$scope.cityVal && !$scope.vendorAddress.pincode)) {
                if (address != "") {
                    address = address + ", " + $scope.district;
                } else {
                    address = $scope.district;
                }
            }
            if ($scope.state && !$scope.vendorAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.state;
                } else {
                    address = $scope.state;
                }
            }
            if ($scope.vendorAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.vendorAddress.pincode;
                } else {
                    address = $scope.vendorAddress.pincode;
                }
            }
        }

        console.log(address);
        if (address != "") {
            // Initialize the Geocoder
            geocoder = new google.maps.Geocoder();
            console.log(geocoder);
            if (geocoder) {
                geocoder.geocode({
                    'address': address.toString()
                }, function(results, status) {
                    console.log(status);
                    console.log(results);
                    if (status == google.maps.GeocoderStatus.OK) {
                        q.resolve(callback(results[0]));
                    } else {
                        q.resolve(callback(results[0]));
                        // $scope.notify("Exact location cannot be fetched from the entered address")
                    }
                });
            }
        }
        return q.promise;
    };

    $scope.callGetLatLong = function() {
        $scope.getLatitudeLongitude($scope.showResult).then(
            function(v) {},
            function(err) {}
        );
    };

    $scope.tableSorting = function(sortType, sortReverse) {
        console.log(sortType);
        console.log(sortReverse);
        $scope.sortType = sortType;
        console.log($scope.directionType);
        if (sortReverse == true) {
            $scope.directionType = 'desc';
        }
        if (sortReverse == false) {
            $scope.directionType = 'asc';
        }
        console.log($scope.directionType);
        $scope.sortReverse = !sortReverse;

        if ($scope.modeVendor == "normal") {
            var page = undefined;
            $scope.listOfVendorsCount(page);
        }
        if ($scope.modeVendor == "mutual") {
            var page = undefined;
            $scope.listOfMutualVendorsCount(page);
        }
        if ($scope.modeVendor == "skumap") {
            var page = undefined;
            $scope.listOfSkuMapVendorsCount(page);
        }

    }

    //Number Validation not allowing -,+,e,.
    $scope.Num1 = function(event) {
        var keys = {
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57
        };
        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    };


    $scope.VendorTemplateDownload = function(){
        console.log('test')
        $http({
            method: 'GET',
            url: $scope.downloadVendorsTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'

        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Vendor_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function(data){
            console.log(data);
        });
    };
    $scope.cancelVendorBulkUpload = function (form) {
        $scope.uploadedFile = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#vendorsBulkUpload').modal('hide');
    }
    $scope.disableBulkUpload = false;
    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile,form) {
       $scope.notify("Upload is being processed in the background",'info');
        file = bulkOrderUploadfile;
        $scope.disableBulkUpload = true;
        if (file) {
            if (!file.$error) {
                var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/vendorbulkupload';

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
                    if ($scope.modeVendor == "normal") {
                        var page = undefined;
                        $scope.listOfVendorsCount(page);
                    }
                    if ($scope.modeVendor == "mutual") {
                        var page = undefined;
                        $scope.listOfMutualVendorsCount(page);
                    }
                    if ($scope.modeVendor == "skumap") {
                        var page = undefined;
                        $scope.listOfSkuMapVendorsCount(page);
                    }
                    $cookies.put('BulkUploadData','vendor');
                    $cookies.put('ActiveTab','vendor');
                    $scope.uploadedFile = {};
                    $scope.cancelVendorBulkUpload(form);
                   $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                    $scope.disableBulkUpload = false;
                }, function(resp) {
                    console.log(resp);
                    $scope.uploadedFile = {};
                    $scope.cancelVendorBulkUpload(form);
                    $scope.notify(resp.data.errorMessage);
                    $scope.disableBulkUpload = false;
                }, function(evt) {
                    // progress notify
                });
            }
        }
    };

    $scope.closeBulkUploadDialog = function(){
        $cookies.put('BulkUploadData','vendor');
        $cookies.put('ActiveTab','vendor');
        $mdDialog.hide();
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }

    $scope.shipAddrClickedRow = function() {
        $scope.shipAddrClicked = !$scope.shipAddrClicked;
    };

    var skuStart=0,size=10;
    $scope.skuLoadBusy = false;
    $scope.stopSkuLoad = false;
    $scope.skuPagingFunction = function () {
        if($scope.stopSkuLoad){
            return;
        }
        $scope.skuLoadBusy = true;
        mastersService.fetchOnlySkusNext(MavenAppConfig.baseUrlSource,skuStart,size,function(data){
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

	$scope.masterSkuDialog = function(ev, check) {
        $scope.genericData.check = check;
        $scope.genericData.skusListFiltered = [];
		mastersService.fetchOnlySkus(MavenAppConfig.baseUrlSource,function(data) {
			$scope.genericData.skusListFiltered = data;
			// $timeout(function() {
			$("#dialogmastersku").modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
			// }, 200);
		});




	}
	
	$scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
		$http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
        console.log(data);
            $scope.genericData.productObject = {};
                if ($scope.genericData.check == false) {
                    $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
                } else {
                    $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
                    // $scope.productObject(data);
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

    $scope.showAddVendorModalWithValues = function(ev)
    {
        $scope.disableSaveButton = false;
        $('#addNewVendorDialog').modal('show');
    }

	
	$scope.showVendorHistory = function(ev, vendorCode){
		
		$scope.genericData.vendorCodeForDialogue = vendorCode;
		
		$http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/poforvendor/'+$scope.genericData.vendorCodeForDialogue).success(function(data) {
            console.log(data);            
            $scope.genericData.poList = data;
            $scope.genericData.poLength = data.length;
            
            $scope.dayDataCollapse1 = [];

            for (var i = 0; i < $scope.genericData.poLength; i += 1) {
                $scope.dayDataCollapse1.push(false);
            }
            
            
            console.log(data);   
        }).error(function(error, status) {
            $scope.notify("There is some issue.");

        });;
		
        $timeout(function() {
      	$mdDialog.show({
				templateUrl : 'vendorPoDialog.tmpl.html',
				parent : angular.element(document.body),
				targetEvent : ev,
				clickOutsideToClose : false,
				scope : $scope.$new()
			});
		}, 500);
		
	}
	
	$scope.dayDataCollapseFn1 = function() {
        $scope.dayDataCollapse1 = [];

        for (var i = 0; i < $scope.genericData.poLength; i += 1) {
            $scope.dayDataCollapse1.push(false);
        }
    };
	
	$scope.cancelpoDialog = function(){
		$mdDialog.hide({
			templateUrl : 'vendorPoDialog.tmpl.html'
		});
	}
	
	$scope.totalQuantity = function(allSkus){
        var total = 0;
        for (var i = 0; i < allSkus.length; i++) {
            var quantity = allSkus[i].tablePurchaseOrderSkusSkuQuantity;
            total += quantity;
        }
        return total;
    }
	
	$scope.getTotal = function(tableSkuData) {

        var total = 0;
        for (var i = 0; i < tableSkuData.tablePurchaseOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tablePurchaseOrderSkusChargeses[i].tablePurchaseOrderSkusChargesValue;
            total += product;
        }
        return total;
    };
    
    $scope.totalCostPerProduct = function(tableSkuData) {
        // console.log(tableSkuData.tablePurchaseOrderSkusChargeses.length);
        var total = 0;
        var totalCost = 0;
        for (var i = 0; i < tableSkuData.tablePurchaseOrderSkusChargeses.length; i++) {
            var product = tableSkuData.tablePurchaseOrderSkusChargeses[i].tablePurchaseOrderSkusChargesValue;
            total += product;
        }

        var totalCost = total * tableSkuData.tablePurchaseOrderSkusSkuQuantity;

        return totalCost;
    }
    
	$scope.totalCostAmount = function(allSkus) {
        var total = 0;
        var totalCost = 0;
        var totalCostAmount = 0;
        var totalCostAll = [];
        for (var i = 0; i < allSkus.length; i++) {
            //console.log(allSkus[i]);
            for (var j = 0; j < allSkus[i].tablePurchaseOrderSkusChargeses.length; j++) {
                var product = allSkus[i].tablePurchaseOrderSkusChargeses[j].tablePurchaseOrderSkusChargesValue;
                total += product;
            }
            totalCostAmount += total * allSkus[i].tablePurchaseOrderSkusSkuQuantity;
            totalCostAll.push(totalCostAmount);
            total = 0;
        }
        return totalCostAmount;
    };
    
    $scope.selectTableRow1 = function(index, storeId) {

        console.log(index);
        console.log(storeId);
        if (typeof $scope.dayDataCollapse1 === 'undefined') {
            $scope.dayDataCollapseFn1();
        }

        if ($scope.tableRowExpanded1 === false && $scope.tableRowIndexExpandedCurr1 === "" && $scope.storeIdExpanded1 === "") {
            $scope.tableRowIndexExpandedPrev1 = "";
            $scope.tableRowExpanded1 = true;
            $scope.tableRowIndexExpandedCurr1 = index;
            $scope.storeIdExpanded1 = storeId;
            $scope.dayDataCollapse1[index] = true;
        } else if ($scope.tableRowExpanded1 === true) {
            if ($scope.tableRowIndexExpandedCurr1 === index && $scope.storeIdExpanded1 === storeId) {
                $scope.tableRowExpanded1 = false;
                $scope.tableRowIndexExpandedCurr1 = "";
                $scope.storeIdExpanded1 = "";
                $scope.dayDataCollapse1[index] = false;
            } else {
                $scope.tableRowIndexExpandedPrev1 = $scope.tableRowIndexExpandedCurr1;
                $scope.tableRowIndexExpandedCurr1 = index;
                $scope.storeIdExpanded1 = storeId;
                $scope.dayDataCollapse1[$scope.tableRowIndexExpandedPrev1] = false;
                $scope.dayDataCollapse1[$scope.tableRowIndexExpandedCurr1] = true;
            }
        }

    };

    $scope.stateTrials = function(saleordskus) {
        console.log(saleordskus);
        console.log(saleordskus.length);
        $scope.trialsDataArray = [];
        $scope.trialIdArray = [];
        $scope.trialsLength = [];
        $scope.fullTrialsArray = [];
        $scope.fullIdArray = [];
        $scope.StateArray = [];
        for (var i = 0; i < saleordskus.length; i++) {
            console.log(i);
            console.log(saleordskus[i]);
            $scope.StateArray.push(saleordskus[i].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
            console.log($scope.StateArray);
            console.log(saleordskus[i]);
            var trials = saleordskus[i].tablePurchaseOrderSkuStateTrails;
            $scope.trialsLength.push(trials.length);
            console.log(trials);
            console.log($scope.trialsLength);
            if (trials.length < 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }

            if (trials.length == 4) {
                for (var j = 0; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }

            if (trials.length > 4) {
                console.log(trials.length - 4);
                var totalLength = trials.length - 4;
                for (var j = totalLength; j < trials.length; j++) {
                    console.log(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialsDataArray.push(trials[j].tablePurchaseOrderSkuStateType.tablePurchaseOrderSkuStateTypeString);
                    $scope.trialIdArray.push(trials[j].tablePurchaseOrderSkuStateType.idtablePurchaseOrderSkuStateTypeId);
                }
            }


            $scope.fullTrialsArray.push($scope.trialsDataArray);
            $scope.fullIdArray.push($scope.trialIdArray);

            $scope.trialsDataArray = [];
            $scope.trialIdArray = [];

            //console.log($scope.fullTrialsArray);
        }
    }
    $scope.changeReturnType = function(){
        if($scope.genericData.returnType == 'quantitybased')
        {
            $scope.vendorsData.tableVendorReturnValuePercentage = null;
        }
        if($scope.genericData.returnType == 'valuebased')
        {
            $scope.vendorsData.tableVendorReturnQuantity = null;
        }

    }

    $scope.checkNumber = checkNumber;

    $scope.getGstTypes = function()
    {
        $scope.gstTypes = [];
        var gstTypesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/gsttypes";
        $http.get(gstTypesUrl).success(function(data)
        {
            $scope.gstTypes = data;
        }).error(function(error, status)
        {
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else{
                $scope.notify("Failed to get GST Types");
            }
        });
    }

    $scope.getGstTypes();

    $scope.onStateChanged = function () {
        if($scope.vendorAddress.stateData && $scope.vendorAddress.stateData.tableStateCode){
            $scope.vendorAddress.tinNoPlaceholder = $scope.vendorAddress.stateData.tableStateCode;
        }
    }

    $scope.$on('$destroy', function () {
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });
	
}]);
