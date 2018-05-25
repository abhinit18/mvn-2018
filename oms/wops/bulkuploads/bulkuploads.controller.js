angular.module('OMSApp.bulkuploads', [ ]).config(function config($stateProvider) {
    $stateProvider.state('/bulkuploads/', {
        name: '/bulkuploads/',
        url: '/bulkuploads/',
        views: {
            "main": {
                controller: 'bulkuploadsController',
                templateUrl: 'wops/bulkuploads/bulkuploads.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'stockTransfer'}
    })

}).controller('bulkuploadsController',['$rootScope','MavenAppConfig', 'pagerService',"$scope", "$http", "$location", "$mdDialog", "$window", "Upload", "$q", "$cookies", "$timeout","$localStorage",

function bulkuploadsController($rootScope,MavenAppConfig, pagerService,$scope, $http, $location,  $mdDialog, $window, Upload,  $q, $cookies,$timeout,$localStorage) {

    $scope.searchSuccessClicked = false;

    $scope.genericData = {};
    $scope.allreport = [];
    $scope.genericData.downloadSkuSalesChannelMapTemplateUrl =MavenAppConfig.baseUrlSource+ MavenAppConfig.downloadSkuSalesChannelMapTemplateUrl;
    $scope.downloadOrderTemplateUrl =MavenAppConfig.baseUrlSource+ MavenAppConfig.downloadOrderTemplateUrl;
    $scope.downloadSkuTemplateUrl = MavenAppConfig.s3+MavenAppConfig.downloadSkuTemplateUrl;
    $scope.downloadMastersTemplateUrl = MavenAppConfig.s3+MavenAppConfig.downloadMastersTemplateUrl;
    $scope.downloadCustomersTemplateUrl = MavenAppConfig.s3 + MavenAppConfig.downloadCustomersTemplateUrl;
    $scope.downloadVendorsTemplateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/vendorbulkuploadtemplate';
    $scope.downloadPOTemplateUrl = MavenAppConfig.s3+MavenAppConfig.downloadPOTemplateUrl;
    $scope.downloadBulkCancelTemplateUrl = MavenAppConfig.s3+MavenAppConfig.downloadBulkCancelTemplateUrl;
    $scope.downloadSTOTemplateUrl =MavenAppConfig.baseUrlSource+ MavenAppConfig.downloadSTOTemplateUrl;
    $scope.downloadStockXferOrderCancelTemplateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/gettemplateforstocktransfercancel';
    $scope.downloadInventoryTemplateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/gettemplateforInventoryupload';
    $scope.downloadPurchaseOrderTemplateUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/purchase/order/bulkuploadtemplate";
    $scope.downloadVendorSkuMapTemplateUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/vendors/vendorskumapbulkuploadtemplate";
    $scope.bulkPurchaseReturnWithIdUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithpo';
    $scope.bulkPurchaseReturnWithoutIdUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/templateforpurchasereturnuploadwithoutpo';
    $scope.downloadSaleReturnTemplateUrl = "";
    $scope.downloadCancelOrderTemplateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/bulkCancelSaleOrderUploadtemplate';

    $scope.filePathUrl =MavenAppConfig.baseUrlSource+ MavenAppConfig.filePathUrl;
    $scope.selectedTab = 0;
    $scope.start = 0;
    $scope.allCount = 0;
    $scope.startSuccess = 0;
    $scope.sizeSuccess = 5;
    $scope.startError = 0;
    $scope.sizeError = 5;
    $scope.pageSize = 5;
    $scope.recordsPerPage = [5,10,15];
    $scope.userSize = 5;
    $scope.currentPage = 1;
    $scope.totalPages = 0;

    //======================================= datepicker filter logic ===================== //
    

    $scope.clearStartDate = function () {
        $scope.startDate = "";
        $scope.start1Date = null;
        if ($scope.end1Date == null) {
            $scope.startmaxDate = new Date();
        }
        else {
            $scope.sendEndDate($scope.end1Date);
        }
        $scope.endminDate = null;
    }

    $scope.clearEndDate = function () {
        $scope.endDate = "";
        $scope.end1Date = null;
        $scope.startmaxDate = new Date();
        $scope.endmaxDate = new Date();
        if ($scope.start1Date == null) {
            $scope.endminDate = null;
        }
        else {
            $scope.sendStartDate($scope.start1Date);
        }
    }

//Start Date and End Date Validations Starts Here
    $scope.startmaxDate = new Date();
    $scope.endmaxDate = new Date();

    $scope.sendStartDate = function (date) {
        $scope.startDateData = new Date(date);
        $scope.endminDate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    $scope.sendEndDate = function (date) {
        console.log(date);
        $scope.endDateData = new Date(date);
        $scope.startmaxDate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
    }


    //=========================== ends here =========================//


    $scope.onLoad = function () {
        $scope.checkAccess();
        $scope.setSelectedState($scope.defaultState);
        //$scope.genericData.selectedState = $scope.defaultState;
    };


    $scope.isActive = function (tab) {
        if ($scope.activeTab == tab) {
            return true;
        }
        return false;
    };

    $scope.listOfChannels = function () {
        $scope.channelNamesData = [];
        var channelListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels";
        // console.log(channelListUrl);
        $http.get(channelListUrl).success(function (data) {
            console.log(data);
            $scope.channelLists = data;

            for (var i = 0; i < $scope.channelLists.length; i++) {
                if ($scope.channelLists[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                    $scope.channelNamesData.push($scope.channelLists[i]);
                }
            }
        }).error(function (error, status) {
            console.log(error);
            console.log(status);
        });
    };
    $scope.listOfChannels();

    $scope.clearFilter = function () {
        $scope.start1Date = null;
        $scope.end1Date = null;
        $scope.loadBulkReporting($scope.defaultState, 0 , 5);
    };

    $scope.toggleSearchSuccessUploads = function () {
        $scope.searchSuccessClicked = !$scope.searchSuccessClicked;
    };

    $scope.showBulkUploadDialog = function () {
        $("#bulkUploadDialog").modal("show");
    };

    $scope.generateMastersTemplate = function () {

        if ($scope.genericData.selectedEntity == null || $scope.genericData.selectedEntity == undefined)
        {
            $scope.notify("Please Choose Upload Type");
        }

        $http({
            method: 'GET',
            url: $scope.downloadMastersTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'

        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Master_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    }

    $scope.VendorTemplateDownload = function () {
        console.log('test')
        $http({
            method: 'GET',
            url: $scope.downloadVendorsTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'

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
            }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.downloadReturnableGoodsOrderTemplate = function () {

        var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/returnablegoodsorder/bulkuploadtemplate";

        $http({
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'

        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Returnable_Goods_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });

    };


    $scope.onSaleReferenceNumberOptionChanged = function (salerefknown) {
        $scope.genericData.saleRefKnown = salerefknown;
        $('#confirmSaleOrderReturnDialog').modal('hide');
        $('#bulkUploadDialog').modal('show');
    };

    $scope.showBulkUploadFileDialog = function () {

        if (!$scope.genericData.selectedEntity) {
            $scope.notify("Choose Upload Type First");
            return;
        }

        if ($scope.genericData.selectedEntity == 'rates') {
            $("#uploadRatesDialog").modal("show");
        } else {
            $("#bulkUploadFileDialog").modal("show");
        }


    };

    $scope.closeBulkUploadDialog = function () {
        $scope.genericData.selectedEntity = null;
        $("#bulkUploadDialog").modal("hide");
    };
    $scope.closeBulkUploadFileDialog = function (form) {
        $scope.bulkUploadfile = null;
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
        $("#bulkUploadFileDialog").modal("hide");
    };

    $scope.closeBulkUploadDialogModal = function () {
        $("#bulkUploadDialog").modal("hide");
        $("#bulkUploadFileDialog").modal("hide");
        $cookies.put('BulkUploadData', $scope.defaultState);
        $cookies.put('ActiveTab', $scope.activeTab);
        $timeout(function () {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    };

    $scope.bulkOrderSettingData = {}
    $scope.DownloadInventoryBulkUploadTemp = function () {
        $http({
            method: 'GET',
            url: $scope.downloadInventoryTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'

        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Inventory_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.DownloadSaleReturnBulkUploadTemp = function (flag) {

        $scope.genericData.saleRefKnown = flag;

        if ($scope.genericData.saleRefKnown == true) {
            $scope.downloadSaleReturnTemplateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/templateforreturnuploadwithsaleorder';
        } else {
            $scope.downloadSaleReturnTemplateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/templateforreturnuploadwithoutsaleorder';
        }
        $http({
            method: 'GET',
            url: $scope.downloadSaleReturnTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'

        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Sale_Return_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.uploadBulkFile = function (bulkOrderUploadfile, activeTab, form) {
        $scope.bulkuploaddisabled = true;
        if (bulkOrderUploadfile == undefined || bulkOrderUploadfile == null || bulkOrderUploadfile == "") {
            $scope.notify("Select File first");
            $scope.bulkuploaddisabled = false;
            return;
        }
        file = bulkOrderUploadfile;
        console.log(file);
        console.log(activeTab);

        if (activeTab == 'SKU') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/skubulkupload';
        }
        if (activeTab == 'Masters') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports/masterbulkupload';
        }

        if (activeTab == 'Customers') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/customersbulkupload';
        }

        if (activeTab == 'Vendors') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/vendorbulkupload';
        }

        if (activeTab == 'orders') {
            if ($scope.bulkOrderSettingData.channelId == undefined || $scope.bulkOrderSettingData.channelId == "") {
                $scope.notify("Please select sales channel");
                $scope.bulkuploaddisabled = false;
                return;
            }
        }

        if (activeTab == 'PO') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchase/order/pobulkupload';
        }
        if (activeTab == 'Cancel') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/orders/uploadbulkcancelledorders';
        }
        if (activeTab == 'Stocktransfer') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/stock/transfer/stbulkupload';
        }
        if (activeTab == 'Inventory') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/inventory/inventorybulkupload';
        }
        if (activeTab == 'Salereturn' && $scope.genericData.saleRefKnown == true) {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithsaleorder';
        }
        if (activeTab == 'Salereturn' && $scope.genericData.saleRefKnown == false) {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/salereturn/uploadsaleorderreturnwithoutsaleorder';
        }
        if (activeTab == 'vendorSkuMap') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/vendors/vendorskumapbulkupload';
        }
        if (activeTab == 'Purchase Return With ID') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithsaleorder';
        }
        if (activeTab == 'Purchase Return Without ID') {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/purchasereturn/uploadpurchasereturnwithoutpurchaseorder';
        }

        var newUploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports/identifybulkupload';

        if (file) {
            if (!file.$error) {
                console.log('file is ');
                console.dir(file);

                var genericBulkUploadDto = {};

                if (activeTab == 'orders') {
                    genericBulkUploadDto.salesChannelValueInfoId = $scope.bulkOrderSettingData.channelId;
                }

                var fd = new FormData();
                fd.append('uploadFile', file);
                fd.append('genericObj', JSON.stringify(genericBulkUploadDto));
                console.log(uploadUrl);
                console.log('uploadFile' + file);
                console.log('fd' + fd);
                var upload = Upload.http({
                    url: newUploadUrl,
                    method: 'POST',
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    }
                });
                upload.then(function (resp) {
                    // file is uploaded successfully
                    console.log(resp);
                    console.log('file ' + file.name + 'is uploaded successfully. Response: ' + resp.data);
                    $scope.notify(activeTab + "Bulk Uploaded successfully", 'success');
                    $scope.bulkUploadfile = null;
                    $scope.closeBulkUploadFileDialog(form);
                    $('#bulkUploadDialog').modal('hide');
                    $scope.bulkuploaddisabled = false;
                    $scope.setSelectedState($scope.genericData.selectedEntity);
                }, function (resp) {
                    console.log(resp);
                    $scope.bulkUploadfile = null;
                    $scope.closeBulkUploadFileDialog(form);
                    $('#bulkUploadDialog').modal('hide');
                    $scope.notify(resp.data.errorMessage);
                    $scope.bulkuploaddisabled = false;
                }, function (evt) {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
                });
            }
        }
    };

    //fetching list of customers count
    $scope.loadBulkCounting = function (page, state) {
        var successCountUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports/filtercount?entity=' + state

        if ($scope.start1Date) {
            successCountUrl += "&startDate" + $scope.start1Date;
        }
        if ($scope.end1Date) {
            successCountUrl += "&startDate" + $scope.end1Date;

        }
        console.log("SUCCESS COUNT URL");
        console.log(successCountUrl);


        $http.get(successCountUrl).success(function (successData) {
            console.log(successData)
            $scope.successCount = successData;
            if (successData) {
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
        }).error(function (error, status) {
            console.log(error);
            console.log(status);
        });
    };

    $scope.generateCategoryTemplate = function () {
        $("#generateTemp").modal('show');
    };
    $scope.cancelGenerateTemplateDialog = function () {
        $("#generateTemp").modal('hide');
    };

    $scope.downloadSkuMaptemplate = function () {

        $http({
            method: 'GET',
            url: $scope.genericData.downloadSkuSalesChannelMapTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_SKU_SalesChannelMap_Bulk_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });

    }

    $scope.downloadSTOtemplate = function () {
        $http({
            method: 'GET',
            url: $scope.downloadSTOTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_StockTransfer_Order_Bulk_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.downloadSTOCanceltemplate = function () {
        $http({
            method: 'GET',
            url: $scope.downloadStockXferOrderCancelTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_StockTransfer_Order_Cancel_Bulk_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.downloadPOtemplate = function () {
        $http({
            method: 'GET',
            url: $scope.downloadPurchaseOrderTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_PO_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.downloadVendorSkuMapTemplate = function () {
        $http({
            method: 'GET',
            url: $scope.downloadVendorSkuMapTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_Vendor_SKU_Map_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };


    $scope.downloadOrdertemplate = function () {
        $http({
            method: 'GET',
            url: $scope.downloadOrderTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_Order_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.downloadCancelOrdertemplate = function () {

        $http({
            method: 'GET',
            url: $scope.downloadCancelOrderTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        }).success(function (data) {
            console.log(data);
            var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
            var downloadUrl = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "Glaucus_Cancel_Order_Upload_Template.xls";
            document.body.appendChild(a);
            a.click();
        }).error(function (data) {
            console.log(data);
            $scope.notify(data.errorMessage);
        });
    };

    $scope.SaleReturnTabCheckforRefNo = "";

    $scope.loadBulkReporting = function (state, start, pagesize, countchange) {
        $scope.SaleReturnTabCheckforRefNo = state;
        $cookies.remove('BulkUploadData');
        $cookies.remove('ActiveTab');
        $scope.state = state;
        start = start||0;
        pagesize = pagesize||$scope.userSize;
        var successUrl = "";
        if (state == "master" || !state) {
            successUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports?start='+start+'&size='+pagesize;
        } else {
            successUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports?start='+start+'&size='+pagesize+'&entity=' + state;
        }
        /*var errorUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=error&entity='+state
         var existingUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=existing&entity='+state
         var duplicateUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=duplicate&entity='+state
         var inprogressUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/bulkuploadreports?start=0&size=5&status=inprogress&entity='+state*/
        if ($scope.start1Date) {
            $scope.start1Date = moment($scope.start1Date).format("YYYY-MM-DD");
            successUrl += "&startDate=" + $scope.start1Date;
        }
        if ($scope.end1Date) {
            $scope.end1Date = moment($scope.end1Date).format("YYYY-MM-DD");
            successUrl += "&endDate=" + $scope.end1Date;
        }
        console.log(successUrl);
        var q = $q.defer();
        $http.get(successUrl).success(function (successdata) {
            console.log(successdata);
            $scope.successdata = successdata;
            !countchange?$scope.dataCount(state):null;
            q.resolve(successdata);
        });
        return q.promise;
    }

    $scope.genericData.statusType = "success";

    $scope.dataCount = function(entity){

        var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/bulkuploadreports/filtercount";
        url += (entity && entity != "master")?'?entity='+entity:"";
        $http.get(url).success(function (count) {
            $scope.successdataCount = count;
            var rem = $scope.successdataCount%$scope.userSize;
            $scope.totalPages = ($scope.successdataCount-rem)/$scope.userSize;
            $scope.totalPages += rem?1:0;
            $scope.pageArray = Array.from({length: $scope.totalPages}, (v, i) => i);
        });
    }

    $scope.changepagecount = function(count, Size){
        var rem = count%Size;
        $scope.totalPages = (count-rem)/Size;
        $scope.totalPages += rem?1:0;
        $scope.pageArray = Array.from({length: $scope.totalPages}, (v, i) => i);
    }

    $scope.downloadPurchaseReturnTemplateWithID = function (flag) {

        if (flag == true) {

            var tempDownloadPurchaseReturnTemplateUrl = $scope.bulkPurchaseReturnWithIdUrl;

            $http({
                method: 'GET',
                url: tempDownloadPurchaseReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Purchase_Return_Bulk_Upload_Template_With_OrderID.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
                $scope.notify(data.errorMessage);
            });
        }
        if (flag == false) {

            var tempDownloadSaleReturnTemplateUrl = $scope.bulkPurchaseReturnWithoutIdUrl;

            $http({
                method: 'GET',
                url: tempDownloadSaleReturnTemplateUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }).success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Purchase_Return_Bulk_Upload_TemplateWithout_OrderID.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
                console.log(data);
                $scope.notify(data.errorMessage);
            });
        }
    };

    $scope.menubar = $localStorage.menu;
    $scope.mastersAccess = {};
    $scope.skuAccess = {};
    $scope.inventoryAccess = {};
    $scope.stockTransferAccess = {};
    $scope.customerAccess = {};
    $scope.vendorAccess = {};
    $scope.saleOrderAccess = {};
    $scope.poAccess = {};
    $scope.saleReturnAccess = {};
    $scope.vendorsAccess = {};
    $scope.purchaseReturnAccess = {};
    $scope.returnableGoodsAccess = {};

    $scope.checkAccess = function (page) {
        $scope.skuAccess = $scope.getSubMenuAccess('Masters', 'SKU');
        $scope.inventoryAccess = $scope.getMenuAccess('Inventory');
        $scope.stockTransferAccess = $scope.getMenuAccess('Stock Transfer');
        $scope.customerAccess = $scope.getSubMenuAccess('Masters', 'Customers');
        $scope.vendorAccess = $scope.getSubMenuAccess('Masters', 'Vendors');
        $scope.saleOrderAccess = $scope.getSubMenuAccess('Orders', 'Sale Order');
        $scope.poAccess = $scope.getMenuAccess('PO');
        $scope.saleReturnAccess = $scope.getSubMenuAccess('Orders', 'Sale Return')
        $scope.purchaseReturnAccess = $scope.getSubMenuAccess('Orders', 'Purchase Return');
        $scope.returnableGoodsAccess = $scope.getSubMenuAccess('Orders', 'Returnable Goods');

        if ($scope.customerAccess != null && $scope.vendorAccess != null) {
            if ($scope.customerAccess.createAccess == true && $scope.vendorAccess.createAccess == true) {
                $scope.mastersAccess = $scope.customerAccess;
            }
        }

        if ($cookies.get('BulkUploadData')) {
            $scope.defaultState = $cookies.get('BulkUploadData');
            $scope.activeTab = $cookies.get('ActiveTab');
            if ($rootScope.growlmessage) {
                $rootScope.growlmessage.destroy();
            }
        }
        else {
            if ($scope.mastersAccess.readAccess) {
                $scope.defaultState = "master";
                $scope.activeTab = "master";
                /*  $cookies.put('BulkUploadData','master');
                 $cookies.put('ActiveTab','Masters');*/
            }
            else if ($scope.skuAccess.readAccess) {
                $scope.defaultState = "sku";
                $scope.activeTab = "sku";
                /* $cookies.put('BulkUploadData','sku');
                 $cookies.put('ActiveTab','SKU');*/
            }
            else if ($scope.inventoryAccess.readAccess) {
                $scope.defaultState = "inventory";
                $scope.activeTab = "inventory";
                /*$cookies.put('BulkUploadData','inventory');
                 $cookies.put('ActiveTab','Inventory');*/
            }
            else if ($scope.stockTransferAccess.readAccess) {
                $scope.defaultState = "stocktransfer";
                $scope.activeTab = "Stocktransfer";
                /* $cookies.put('BulkUploadData','stocktransfer');
                 $cookies.put('ActiveTab','Stocktransfer');*/
            }
            else if ($scope.customerAccess.readAccess) {
                $scope.defaultState = "customer";
                $scope.activeTab = "customer";
                /* $cookies.put('BulkUploadData','customer');
                 $cookies.put('ActiveTab','Customers');*/
            }
            else if ($scope.vendorAccess.readAccess) {
                $scope.defaultState = "vendor";
                $scope.activeTab = "vendor";
                /*$cookies.put('BulkUploadData','vendor');
                 $cookies.put('ActiveTab','Vendors');*/
            }
            else if ($scope.saleOrderAccess.readAccess) {
                $scope.defaultState = "orders";
                $scope.activeTab = "orders";
                /* $cookies.put('BulkUploadData','orders');
                 $cookies.put('ActiveTab','Orders');*/
            }
            else if ($scope.poAccess.readAccess) {
                $scope.defaultState = "po";
                $scope.activeTab = "po";
                /*$cookies.put('BulkUploadData','po');
                 $cookies.put('ActiveTab','PO');*/
            }
            else if ($scope.saleReturnAccess.readAccess) {
                $scope.defaultState = "salereturn";
                $scope.activeTab = "salereturn";
                /* $cookies.put('BulkUploadData','salereturn');
                 $cookies.put('ActiveTab','Salereturn');*/
            }
            else if ($scope.purchaseReturnAccess.readAccess) {
                $scope.defaultState = "purchasereturnwithid";
                $scope.activeTab = "purchasereturnwithid";
                /* $cookies.put('BulkUploadData','purchasereturnwithid');
                 $cookies.put('ActiveTab','Purchase Return With ID');*/
            }
            else if ($scope.returnableGoodsAccess.readAccess) {
                $scope.defaultState = "returnablegoodsorder";
                $scope.activeTab = "returnablegoodsorder";
                /* $cookies.put('BulkUploadData','purchasereturnwithid');
                 $cookies.put('ActiveTab','Purchase Return With ID');*/
            }
        }

    }

    $scope.getMenuAccess = function (menu) {
        var response = {};
        angular.forEach($scope.menubar, function (value) {
            if (value.name == menu) {
                response = value;
            }
        });
        return response;
    }

    $scope.getSubMenuAccess = function (menu, submenu) {
        var response = {};
        angular.forEach($scope.menubar, function (value) {
            if (value.name == menu) {
                angular.forEach(value.subMenu, function (sub) {
                    if (sub.name == submenu) {
                        response = sub;
                    }
                });
            }
        });
        return response;
    }

    $scope.activeTab = 'master';

    $scope.hasUploadAccess = function () {

        var activeTab = $scope.activeTab;

        if (activeTab == 'master') {
            return $scope.mastersAccess.createAccess;
        }
        else if (activeTab == 'sku' || activeTab == 'skusaleschannelmap') {
            return $scope.skuAccess.createAccess;
        }
        else if (activeTab == 'inventory') {
            return $scope.inventoryAccess.createAccess;
        }
        else if (activeTab == 'stocktransfer') {
            return $scope.stockTransferAccess.createAccess;
        }
        else if (activeTab == 'customer') {
            return $scope.customerAccess.createAccess;
        }
        else if (activeTab == 'vendor') {
            return $scope.vendorAccess.createAccess;
        }
        else if (activeTab == 'orders' || activeTab == 'cancelsaleorders') {
            return $scope.saleOrderAccess.createAccess;
        }
        else if (activeTab == 'po') {
            return $scope.poAccess.createAccess;
        }
        else if (activeTab == 'salereturn' || activeTab == 'salereturnwithoutorderid') {
            return $scope.saleReturnAccess.createAccess;
        }
        else if (activeTab == 'purchasereturnwithid' || activeTab == 'purchasereturnwitoutid') {
            return $scope.purchaseReturnAccess.createAccess;
        }
        else if (activeTab == 'returnablegoodsorder') {
            return $scope.returnableGoodsAccess.createAccess;
        }
        else if (activeTab == 'vendorskumap') {
            return $scope.vendorAccess.createAccess;
        }
    }


    $scope.setSelectedEntity = function (entity, flag) {
        //$scope.loadBulkReporting(entity);
        $scope.activeTab = $scope.genericData.selectedEntity;
    }

    $scope.setSelectedState = function (entity) {

        $scope.loadBulkReporting(entity, 0, 5).then(function (data) {
            $scope.allreport = data;
        });
    }

    $scope.changePage = function (entity, start, pagesize, currentpage) {
        $scope.pageshow = currentpage>3?currentpage-2:0;
        $scope.currentPage = currentpage;
        $scope.userSize = pagesize;
        $scope.start = start;
        $scope.loadBulkReporting(entity, start, pagesize, 'yes').then(function (data) {
            $scope.allreport = data;
        });
    }

    $scope.downloadCustomerBulkUploadTemplate = function () {

        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/bulkuploadtemplate";

        $http({
            method: 'GET',
            url: orderListUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'

        })
            .success(function (data, status) {
                console.log(data);
                if (status == '204') {
                    $scope.notify("There is some error in downloading template. Please try after some time.");
                } else {
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Glaucus_Customer_Bulk_Upload_Template.xls";
                    document.body.appendChild(a);
                    a.click();

                }
                ;

            }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(data.errorMessage);
            }
            else {
                $scope.notify("There is some error in downloading template. Please try after some time.");
            }

        });

    }
    //$scope.genericData.selectedState = "orders";


    $scope.rateListDataObject = {};
    $scope.showUploadRatesDialog = function (event) {
        $("#uploadRatesDialog").modal("show");
    }


    $scope.uploadBulkRatesFile = function(bulkRatesUploadfile) {
        console.log(bulkRatesUploadfile);
        file = bulkRatesUploadfile;
        console.log(file);
        console.log(file.name);
        $scope.fileName = file.name;
    };

    $scope.ratesTemplateDownload = function () {

        $http({
            method: 'GET',
            url: $scope.downloadRatesTemplateUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        })
            .success(function (data) {
                console.log(data);
                var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "Glaucus_Rates_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function (data) {
            console.log(data);
        });

    };

    $scope.uploadTab = true;
    $scope.downloadTab = false;

    $scope.BulkUploadMode = function() {
        $scope.uploadTab = true;
        $scope.downloadTab = false;
    }

    $scope.BulkDownloadMode = function() {
        $scope.uploadTab = false;
        $scope.downloadTab = true;
    }


    $scope.processRatesBulkUpload = function (form, data) {

        file = data.bulkRatesUploadfile;
        $scope.disableBulkUpload = true;
        $scope.uploadProgress = null;
        $scope.notify("Upload is being processed in the background");
        if (!file.$error) {
            var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/fixedpricerule/ratesbulkupload';

            var fd = new FormData();
            fd.append('uploadFile', file);
            fd.append('name', data.rateListName);
            fd.append('description', data.rateListDescription);

            var upload = Upload.http({
                url: uploadUrl,
                method: 'POST',
                data: fd,
                headers: {
                    'Content-Type': undefined
                }
            });
            upload.then(function(resp) {
                $cookies.put('BulkUploadData','rates');
                $cookies.put('ActiveTab','rates');
                $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                file = null;
                $scope.cancelRatesUploadDialog(form);
                $scope.disableBulkUpload = false;
            }, function(resp) {
                $scope.uploadedFile={};
                file = null;
                $scope.notify(resp.data.errorMessage);
                $scope.disableBulkUpload = false;
            }, function(evt) {
                $scope.uploadProgress = 'progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name;
                console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + file.name);
            });
        }

    }

    $scope.cancelRatesUploadDialog = function(form, data) {
        // $scope.$broadcast("angucomplete-alt:clearInput", "products");
        // $scope.selectedSku = {};
        $scope.rateListDataObject.rateListName = null;
        $scope.rateListDataObject.rateListDescription = null;
        $scope.fileName = null;
        if(form){
            form.$setPristine();
            form.$setUntouched();
        }
        $('#uploadRatesDialog').modal('hide');
    };
}]);