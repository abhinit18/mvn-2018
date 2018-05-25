angular.module('OMSApp.taxation',[]).config(function config($stateProvider) {
    $stateProvider.state('/taxation/', {
        name: '/taxation/',
        url: '/taxation/',
        views: {
            "main": {
                controller: 'taxationCtrl',
                templateUrl: 'taxation/taxation.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'taxation'}
    })

}).controller('taxationCtrl', ['$scope', '$http', '$location', 'MavenAppConfig', '$mdDialog','$sce', '$window', 'Upload', 'pagerService', '$q', '$cookies','$timeout', 'mastersService',

function taxationController($scope, $http, $location, MavenAppConfig, $mdDialog,$sce, $window, Upload, pagerService, $q, $cookies,$timeout, mastersService) {

    $scope.categorySearchUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/search?search=";
    $scope.skuSearchUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skus/search?search=";
    $scope.entitySearchUrl = $scope.categorySearchUrl;
    $scope.angucompleteTitleField = "skuNodePathNameFormatted";
    $scope.ScopeTypeRule = 'HSN';
    $scope.taxData = {"tableTaxClassTaxType":"GST"};
    $scope.countryTaxClasses = [];
    $scope.stateTaxClasses = [];
    $scope.taxClasses = [];
    $scope.addModalMode = 'add';
    $scope.taxRule = {};
    $scope.selectedTaxClass = "";
    $scope.taxRule.tableTaxRuleClassMaps = [];
    $scope.allTaxClassSizeStart = 0;
    $scope.recordsPerPage = [5,10,15];
    $scope.allTaxClassPageSize = $scope.recordsPerPage[0];
    $scope.taxClassTabValue = 'gst';

    $scope.gstTaxRates = [];

    $scope.setActiveEntity = function (activeEntity) {
        console.log(activeEntity);
        $scope.clickedEntity = activeEntity;
    };

    $scope.isActive = function(clickedEntity)
    {
        /*if($scope.taxTabMode == 'category' && clickedEntity.idskuNodeId) {
            if ($scope.clickedEntity.tableSkuNode.idskuNodeId == clickedEntity.idskuNodeId) {
                return true;
            }
        }
        if($scope.taxTabMode == 'sku' && clickedEntity.idtableSkuId) {
            if ($scope.clickedEntity.tableSku.idtableSkuId == clickedEntity.idtableSkuId) {
                return true;
            }
        }
        if($scope.taxTabMode == 'hsn' && clickedEntity.idtableHsnId) {
            if ($scope.clickedEntity.tableHsn.idtableHsnId == clickedEntity.idtableHsnId) {
                return true;
            }
        }
        if($scope.taxTabMode == 'service' && clickedEntity.idtableGrossTaxTypeId) {
            if ($scope.clickedEntity.tableGrossTaxType.idtableGrossTaxTypeId == clickedEntity.idtableGrossTaxTypeId) {
                return true;
            }
        }*/
        return false;
    };
    $scope.genericData = {};

    $scope.getGstSlabs = function () {
if($scope.clientprofile.tableGstType!=null )
{
        var gstSlabsURL =MavenAppConfig.baseUrlSource +"/omsservices/webapi/gsttypes/" + $scope.clientprofile.tableGstType.idtableGstTypeId  + "/gstslab";

        $http.get(gstSlabsURL).success(function(data)
        {
            $scope.gstTaxRates = data;
        }).error(function(error, status) {
            if(status == 400){
              $scope.notify(error.errorMessage);
            }
            else{
              $scope.notify("Failed to get GST slabs")
            }
            console.log(error);

        });
}
    }

    $scope.getClientProfile = function(){
        var clientProfileUrl =MavenAppConfig.baseUrlSource +"/omsservices/webapi/clientprofiles/1"
        $http.get(clientProfileUrl).success(function(data)
        {
            $scope.clientprofile = data;
            $scope.getGstSlabs();
            $scope.getTaxType();

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

    $scope.getClientProfile();

    $scope.sendSearchUrl = function(data)
    {
        console.log(data);
        $scope.ScopeTypeRule = data;
        $scope.taxRule.tableTaxRuleClassMaps = [];
        $scope.genericData.selectedTaxClass = null;
        if(data == 'Category')
        {
            $scope.entitySearchUrl = $scope.categorySearchUrl;
            $scope.angucompleteTitleField = "skuNodePathNameFormatted";
            $scope.searchedSKU = null;
            $scope.taxRule.tableSku = null;
        }
        if(data == 'SKU')
        {
            $scope.angucompleteTitleField = "tableSkuName";
            $scope.entitySearchUrl = $scope.skuSearchUrl;
            $scope.taxRule.tableSkuNode = null;
            $scope.searchedCategory = null;

        }
    };

    $scope.searchedEntitySelected = function (selected) {
        console.log(selected);
        if($scope.ScopeTypeRule == 'Category' && selected != null)
        {
            $scope.searchedCategory = selected.originalObject;
            $scope.taxRule.tableSkuNode = selected.originalObject;
            $scope.searchedSKU = null;
            $scope.taxRule.tableSku = null;
        }

        if($scope.ScopeTypeRule == 'SKU' && selected != null)
        {
            $scope.searchedSKU = selected.originalObject;
            $scope.taxRule.tableSku = selected.originalObject;
            $scope.taxRule.tableSkuNode = null;
            $scope.searchedCategory = null;
        }
    };
    
    $scope.addTaxClassToTaxRule = function (selectedTaxClass) {
        console.log(selectedTaxClass);
        if(selectedTaxClass == "" || selectedTaxClass == undefined || selectedTaxClass == null){
          $scope.notify('Please select tax class name.');
            return false;
        }
        else
        {
            $scope.genericData.selectedTaxClass = selectedTaxClass;
            if ($scope.taxRule.tableTaxRuleClassMaps.filter(function(e) { return e.tableTaxClass == $scope.genericData.selectedTaxClass; }).length > 0) {
              $scope.notify('Tax class already selected');
                return;
            }
            if(!$scope.genericData.tableTaxRuleClassMapMinValue)
            {
                $scope.genericData.tableTaxRuleClassMapMinValue = 0.0;
            }
            $scope.taxRule.tableTaxRuleClassMaps.push(
                { 'tableTaxClass' : $scope.genericData.selectedTaxClass,
                    'tableTaxRuleClassMapMinValue' : $scope.genericData.tableTaxRuleClassMapMinValue
                }
            )
            $scope.genericData.tableTaxRuleClassMapMinValue = null;
        }
    };
    $scope.removeTaxClassFromTaxRule = function(index) {
        $scope.genericData.deleteItemIndex = index;
        $('#masterDeleteDialogue').modal('show');
    };
    var removeTaxRuleData;
    $scope.removeTaxClassFromExistingTaxRuleConfirmation = function(data){
        $('#masterDeleteDialogue').modal('show');
        removeTaxRuleData = data;
    };
    $scope.deleteSelectedItem = function(){
        if($scope.deleteDialogBoxforListedRules == false){
            $scope.taxRule.tableTaxRuleClassMaps.splice($scope.genericData.deleteItemIndex, 1);
        }else{
         $scope.removeTaxClassFromExistingTaxRule(removeTaxRuleData);
        }
        $scope.cancelmasterDeleteDialog();
      $scope.notify('Item deleted successfully.');
    };
    $scope.cancelmasterDeleteDialog = function(){
        $('#masterDeleteDialogue').modal('hide');
    };

    $scope.showAddTaxClassModal = function(){
        $scope.taxData = {};
        $scope.genericData.disableButton = false;
        $scope.addModalMode = 'add';
        $('#addNewTaxClass').modal('show');
    };



    $scope.showEditTaxClassModal = function (taxClass) {
        console.log(taxClass);
        $scope.genericData.disableButton = false;
        $scope.addModalMode = 'edit';
        $scope.taxData = angular.copy(taxClass);
        $('#addNewTaxClass').modal('show');
    }

    $scope.cancelTaxClassModal = function(form){
        $scope.taxData = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addNewTaxClass').modal('hide');
    };


    //CountryScopeTabMode Tab Mode
    $scope.CountryScopeTabMode = function() {
        $scope.taxClassTabValue = 'country';
        $scope.listOfTaxCount(1);
    };

    //StateScopeTabMode Tab Mode
    $scope.StateScopeTabMode = function() {
        $scope.taxClassTabValue = 'state';
        $scope.listOfTaxCount(1);
    };

    //GstScopeTabMode Tab Mode
    $scope.GstScopeTabMode = function() {
        $scope.taxClassTabValue = 'gst';
        $scope.listOfTaxCount(1);
    };

    //CategoryScopeTabMode Tab Mode
    $scope.taxTabMode = 'hsn';
    $scope.HsnScopeTabMode = function() {
        $scope.clickedEntity = null;
        $scope.taxTabMode = 'hsn';
        $scope.ScopeTypeRule = "HSN";
    };

    $scope.CategoryScopeTabMode = function() {
        $scope.clickedEntity = null;
        $scope.taxTabMode = 'category';
        $scope.ScopeTypeRule = "Category";
        $scope.entitySearchUrl = $scope.categorySearchUrl;
    };

    //SkuScopeTabMode Tab Mode
    $scope.SkuScopeTabMode = function() {
        $scope.clickedEntity = null;
        $scope.taxTabMode = 'sku';
        $scope.ScopeTypeRule = "SKU";
        $scope.entitySearchUrl = $scope.skuSearchUrl;
        $scope.angucompleteTitleField = "tableSkuName";
    };

    $scope.serviceTaxMode = function() {
        $scope.clickedEntity = null;
        $scope.taxTabMode = 'service';
        $scope.ScopeTypeRule = "Service";
    };

    $scope.deleteDialogBoxforListedRules = true;
    $scope.ShowAddNewTaxRule = function(){
        $scope.genericData.disableButton=false;
        $scope.genericData.tableTaxRuleClassMapMinValue = 0.0;
        $scope.deleteDialogBoxforListedRules = false;
        $scope.getTaxClasses();
        $scope.taxRule = {};
        $scope.taxRule.tableTaxRuleClassMaps = [];
        $scope.taxRule.tableTaxRuleCascadeClass = false;
        // $mdDialog.show({
        //     templateUrl: 'addNewTaxRule.tmpl.html',
        //     parent: angular.element(document.body),
        //     clickOutsideToClose: false,
        //     scope: $scope.$new()
        // })
        $('#addNewTaxRule').modal('show');
    };

    $scope.cancelTaxRuleModal = function(form)
    {
        $scope.$broadcast("angucomplete-alt:clearInput", "products");
        $scope.genericData.selectedTaxClass = "";
        $scope.taxRule.tableTaxRuleClassMaps = [];
        $scope.taxRule.tableSkuNode = "";
        $scope.deleteDialogBoxforListedRules = true;
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addNewTaxRule').modal('hide');
    };

//    ============================================= get tax scope ======================================= //

    $scope.getTaxScope = function () {
        $scope.taxScopes = [];
        var taxScopeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass/gettaxscopes";
        $http.get(taxScopeUrl).success(function (data) {
            $scope.taxScopes = data;
            console.log($scope.taxScopes);
        }).error(function (error, status) {
            console.log(error);
            if (status == 400) {
              $scope.notify(error.errorMessage);
            }
            else {
              $scope.notify("Failed to get tax scopes");
            }
        });
    };
    $scope.getTaxScope();

    //========================================== get tax types ==================================== //

    $scope.getTaxType = function () {
        $scope.taxTypes = [];
        var taxTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass/gettaxtypes";
        $http.get(taxTypeUrl).success(function (data) {
            $scope.taxTypes = data;
            if($scope.clientprofile.tableGstType.idtableGstTypeId == 1 || $scope.clientprofile.tableGstType.idtableGstTypeId == 4)
            {
                for(var index = 0; index < $scope.taxTypes.length ; index++)
                {
                    if($scope.taxTypes[index] == 'GST')
                    {
                        $scope.taxTypes.splice(index,1);
                    }
                }
            }
            console.log($scope.taxTypes);
        }).error(function (error, status) {
            console.log(error);
            if (status == 400) {
              $scope.notify(error.errorMessage);
            }
            else {
              $scope.notify("Failed to get tax types");
            }
        });
    };

// ================================================ get states  =================================== //

    $scope.regionsStatesData = function() {
        var q = $q.defer();
        $scope.regionsStatesArray = [];
        var regionsStatesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states";
        $http.get(regionsStatesUrl).success(function(data) {
            console.log(data);
            $scope.regionsStatesArray = data;
            q.resolve(true);
            console.log($scope.regionsStatesArray);
        }).error(function(error, status) {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.regionsStatesData();

    //============================ validation for adding tax rule ========================= //

    $scope.validateTaxRuleFormData = function() {
        console.log($scope.ScopeTypeRule);
        if($scope.ScopeTypeRule == 'HSN' && $scope.taxRule.tableHsn.tableHsnCode == undefined)
        {
          $scope.notify('HSN is a mandatory');
            return false;
        }
        if($scope.ScopeTypeRule == 'Category' && $scope.taxRule.tableSkuNode == undefined)
        {
          $scope.notify('Category is a mandatory');
            return false;
        }
        if($scope.ScopeTypeRule == 'Category')
        {
            if(!$scope.taxRule.tableSkuNode.tableHsn) {
                $scope.notify('Define HSN at Category level. Error may occur if HSN is not found during invoice generation.','warning');
            }
        }
        if($scope.ScopeTypeRule == 'SKU' && $scope.searchedSKU == undefined)
        {
          $scope.notify('SKU is a mandatory');
            return false;
        }
        if($scope.ScopeTypeRule == 'SKU')
        {
            if(!$scope.searchedSKU.tableHsn && !$scope.searchedSKU.tableSkuNode.tableHsn) {
              $scope.notify('Define HSN either at SKU or Category level');
                return false;
            }
        }
        if($scope.ScopeTypeRule == 'Service' && $scope.taxRule.tableGrossTaxType == undefined)
        {
          $scope.notify('Service is a mandatory');
            return false;
        }
        if($scope.taxRule.tableTaxRuleClassMaps.length == 0){
          $scope.notify('Tax Class is a mandatory. At least one tax rule is required.');
            return false;
        }
        return true;

    };



    //======================add tax rule =======================//

    $scope.AddTaxRule = function (form) {

        if($scope.genericData.disableButton==true)
        {
            //a request is already in process
            return;
        }
        $scope.genericData.disableButton=true;

        console.log($scope.taxRule);
        if( $scope.validateTaxRuleFormData() == false )
        {
            $scope.genericData.disableButton=false;
            return;
        }
        else
        {
            var addTaxRuleUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxrule";

            $http({
                method: 'POST',
                url: addTaxRuleUrl,
                data: $scope.taxRule,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                if($scope.ScopeTypeRule == "HSN") {
                    $scope.getHsnTaxRules();
                    activaTab('taxTab1');
                    $scope.HsnScopeTabMode();
                }
                if($scope.ScopeTypeRule == "Category") {
                    $scope.getCategoryTaxRules();
                    activaTab('taxTab2');
                    $scope.CategoryScopeTabMode();
                }
                if($scope.ScopeTypeRule == "SKU") {
                    $scope.getSkuTaxRules();
                    activaTab('taxTab3');
                    $scope.SkuScopeTabMode();
                }
                if($scope.ScopeTypeRule == "Service") {
                    $scope.getServiceTaxRules();
                    activaTab('taxTab4');
                    $scope.serviceTaxMode();
                }
                $scope.cancelTaxRuleModal(form);
                $scope.notify('Tax rule added successfully !','success')
            }).error(function(error, status)
            {
                $scope.genericData.disableButton=false;
                if(status == 400)
                {
                  $scope.notify(error.errorMessage);
                }
                else
                {
                  $scope.notify("Failed to add Tax Rule");
                }

            });
        }
    };
    
    //======================add tax rule ends =================//

    //    =========================================== update tax rule ==================================== //
    $scope.updateTaxRule = function () {

        if($scope.genericData.disableButton == true)
        {
            return;
        }
        $scope.genericData.disableButton = true;

        console.log($scope.taxRule);
        var updateTaxRuleUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxrule";

        $http({
            method: 'PUT',
            url: updateTaxRuleUrl,
            data: $scope.taxRule,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            if($scope.ScopeTypeRule == "HSN") {
                $scope.hsnTaxRules.splice($scope.taxRule,1);
                $scope.hsnTaxRules.push(res);
            }
            if($scope.ScopeTypeRule == "Category") {
                $scope.categoryTaxRules.splice($scope.taxRule,1);
                $scope.categoryTaxRules.push(res);
            }
            if($scope.ScopeTypeRule == "SKU") {
                $scope.skuTaxRules.splice($scope.taxRule,1);
                $scope.skuTaxRules.push(res);
            }
            if($scope.ScopeTypeRule == "SKU") {
                $scope.serviceTaxRules.splice($scope.taxRule,1);
                $scope.serviceTaxRules.push(res);
            }
            $mdDialog.hide();
            $scope.notify('Tax rule updated successfully !','success')
        }).error(function(error, status) {
            $scope.genericData.disableButton = false;
            console.log(error);
            console.log(status);

        });
    }

    //===========get hsn wise rules =====================//
    $scope.getHsnTaxRules = function() {
        var q = $q.defer();
        $scope.hsnTaxRules = [];
        var getTaxRuleUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxrule/taxrulesforhsn";
        $http.get(getTaxRuleUrl).success(function(data) {
            console.log(data);
            $scope.hsnTaxRules = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };
    $scope.getHsnTaxRules();

    //===========get category wise rules =====================//
    $scope.getCategoryTaxRules = function() {
        var q = $q.defer();
        $scope.categoryTaxRules = [];
        var getTaxRuleUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxrule/taxrulesforcategory";
        $http.get(getTaxRuleUrl).success(function(data) {
            console.log(data);
            $scope.categoryTaxRules = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getCategoryTaxRules();

    //===========get sku wise rules =====================//
    $scope.getSkuTaxRules = function() {
        var q = $q.defer();
        $scope.skuTaxRules = [];
        var getTaxRuleUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxrule/taxrulesforsku";
        $http.get(getTaxRuleUrl).success(function(data) {
            console.log(data);
            $scope.skuTaxRules = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getSkuTaxRules();

    //===========get sku wise rules =====================//
    $scope.getServiceTaxRules = function() {
        var q = $q.defer();
        $scope.serviceTaxRules = [];
        var getTaxRuleUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxrule/taxrulesforservice";
        $http.get(getTaxRuleUrl).success(function(data) {
            console.log(data);
            $scope.serviceTaxRules = data;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getServiceTaxRules();

//    ========================================== Validation for adding tax class ===================== //

    $scope.validateTaxClassFormData = function(value){
        console.log(value);
        console.log($scope.taxData);

        if(value.tableTaxClassName == '' || value.tableTaxClassName == undefined)
            {
              $scope.notify('Tax Class Name is a mandatory');
                return false;
            }
            if(value.tableTaxClassTaxType != 'GST') {
                if (value.tableTaxClassScope == '' || value.tableTaxClassScope == undefined) {
                  $scope.notify('Tax scope is a mandatory');
                    return false;
                }
            }
            else
            {
                value.tableTaxClassScope = "Gst";
            }
            if(value.tableTaxClassScope == "State")
            {
                if(value.tableState == null || value.tableState == undefined){
                  $scope.notify('State is a mandatory.');
                    return false;
                }
                if(value.tableTaxClassTaxType=='Others')
                {
                    if (value.tableTaxClassTaxTypeOther == null || value.tableTaxClassTaxTypeOther == undefined) {
                      $scope.notify('Intrastate tax name is a mandatory.');
                        return false;
                    }
                }
                if(value.tableTaxClassTaxValue == '' || value.tableTaxClassTaxValue == null || value.tableTaxClassTaxValue == undefined){
                  $scope.notify('Intrastate tax value is a mandatory.');
                    return false;
                }
                else
                {
                    if(value.tableTaxClassTaxValue < 0.01 || value.tableTaxClassTaxValue > 100.00 )
                    {
                      $scope.notify('Intrastate tax percentage shall be between 0.01 to 100.00');
                        return false;
                    }

                }
                if(value.tableTaxClassSurcharge != '' && value.tableTaxClassSurcharge != null && value.tableTaxClassSurcharge != undefined)
                {
                    if(value.tableTaxClassSurcharge < 0.00 || value.tableTaxClassSurcharge > 100.00 )
                    {
                      $scope.notify('Intrastate tax surcharge percentage shall be between 0.00 to 100.00');
                        return false;
                    }
                }
                if(value.tableTaxClassInterstateTaxType=='Others')
                {
                    if (value.tableTaxClassInterstateTaxTypeOther == null || value.tableTaxClassInterstateTaxTypeOther == undefined) {
                      $scope.notify('Interstate tax type is a mandatory.');
                        return false;
                    }
                }
                if(value.tableTaxClassInterstateTaxValue == null || value.tableTaxClassInterstateTaxValue == undefined){
                  $scope.notify('Interstate tax value is a mandatory.');
                    return false;
                }
                else
                {
                    if(value.tableTaxClassInterstateTaxValue < 0.01 || value.tableTaxClassInterstateTaxValue > 100.00 )
                    {
                      $scope.notify('Interstate tax percentage shall be between 0.01 to 100.00');
                        return false;
                    }
                }

                if(value.tableTaxClassInterstateSurcharge != '' && value.tableTaxClassInterstateSurcharge != null && value.tableTaxClassInterstateSurcharge == undefined)
                {
                    if(value.tableTaxClassInterstateSurcharge < 0.00 || value.tableTaxClassInterstateSurcharge > 100.00 )
                    {
                      $scope.notify('Interstate surcharge percentage shall be between 0.00 to 100.00');
                        return false;
                    }
                }


            }
            if(value.tableTaxClassScope == 'Country')
            {
                if(value.tableTaxClassTaxType == "" || value.tableTaxClassTaxType == undefined){
                  $scope.notify('Tax Class Type is a mandatory.');
                    return false;
                }
                if(value.tableTaxClassTaxValue == "" || value.tableTaxClassTaxValue == undefined){
                  $scope.notify('Tax percentage is a mandatory.');
                    return false;
                }
                else
                {
                    if(value.tableTaxClassTaxValue < 0.01 || value.tableTaxClassTaxValue > 100.00 )
                    {
                      $scope.notify('Tax percentage shall be between 0.01 to 100.00');
                        return false;
                    }

                }

                if(value.tableTaxClassSurcharge != ''  && value.tableTaxClassSurcharge != null && value.tableTaxClassSurcharge != undefined)
                {
                    if(value.tableTaxClassSurcharge < 0.00 || value.tableTaxClassSurcharge > 100.00 )
                    {
                      $scope.notify('Tax surcharge percentage shall be between 0.00 to 100.00');
                        return false;
                    }

                }
            }
            return true;
    };

//    ================================= Category array type ================================== //4

    $scope.categoryTypeArray = function() {
        var categoryTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode?selected=true";
        $http.get(categoryTypeUrl).success(function(data) {
            $scope.categoryTypeLists = data;
        }).error(function(error, status) {

        });
    };

    $scope.categoryTypeArray();

    //    ================================= Category array type ================================== //4

    $scope.getServiceTypes = function() {
        var serviceTypeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/grosstaxtype";
        $http.get(serviceTypeUrl).success(function(data) {
            $scope.tableGrossTaxTypes = data;
        }).error(function(error, status) {

        });
    };

    $scope.getServiceTypes();

//    =========================================== add tax class ==================================== //
    $scope.setFormButtonValue = function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitAddOrderForm =  function (taxData,form) {

        //assigning 'GST' as a default value in tax type
        taxData.tableTaxClassTaxType =  "GST";

        if($scope.addModalMode == 'add' && $scope.submitActionButton == 'add'){
            $scope.AddTaxClass(taxData,form);
        }
        else if($scope.addModalMode == 'edit'  && $scope.submitActionButton == 'edit'){
            $scope.updateTaxClass(taxData,form);
        }
    }
    $scope.AddTaxClass = function(data,form){
        $scope.validateTaxClassInputValues(data).then(function (response) {

            if(response == true){
              $scope.notify("Tax Class Name already exists.");
                return;
            }

        if($scope.genericData.disableButton==true)
        {
            //a request is already in process
            return;
        }
        $scope.genericData.disableButton=true;

        if( $scope.validateTaxClassFormData(data) == false )
        {
            $scope.genericData.disableButton=false;
            return;
        }
        else
        {
            var addTaxClassUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass";
            $http({
                method: 'POST',
                url: addTaxClassUrl,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                $scope.taxData = {};
                $scope.listOfTaxCount(1);
                $scope.cancelTaxClassModal(form);
                $scope.genericData.disableButton=false;
                $scope.getTaxClasses();

                $scope.notify('Tax class added successfully !','success');
                if(data.tableTaxClassScope == 'Gst')
                {
                    activaTab("tab1");
                    $scope.GstScopeTabMode();
                }
                if(data.tableTaxClassScope == 'State')
                {
                    activaTab("tab2");
                    $scope.StateScopeTabMode();
                }
                if(data.tableTaxClassScope == 'Country')
                {
                    activaTab("tab3");
                    $scope.CountryScopeTabMode();
                }

            }).error(function(error, status) {
                $scope.genericData.disableButton=false;
                $scope.cancelTaxClassModal(form);
            });
        }
        });
    };

    //    =========================================== add tax class ==================================== //

    $scope.updateTaxClass = function(data,form)
    {
        if($scope.genericData.disableButton == true)
        {
            return;
        }
        $scope.genericData.disableButton = true;
        console.log(data);
        if( $scope.validateTaxClassFormData(data) == false )
        {
            $scope.genericData.disableButton=false;
            return;
        }
        else
        {
            var addTaxClassUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass/" + data.idtableTaxClassId;

            $http({
                method: 'PUT',
                url: addTaxClassUrl,
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                console.log("Watch out");
                $scope.listOfTaxCount(1);
                $scope.taxData = {};
                $scope.notify('Tax class updated successfully !','success')
                $scope.cancelTaxClassModal(form);
            }).error(function (error, status) {
                $scope.genericData.disableButton=false;
                $scope.cancelTaxClassModal(form);
            });
        }

    }


    $scope.onRecordsPerPageChange = function (orderSize) {
        $scope.taxClassStart = 0;
        $scope.allTaxClassPageSize = orderSize;
        $scope.taxClassEnd = 0;
        $scope.taxClasses = [];
        $scope.listOfTaxCount(1);
    }
    $scope.listOfTaxCount = function(page)
    {
        if($scope.taxClassTabValue == 'state') {
            $scope.stateCount = 0;
            var taxClassStateCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass/count?scope=State";
            console.log(taxClassStateCountUrl);
            $http.get(taxClassStateCountUrl).success(function(data) {
                $scope.stateCount = data;
                $scope.stateTaxClasses = [];
                $scope.showLoader = true;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.allTaxClassPageSize);

                    $scope.vmPager = vm.pager;

                    $scope.taxClassStart = (vm.pager.currentPage - 1) * $scope.allTaxClassPageSize;
                    $scope.taxClassbyScopeSize = $scope.taxClassStart + $scope.allTaxClassPageSize;


                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.getStateTaxClasses($scope.taxClassStart);
                }
                if (data != null) {

                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.stateCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;

                    if (page == undefined) {
                        vm.setPage(1);
                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }



                }
            }).error(function(error, status) {

            });
        }

        if($scope.taxClassTabValue == 'gst') {
            $scope.gstCount = 0;
            var taxClassStateCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass/count?scope=Gst";
            console.log(taxClassStateCountUrl);
            $http.get(taxClassStateCountUrl).success(function(data) {
                $scope.gstCount = data;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.allTaxClassPageSize);

                    $scope.vmPager = vm.pager;

                    $scope.taxClassStart = (vm.pager.currentPage - 1) * $scope.allTaxClassPageSize;
                    $scope.taxClassbyScopeSize = $scope.taxClassStart + $scope.allTaxClassPageSize;


                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.getGstTaxClasses($scope.taxClassStart);
                }
                $scope.gstTaxClasses = [];
                $scope.showLoader=true;
                if (data != null) {

                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.gstCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;

                    if (page == undefined) {
                        vm.setPage(1);
                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }



                }
            }).error(function(error, status) {

            });
        }

        if($scope.taxClassTabValue == 'country') {
            $scope.countryCount = 0;
            var taxClassCountryCountUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass/count?scope=Country";
            console.log(taxClassCountryCountUrl);
            $http.get(taxClassCountryCountUrl).success(function(data) {
                $scope.countryCount = data;
                $scope.countryTaxClasses = [];
                $scope.showLoader = true;
                function setPage(page) {
                    if (page < 1 || page > vm.pager.totalPages) {
                        return;
                    }

                    // get pager object from service
                    vm.pager = pagerService.GetPager(vm.dummyItems.length, page,$scope.allTaxClassPageSize);

                    $scope.vmPager = vm.pager;

                    $scope.taxClassStart = (vm.pager.currentPage - 1) * $scope.allTaxClassPageSize ;
                    $scope.taxClassbyScopeSize = $scope.taxClassStart + $scope.allTaxClassPageSize ;


                    // get current page of items
                    vm.items = vm.dummyItems.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
                    $scope.vmItems = vm.items;
                    $scope.getCountryTaxClasses($scope.taxClassStart);
                }
                if (data != null) {

                    var vm = this;

                    vm.dummyItems = _.range(0, $scope.countryCount); // dummy array of items to be paged
                    vm.pager = {};
                    vm.setPage = setPage;

                    if (page == undefined) {
                        vm.setPage(1);
                    }

                    if (page != undefined) {
                        vm.setPage(page);

                    }



                }
            }).error(function(error, status) {

            });
        }
    };

    $scope.listOfTaxCount(1);

    //===========get tax classes =====================//
    $scope.getGstTaxClasses = function(start) {
        var q = $q.defer();
        $scope.gstTaxClasses = [];
        var getTaxClassUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass?scope=Gst&start=" + start + "&size=" + $scope.allTaxClassPageSize;
        $http.get(getTaxClassUrl).success(function(data) {
            console.log(data);
            $scope.gstTaxClasses = data;
	    $scope.gstTaxClassEnd = $scope.gstTaxClassStart + data.length;
            $scope.showLoader = false;
            q.resolve(true);
        }).error(function(error, status)
        {
            $scope.showLoader = false;
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getGstTaxClasses($scope.allTaxClassSizeStart);


    //===========get tax classes =====================//
    $scope.getCountryTaxClasses = function(start) {
        var q = $q.defer();
        $scope.countryTaxClasses = [];
        var getTaxClassUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass?scope=Country&start=" + start + "&size=" + $scope.allTaxClassPageSize;
        $http.get(getTaxClassUrl).success(function(data) {
            console.log(data);
            $scope.countryTaxClasses = data;
	    $scope.countryTaxClassEnd = $scope.countryTaxClassStart + data.length;
            $scope.showLoader = false;
            q.resolve(true);
        }).error(function(error, status)
        {
            $scope.showLoader = false;
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getCountryTaxClasses($scope.allTaxClassSizeStart);

    //===========get state tax classes =====================//
    $scope.getStateTaxClasses = function(start) {
        var q = $q.defer();
        $scope.stateTaxClasses = [];
        var getTaxClassUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass?scope=State&start=" + start + "&size=" + $scope.allTaxClassPageSize;
        $http.get(getTaxClassUrl).success(function(data) {
            console.log(data);
            $scope.stateTaxClasses = data;
	    $scope.stateTaxClassEnd = $scope.stateTaxClassStart + data.length;
            $scope.showLoader = false;
	    q.resolve(true);
        }).error(function(error, status)
        {
            $scope.showLoader = false;
            q.reject(error);

        });
        return q.promise;
    };

    $scope.getStateTaxClasses($scope.allTaxClassSizeStart);

    //===========get tax classes =====================//
    $scope.getTaxClasses = function() {
        var q = $q.defer();
        $scope.taxClasses = [];
        var getTaxClassUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass";
        $http.get(getTaxClassUrl).success(function(data) {
            console.log(data);
            $scope.taxClasses = data;
            $scope.taxClassEnd = $scope.taxClassStart + data.length;
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            q.reject(error);

        });
        return q.promise;
    };

//    ======================================= add tax rule by type ================================ //

    $scope.showAddClassToExistingRuleDialog = function(){
        $scope.genericData.tableTaxRuleClassMapMinValue = 0.0
        $scope.getTaxClasses();
        $mdDialog.show({
            templateUrl: 'addClassToTaxRule.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false,
            scope: $scope.$new()
        })
    }
    $scope.closeAddClassToExistingRuleDialog = function(){
        $scope.genericData.selectedTaxClass=null;
        $mdDialog.hide();
    };

    //    ====================================== remove tax rules data ======================== //

    $scope.removeTaxClassFromExistingTaxRule  = function(data){
        console.log(data);

        var deleteURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxruleclassmap/" + data.idtableTaxRuleClassMapId;

        $http({
            method: 'DELETE',
            url: deleteURL,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {

            if($scope.ScopeTypeRule == 'HSN')
            {
                for (var entityCounter = 0; entityCounter < $scope.hsnTaxRules.length; entityCounter++) {
                    if ($scope.hsnTaxRules[entityCounter].idtableTaxRuleId == $scope.clickedEntity.idtableTaxRuleId) {
                        for (var mapCounter = 0; mapCounter < $scope.clickedEntity.tableTaxRuleClassMaps.length; mapCounter++) {
                            if ($scope.hsnTaxRules[entityCounter].tableTaxRuleClassMaps[mapCounter].idtableTaxRuleClassMapId == data.idtableTaxRuleClassMapId) {
                                $scope.hsnTaxRules[entityCounter].tableTaxRuleClassMaps.splice(mapCounter, 1);
                                break;
                            }
                        }
                        if ($scope.hsnTaxRules[entityCounter].tableTaxRuleClassMaps.length == 0) {

                            $scope.hsnTaxRules.splice(entityCounter, 1);
                            break;
                        }
                    }
                }
            }
            if($scope.ScopeTypeRule == 'Category')
            {
                for (var entityCounter = 0; entityCounter < $scope.categoryTaxRules.length; entityCounter++) {
                    if ($scope.categoryTaxRules[entityCounter].idtableTaxRuleId == $scope.clickedEntity.idtableTaxRuleId) {
                        for (var mapCounter = 0; mapCounter < $scope.clickedEntity.tableTaxRuleClassMaps.length; mapCounter++) {
                            if ($scope.categoryTaxRules[entityCounter].tableTaxRuleClassMaps[mapCounter].idtableTaxRuleClassMapId == data.idtableTaxRuleClassMapId) {
                                $scope.categoryTaxRules[entityCounter].tableTaxRuleClassMaps.splice(mapCounter, 1);
                                break;
                            }
                        }
                        if ($scope.categoryTaxRules[entityCounter].tableTaxRuleClassMaps.length == 0) {

                            $scope.categoryTaxRules.splice(entityCounter, 1);
                            break;
                        }
                    }
                }
            }
            if($scope.ScopeTypeRule == 'SKU')
            {
                for (var entityCounter = 0; entityCounter < $scope.skuTaxRules.length; entityCounter++) {
                    if ($scope.skuTaxRules[entityCounter].idtableTaxRuleId == $scope.clickedEntity.idtableTaxRuleId) {
                        for (var mapCounter = 0; mapCounter < $scope.clickedEntity.tableTaxRuleClassMaps.length; mapCounter++) {
                            if ($scope.skuTaxRules[entityCounter].tableTaxRuleClassMaps[mapCounter].idtableTaxRuleClassMapId == data.idtableTaxRuleClassMapId) {
                                $scope.skuTaxRules[entityCounter].tableTaxRuleClassMaps.splice(mapCounter, 1);
                                break;
                            }
                        }
                        if ($scope.skuTaxRules[entityCounter].tableTaxRuleClassMaps.length == 0) {

                            $scope.skuTaxRules.splice(entityCounter, 1);
                            break;
                        }
                    }
                }
            }
            if($scope.ScopeTypeRule == 'Service')
            {
                for (var entityCounter = 0; entityCounter < $scope.serviceTaxRules.length; entityCounter++) {
                    if ($scope.serviceTaxRules[entityCounter].idtableTaxRuleId == $scope.clickedEntity.idtableTaxRuleId) {
                        for (var mapCounter = 0; mapCounter < $scope.clickedEntity.tableTaxRuleClassMaps.length; mapCounter++) {
                            if ($scope.serviceTaxRules[entityCounter].tableTaxRuleClassMaps[mapCounter].idtableTaxRuleClassMapId == data.idtableTaxRuleClassMapId) {
                                $scope.serviceTaxRules[entityCounter].tableTaxRuleClassMaps.splice(mapCounter, 1);
                                break;
                            }
                        }
                        if ($scope.serviceTaxRules[entityCounter].tableTaxRuleClassMaps.length == 0) {

                            $scope.serviceTaxRules.splice(entityCounter, 1);
                            break;
                        }
                    }
                }
            }
            $mdDialog.hide();
            $scope.notify('Tax class deleted from this rule!','success')
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });

    }

    $scope.cancelAddClassToExistingTaxRule = function () {
        $scope.selectedTaxClass = null;
        $mdDialog.hide();
    }

    $scope.addTaxClassToExistingTaxRule = function (selectedTaxClass) {


        /*if($scope.genericData.disableButton == true)
        {
            return;
        }*/
        $scope.genericData.disableButton = true;

        console.log($scope.clickedEntity);
        console.log(selectedTaxClass);

        var addTaxClassToExistingRuleUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxrule/" + $scope.clickedEntity.idtableTaxRuleId + "/taxclass/" + selectedTaxClass.idtableTaxClassId + "?minval=" + $scope.genericData.tableTaxRuleClassMapMinValue ;

        $http({
            method: 'POST',
            url: addTaxClassToExistingRuleUrl,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.clickedEntity.tableTaxRuleClassMaps.push(res);
            $scope.closeAddClassToExistingRuleDialog();
            $scope.notify('Tax class added successfully !','success')
        }).error(function(error, status) {
            if(status == 400){
              $scope.notify(error.errorMessage);
            }
            else{
              $scope.notify("Failed to add Tax Class");
            }

        });
    }

    $scope.validateTaxClassInputValues = function (taxData) {
        var q = $q.defer();
        if(taxData.tableTaxClassName){
            $http({
                method: 'GET',
                url: MavenAppConfig.baseUrlSource + "/omsservices/webapi/taxclass/validatetaxclassname?taxClassName="+taxData.tableTaxClassName
            })
                .success(function (data, status) {
                    console.log(data);
                    q.resolve(data);

                }).error(function(error,status){
                if(status == 400){
                  $scope.notify(data.errorMessage);
                }
                q.reject(error);
            });
        }
        return q.promise;
    }


    $scope.downloadTaxes = function () {

        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/tax/export";

        $http({
            method: 'GET',
            url: orderListUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            responseType:'arraybuffer'

        })
            .success(function (data, status) {
                console.log(data);
                if(status == '204'){
                  $scope.notify("Tax are not available.");
                }else{
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Glaucus_Tax_Matrix.xls";
                    document.body.appendChild(a);
                    a.click();
                };

            }).error(function(error,status){
            if(status == 400){
              $scope.notify(data.errorMessage);
            }
            else{
              $scope.notify("Taxes Export request failed");
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

        mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data){
            $scope.genericData.skusListFiltered = data;

        });

        $('#dialogmastersku').modal('show');
        $scope.skuLoadBusy = false;
        $scope.stopSkuLoad = false;
        $scope.genericData.check = check;

        if(check == true){

            console.log($scope.singleorderData);
        }

    }

    $scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            if($scope.genericData.check == true){
                $scope.$broadcast("angucomplete-alt:changeInput", "products", data);
            }

        }).error(function(error, status) {
            console.log(error);

        });

        $scope.cancelmastersDialog();
    }

    $scope.cancelmastersDialog = function(){
        skuStart=0;
        size=10;
        $scope.genericData.skusListFiltered = [];
        $scope.skuLoadBusy = true;
        $scope.stopSkuLoad = true;
        $('#dialogmastersku').modal('hide');
    }
    $scope.$on('$destroy', function () {
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

}]);
function activaTab(tab){
    $('.nav-tabs a[data-target="#' + tab + '"]').tab('show');
    console.log(tab);
};