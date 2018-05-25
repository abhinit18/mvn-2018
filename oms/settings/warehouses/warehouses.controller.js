angular.module('OMSApp.warehouses', []).config(function config($stateProvider) {

    $stateProvider.state('/warehouses/', {
        name: '/warehouses/',
        url: '/warehouses/',
        views: {
            "main": {
                controller: 'warehousesController',
                templateUrl: 'settings/warehouses/warehouses.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'warehouses'}
    })

}).controller('warehousesController', ['$scope', '$http', '$location', '$timeout', 'MavenAppConfig', 'Upload', 'pagerService', '$q',

    function warehousesController($scope, $http, $location, $timeout, MavenAppConfig, Upload, pagerService, $q) {
        $scope.searchWarehousesClicked = false;
        $scope.isStateWarehouseSelected = false;
        $scope.isDistrictWarehouseSelected = false;
        $scope.isCityWarehouseSelected = false;
        $scope.selected = [];
        $scope.basicUrl = MavenAppConfig.baseUrlSource;
        $scope.formsUrl = MavenAppConfig.s3+MavenAppConfig.formsUrl;
        $scope.recordsPerPage = [5, 10, 15];
        $scope.start = 0;
        $scope.size = $scope.recordsPerPage[0];
        $scope.vatTinEntered = false;
        $scope.glVatTinEntered = false;
        $scope.glStateDataSelected = false;
        $scope.glWarehouseSelected = false;
        $scope.isstore = false;
        $scope.tableAddress = {};
        $scope.ownStateDataSelected = false;
        $scope.ownDistrictDataSelected = false;
        $scope.ownCityDataSelected = false;
        $scope.ownShortNameEntered = false;
        $scope.ownLongNameEntered = false;
        $scope.ownCPersonNameEntered = false;
        $scope.ownPersonEmailEntered = false;
        $scope.ownPersonPhoneEntered = false;
        $scope.ownAddrLine1Entered = false;
        $scope.ownPinCodeEntered = false;

        $scope.items = [];

        $scope.genericData = {};
        $scope.allStatesWithStatus = [];
        $scope.genericData.glwarehouseData = {};

        $scope.editwarehousestates = false;

        $scope.addOwnGlMode = "add";

        $scope.onLoad = function () {
            $scope.listOfWarehouses($scope.start);
            $scope.listOfWarehousesCount();
            $scope.getCountriesData().then(function(res){
                if(res) $scope.regionsStatesData();
            });
            $scope.glaucusStatesData();
            $scope.listOfGlaucusWarehouses();
            $scope.getClientProfile();
        };

        var regex = new RegExp("^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][0-9]Z[A-Z0-9]");


        $scope.getClientProfile = function () {
            var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles/1"
            $http.get(clientProfileUrl).success(function (data) {
                $scope.clientprofile = data;
            }).error(function (error, status) {
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Failed to get client profile")
                }
                console.log(error);

            });
        }
        $scope.showWarehouseModal = function ()
        {
            if($scope.clientprofile.tableClientProfileEnableInvoice != null && $scope.clientprofile.tableClientProfileEnableInvoice == true)
            {
                if($scope.clientprofile.tableGstType==null)
                {
                    $('#gotoClientProfile').modal('show');
                }
                else
                {
                    $('#addWarehouseModal').modal('show');
                }
            }
            else if($scope.clientprofile.tableClientProfileEnableInvoice == null || $scope.clientprofile.tableClientProfileEnableInvoice == false)
            {
                $('#addWarehouseModal').modal('show');
            }
        }
        $scope.redirectToClientProfile = function () {
            $('#gotoClientProfile').modal('hide');
            $timeout(function () {
                $location.path('/clientprofile/');
            }, 500);

        }
        $scope.warehouseAction = function (status, tableState, warehouseId) {
            if (status.toLowerCase() == "gstin not provided") {
                $scope.vatTinEntered = false;
                $scope.stateData = tableState;
                $scope.warehouseId = warehouseId;
                $scope.updateVatTinTableState = tableState;
                $("#vatTinDialog").modal("show");
            } else if (status.toLowerCase() == "apob registration pending") {
                $scope.warehouseId = warehouseId;
                $("#uploadAppDocModal").modal("show");
            } else if (status.toLowerCase() == "apob verification pending") {
                $("#apobVerificationPending").modal("show");
            }
        };

        $scope.checkEmptyValue = function () {
            if ($scope.genericData.tableClientStateWiseVatNo != undefined) {
                $scope.vatTinEntered = false;
            } else {
                $scope.vatTinEntered = true;
            }
        };

        $scope.validateGSTIN = function () {

            if (!$scope.genericData.tableClientStateWiseVatNo) {
                $scope.vatTinEntered = true;
                $scope.notify("GSTIN not entered", 'warning');
                return false;
            }

            var m = null;
            if ($scope.genericData.tableClientStateWiseVatNo != null && $scope.genericData.tableClientStateWiseVatNo.length > 0) {
                m = regex.exec($scope.genericData.tableClientStateWiseVatNo);
                if (m == null) {
                    $scope.notify("Provided GST doesn't seem to match the prescribed format");
                    return false;
                }
                else {
                    var stateCode = $scope.genericData.tableClientStateWiseVatNo.substr(0, 2);
                    if ($scope.stateData.tableStateCode != stateCode) {
                        $scope.notify("State code provided in GSTIN does not match the state code of selected state. Select the state again");
                        return false;
                    }
                }
            }
        }

        $scope.updateVatTinInfo = function () {

            var q = $q.defer();

            if($scope.clientprofile.tableClientProfileEnableInvoice!=null && $scope.clientprofile.tableClientProfileEnableInvoice == true) {
                if ($scope.clientprofile.tableGstType.idtableGstTypeId == 1 || $scope.clientprofile.tableGstType.idtableGstTypeId == 4) {
                    q.resolve(true);
                }
                else {
                    var vatPostData = {};
                    vatPostData.tableClientStateWiseVatNo = $scope.genericData.tableClientStateWiseVatNo;
                    vatPostData.tableState = $scope.stateData;

                    $http({
                        method: "POST",
                        url: MavenAppConfig.baseUrlSource + "/omsservices/webapi/vat/" + $scope.stateData.idtableStateId,
                        data: vatPostData,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (res) {
                        console.log(res);
                        q.resolve(true);
                        if (res) {
                            if ($scope.apobDocs) {
                                if (!$scope.apobDocs.$error) {
                                    var uploadUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clients/docs/uploadapob?warehouseid=" + $scope.warehouseId;

                                    var fd = new FormData();
                                    fd.append("uploadFile", $scope.apobDocs);
                                    var upload = Upload.http({
                                        url: uploadUrl,
                                        method: "POST",
                                        data: fd,
                                        headers: {
                                            "Content-Type": undefined
                                        }
                                    });
                                    upload.then(function (resp) {
                                        $scope.notify("APOB document updated successfully"), 'success';
                                        $scope.clearWareHouseData();
                                        $scope.listOfWarehouses(0);
                                    }, function (resp) {
                                        $scope.notify("Error in uploading APOB document");
                                    }, function (evt) {
                                        console.log("progress: " + parseInt(100.0 * evt.loaded / evt.total) + "% file :" + file.name);
                                    });
                                }
                            }
                            else {
                                $scope.notify("GSTIN updated successfully", 'success');
                                $scope.clearWareHouseData();
                                $scope.listOfWarehouses(0);
                            }

                        }
                    }).error(function (error, status) {
                        q.resolve(false);
                        console.log(error);
                        if (status == 400) {
                            $scope.notify(error.errorMessage);
                        } else {
                            $scope.notify("GSTIN No cannot be added");
                        }
                    });
                }
            }
            else
            {
                if ($scope.apobDocs) {
                    if (!$scope.apobDocs.$error) {
                        var uploadUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clients/docs/uploadapob?warehouseid=" + $scope.warehouseId;

                        var fd = new FormData();
                        fd.append("uploadFile", $scope.apobDocs);
                        var upload = Upload.http({
                            url: uploadUrl,
                            method: "POST",
                            data: fd,
                            headers: {
                                "Content-Type": undefined
                            }
                        });
                        upload.then(function (resp) {
                            $scope.notify("APOB document updated successfully", 'success');
                            $scope.clearWareHouseData();
                            $scope.listOfWarehouses(0);
                            q.resolve(true);
                        }, function (resp) {
                            $scope.notify("Error in uploading APOB document");
                            q.resolve(false);
                        }, function (evt) {
                            console.log("progress: " + parseInt(100.0 * evt.loaded / evt.total) + "% file :" + file.name);
                        });
                    }
                }
            }


            return q.promise;
        };

        $scope.warehouseSelected = function (glwarehouseData) {
            if (glwarehouseData) {
                $scope.isWarehouseSelected = true;
                $scope.glWarehouseSelected = false;
            } else {
                $scope.glWarehouseSelected = true;
            }
        };

        $scope.toggleSearchRow = function () {
            console.log($scope.searchWarehousesClicked);
            $scope.searchWarehousesClicked = !$scope.searchWarehousesClicked;
        }

        // fetching list of warehouses from RestAPI OMS
        $scope.listOfWarehouses = function (start) {
            var wareHouseListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses";
            wareHouseListUrl += "?start=" + start + '&size=' + $scope.size + '&direction=desc';
            $http.get(wareHouseListUrl).success(function (data) {
                $scope.wareHouseLists = data;
                $scope.end = $scope.start + data.length;
                console.log(data);
                $scope.dayDataCollapse = [];

                for (var i = 0; i < $scope.wareHouseLists.length; i += 1) {
                    $scope.dayDataCollapse.push(false);
                }
                $scope.showLoader = false;
            }).error(function (error, status) {
                $scope.showLoader = false;

                if (error.errorCode == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("There is some error in getting list of warehouses");
                }

            });
        }
        $scope.onRecordsPerPageChange = function (orderSize) {
            $scope.start = 0;
            $scope.size = orderSize;
            $scope.end = 0;
            $scope.wareHouseLists = [];
            $scope.listOfWarehousesCount(1);
        }

        $scope.listOfWarehousesCount = function (page) {
            console.log(page);
            var warehousesCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses/count";
            $http.get(warehousesCountUrl).success(function (data) {
                $scope.warehousesCount = data;
                console.log($scope.warehousesCount);
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page, $scope.size);
                    console.log(vm.pager);
                    $scope.vmPager = vm.pager;

                    $scope.start = (vm.pager.currentPage - 1) * $scope.size;
                    console.log($scope.start);
                    console.log($scope.size);
                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.listOfWarehouses($scope.start);
                }

                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.warehousesCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;
                    $scope.wareHouseLists = [];
                    $scope.showLoader = true;
                    if (page == undefined) {
                        vm.setPage(1);
                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }


                }
            }).error(function (error, status) {
                console.log(error);

            });
        }

        //fetching list of mutual vendors from mutually exlusive search string vendor
        $scope.listOfMutualWarehouses = function (start) {
            var warehouseListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses/search?search=" + $scope.wordSearch;
            warehouseListUrl += "&start=" + start + "&size=" + $scope.size;
            console.log(vendorsListUrl);
            $http.get(vendorsListUrl).success(function (data) {
                console.log(data);
                $scope.vendorsLists = data;
                $scope.dayDataCollapse = [];

                for (var i = 0; i < $scope.vendorsLists.length; i += 1) {
                    $scope.dayDataCollapse.push(false);
                }
            }).error(function (error, status) {
                console.log(error);

            });
        }

        //fetching list of mutual vendors count
        $scope.listOfMutualWarehousesCount = function (page) {
            var vendorCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses/searchcount?search=" + $scope.wordSearch;
            console.log(vendorCountUrl);
            $http.get(vendorCountUrl).success(function (data) {
                $scope.vendorCount = data;
                if (data != null) {
                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.vendorCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;

                    if (page == undefined) {
                        initController();

                        function initController() {
                            // initialize to page 1
                            vm.setPage(1);
                        }
                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }

                    function setPage(page) {
                        if (page < 1 || page > vm.pager.totalPages) {
                            return;
                        }

                        // get pager object from service
                        vm.pager = pagerService.GetPager(vm.dummyItems.length, page);
                        console.log(vm.pager);
                        $scope.vmPager = vm.pager;

                        $scope.vendorstart = (vm.pager.currentPage - 1) * 5;
                        $scope.vendorsize = $scope.vendorstart + 5;
                        console.log($scope.vendorstart);
                        console.log($scope.vendorSize);
                        // get current page of items
                        vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                        $scope.vmItems = vm.items;
                        $scope.listOfMutualWarehouses($scope.vendorstart);
                    }
                }
            }).error(function (error, status) {
                console.log(error);

            });
        }


        $scope.tableRowExpanded = false;
        $scope.tableRowIndexExpandedCurr = "";
        $scope.tableRowIndexExpandedPrev = "";
        $scope.storeIdExpanded = "";

        $scope.dayDataCollapseFn = function () {
            $scope.dayDataCollapse = [];

            for (var i = 0; i < $scope.orderLists.length; i += 1) {
                $scope.dayDataCollapse.push(false);
            }
        };

        $scope.selectTableRow = function (index, storeId) {
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

        $scope.selectedStates = function (warehousesId) {
            var q = $q.defer();
            console.log(warehousesId);
            $scope.warehouseStatesById = [];
            var warehouseStateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + warehousesId + '/states';
            $http.get(warehouseStateUrl).success(function (data) {
                if (data) {
                    $scope.warehouseStatesById = data;
                    $scope.nonwarehouseStatesById = [];

                    var nonwarehouseStateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + warehousesId + '/states/remaining';
                    $http.get(nonwarehouseStateUrl).success(function (data) {
                        if (data) {
                            $scope.nonwarehouseStatesById = data;

                            $scope.items = [];

                            $scope.items = $scope.warehouseStatesById;
                            var stateCounter = 0;
                            for (stateCounter = 0; stateCounter < $scope.items.length; stateCounter++) {
                                $scope.items[stateCounter].checked = true;
                            }

                            for (var stateCounter1 = 0; stateCounter1 < $scope.nonwarehouseStatesById.length; stateCounter1++) {
                                $scope.items[stateCounter + stateCounter1] = $scope.nonwarehouseStatesById[stateCounter1];
                                $scope.items[stateCounter + stateCounter1].checked = false;
                            }
                            q.resolve();
                        }
                    }).error(function (error, status) {
                        console.log(error);
                        q.reject();

                    });
                }
            }).error(function (error, status) {
                console.log(error);
                q.reject();

            });

            return q.promise;

        }

        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };

        //add states
        $scope.addAllStates = function (selectedStatesData, warehousesId) {
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + warehousesId + '/states/all',
                data : '',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res) {
                if (res) {
                    console.log(res)
                    $scope.selectedStates(warehousesId);
                    $scope.selected = [];
                }
            }).error(function (error, status) {
                console.log(error);

            });

        };

        $scope.onCheckBoxStateChanged = function (selectedState, warehousesId) {
            $scope.editwarehousestates = true;
            $scope.genericData.requestInprogress = true;
            if (selectedState.checked == true) {
                $scope.addState(selectedState, warehousesId).then(function () {
                    $scope.genericData.requestInprogress = false;
                    $scope.editwarehousestates = false;
                });
            }
            else {
                $scope.deleteStatesForWarehouses(warehousesId, selectedState.idtableStateId).then(function () {
                    $scope.genericData.requestInprogress = false;
                    $scope.editwarehousestates = false;
                });
            }

        }
        //add states
        $scope.addState = function (selectedState, warehousesId) {

            var q = $q.defer();
            console.log($scope.selected);

            selectedStateCopy = angular.copy(selectedState);

            delete selectedStateCopy.checked;

            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + warehousesId + '/states',
                data: selectedStateCopy,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res) {
                if (res) {
                    console.log(res)
                    $scope.selectedStates(warehousesId).then(function () {
                        q.resolve(true);
                    });
                    $scope.selected = [];
                }
            }).error(function (error, status) {
                console.log(error);
                q.reject();

            });

            return q.promise;

        };

        // fetching list of glaucus warehouses
        $scope.listOfGlaucusWarehouses = function () {
            var glwareHouseListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/glwarehouses";
            // glwareHouseListUrl += "?start=" + $scope.start + '&size=5&sort=idtableVendorId&direction=desc';
            $http.get(glwareHouseListUrl).success(function (data) {
                $scope.glwareHouseLists = data;
            }).error(function (error, status) {
                console.log(error);

            });
        };

        //Regions Data from region generic API
        $scope.regionsStatesData = function () {
            var q = $q.defer();
            $scope.regionsStatesArray = [];
            var regionsStatesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+$scope.countryData.idtableCountryId+"/states";
            $http.get(regionsStatesUrl).success(function (data) {
                for (var i = 0; i < data.length; i++) {
                    $scope.regionsStatesArray.push(data[i]);
                }
                q.resolve(true);
                console.log($scope.regionsStatesArray);
            }).error(function (error, status) {
                console.log(error);
                q.reject(error);

            });
            return q.promise;
        };

        $scope.countryChanged = function (countryId) {
            $scope.regionsStatesArray = [];
            var regionsStatesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+countryId+"/states";
            $http.get(regionsStatesUrl).success(function (data) {
                $scope.regionsStatesArray = data;
            }).error(function (error, status) {
                console.log(error);
            });
        };

        $scope.getCountriesData = function () {
            var q = $q.defer();
            $scope.countriesArray = [];
            var regionsStatesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries";
            $http.get(regionsStatesUrl).success(function (data) {
                $scope.countriesArray = data;
                $scope.countryData = data[0];
                q.resolve(true);
            }).error(function (error, status) {
                console.log(error);
                q.reject(error);
            });
            return q.promise;
        };

        $scope.glaucusStatesData = function () {
            var q = $q.defer();
            $scope.glaucusStatesArray = [];
            var glaucusStatesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/glwarehouses/warehousestates";
            $http.get(glaucusStatesUrl).success(function (data) {

                $scope.glaucusStatesArray = data;

                q.resolve(true);
                console.log($scope.glaucusStatesArray);
            }).error(function (error, status) {
                console.log(error);
                q.reject(error);

            });
            return q.promise;
        };


        //Regions Data from region states generic API
        $scope.regionsStatesDistrictData = function (stateData) {
            var q = $q.defer();
            if (stateData) {
                console.log(stateData);
                $scope.stateId = stateData.idtableStateId;
                $scope.regionsStatesDistrictArray = [];
                var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+$scope.countryData.idtableCountryId+"/states/" + stateData.idtableStateId + "/districts";
                $http.get(regionsStatesDistrictUrl).success(function (data) {
                    if (data != null) {
                        for (var i = 0; i < data.length; i++) {
                            $scope.regionsStatesDistrictArray.push(data[i]);
                            $scope.state = data[i].tableState.tableStateLongName;
                        }
                        console.log($scope.regionsStatesDistrictArray);
                        console.log($scope.districtData);
                        $scope.isStateWarehouseSelected = true;
                        $scope.ownStateDataSelected = false;
                        q.resolve(true);
                    }
                }).error(function (error, status) {
                    console.log(error);

                });
            } else {
                $scope.isStateWarehouseSelected = false;
                $scope.isOwnStateWarehouseSelected = true;
            }
            return q.promise;
        };

        //Regions Data from region states distict generic API
        $scope.regionsStatesDistrictsCityData = function (stateData, districtData) {
            var q = $q.defer();
            if (stateData && districtData) {
                console.log(districtData);
                $scope.regionsStatesDistrictsCityArray = [];
                $scope.districtId = districtData.idtableDistrictId;
                var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/"+$scope.countryData.idtableCountryId+"/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
                $http.get(regionsStatesDistrictsCityUrl).success(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        $scope.regionsStatesDistrictsCityArray.push(data[i]);
                        $scope.district = data[i].tableDistrict.tableDistrictLongName;
                    }
                    console.log($scope.regionsStatesDistrictsCityArray);
                    $scope.isDistrictWarehouseSelected = true;
                    $scope.ownDistrictDataSelected = false;
                    q.resolve(true);
                }).error(function (error, status) {
                    console.log(error);

                });
            } else {
                $scope.isDistrictWarehouseSelected = false;
                $scope.ownDistrictDataSelected = true;
            }
            return q.promise;
        };

        $scope.changeCity = function (city) {
            if (city) {
                var cityM = city;
                console.log(cityM);
                $scope.cityVal = cityM;
                $scope.isCityWarehouseSelected = true;
                $scope.ownCityDataSelected = false;
            } else {
                $scope.isCityWarehouseSelected = false;
                $scope.ownCityDataSelected = true;
            }
        };

        $scope.getVatTin = function (stateData)
        {
            if($scope.clientprofile.tableClientProfileEnableInvoice!=null && $scope.clientprofile.tableClientProfileEnableInvoice == true) {
                if ($scope.clientprofile.tableGstType.idtableGstTypeId != 1 && $scope.clientprofile.tableGstType.idtableGstTypeId != 4) { //If NOT "Non Registered"
                    $scope.glWarehouseSelected = false;
                    if (stateData) {
                        console.log(stateData);
                        $scope.genericData.tableClientStateWiseVatNo = "";
                        var vatTinUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vat/" + stateData.idtableStateId;
                        $http.get(vatTinUrl).success(function (data) {
                            $scope.vatTinData = data;
                            $scope.genericData.tableClientStateWiseVatNo = $scope.vatTinData.tableClientStateWiseVatNo;
                            if ($scope.genericData.tableClientStateWiseVatNo == null) {
                                $scope.onStateChanged();
                            }
                            $scope.glStateDataSelected = false;
                            console.log(data);
                        }).error(function (error, status) {
                            console.log(error);

                        });
                    } else {
                        $scope.vatTinData = undefined;
                        $scope.glStateDataSelected = true;
                    }
                }
            }
        }

        $scope.getStateWiseWarehouses = function (stateData) {
            if (stateData) {
                console.log(stateData);
                var stateWiseWarehouseUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/glwarehouses/states/" + stateData.idtableStateId;
                $http.get(stateWiseWarehouseUrl).success(function (data) {
                    console.log(data);
                    $scope.stateWareHouses = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].tableWarehouseType.idtableWarehouseTypeId == 1) {
                            $scope.stateWareHouses.push(data[i])
                        }
                    }
                    $scope.isStateWarehouseSelected = true;
                }).error(function (error, status) {
                    console.log(error);

                });
            } else {
                $scope.isStateWarehouseSelected = false;
            }
        }

        $scope.isValidApobDocs = function () {
            if ($scope.apobDocs) {
                if ($scope.apobDocs.name) {
                    $scope.glApobDocsSelected = false;
                }
            }
        };

        $scope.addGlaucusWarehouse = function (form) {
            $scope.addButtonDisabled = true;
            var canSubmit = false;
            if (!$scope.stateData) {
                $scope.notify("Please select a state!");
                $scope.glStateDataSelected = false;
                $scope.addButtonDisabled = false;
                return;
            }
            if (!$scope.genericData.glwarehouseData) {
                $scope.notify("Please select a warehouse!");
                $scope.glWarehouseSelected = false;
                $scope.addButtonDisabled = false;
                return;
            }
            if($scope.clientprofile.tableClientProfileEnableInvoice!=null && $scope.clientprofile.tableClientProfileEnableInvoice == true)
            {
                if ($scope.clientprofile.tableGstType.idtableGstTypeId != 1 && $scope.clientprofile.tableGstType.idtableGstTypeId != 4) { //If NOT "Non Registered"
                    if ((!$scope.vatTinData || $scope.vatTinData == "") && (!$scope.genericData.tableClientStateWiseVatNo || $scope.genericData.tableClientStateWiseVatNo == "")) {
                        $scope.notify("Please enter the GSTIN No.");
                        $scope.glVatTinEntered = false;
                        $scope.addButtonDisabled = false;
                        return;
                    }
                    else {
                        if ($scope.validateGSTIN() == false) {
                            $scope.addButtonDisabled = false;
                            return false;
                        }
                    }
                }
                if (!$scope.vatTinData)
                {
                    var vatTinNo = $scope.genericData.tableClientStateWiseVatNo;
                }
                else
                {
                    var vatTinNo = $scope.vatTinData.tableClientStateWiseVatNo;
                }
            }


            if ($scope.apobDocs != undefined) {
                var file = $scope.apobDocs;
            }

            if($scope.clientprofile.tableClientProfileEnableInvoice!=null && $scope.clientprofile.tableClientProfileEnableInvoice == true && $scope.clientprofile.tableGstType.idtableGstTypeId != 1 && $scope.clientprofile.tableGstType.idtableGstTypeId != 4) {

                    if (vatTinNo != "") {
                        var vatPostData =
                            {
                                "idtableClientStateWiseVatId": 1,
                                "tableClientStateWiseVatNo": vatTinNo,
                                "tableClientStateWiseVatCreatedOn": null,
                                "tableState": $scope.stateData

                            };

                        $http({
                            method: "POST",
                            url: MavenAppConfig.baseUrlSource + "/omsservices/webapi/vat/" + $scope.stateData.idtableStateId,
                            data: vatPostData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function (res) {
                            var postGlaucusWarehouseData = $scope.genericData.glwarehouseData;
                            $http({
                                method: 'POST',
                                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses',
                                data: postGlaucusWarehouseData,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).success(function (res) {
                                console.log(res);
                                if ($scope.apobOrNot) {
                                    if ($scope.apobOrNot == "apob") {
                                        if (file) {
                                            if (!file.$error) {
                                                console.log('file is ');
                                                console.dir(file);
                                                var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/clients/docs/uploadapob?warehouseid=' + res.tableWarehouseDetails.idtableWarehouseDetailsId;

                                                var fd = new FormData();
                                                fd.append('uploadFile', file);
                                                console.log(uploadUrl);
                                                console.log('uploadFile' + file);
                                                console.log('fd' + fd);
                                                var upload = Upload.http({
                                                    url: uploadUrl,
                                                    method: 'POST',
                                                    data: fd,
                                                    headers: {
                                                        'Content-Type': undefined
                                                    }
                                                });
                                                upload.then(function (resp) {
                                                    $scope.notify("Glaucus Warehouse Added Successfully", 'success');
                                                    $scope.clearWareHouseData(form);
                                                    $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                                                }, function (resp) {
                                                    $scope.notify("Error in Uploading APOB doc");
                                                    $scope.clearWareHouseData(form);
                                                }, function (evt) {
                                                    // progress notify
                                                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                                                });
                                            }
                                        }
                                        else {
                                            $scope.notify("Glaucus warehouse added successfully", 'success');
                                            $('#addGlaucusWarehouseModal').modal('hide');
                                            $scope.clearWareHouseData(form);
                                            $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                                        }
                                    }
                                    else {
                                        $scope.notify("Glaucus warehouse added successfully", 'success');
                                        $('#addGlaucusWarehouseModal').modal('hide');
                                        $scope.clearWareHouseData(form);
                                        $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                                    }
                                }
                                else {
                                    $scope.notify("Glaucus warehouse added successfully", 'success');
                                    $('#addGlaucusWarehouseModal').modal('hide');
                                    $scope.clearWareHouseData(form);
                                    $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                                }
                            }).error(function (error, status) {
                                console.log(error);
                                if (status == 400) {
                                    $scope.notify(error.errorMessage);
                                } else {
                                    $scope.notify("Warehouse can't be added");
                                }
                            });
                        }).error(function (error, status) {
                            console.log(error);
                            if (status == 400) {
                                $scope.notify(error.errorMessage);
                            } else {
                                $scope.notify("GSTIN cannot be added");
                            }
                        });
                    }
            }
            else
            {
                var postGlaucusWarehouseData = $scope.genericData.glwarehouseData;
                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses',
                    data: postGlaucusWarehouseData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (res) {
                    console.log(res);
                    if ($scope.apobOrNot) {
                        if ($scope.apobOrNot == "apob") {
                            if (file) {
                                if (!file.$error) {
                                    console.log('file is ');
                                    console.dir(file);
                                    var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/clients/docs/uploadapob?warehouseid=' + res.tableWarehouseDetails.idtableWarehouseDetailsId;

                                    var fd = new FormData();
                                    fd.append('uploadFile', file);
                                    console.log(uploadUrl);
                                    console.log('uploadFile' + file);
                                    console.log('fd' + fd);
                                    var upload = Upload.http({
                                        url: uploadUrl,
                                        method: 'POST',
                                        data: fd,
                                        headers: {
                                            'Content-Type': undefined
                                        }
                                    });
                                    upload.then(function (resp) {
                                        $scope.notify("Glaucus Warehouse Added Successfully", 'success');
                                        $scope.clearWareHouseData();
                                        $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                                    }, function (resp) {
                                        $scope.notify("Error in Uploading APOB doc");
                                    }, function (evt) {
                                        // progress notify
                                        console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                                    });
                                }
                            }
                            else {
                                $scope.notify("Glaucus warehouse added successfully", 'success');
                                $('#addGlaucusWarehouseModal').modal('hide');
                                $scope.clearWareHouseData();
                                $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                            }
                        }
                        else {
                            $scope.notify("Glaucus warehouse added successfully", 'success');
                            $('#addGlaucusWarehouseModal').modal('hide');
                            $scope.clearWareHouseData();
                            $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                        }
                    }
                    else {
                        $scope.notify("Glaucus warehouse added successfully", 'success');
                        $('#addGlaucusWarehouseModal').modal('hide');
                        $scope.clearWareHouseData();
                        $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                    }
                }).error(function (error, status) {
                    console.log(error);
                    if (status == 400) {
                        $scope.notify(error.errorMessage);
                    } else {
                        $scope.notify("Warehouse can't be added");
                    }
                });
            }
        };

        $scope.checkOwnShortName = function (shortName) {
            if (shortName) {
                $scope.ownShortNameEntered = false;
            } else {
                $scope.ownShortNameEntered = true;
            }
        };

        $scope.checkOwnLongName = function (longName) {
            if (longName) {
                $scope.ownLongNameEntered = false;
            } else {
                $scope.ownLongNameEntered = true;
            }
        };

        $scope.checkOwnCPersonName = function (personName) {
            if (personName) {
                $scope.ownCPersonNameEntered = false;
            } else {
                $scope.ownCPersonNameEntered = true;
            }
        };

        $scope.checkOwnPersonEmail = function (email) {
            if (email) {
                $scope.ownPersonEmailEntered = false;
            } else {
                $scope.ownPersonEmailEntered = true;
            }
        };

        //Number Validation not allowing -,+,e
        $scope.Num = function (event) {
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

        $scope.checkOwnPersonPhone = function (phone) {
            if (phone) {
                $scope.ownPersonPhoneEntered = false;
            } else {
                $scope.ownPersonPhoneEntered = true;
            }
        };

        $scope.checkOwnAddrLine1 = function (addrLine1) {
            if (addrLine1) {
                $scope.ownAddrLine1Entered = false;
            } else {
                $scope.ownAddrLine1Entered = true;
            }
        };

        $scope.checkOwnPinCode = function (pinCode) {
            if (pinCode) {
                $scope.ownPinCodeEntered = false;
            } else {
                $scope.ownPinCodeEntered = true;
            }
        };

        $scope.editWarehouseModal = function (idtableWarehouseDetailsId) {
            $scope.addOwnGlMode = "edit";
            $scope.tableAddress = {};
            var editOpenUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/glwarehouses/' + idtableWarehouseDetailsId;
            $http.get(editOpenUrl).success(function (response) {
                console.log(response);
                if (response != null) {
                    if (response.tableWarehouseType.idtableWarehouseTypeId == 5) {
                        $scope.isstore = true;
                    }
                    $scope.wareHouseUpdateId = idtableWarehouseDetailsId;
                    $scope.tableAddress = response.tableAddress;
                    $scope.stateData = initializeDropdowns($scope.regionsStatesArray, 'idtableStateId', response.tableAddress.tableCity.tableDistrict.tableState.idtableStateId);
                    if($scope.clientprofile.tableClientProfileEnableInvoice!=null && $scope.clientprofile.tableClientProfileEnableInvoice == true)
                    {
                        $scope.getVatTin(response.tableAddress.tableCity.tableDistrict.tableState);
                    }

                    $scope.regionsStatesDistrictData($scope.stateData).then(
                        function (v) {
                            if (v) {
                                console.log(v);
                                $scope.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', response.tableAddress.tableCity.tableDistrict.idtableDistrictId);
                                $scope.regionsStatesDistrictsCityData($scope.stateData, $scope.districtData).then(
                                    function (v) {
                                        if (v) {
                                            console.log(v);
                                            $scope.cityData = initializeDropdowns($scope.regionsStatesDistrictsCityArray, 'idtableCityId', response.tableAddress.tableCity.idtableCityId);
                                            $scope.changeCity($scope.cityData);
                                            $scope.tableAddress.tableWarehouseDetailsShortname = response.tableWarehouseDetailsShortname;
                                            $scope.tableAddress.tableWarehouseDetailsLongname = response.tableWarehouseDetailsLongname;
                                            $scope.tableAddress.tableWarehouseDetailsCanServiceOrder = response.tableWarehouseDetailsCanServiceOrder;
                                        }
                                    });
                            }
                        });
                    $('#addOwnWarehouseModal').modal('show');
                }
            }).error(function (error, status) {
                console.log(error);

            });
        }


        function initializeDropdowns(lists, prop, code) {
            lists = lists || [];
            for (var i = 0; i < lists.length; i++) {
                var list = lists[i];
                if (list[prop] === code) {
                    return list;
                }
            }
            ;
            return null;
        };

        $scope.OwnGlaucusWareHouseForm = function (form) {
            if ($scope.addOwnGlMode == 'add') {
                $scope.addOwnGlaucusWareHouses(form);
            }
            else if ($scope.addOwnGlMode == 'edit') {
                $scope.editOwnGlaucusWareHouses(form);
            }
        }
        $scope.addOwnGlaucusWareHouses = function (form) {

            $scope.checkIfWarehouseNameExist($scope.tableAddress.tableWarehouseDetailsLongname).then(function (data) {

                if (data == true) {
                    $scope.notify("Warehouse name already exists");
                    return;
                }

                $scope.addButtonDisabled = true;
                var isstore = $scope.isstore;
                var canSubmit = false;
                if (!$scope.stateData) {
                    $scope.notify("Please select a State!");
                    $scope.ownStateDataSelected = true;
                    $scope.addButtonDisabled = false;
                }
                else if (!$scope.districtData) {
                    $scope.notify("Please select a District!");
                    $scope.ownDistrictDataSelected = true;
                    $scope.addButtonDisabled = false;
                }
                else if (!$scope.cityData) {
                    $scope.notify("Please select a City!");
                    $scope.ownCityDataSelected = true;
                    $scope.addButtonDisabled = false;
                }
                else if (!$scope.tableAddress) {
                    if (isstore == true) {
                        $scope.notify("Please enter the Store Short Name!");
                    }
                    else {
                        $scope.notify("Please enter the Warehouse Short Name!");
                    }
                    $scope.ownShortNameEntered = true;
                    $scope.addButtonDisabled = false;
                }
                else if (!$scope.tableAddress.tableWarehouseDetailsShortname) {
                    if (isstore == true) {
                        $scope.notify("Please enter the Store Short Name!");
                    }
                    else {
                        $scope.notify("Please enter the Warehouse Short Name!");
                    }
                    $scope.ownShortNameEntered = true;
                    $scope.addButtonDisabled = false;
                } else if (!$scope.tableAddress.tableWarehouseDetailsLongname) {
                    if (isstore == true) {
                        $scope.notify("Please enter the Store Long Name!");
                    }
                    else {
                        $scope.notify("Please enter the Warehouse Long Name!");
                    }
                    $scope.ownLongNameEntered = true;
                    $scope.addButtonDisabled = false;
                } else if (!$scope.tableAddress.tableAddressContactPerson1) {
                    $scope.notify("Please enter the Contact Person Name!");
                    $scope.ownCPersonNameEntered = true;
                    $scope.addButtonDisabled = false;
                } else if (!$scope.tableAddress.tableAddressEmail1) {
                    $scope.notify("Please enter a valid Email!");
                    $scope.ownPersonEmailEntered = true;
                    $scope.addButtonDisabled = false;
                } else if (!$scope.tableAddress.tableAddressPhone1) {
                    $scope.notify("Please enter the Contact Person Phone!");
                    $scope.ownPersonPhoneEntered = true;
                    $scope.addButtonDisabled = false;
                } else if ($scope.tableAddress.tableAddressPhone1 && $scope.tableAddress.tableAddressPhone1.length != 10) {
                    $scope.notify("Please enter a valid Contact Person Phone!");
                    $scope.ownPersonPhoneEntered = true;
                    $scope.addButtonDisabled = false;
                } else if (!$scope.tableAddress.tableAddress1) {
                    $scope.notify("Please enter the Address Line 1!");
                    $scope.ownAddrLine1Entered = true;
                    $scope.addButtonDisabled = false;
                } else if (!$scope.tableAddress.tableAddressPin) {
                    $scope.notify("Please enter valid 6 digit Pin Code!");
                    $scope.ownPinCodeEntered = true;
                    $scope.addButtonDisabled = false;
                }
                else if ($scope.tableAddress.tableAddressPin.length < 6 || $scope.tableAddress.tableAddressPin.length > 6) {
                    $scope.notify("Please enter valid 6 digit Pin Code!");
                    $scope.ownPinCodeEntered = true;
                    $scope.addButtonDisabled = false;
                }
                else {
                    console.log($scope.vatTinData);
                    console.log($scope.tableAddress);
                    var tableAddress = $scope.tableAddress;
                    if (!$scope.vatTinData) {
                        var vatTinNo = $scope.genericData.tableClientStateWiseVatNo;
                    }
                    else {
                        var vatTinNo = $scope.vatTinData.tableClientStateWiseVatNo;
                    }
                    if ($scope.vatTinDocs != undefined) {
                        var file = $scope.vatTinDocs;
                    }
                    if ($scope.apobDocs != undefined) {
                        var file = $scope.apobDocs;
                    }

                    if (tableAddress.tableWarehouseDetailsCanServiceOrder == undefined) {
                        tableAddress.tableWarehouseDetailsCanServiceOrder = false;
                    }
                    var city = $scope.cityVal;

                    if($scope.clientprofile.tableClientProfileEnableInvoice!=null && $scope.clientprofile.tableClientProfileEnableInvoice == true) {

                        if ($scope.clientprofile.tableGstType.idtableGstTypeId != 1 && $scope.clientprofile.tableGstType.idtableGstTypeId != 4) {
                            if ($scope.validateGSTIN() == false) {
                                $scope.addButtonDisabled = false;
                                return false;
                            }
                        }

                        $scope.updateVatTinInfo().then(function ()
                        {
                            var postOwnGlaucusWarehouseData = {
                                "tableWarehouseDetailsShortname": tableAddress.tableWarehouseDetailsShortname,
                                "tableWarehouseDetailsLongname": tableAddress.tableWarehouseDetailsLongname,
                                "tableWarehouseDetailsIsClientDedicated": true,
                                "tableAddress": {
                                    "tableAddress1": tableAddress.tableAddress1,
                                    "tableAddress2": tableAddress.tableAddress2,
                                    "tableAddress3": tableAddress.tableAddress3,
                                    "tableAddress4": null,
                                    "tableAddressPin": tableAddress.tableAddressPin,
                                    "tableAddressFax": null,
                                    "tableAddressContactPerson1": tableAddress.tableAddressContactPerson1,
                                    "tableAddressPhone1": tableAddress.tableAddressPhone1,
                                    "tableAddressEmail1": tableAddress.tableAddressEmail1,
                                    "tableAddressType": {
                                        "idtableAddressTypeId": 3,
                                        "tableAddressTypeString": "General"
                                    },
                                    "tableCity": city,
                                },
                                "tableWarehouseFacilitieses": [],
                                "tableWarehouseStorageTypeWiseCapacities": [],
                                "tableWarehouseDetailsCanServiceOrder": tableAddress.tableWarehouseDetailsCanServiceOrder
                            };

                            if (isstore == true) {
                                postOwnGlaucusWarehouseData.tableWarehouseType = {
                                    "idtableWarehouseTypeId": 5,
                                    "tableWarehouseTypeString": "Store"
                                };
                            }
                            else {
                                postOwnGlaucusWarehouseData.tableWarehouseType = {
                                    "idtableWarehouseTypeId": 2,
                                    "tableWarehouseTypeString": "SelfOwned"
                                };
                            }

                            console.log(postOwnGlaucusWarehouseData);
                            $http({
                                method: 'POST',
                                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/glwarehouses',
                                data: postOwnGlaucusWarehouseData,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).success(function (res) {
                                console.log(res);
                                if (res) {
                                    $scope.notify("Warehouse added successfully", 'success');
                                    $scope.clearWareHouseData(form);
                                    $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                                }
                                $scope.addButtonDisabled = false;
                            }).error(function (error, status) {
                                console.log(error);
                                if (status == 400) {
                                    $scope.notify(error.errorMessage);
                                } else {
                                    $scope.notify("Failed to add warehouse");
                                }
                                $scope.addButtonDisabled = false;
                            });
                        });
                    }
                    else
                    {
                        var postOwnGlaucusWarehouseData = {
                            "tableWarehouseDetailsShortname": tableAddress.tableWarehouseDetailsShortname,
                            "tableWarehouseDetailsLongname": tableAddress.tableWarehouseDetailsLongname,
                            "tableWarehouseDetailsIsClientDedicated": true,
                            "tableAddress": {
                                "tableAddress1": tableAddress.tableAddress1,
                                "tableAddress2": tableAddress.tableAddress2,
                                "tableAddress3": tableAddress.tableAddress3,
                                "tableAddress4": null,
                                "tableAddressPin": tableAddress.tableAddressPin,
                                "tableAddressFax": null,
                                "tableAddressContactPerson1": tableAddress.tableAddressContactPerson1,
                                "tableAddressPhone1": tableAddress.tableAddressPhone1,
                                "tableAddressEmail1": tableAddress.tableAddressEmail1,
                                "tableAddressType": {
                                    "idtableAddressTypeId": 3,
                                    "tableAddressTypeString": "General"
                                },
                                "tableCity": city,
                            },
                            "tableWarehouseFacilitieses": [],
                            "tableWarehouseStorageTypeWiseCapacities": [],
                            "tableWarehouseDetailsCanServiceOrder": tableAddress.tableWarehouseDetailsCanServiceOrder
                        };

                        if (isstore == true) {
                            postOwnGlaucusWarehouseData.tableWarehouseType = {
                                "idtableWarehouseTypeId": 5,
                                "tableWarehouseTypeString": "Store"
                            };
                        }
                        else {
                            postOwnGlaucusWarehouseData.tableWarehouseType = {
                                "idtableWarehouseTypeId": 2,
                                "tableWarehouseTypeString": "SelfOwned"
                            };
                        }

                        $http({
                            method: 'POST',
                            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/glwarehouses',
                            data: postOwnGlaucusWarehouseData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function (res) {
                            console.log(res);
                            if (res) {
                                $scope.notify("Warehouse added successfully", 'success');
                                $scope.clearWareHouseData(form);
                                $scope.listOfWarehousesCount($scope.vmPager.currentPage);
                            }
                            $scope.addButtonDisabled = false;
                        }).error(function (error, status) {
                            console.log(error);
                            if (status == 400) {
                                $scope.notify(error.errorMessage);
                            } else {
                                $scope.notify("Failed to add warehouse");
                            }
                            $scope.addButtonDisabled = false;
                        });
                    }
                }
            });
        };

        $scope.editOwnGlaucusWareHouses = function (form) {

            $scope.addButtonDisabled = true;
            var isstore = $scope.isstore;
            var canSubmit = false;
            if (!$scope.stateData) {
                $scope.notify("Please select a State!");
                $scope.ownStateDataSelected = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.districtData) {
                $scope.notify("Please select a District!");
                $scope.ownDistrictDataSelected = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.cityData) {
                $scope.notify("Please select a City!");
                $scope.ownCityDataSelected = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress) {
                $scope.notify("Please enter the Warehouse Short Name!");
                $scope.ownShortNameEntered = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress.tableWarehouseDetailsShortname) {
                $scope.notify("Please enter the Warehouse Short Name!");
                $scope.ownShortNameEntered = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress.tableWarehouseDetailsLongname) {
                $scope.notify("Please enter the Warehouse Long Name!");
                $scope.ownLongNameEntered = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress.tableAddressContactPerson1) {
                $scope.notify("Please enter the Contact Person Name!");
                $scope.ownCPersonNameEntered = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress.tableAddressEmail1) {
                $scope.notify("Please enter a valid Email!");
                $scope.ownPersonEmailEntered = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress.tableAddressPhone1) {
                $scope.notify("Please enter the Contact Person Phone!");
                $scope.ownPersonPhoneEntered = true;
                $scope.addButtonDisabled = false;
            } else if ($scope.tableAddress.tableAddressPhone1 && $scope.tableAddress.tableAddressPhone1.length != 10) {
                $scope.notify("Please enter a valid Contact Person Phone!");
                $scope.ownPersonPhoneEntered = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress.tableAddress1) {
                $scope.notify("Please enter the Address Line 1!");
                $scope.ownAddrLine1Entered = true;
                $scope.addButtonDisabled = false;
            } else if (!$scope.tableAddress.tableAddressPin) {
                $scope.notify("Please enter valid 6 digit Pin Code!");
                $scope.ownPinCodeEntered = true;
                $scope.addButtonDisabled = false;
            }
            else if ($scope.tableAddress.tableAddressPin.length < 6 || $scope.tableAddress.tableAddressPin.length > 6) {
                $scope.notify("Please enter valid 6 digit Pin Code!");
                $scope.ownPinCodeEntered = true;
                $scope.addButtonDisabled = false;
            } else {
                console.log($scope.vatTinData);
                console.log($scope.tableAddress);
                var tableAddress = $scope.tableAddress;
                if (!$scope.vatTinData) {
                    var vatTinNo = $scope.genericData.tableClientStateWiseVatNo;
                } else {
                    var vatTinNo = $scope.vatTinData.tableClientStateWiseVatNo
                }
                if ($scope.vatTinDocs != undefined) {
                    var file = $scope.vatTinDocs;
                }
                if ($scope.apobDocs != undefined) {
                    var file = $scope.apobDocs;
                }
                console.log(file);
                console.log(vatTinNo);
                console.log($scope.stateData);
                var city = $scope.cityVal;

                if($scope.clientprofile.tableClientProfileEnableInvoice!=null && $scope.clientprofile.tableClientProfileEnableInvoice == true) {
                    if ($scope.clientprofile.tableGstType.idtableGstTypeId != 1 && $scope.clientprofile.tableGstType.idtableGstTypeId != 4) {
                        if ($scope.validateGSTIN() == false) {
                            $scope.addButtonDisabled = false;
                            return false;
                        }
                    }

                    $scope.updateVatTinInfo().then(function ()
                    {
                        var postOwnGlaucusWarehouseData = {
                            "tableWarehouseDetailsShortname": tableAddress.tableWarehouseDetailsShortname,
                            "tableWarehouseDetailsLongname": tableAddress.tableWarehouseDetailsLongname,
                            "tableWarehouseDetailsIsClientDedicated": true,
                            "tableAddress": {
                                "tableAddress1": tableAddress.tableAddress1,
                                "tableAddress2": tableAddress.tableAddress2,
                                "tableAddress3": tableAddress.tableAddress3,
                                "tableAddress4": null,
                                "tableAddressPin": tableAddress.tableAddressPin,
                                "tableAddressFax": null,
                                "tableAddressContactPerson1": tableAddress.tableAddressContactPerson1,
                                "tableAddressPhone1": tableAddress.tableAddressPhone1,
                                "tableAddressEmail1": tableAddress.tableAddressEmail1,
                                "tableAddressType": {
                                    "idtableAddressTypeId": 3,
                                    "tableAddressTypeString": "General"
                                },
                                "tableCity": city,
                            },
                            "tableWarehouseFacilitieses": [],
                            "tableWarehouseStorageTypeWiseCapacities": [],
                            "tableWarehouseDetailsCanServiceOrder": tableAddress.tableWarehouseDetailsCanServiceOrder
                        }


                        if (isstore == true) {
                            postOwnGlaucusWarehouseData.tableWarehouseType = {
                                "idtableWarehouseTypeId": 5,
                                "tableWarehouseTypeString": "Store"
                            };
                        }
                        else {
                            postOwnGlaucusWarehouseData.tableWarehouseType = {
                                "idtableWarehouseTypeId": 2,
                                "tableWarehouseTypeString": "SelfOwned"
                            };
                        }

                        console.log(postOwnGlaucusWarehouseData);
                        $http({
                            method: 'PUT',
                            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/glwarehouses/' + $scope.wareHouseUpdateId,
                            data: postOwnGlaucusWarehouseData,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function (res) {
                            $scope.addButtonDisabled = false;
                            console.log(res);
                            if (res) {
                                $scope.notify("Warehouse updated successfully", 'success');
                                $scope.clearWareHouseData();
                                $scope.listOfWarehousesCount($scope.vmPager.currentPage);

                            }
                        }).error(function (error, status) {
                            $scope.addButtonDisabled = false;
                            console.log(error);
                            if (status == 400) {
                                $scope.notify(error.errorMessage);
                            } else {
                                $scope.notify("Failed to update warehouse");
                            }
                        });
                    });
                }
                else
                {
                    var postOwnGlaucusWarehouseData = {
                        "tableWarehouseDetailsShortname": tableAddress.tableWarehouseDetailsShortname,
                        "tableWarehouseDetailsLongname": tableAddress.tableWarehouseDetailsLongname,
                        "tableWarehouseDetailsIsClientDedicated": true,
                        "tableAddress": {
                            "tableAddress1": tableAddress.tableAddress1,
                            "tableAddress2": tableAddress.tableAddress2,
                            "tableAddress3": tableAddress.tableAddress3,
                            "tableAddress4": null,
                            "tableAddressPin": tableAddress.tableAddressPin,
                            "tableAddressFax": null,
                            "tableAddressContactPerson1": tableAddress.tableAddressContactPerson1,
                            "tableAddressPhone1": tableAddress.tableAddressPhone1,
                            "tableAddressEmail1": tableAddress.tableAddressEmail1,
                            "tableAddressType": {
                                "idtableAddressTypeId": 3,
                                "tableAddressTypeString": "General"
                            },
                            "tableCity": city,
                        },
                        "tableWarehouseFacilitieses": [],
                        "tableWarehouseStorageTypeWiseCapacities": [],
                        "tableWarehouseDetailsCanServiceOrder": tableAddress.tableWarehouseDetailsCanServiceOrder
                    }

                    if (isstore == true) {
                        postOwnGlaucusWarehouseData.tableWarehouseType = {
                            "idtableWarehouseTypeId": 5,
                            "tableWarehouseTypeString": "Store"
                        };
                    }
                    else {
                        postOwnGlaucusWarehouseData.tableWarehouseType = {
                            "idtableWarehouseTypeId": 2,
                            "tableWarehouseTypeString": "SelfOwned"
                        };
                    }

                    console.log(postOwnGlaucusWarehouseData);
                    $http({
                        method: 'PUT',
                        url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/glwarehouses/' + $scope.wareHouseUpdateId,
                        data: postOwnGlaucusWarehouseData,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function (res) {
                        $scope.addButtonDisabled = false;
                        console.log(res);
                        if (res) {
                            $scope.notify("Warehouse updated successfully", 'success');
                            $scope.clearWareHouseData();
                            $scope.listOfWarehousesCount($scope.vmPager.currentPage);

                        }
                    }).error(function (error, status) {
                        $scope.addButtonDisabled = false;
                        console.log(error);
                        if (status == 400) {
                            $scope.notify(error.errorMessage);
                        } else {
                            $scope.notify("Failed to update warehouse");
                        }
                    });
                }
            }
        };


        $scope.clearWareHouseData = function (form) {
            $scope.vatTinData = null;
            $scope.genericData.glwarehouseData = null;
            $scope.stateData = null;
            $scope.vatTinDocs = null;
            $scope.apobDocs = null;
            $scope.tableAddress = {};
            $scope.stateData = null;
            $scope.districtData = null;
            $scope.cityVal = null;
            $scope.cityData = null;
            $scope.isStateWarehouseSelected = false;
            $scope.isDistrictWarehouseSelected = false;
            $scope.isCityWarehouseSelected = false;
            $scope.vatTinInfo = null;
            $scope.isWarehouseSelected = false;
            $scope.glStateDataSelected = false;
            $scope.glWarehouseSelected = false;
            $scope.glVatTinEntered = false;
            $scope.glApobDocsSelected = false;
            $scope.apobOrNot = undefined;
            $scope.ownStateDataSelected = false;
            $scope.ownDistrictDataSelected = false;
            $scope.ownCityDataSelected = false;
            $scope.ownShortNameEntered = false;
            $scope.ownLongNameEntered = false;
            $scope.ownCPersonNameEntered = false;
            $scope.ownPersonEmailEntered = false;
            $scope.ownPersonPhoneEntered = false;
            $scope.ownAddrLine1Entered = false;
            $scope.ownPinCodeEntered = false;
            $scope.isstore = false;
            if (form) {
                var controlNames = Object.keys(form).filter(function (key) {
                    key.indexOf('$') !== 0
                });
                for (var name in controlNames) {
                    var control = form[name];
                    control.$setViewValue(undefined);
                }
                form.$setPristine();
                form.$setUntouched();
            }
            $('#addOrderDialog').modal('hide');
            $('#confirmEditOrder').modal('hide');

            $('#addOwnWarehouseModal').modal('hide');
            $('#addGlaucusWarehouseModal').modal('hide');
            $('#uploadAppDocModal').modal('hide');
            $('#uploadAppDocModal').modal('hide');
            $("#vatTinDialog").modal("hide");
        };

        $scope.checkIfWarehouseNameExist = function (warehousename) {

            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/glwarehouses/isexist?warehousename=' + warehousename
            }).success(function (res) {
                console.log(res);
                deferred.resolve(res);

            }).error(function (error, status) {
                console.log(error);
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                } else {
                    $scope.notify("There is some error");
                }
            });

            return deferred.promise;
        }

        $scope.initializeModalState = function () {

            $scope.addButtonDisabled = false;
            $scope.addOwnGlMode = "add";
        }

        $scope.initializeStoreModalState = function () {
            $scope.initializeModalState();
            $scope.isstore = true;
        }

        $scope.deleteStatesForWarehouses = function (wid, stateId) {
            var q = $q.defer();
            console.log(wid);
            console.log(stateId);

            var deleteStateWiseurl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/' + wid + '/states/' + stateId;
            console.log(deleteStateWiseurl);
            $http({
                url: deleteStateWiseurl,

                method: 'DELETE',
            }).success(function (data) {
                console.log(data);
                if (data) {
                    $scope.selectedStates(wid).then(function () {
                        q.resolve();
                    });
                }
                else {
                    q.resolve();
                }
            })

            return q.promise;
        };

        $scope.uploadApplicationDocs = function (warehouseId) {
            if ($scope.apobDocs != undefined) {
                var file = $scope.apobDocs;
                if (file) {
                    if (!file.$error) {
                        console.log('file is ');
                        console.dir(file);
                        var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/clients/docs/uploadapob?warehouseid=' + warehouseId;

                        var fd = new FormData();
                        fd.append('uploadFile', file);
                        console.log(uploadUrl);
                        console.log('uploadFile' + file);
                        console.log('fd' + fd);
                        var upload = Upload.http({
                            url: uploadUrl,
                            method: 'POST',
                            data: fd,
                            headers: {
                                'Content-Type': undefined
                            }
                        });
                        upload.then(function (resp) {
                            $scope.notify('APOB Application Form Successfully Added', 'success');
                            $scope.clearWareHouseData();
                            $scope.listOfWarehouses(0);
                        }, function (resp) {
                            console.log(resp);
                            $scope.notify("Error in Uploading Apob Application Form");
                        }, function (evt) {
                            // progress notify
                            console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                        });

                    }
                }
            }
        };

        //dialog box to open contact glaucus succesfull message
        $scope.contactGlaucus = function () {
            var data = {
                "subject": "GSTIN/APOB assistance required by {seller}",
                "body": "Dear Executive, \n Please contact {seller} through email {emailid} or call on {phone} for GSTIN/APOB assistance. \n OMS System"
            }
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/warehouses/vatquery',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res) {
                console.log(res);
            }).error(function (error, status) {
                console.log(error);
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                } else {
                    $scope.notify("Warehouse Cant be Added");
                }
            });

        }

        $scope.cancelGlContact = function () {
            $('#contactGlaucus').modal('hide');
        }

        //Number Validation not allowing -,+,e,.
        $scope.Num1 = function (event) {
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

        $scope.onStateChanged = function () {

            if ($scope.genericData.tableClientStateWiseVatNo != null && $scope.genericData.tableClientStateWiseVatNo.length >= 2) {
                var isFirstNumber = false;
                var isSecondNumber = false;
                var firstChar = $scope.genericData.tableClientStateWiseVatNo[0];
                if (firstChar <= '3' && firstChar >= '0') {
                    isFirstNumber = true;
                }
                var secondChar = $scope.genericData.tableClientStateWiseVatNo[1];
                if (secondChar <= '9' && secondChar >= '0') {
                    isSecondNumber = true;
                }
                if (isFirstNumber == true) {
                    $scope.genericData.tableClientStateWiseVatNo = $scope.genericData.tableClientStateWiseVatNo.replace($scope.genericData.tableClientStateWiseVatNo[0], '');
                }

                if (isSecondNumber == true) {
                    $scope.genericData.tableClientStateWiseVatNo = $scope.genericData.tableClientStateWiseVatNo.replace($scope.genericData.tableClientStateWiseVatNo[0], '');
                }
            }
            if ($scope.genericData.tableClientStateWiseVatNo == null) {
                $scope.genericData.tableClientStateWiseVatNo = "";
            }
            $scope.genericData.tableClientStateWiseVatNo = $scope.stateData.tableStateCode + $scope.genericData.tableClientStateWiseVatNo;
        }

    }]);
