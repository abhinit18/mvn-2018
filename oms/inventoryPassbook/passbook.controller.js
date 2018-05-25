angular.module('OMSApp.inventoryPassbook', []).config(function config($stateProvider) {
    $stateProvider.state('/inventorypassbook', {
        name: '/inventorypassbook',
        url: '/inventorypassbook',
        views: {
            "main": {
                controller: 'inventoryPassbookController',
                templateUrl: 'inventoryPassbook/passbook.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'inventoryPassbook'}
    })

}).controller('inventoryPassbookController',['$rootScope' ,'$scope' ,'$http', '$location', '$filter', 'MavenAppConfig', '$mdDialog', '$sce', '$window', 'Upload', 'pagerService', '$q', '$cookies','$timeout','$controller', 'mastersService',

function inventoryPassbookController($rootScope ,$scope, $http, $location, $filter, MavenAppConfig, $mdDialog,$sce, $window, Upload, pagerService, $q,  $cookies, $timeout, $controller,  mastersService) {

    $scope.inventoryPassbookResponse = {};

    $scope.skuTransactionDetails = [];

    $scope.inventorySnap = {};

    $scope.skuInventories = [];

    $scope.filter = {};

    $scope.appliedfilter = {};

    $scope.transactiontype = null;

    $scope.inventorydate = null;

    $scope.pagestart = 0;

    $scope.pagesize = 30;

    $scope.totalInventories = 0;

    $scope.showinventories = false;

    $scope.genericData = {};

    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';

    $scope.startmaxdate = new Date();
    $scope.endmaxdate = new Date();

    $scope.onLoad=function() {
        $scope.categoryTypeArray();
        $scope.listOfWareHouses();
    };

    $scope.getInventoryPassbook = function(page){
        var urlparam = $scope.getUrlParamForInventoryPassbook();
        var vm = this;
        vm.dummyItems = _.range(0, $scope.totalInventories); // dummy array of items to be paged
        vm.pager = {};
        function setPage(page) {
            if (page < 1 || page > vm.pager.totalPages) {
                return;
            }
            // get pager object from service
            vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.pagesize);
            console.log(vm.pager);
            $scope.vmPager = vm.pager;
            $scope.pagestart = (vm.pager.currentPage - 1) * $scope.pagesize;
            $scope.inventorySize = $scope.pagestart + $scope.pagesize;
            // get current page of items
            vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
            $scope.vmItems = vm.items;
            var inventoryPassbookUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuinventorysnap?direction=desc&" + urlparam + "&start="+$scope.pagestart
                +"&size="+$scope.pagesize;
            $http.get(inventoryPassbookUrl).success(function(data) {
                $scope.inventoryPassbookResponse = data;
            }).error(function(error, status) {
                if(status == 400){
                   $scope.notify(error.errorMessage);
                }
                else{
                   $scope.notify("Failed to load inventory passbook details");
                }
            });
        }

        if (page == undefined) {
            setPage(1);
        }

        if (page != undefined) {
            setPage(page);
        }

    }

    $scope.getUrlParamForInventoryPassbook = function(){
        var urlparam = "";
        if($scope.appliedfilter.category){
            urlparam += "category="+$scope.appliedfilter.category;
        }
        if($scope.appliedfilter.startdate){
            urlparam += "&startdate="+moment.utc($scope.appliedfilter.startdate).format();
        }
        if($scope.appliedfilter.enddate){
            urlparam += "&enddate=" +moment.utc($scope.appliedfilter.enddate).format();
        }
        if($scope.appliedfilter.skuid){
            urlparam += "&skuid="+ $scope.appliedfilter.skuid;
        }
        if($scope.appliedfilter.warehouseid){
            urlparam += "&warehouseid="+ $scope.appliedfilter.warehouseid;
        }


        return urlparam;
    }

    $scope.getInventoryPassbookCount = function(page) {
        $scope.appliedfilter = $scope.filter;
        var urlparam = $scope.getUrlParamForInventoryPassbook();
        var inventoryPassbookCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuinventorysnap/filtercount?" + urlparam;
        $http.get(inventoryPassbookCountUrl).success(function(data) {
            if(data == null || data == 0){
                $scope.showinventories = false;
               $scope.notify("No Inventory Passbook Record");
                return;
            }
            $scope.totalInventories = data;
            $scope.showinventories = true;
            $scope.getInventoryPassbook(page);
        });
    }

    $scope.getSkuInventories = function(transactiontype,date) {
        var urlparam = $scope.getUrlParamForInventoryPassbook();
        $scope.transactiontype = transactiontype;

        $scope.inventorydate = date;

        var skuDetailsUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuinventorysnap/transactiondetails?transactiontype="+transactiontype
            +"&snapdate="+date +"&"+ urlparam;
        $http.get(skuDetailsUrl).success(function(data) {
            $scope.skuInventories = data;
            $("#ViewPassbook").modal('show');
        }).error(function(error, status) {
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to load sku details");
            }
        });
    }


    $scope.getSkuTransactionDetails = function(skuid,index) {
        var urlparam = $scope.getUrlParamForInventoryPassbook();
        $scope.skuTransactionDetails = {};
        var toolTipVariation = '#tool-tip-SkuInventory-Count'+index;
        $(toolTipVariation).css('visibility','visible');
        var skuTransactionDetailsUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuinventorysnap/skutransactiondetails?transactiontype="+$scope.transactiontype
            +"&snapdate="+$scope.inventorydate +"&skuid=" + skuid+ "&"+urlparam;
        $http({
            method: 'GET',
            url:skuTransactionDetailsUrl ,
            cache:true
        }).success(function(data) {
            $scope.skuTransactionDetails = data;
        }).error(function(error, status) {
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to load sku transactions");
            }
        });
    }
    $scope.hidePopover = function(index){
        var toolTipVariation = '#tool-tip-Inventory-Count'+index;
        $(toolTipVariation).css('visibility','hidden');
    };
    $scope.getInventorySnapBalanace = function(date,index) {

        var urlparam = "",toolTipVariation = '#tool-tip-Inventory-Count'+index;

        if($scope.appliedfilter.category){
            urlparam += "&category="+$scope.appliedfilter.category;
        }
        if($scope.appliedfilter.skuid){
            urlparam += "&skuid="+ $scope.appliedfilter.skuid;
        }
        if($scope.appliedfilter.warehouseid){
            urlparam += "&warehouseid="+ $scope.appliedfilter.warehouseid;
        }

        var inventorySnapBalanaceUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuinventorysnap/inventorysnapshot?snapdate="+date
            + urlparam;
        $http({
            method: 'GET',
            url:inventorySnapBalanaceUrl ,
            cache:true
        }).success(function(data) {
            $scope.inventorySnap = data;

            $(toolTipVariation).css('visibility','visible');

        }).error(function(error, status) {
            if(status == 400){
               $scope.notify(error.errorMessage);
            }
            else{
               $scope.notify("Failed to load balance");
            }
        });
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

        mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data) {
            $scope.genericData.skusListFiltered = data;
            $timeout(function() {
                $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
            }, 500);
        });

        $scope.genericData.check = check;

        if(check == true){
            $mdDialog.hide({
                templateUrl: 'addPodialog.tmpl.html'
            });
            console.log($scope.singleorderData);
        }

    };

    $scope.searchedProductForFilter = function(selected) {
        if (selected != undefined && selected != null) {
            $scope.filter.skuid = selected.originalObject.idtableSkuId;
        }
        else{
            $scope.filter.skuid = undefined;
        }
    }

    $scope.categoryTypeArray = function() {
        var categoryTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode?selected=true";
        $http.get(categoryTypeUrl).success(function(data) {
            $scope.categoryTypeLists = data;
        }).error(function(error, status) {

        });
    };

    $scope.listOfWareHouses = function() {
        $scope.wareHousesData = [];
        var wareHousesListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/warehouses?size=-1&option=to";
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

 $scope.clearStartDate = function() {
        $scope.filter.startdate = null;
        $scope.startmaxdate = new Date($scope.filter.enddate);
        $scope.endmindate = null;
        $scope.startmindate = null;
        $scope.endmaxdate = new Date();
    }

    $scope.clearEndDate = function() {
        $scope.filter.enddate = null;
        $scope.startmaxdate = new Date();
        $scope.endmindate = new Date($scope.filter.startdate);
        $scope.startmindate = null;
        $scope.endmaxdate = new Date();
    }

    $scope.sendStartDate = function(date)
    {
        $scope.startDateData = new Date(date);
        $scope.endmindate = new Date(
            $scope.startDateData.getFullYear(),
            $scope.startDateData.getMonth(),
            $scope.startDateData.getDate());
    }

    $scope.sendEndDate = function(date)
    {
        console.log(date);
        $scope.endDateData = new Date(date);
        $scope.startmaxdate = new Date(
            $scope.endDateData.getFullYear(),
            $scope.endDateData.getMonth(),
            $scope.endDateData.getDate());
    }

    $scope.CancelViewPassbook = function(){
        $("#ViewPassbook").modal('hide');
    }
    $scope.cancelmastersDialog = function(ev){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');
    };
    $scope.SkuInventoryPopOverHide = function(index){
        var SkuInventoryCount = "#tool-tip-SkuInventory-Count"+index;
        $(SkuInventoryCount).css('visibility','hidden');
    };

    $scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            if($scope.genericData.check == false){
                $scope.$broadcast("angucomplete-alt:changeInput", "productsfilter", data);
            }else{
                $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
            }

        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog(ev);


    }

    $scope.clearAction = function() {
        $scope.filter = {};
        $scope.appliedfilter = {};
        $scope.filter.skuid = null;
        $scope.$broadcast('angucomplete-alt:clearInput', 'productsfilter');
        $scope.$broadcast('angucomplete-alt:clearInput', 'products');
        $scope.$broadcast('angucomplete-alt:clearInput', 'customersfilter');
        $scope.showinventories = false;
    }

    $scope.openTransaction = function(orderid) {
        $cookies.put('orderid',orderid);
        var path = $window.location.pathname;
        if($scope.transactiontype == 'Sale Order')
        {
            $window.open(path + '#/order/', '_blank');
        }
        else if($scope.transactiontype == 'Stock Transfer In' || $scope.transactiontype == 'Stock Transfer Out'){
            $window.open(path+'#/stocktransfer/', '_blank');
        }
        else if($scope.transactiontype == 'PO'){
            $window.open(path+'#/po/', '_blank');
        }
        else if($scope.transactiontype == 'Sale Return'){
            $window.open(path+'#/salereturn/', '_blank');
        }
        else if($scope.transactiontype == 'Purchase Return'){
            $window.open(path+'#/purchaseReturn/', '_blank');
        }
        else if($scope.transactiontype == 'Returnable Goods Order In' || $scope.transactiontype == 'Returnable Goods Order Out'){
            $window.open(path+'#/returnableGoodsOrder/', '_blank');
        }

    }

    $scope.hoverIn = function(index){
        var toolTipVariation = '#tool-tip-SkuInventory-goodbadCount'+index;
        $(toolTipVariation).css('visibility','visible');
    };

    $scope.hoverOut = function(index){
        var toolTipVariation = '#tool-tip-SkuInventory-goodbadCount'+index;
        $(toolTipVariation).css('visibility','hidden');
    };

    $scope.$on('$destroy', function () {
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

    $scope.inventoryExport = function(){
        $scope.appliedfilter = $scope.filter;
        var urlparam = $scope.getUrlParamForInventoryPassbook();
        $http({
            method: 'GET',
            url: MavenAppConfig.baseUrlSource + "/omsservices/webapi/skuinventorysnap/export?"+urlparam,
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
                a.download = "Inventory_passbook.xls";
                document.body.appendChild(a);
                a.click();
            }).error(function(data){
            console.log(data);
        });
    };

}]);

