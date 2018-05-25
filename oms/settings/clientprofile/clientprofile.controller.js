angular.module('OMSApp.clientprofile', []).config(function config($stateProvider) {
    $stateProvider.state('/clientprofile/', {
        name: '/clientprofile/',
        url: '/clientprofile/',
        views: {
            "main": {
                controller: 'clientprofileCtrl',
                templateUrl: 'settings/clientprofile/clientprofile.view.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'clientprofile'}
    })

}).controller('clientprofileCtrl',['$scope', '$rootScope','$http','$location', 'MavenAppConfig', '$mdDialog','$sce', '$window', 'Upload',  '$q', '$cookies',

function clientprofileController($scope, $rootScope,$http, $location, MavenAppConfig, $mdDialog,$sce, $window, Upload,  $q,  $cookies) {

    $scope.invoiceformatavailable = false;
    $scope.saleorderinvoiceformat = "";
    $scope.invoicedetails = {};
    $scope.showfinanceyear=false;
    $scope.featureConfig=false;
    $scope.wmsconfiguration=false;
    $scope.editNature=false;
    $scope.editAddress=false;
    $scope.editInvConfig=false;
    $scope.editInvGen=false;
    $scope.editTllyInt=false;
    $scope.editInvFor=false;
    $scope.invoiceconfig=false;
    $scope.addressconfig= false;

    

    $scope.genericData = {};

    $scope.financialYears = {
        "yy-yy" : 1,
        "yy" : 2

    }
    $scope.clientprofile = {};

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
    )

    $scope.onLoad= function() {

        $scope.getGstTypes();
        $scope.getClientProfile();
        $scope.getInvoice();
        $scope.getStateWiseVats();
        $scope.getStatesArray();
        $scope.generateCharString();

    };

    $scope.openSection = function(section){
        if(section == 'feature'){
            $scope.featureConfig = !$scope.featureConfig;
            $scope.wmsconfiguration = false;
            $scope.addressconfig = false;
            $scope.invoiceconfig = false;
        }
        else if(section == 'wms'){
            $scope.wmsconfiguration = !$scope.wmsconfiguration;
            $scope.addressconfig = false;
            $scope.invoiceconfig = false;
            $scope.featureConfig = false;
        }
        else if(section == 'address'){
            $scope.addressconfig = !$scope.addressconfig;
            $scope.wmsconfiguration = false;
            $scope.addressonfig = false;
            $scope.invoiceconfig = false;
            $scope.featureConfig = false;
        }
        else if(section == 'invoice'){
            $scope.invoiceconfig = !$scope.invoiceconfig;
            $scope.wmsconfiguration = false;
            $scope.addressconfig = false;
            $scope.featureConfig = false;
        }
    }

    $scope.generateCharString = function(){
        $scope.characterString = [];
        for(var characterStringIndex=0;characterStringIndex<20;characterStringIndex++){
            $scope.characterString.push({check:false});
        }
    }

    $scope.getClientProfile = function() {
        var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles";
        $http.get(clientProfileUrl).success(function(data)
        {
            if(data.length > 0){
                $scope.clientprofile = data[0];
                $rootScope.clientprofile = data[0];
                $rootScope.$broadcast('menuChanged', true);
                if($scope.clientprofile.tableClientProfileSkuCodeCharIndexes){
                    $scope.updatedChars = [];
                    var skuCharArray = "["+$scope.clientprofile.tableClientProfileSkuCodeCharIndexes+"]";
                    $scope.updatedChars = JSON.parse(skuCharArray);
                    for(var a = 0;a<$scope.updatedChars.length;a++){
                        $scope.characterString[$scope.updatedChars[a]].check = true;
                    }
                }
                if($scope.clientprofile.tableClientProfileSignatureImage)
                {

                    var signUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/clientprofiles/docs/signimage";
                    $http({
                        method: 'GET',
                        url: signUrl,
                        headers: {
                            'Content-Type': 'image/*'
                        },
                        responseType:'arraybuffer',
                        dataType:'blob'
                    }).
                        success(function(imgdata)
                        {
                            $scope.imageSrc = imgdata;
                            $scope.imageformat = $scope.clientprofile.tableClientProfileSignatureImage.substr($scope.clientprofile.tableClientProfileSignatureImage.lastIndexOf('.')+1)

                            var file = new Blob([(imgdata)], {
                                type: 'image/' + $scope.imageformat
                            });

                            var fileURL = URL.createObjectURL(file);
                            $scope.genericData.signImageReceivedFile = $sce.trustAsResourceUrl(fileURL);

                        }).error(function(error, status)
                        {
                            if(status == 400)
                            {
                                $scope.notify(error.errorMessage);
                            }
                            else
                            {
                                $scope.notify("Failed to get client sign image");
                            }
                        });

                }
            }

        }).error(function(error, status) {
            if(status == 400){
                $scope.notify(error.errorMessage);
            }
            else{
                $scope.notify("Failed to load client profile");
            }
        });
    }

    var invoicedetailsBackup = {};
    $scope.getInvoice = function() {
        var invoiceUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/saleorderinvoicerule";
        $http.get(invoiceUrl).success(function(data) {
            if(data.length > 0){

                $scope.invoicedetails = data[0];
                invoicedetails = angular.copy($scope.invoicedetails);
                $scope.invoicedetails.tableSaleOrderInvoiceRulesIsFySelected = true;
                $scope.checkFinancialyear();
            }
        }).error(function(error, status) {
        });
    }

    $scope.checkFinancialyear = function() {
        if($scope.invoicedetails.tableSaleOrderInvoiceRulesIsFySelected){
            if($scope.invoicedetails.tableSaleOrderInvoiceRulesFyFormat == null)
            {
                $scope.invoicedetails.tableSaleOrderInvoiceRulesFyFormat = 1;
            }
            $scope.showfinanceyear=true;
        }else{
            $scope.invoicedetails.tableSaleOrderInvoiceRulesFyFormat = null;
            $scope.showfinanceyear=false;
        }
    }

    $scope.resetInvDetail = function(){
        $scope.editInvFor = !$scope.editInvFor;
        $scope.invoicedetails = angular.copy(invoicedetails);
    }

    $scope.updateInvoiceDetails = function() {
        if($scope.invoicedetails.idtableSaleOrderInvoiceRulesId)
        {
            $http({
                method: 'PUT',
                url: MavenAppConfig.baseUrlSource  + '/omsservices/webapi/saleorderinvoicerule/' + $scope.invoicedetails.idtableSaleOrderInvoiceRulesId,
                data: $scope.invoicedetails,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                invoicedetails = angular.copy($scope.invoicedetails);
               $scope.notify("invoice details updated successfully",'success');
                $scope.editInvFor=false;
            }).error(function(error, status) {
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Failed to update Invoice Details");
                }
                $scope.editInvFor=false;

            });
        }
        else
        {
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource  + '/omsservices/webapi/saleorderinvoicerule',
                data: $scope.invoicedetails,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                $scope.invoicedetails = res;
                $scope.notify("invoice details updated successfully",'success');
            }).error(function(error, status) {
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Failed to update Invoice Details");
                }

            });
        }

    }

    $scope.uploadSignImage = function()
    {
        if(!$scope.genericData.signImageFile)
        {
            $scope.notify("Select a signature image first");
            return;
        }
        if($scope.genericData.signImageFile.$ngfHeight > 70 && $scope.genericData.signImageFile.$ngfWidth > 200)
        {
            $scope.notify("Signature image should have dimensions 200 X 70 in pixels.");
            return;
        }
        if ($scope.genericData.signImageFile)
        {
            if (!$scope.genericData.signImageFile.$error)
            {
                var uploadUrl = MavenAppConfig.baseUrlSource  + '/omsservices/webapi/clientprofiles/docs/signimage';

                var fd = new FormData();
                fd.append('uploadFile', $scope.genericData.signImageFile);
                var upload = Upload.http({
                    url: uploadUrl,
                    method: 'POST',
                    data: fd,
                    headers: {
                        'Content-Type': undefined
                    }
                });
                upload.then(function(resp)
                {
                    if(resp.data == true) {
                        $scope.notify("File has been uploaded successfully.",'success');
                    }
                    else {
                        $scope.notify("Failed to upload image file");
                    }

                }, function(resp) {
                    $scope.notify(resp.data.errorMessage);
                }, function(evt)
                {
                    // progress notify
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :' + $scope.genericData.signImageFile.name);
                });
            }
        }
    };

    //Regions Data from region generic API
    $scope.regionsStatesData = function() {
        $scope.regionsStatesArray = [];
        var regionsStatesUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/countries/1/states";
        $http.get(regionsStatesUrl).success(function(data)
        {
            $scope.regionsStatesArray = data;

        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.regionsStatesData();

    //Regions Data from region states generic API - For Shipping
    $scope.regionsStatesDistrictData = function(stateData) {
        $scope.state = stateData.tableStateLongName;
        $scope.stateId = stateData.idtableStateId;
        $scope.regionsStatesDistrictArray = [];
        var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
        $http.get(regionsStatesDistrictUrl).success(function(data) {
            if (data != null)
            {
                $scope.regionsStatesDistrictArray = data;
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
        });

    };

    //Regions Data from region states distict generic API
    $scope.regionsStatesDistrictsCityData = function(stateData, districtData) {
        if (districtData) {
            $scope.district = districtData.tableDistrictLongName;
            $scope.regionsStatesDistrictsCityArray = [];
            $scope.districtId = districtData.idtableDistrictId;
            var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
            $http.get(regionsStatesDistrictsCityUrl).success(function(data)
            {
                $scope.regionsStatesDistrictsCityArray = data;
            }).error(function(error, status) {
                console.log(error);

            });
        }
    };

    $scope.tableAddress = {};
    $scope.onUpdateClientAddressClicked = function ()
    {
        $scope.getClientAddress().then(function (res)
        {
            if($scope.tableAddress && !$scope.tableAddress.idtableAddressId)
            {
                $scope.addressMode = 'add';


                $scope.tableAddress.tableAddressPhone1 = $cookies.get("userphone");
                $scope.tableAddress.tableAddressContactPerson1 = $cookies.get("userfullname");
                $scope.tableAddress.tableAddressEmail1 = $cookies.get("useremail");
                $('#addressModal').modal('show');


            }
            else if($scope.tableAddress && $scope.tableAddress.idtableAddressId > 0)
            {
                $scope.addressMode = 'edit';
                var stateid = $scope.tableAddress.tableCity.tableDistrict.tableState.idtableStateId;
                var districtid = $scope.tableAddress.tableCity.tableDistrict.idtableDistrictId;
                var tableCity = angular.copy($scope.tableAddress.tableCity);
                $scope.regionsStatesDistrictArray = [];
                var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/countries/1/states/" + stateid + "/districts";
                $scope.regionsStatesDistrictsCityArray = [];
                var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/countries/1/states/" + stateid + "/districts/" + districtid + "/cities";
                $q.all([$http.get(regionsStatesDistrictUrl),$http.get(regionsStatesDistrictsCityUrl)])
                    .then(function (res) {
                        $scope.tableAddress.tableCity = tableCity; //Do not remove this code as tableCity was becoming null on subsequent opening of dialogbox
                        $scope.regionsStatesDistrictArray =  res[0].data;
                        $scope.genericData.districtData = $scope.tableAddress.tableCity.tableDistrict;
                        $scope.regionsStatesDistrictsCityArray = res[1].data;
                        $scope.genericData.stateData = $scope.tableAddress.tableCity.tableDistrict.tableState;

                        $('#addressModal').modal('show');
                    })
                    .catch(function (error) {

                    });
            }

        })

    }

    $scope.cancelUpdateAddress = function (form) {
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addressModal').modal('hide');
        $scope.editAddress=false;
    }
    
    $scope.updateClientAddress = function (form) {

        if($scope.addressMode == 'add') {

            var clientAddressURL = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/clientaddress";

            $http({
                method: 'POST',
                url: clientAddressURL,
                data: $scope.tableAddress,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                $scope.tableAddress = res;
                $scope.notify("Address updated successfully",'success');
                $scope.cancelUpdateAddress(form);
            }).error(function(error, status)
            {
                $scope.cancelUpdateAddress(form);
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Failed to update address");
                }

            });
        }

        if($scope.addressMode == 'edit') {

            var clientAddressURL = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/clientaddress/" + $scope.tableAddress.idtableAddressId;

            $http({
                method: 'PUT',
                url: clientAddressURL,
                data: $scope.tableAddress,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res)
            {
                $scope.tableAddress = res;
                $scope.notify("Address updated successfully",'success');
                $scope.cancelUpdateAddress(form);
            }).error(function(error, status)
            {
                $scope.cancelUpdateAddress(form);
                if(status == 400){
                    $scope.notify(error.errorMessage);
                }else {
                    $scope.notify("Failed to update address");
                }

            });
        }
    }

    $scope.tableAddress = {};
    $scope.getClientAddress = function () {

        var q = $q.defer();

        var getClientAddress = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/clientaddress";
        $http.get(getClientAddress).success(function(data)
        {
            if(data) {
                $scope.tableAddress = data;
                q.resolve();
            }
            else
            {
                $scope.tableAddress = {};
                q.resolve();
            }
        }).error(function(error, status)
        {
        });
        return q.promise;

    }
    $scope.getClientAddress();

    $scope.updatedChars = [];
    $scope.updateSkuCharArray = function(index, check){
        if(check){
            $scope.updatedChars.push(index);
        }else{
            var position = $scope.updatedChars.indexOf(index);
            $scope.updatedChars.splice(position,1);
        }
    }

    $scope.updateSkuChar = function(){
        $scope.updatedChars.sort(function(a, b) {
          return a - b;
        });
        $scope.clientprofile.tableClientProfileSkuCodeCharIndexes = $scope.updatedChars.toString();
        $scope.updateClientProfile();
    }

    $scope.updateClientProfile = function () {
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource  + '/omsservices/webapi/clientprofiles',
            data: $scope.clientprofile,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.clientprofile = res;
            $scope.notify("Profile updated successfully",'success');
            $scope.editInvConfig=false;
            $scope.editInvGen=false;
            $scope.editTllyInt=false;
            $rootScope.$broadcast('menuChanged', true);
        }).error(function(error, status) {
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Failed to update clientProfile");
            }
            $scope.editInvConfig=false;
            $scope.editInvGen=false;
            $scope.editTllyInt=false;

        });
    }

    $scope.updateClientProfileGst = function() {
        if(!$scope.clientprofile.tableGstType){
            $scope.notify("Enter GST status");
            return;
        }
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource  + '/omsservices/webapi/clientprofiles',
            data: $scope.clientprofile,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.clientprofile = res;
            $scope.notify("Profile updated successfully",'success');
            $scope.editNature=false;
            $rootScope.$broadcast('menuChanged', true);
            if(res.tableGstType.idtableGstTypeId == 2 || res.tableGstType.idtableGstTypeId == 3)
            {
                $scope.notify("Please Configure tax details in Master",'success');
            }
        }).error(function(error, status) {
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Failed to update clientProfile");
            }
            $scope.editNature=false;

        });
    }

    $scope.getStateWiseVats = function () {

        var getAllVats = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/vat";
        $scope.allVats = [];
        $http.get(getAllVats).success(function(data)
        {
            if(data.length > 0)
            {
                $scope.allVats = data;
            }
        }).error(function(error, status)
        {
        });

    }



    //Regions Data from region generic API
    $scope.getStatesArray = function() {
        $scope.statesArray = [];
        var regionsStatesUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/countries/1/states";
        $http.get(regionsStatesUrl).success(function(data) {
            $scope.statesArray = data;
        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    $scope.onEditGSTClicked = function(vat) {
        $scope.genericData.gstmode = 'edit';
        $scope.vatToBeEdited = angular.copy(vat);
        $('#addupdategstmodal').modal('show');
    }

    $scope.onAddNewGstClicked = function(vat)
    {
        $scope.vatToBeEdited = {};
        $scope.genericData.gstmode = 'add';
        $scope.vatToBeEdited.tableClientStateWiseVatNo = null;
        $('#addupdategstmodal').modal('show');
    }

    $scope.onDeleteGSTClicked = function(vat) {

        $scope.vatToBeDeleted = vat;
        $('#deletegstinmodal').modal('show');
    }

    $scope.cancelDeleteGSTModal = function()
    {

        $('#deletegstinmodal').modal('hide');

    }

    $scope.canceladdupdategstmodal = function(form) {
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addupdategstmodal').modal('hide');

    }

    var regex = new RegExp("^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][0-9]Z[A-Z0-9]");

    $scope.updategstin = function() {

        var m = null;
        if($scope.vatToBeEdited.tableClientStateWiseVatNo!= null && $scope.vatToBeEdited.tableClientStateWiseVatNo.length > 0)
        {
            m = regex.exec($scope.vatToBeEdited.tableClientStateWiseVatNo);
            if(m == null)
            {
                $scope.notify("Provided GST doesn't seem to match the prescribed format");
                return;
            }
            else
            {
                var stateCode = $scope.vatToBeEdited.tableClientStateWiseVatNo.substr(0,2);
                if($scope.vatToBeEdited.tableState.tableStateCode != stateCode)
                {
                    $scope.notify("State code provided in GSTIN does not match the state code of selected state. Select the state again");
                    return;
                }
            }
        }

        var vatPostData = $scope.vatToBeEdited;
        $http({
            method: "PUT",
            url: MavenAppConfig.baseUrlSource  + "/omsservices/webapi/vat/" + $scope.vatToBeEdited.tableState.idtableStateId,
            data: vatPostData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            $scope.canceladdupdategstmodal();
            $scope.notify("GSTIN updated successfully",'success');
            $scope.getStateWiseVats();


        }).error(function(error, status) {
            console.log(error);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Failed to update GSTIN");
            }
        });

    }

    $scope.submitGstForm =  function (form) {
        if(($scope.singleOrderMode == 'add' || $scope.singleOrderMode == 'copy') && $scope.OrderMode == '' && $scope.submitActionButton == 'singleOrder'){
            $scope.saveSingleOrder(form);
        }
        else if($scope.singleOrderMode == 'edit' && $scope.OrderMode != 'EditDraft'  && $scope.submitActionButton == 'updateOrder'){
            $scope.updateSingleOrder(form);
        }
        else if($scope.singleOrderMode != 'edit' && $scope.bulkOrderTab !=true  && $scope.submitActionButton == 'saveDraft'){
            $scope.Drafted($scope.OrderMode,form);
        }
        else if($scope.OrderMode == 'EditDraft'  && $scope.submitActionButton == 'sendDraft'){
            $scope.SendDraft(form);
        }
        else{

        }

    }


    $scope.addgstin = function(form) {

        var m = null;
        if($scope.vatToBeEdited.tableClientStateWiseVatNo!= null && $scope.vatToBeEdited.tableClientStateWiseVatNo.length > 0)
        {
            m = regex.exec($scope.vatToBeEdited.tableClientStateWiseVatNo);
            if(m == null)
            {
                $scope.notify("Provided GST doesn't seem to match the prescribed format");
                return;
            }
            else
            {
                var stateCode = $scope.vatToBeEdited.tableClientStateWiseVatNo.substr(0,2);
                if($scope.vatToBeEdited.tableState.tableStateCode != stateCode)
                {
                    $scope.notify("State code provided in GSTIN does not match the state code of selected state. Select the state again");
                    return;
                }
            }
        }
        var vatPostData = $scope.vatToBeEdited;
        $http({
            method: "POST",
            url: MavenAppConfig.baseUrlSource  + "/omsservices/webapi/vat/" + $scope.vatToBeEdited.tableState.idtableStateId,
            data: vatPostData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.canceladdupdategstmodal(form);
            $scope.notify("GSTIN added successfully",'success');
            $scope.getStateWiseVats();

        }).error(function(error, status) {
            console.log(error);
            $scope.canceladdupdategstmodal(form);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Failed to add GSTIN");
            }
        });

    }
    
    $scope.deletegstin = function () {

        var vatPostData = $scope.vatToBeDeleted;
        $http({
            method: "DELETE",
            url: MavenAppConfig.baseUrlSource  + "/omsservices/webapi/vat/" + $scope.vatToBeDeleted.tableState.idtableStateId,
            data: vatPostData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            $scope.notify("GSTIN deleted successfully",'success');
            $scope.cancelDeleteGSTModal();
            $scope.getStateWiseVats();

        }).error(function(error, status) {
            console.log(error);
            if(status == 400){
                $scope.notify(error.errorMessage);
            }else {
                $scope.notify("Failed to delete GSTIN");
            }
        });
    }

    $scope.getGstTypes = function()
    {
        $scope.gstTypes = [];
        var gstTypesUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/gsttypes";
        $http.get(gstTypesUrl).success(function(data)
        {
            $scope.gstTypes = data;
            $scope.gstTypes.splice(4,1);
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

    $scope.onStateChanged = function () {
        if($scope.genericData.gstmode == 'add'){
            $scope.vatToBeEdited.tableClientStateWiseVatNo = null;
        }

        if($scope.vatToBeEdited.tableClientStateWiseVatNo != null && $scope.vatToBeEdited.tableClientStateWiseVatNo.length >=2 && $scope.genericData.gstmode == 'edit') {
            var isFirstNumber = false;
            var isSecondNumber = false;
            var firstChar = $scope.vatToBeEdited.tableClientStateWiseVatNo[0];
            if (firstChar <= '3' && firstChar >= '0') {
                isFirstNumber = true;
            }
            var secondChar = $scope.vatToBeEdited.tableClientStateWiseVatNo[1];
            if (secondChar <= '9' && secondChar >= '0') {
                isSecondNumber = true;
            }
            if (isFirstNumber == true) {
                $scope.vatToBeEdited.tableClientStateWiseVatNo = $scope.vatToBeEdited.tableClientStateWiseVatNo.replace($scope.vatToBeEdited.tableClientStateWiseVatNo[0], '');
            }

            if (isSecondNumber == true) {
                $scope.vatToBeEdited.tableClientStateWiseVatNo = $scope.vatToBeEdited.tableClientStateWiseVatNo.replace($scope.vatToBeEdited.tableClientStateWiseVatNo[1], '');
            }
        }
        if($scope.vatToBeEdited.tableClientStateWiseVatNo == null)
        {
            $scope.vatToBeEdited.tableClientStateWiseVatNo = "";
        }
        $scope.vatToBeEdited.tableClientStateWiseVatNo = $scope.vatToBeEdited.tableState.tableStateCode + $scope.vatToBeEdited.tableClientStateWiseVatNo;
        var stateData = $scope.allVats.filter(function (val) {
                    return val.tableState.tableStateCode == $scope.vatToBeEdited.tableState.tableStateCode;
        });
        if(stateData.length){
            $scope.vatToBeEdited.tableClientStateWiseVatNo = stateData[0].tableClientStateWiseVatNo;
        }
        // $scope.allVats.forEach(function (val,key) {
        //     if(val.tableState.tableStateCode == $scope.vatToBeEdited.tableState.tableStateCode){
        //         $scope.vatToBeEdited.tableClientStateWiseVatNo = val.tableClientStateWiseVatNo;
        //     }
        // });
    }
    $scope.categoryMaster = {};
    $scope.onCategoryMasterSelected = function ()
    {
        var selectedValue = $scope.categoryMaster.tableClientProfileCategoryMaster;

        if(selectedValue == 'Standard')
        {
            $scope.categoryMaster.warning = true;

        }
        else
        {
            $scope.categoryMaster.warning = false;
        }
        $('#categoryMasterConfirmationModal').modal('show');
    }

    $scope.cancelCategoryMasterModal = function(form)
    {
        $('#categoryMasterConfirmationModal').modal('hide');
        $scope.categoryMaster = {};
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

    $scope.updateCategoryMaster = function (form)
    {
        var setCategoryMasterURL = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/clientprofiles/categorymaster?option=" + $scope.categoryMaster.tableClientProfileCategoryMaster;

        $http({
            method: 'PUT',
            url: setCategoryMasterURL,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response)
        {
            if($scope.categoryMaster.tableClientProfileCategoryMaster == 'Standard')
            {
                $scope.notify('All categories has been restored to Standard and All SKUs with Amazon Categories has been updated with undefined category;','success');
            }
            else
            {
                $scope.notify('Standard Category has been appended with Amazon Category.','success');
            }
            $scope.cancelCategoryMasterModal(form);
            $scope.clientprofile.tableClientProfileCategoryMaster = $scope.categoryMaster.tableClientProfileCategoryMaster;
        }

        ).error(function (error,status){
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else
            {
                $scope.notify('Failed to set ' + $scope.genericData.selectedCategoryMaster + ' as default category master  ');
            }
            $scope.cancelCategoryMasterModal(form);
        });
    }

    $scope.clientbarcodesettings = {};
    var clientbarcodesettingsBackup = {};

    $scope.getclientbarcodesetting = function()
    {
        // $scope.clientbarcodesettings = [];
        var barcodeSettingsUrl = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/clientprofiles/clientbarcodesetting";
        $http.get(barcodeSettingsUrl).success(function(data)
        {
            $scope.clientbarcodesettings = data;
            clientbarcodesettingsBackup =  angular.copy($scope.clientbarcodesettings);

        }).error(function(error, status)
        {
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else{
                $scope.notify("Failed to get Barcode Settings");
            }
        });
    }


    $scope.getclientbarcodesetting();


    $scope.updateclientbarcodesetting = function (form)
    {
        var clientbarcodesettingURL = MavenAppConfig.baseUrlSource  + "/omsservices/webapi/clientprofiles/clientbarcodesetting";
        var clientSettingsData = $scope.clientbarcodesettings;
        var arr = [];
        arr.push(clientSettingsData.tableClientSettingsSkuAlternateCodePriority);
        if(arr.indexOf(clientSettingsData.tableClientSettingsSkuClientSkuCode) >= 0)
        {
            $scope.notify("Priority can not be same for multiple Attributes");
            return;
        }
        else
        {
            arr.push(clientSettingsData.tableClientSettingsSkuClientSkuCode);
        }

        if(arr.indexOf(clientSettingsData.tableClientSettingsSkuSystemNo) >= 0)
        {
            $scope.notify("Priority can not be same for multiple Attributes");
            return;
        }
        else
        {
            arr.push(clientSettingsData.tableClientSettingsSkuSystemNo);
        }

        if(arr.indexOf(clientSettingsData.tableClientSettingsSkuUpcPriority) >= 0)
        {
            $scope.notify("Priority can not be same for multiple Attributes");
            return;
        }
        else
        {
            arr.push(clientSettingsData.tableClientSettingsSkuUpcPriority);
        }

        $http({
            method: 'PUT',
            url: clientbarcodesettingURL,
            data: clientSettingsData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response)
            {
                $scope.clientbarcodesettings = response;
                clientbarcodesettingsBackup =  angular.copy($scope.clientbarcodesettings);
                $scope.editSkuBarocodeConfig = !$scope.editSkuBarocodeConfig;
                $scope.notify("SKU Barcode Priority Configuration updated successfully",'success');
            }

        ).error(function (error,status){
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else
            {
                $scope.notify('Failed to update Client Settings');
            }
            $scope.cancelCategoryMasterModal(form);
        });
    }

    $scope.setDefaultskuBarCodesettings = function(){
        $scope.editSkuBarocodeConfig = !$scope.editSkuBarocodeConfig;
        $scope.clientbarcodesettings = angular.copy(clientbarcodesettingsBackup);
    }

    $scope.onChangePricingConfig = function (data_client_profile)
    {

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles",
            data: data_client_profile,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response)
            {
                $rootScope.clientprofile = response[0];
                $rootScope.$broadcast('menuChanged', true);
                $scope.notify("Updated Successfully.",'success');
            }

        ).error(function (error,status){
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else
            {
                $scope.notify('Failed to update Pricing');
            }
        });
    }
}]);
