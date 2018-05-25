angular.module('customerbaseController', []).config(function config($stateProvider) {

})

.controller('customerbaseCtrl',['$rootScope','$scope', '$http','$mdDialog', '$location', 'MavenAppConfig','Upload', '$q', '$cookies','$timeout','$cookies','$rootScope', 'mastersService',

function customerbaseController($rootScope,$scope, $http ,$mdDialog , $location , MavenAppConfig,Upload,  $q, $cookies,$timeout,$cookies,$rootScope, mastersService) {

    $scope.singleCustomerTab = true;
    $scope.bulkCustomerTab = false;
    $scope.genericData = {};
    $scope.customerBillingAddress = {};
    $scope.customerVatTin = {};
    $scope.billingAddressGstin = {};
    $scope.genericData.shipAddrBillAddrSame = false;
    $scope.billingAddress = {};
    $scope.shippingAddress = {};
    $scope.customersData = {};
    $scope.uploadedFile={};
    $scope.genericData.customerMode = "add";
    $scope.shipAddressMode = "add";
    $scope.billAddressMode = "add";
    $scope.baseSkuUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/search?search=';
    $scope.baseCustomerUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/search?search=';
    $scope.tinMode = "";


    $scope.modeCustomer = "normal";

    $scope.shipAddrClicked = false;
    $scope.billingAddrClicked = false;
    $scope.returnParamsClicked = false;

    $scope.genericData.returnType = "";

    $scope.returnTypes = [];

    $scope.gstTypes = [];

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

    //Creation Source Api Data from saleschannel API
    $scope.creationSourceData = function(saleChannelType) {
        var q = $q.defer();
        $scope.creationSourceArray = [];
        var salesChannelUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/saleschannels";
        $http.get(salesChannelUrl).success(function(data) {
            if (saleChannelType == "Manual")
            {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].tableSalesChannelMetaInfo.tableSalesChannelType.idtableSalesChannelTypeId == 2) {
                        $scope.creationSourceArray.push(data[i]);
                    }
                }
                q.resolve(true);
            }
            else
            {
                for (var i = 0; i < data.length; i++)
                {
                    $scope.creationSourceArray.push(data[i]);
                }
                q.resolve(true);
            }
        }).error(function(error, status) {
            q.resolve(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    };

    $scope.billingAddrClickedRow = function(){
        $scope.billingAddrClicked = !$scope.billingAddrClicked;
    }
    $scope.shipAddrClickedRow = function() {
        $scope.shipAddrClicked = !$scope.shipAddrClicked;
    };

    $scope.returnParamsClickedRow = function() {
        $scope.returnParamsClicked = !$scope.returnParamsClicked;
    };

    $scope.searchLocation = {
        latitude: 28.6139391,
        longitude: 77.20902120000005
    };
    $scope.searchLocationBilling = {
        latitude: 28.6139391,
        longitude: 77.20902120000005
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
    $scope.showResultForBilling = function(result) {
        console.log(result);
        // $scope.searchLocation = null;
        if(result!=undefined)
        {
            $scope.searchLocationBilling = {
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng()
            }
            console.log($scope.searchLocationBilling);
        }
        return true;
    };

    $scope.getLatitudeLongitude = function(callback) {
        var q = $q.defer();
        var address = "";
        if ($scope.customerAddress) {
            if ($scope.customerAddress.adLine1) {
                address = address + $scope.customerAddress.adLine1;
            }
            if ($scope.customerAddress.adLine2) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.adLine2;
                } else {
                    address = $scope.customerAddress.adLine2;
                }
            }
            if ($scope.customerAddress.adLine3) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.adLine3;
                } else {
                    address = $scope.customerAddress.adLine3;
                }
            }
            if ($scope.cityVal && !$scope.customerAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.cityVal;
                } else {
                    address = $scope.cityVal;
                }
            }
            if ($scope.district && (!$scope.cityVal && !$scope.customerAddress.pincode)) {
                if (address != "") {
                    address = address + ", " + $scope.district;
                } else {
                    address = $scope.district;
                }
            }
            if ($scope.state && !$scope.customerAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.state;
                } else {
                    address = $scope.state;
                }
            }
            if ($scope.customerAddress.pincode) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.pincode;
                } else {
                    address = $scope.customerAddress.pincode;
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
                        // $scope.notify("Exact location cannot be fetched from the entered address",'info');
                    }
                });
            }
        }
        return q.promise;
    };
    $scope.getLatitudeLongitudeForBilling = function(callback) {
        var q = $q.defer();
        var address = "";
        if ($scope.customerAddress) {
            if ($scope.customerAddress.billingAddLine1) {
                address = address + $scope.customerAddress.billingAddLine1;
            }
            if ($scope.customerAddress.billingAddLine2) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.billingAddLine2;
                } else {
                    address = $scope.customerAddress.billingAddLine2;
                }
            }
            if ($scope.customerAddress.billingAddLine3) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.billingAddLine3;
                } else {
                    address = $scope.customerAddress.billingAddLine3;
                }
            }
            if ($scope.cityValForBilling && !$scope.customerAddress.pincodeBilling) {
                if (address != "") {
                    address = address + ", " + $scope.cityValForBilling;
                } else {
                    address = $scope.cityValForBilling;
                }
            }
            if ($scope.districtForBilling && (!$scope.cityValForBilling && !$scope.customerAddress.pincodeBilling)) {
                if (address != "") {
                    address = address + ", " + $scope.districtForBilling;
                } else {
                    address = $scope.districtForBilling;
                }
            }
            if ($scope.stateForBilling && !$scope.customerAddress.pincodeBilling) {
                if (address != "") {
                    address = address + ", " + $scope.stateForBilling;
                } else {
                    address = $scope.stateForBilling;
                }
            }
            if ($scope.customerAddress.pincodeBilling) {
                if (address != "") {
                    address = address + ", " + $scope.customerAddress.pincodeBilling;
                } else {
                    address = $scope.customerAddress.pincodeBilling;
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
                        // $scope.notify("Exact location cannot be fetched from the entered address",'info')
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
    $scope.callGetLatLongForBilling = function() {
        $scope.getLatitudeLongitudeForBilling($scope.showResultForBilling).then(
            function(v) {},
            function(err) {}
        );
    };

    //Regions Data from region generic API
    $scope.regionsStatesData = function() {
        $scope.regionsStatesArray = [];
        var regionsStatesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states";
        $http.get(regionsStatesUrl).success(function(data)
        {
            $scope.regionsStatesArray = data;

        }).error(function(error, status) {
            console.log(error);
            console.log(status);

        });
    };

    //Regions Data from region states generic API - For Shipping
    $scope.regionsStatesDistrictData = function(stateData) {
        $scope.state = stateData.tableStateLongName;
        $scope.getLatitudeLongitude($scope.showResult).then(
            function(v) {
                if (v || !v) {
                    console.log(v);
                    console.log(stateData);
                    $scope.stateId = stateData.idtableStateId;
                    $scope.regionsStatesDistrictArray = [];
                    var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
                    $http.get(regionsStatesDistrictUrl).success(function(data) {
                        if (data != null)
                        {
                            $scope.regionsStatesDistrictArray = data;
                        }
                    }).error(function(error, status) {
                        console.log(error);
                        console.log(status);
                    });
                }
            },
            function(err) {}
        );
    };
    // For billing address
    $scope.regionsStatesDistrictDataForBilling = function(stateData)
    {
        $scope.stateForBilling = stateData.tableStateLongName;
        $scope.getLatitudeLongitudeForBilling($scope.showResultForBilling).then(
            function(v) {
                if (v || !v) {
                    console.log(v);
                    console.log(stateData);
                    $scope.stateIdForBilling = stateData.idtableStateId;
                    $scope.regionsStatesDistrictArrayForBilling = [];
                    var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource+ "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts";
                    $http.get(regionsStatesDistrictUrl).success(function(data)
                    {
                        if (data != null)
                        {
                            $scope.regionsStatesDistrictArrayForBilling = data;
                        }
                    }).error(function(error, status)
                    {
                        console.log(error);
                        console.log(status);

                    });
                }
            },
            function(err) {}
        );
    };

    //Regions Data from region states distict generic API
    $scope.regionsStatesDistrictsCityData = function(stateData, districtData) {
        if (districtData) {
            $scope.district = districtData.tableDistrictLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {
                    console.log(v);
                    if (v || !v) {
                        console.log(districtData);
                        $scope.regionsStatesDistrictsCityArray = [];
                        $scope.districtId = districtData.idtableDistrictId;
                        var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
                        $http.get(regionsStatesDistrictsCityUrl).success(function(data)
                        {
                            $scope.regionsStatesDistrictsCityArray = data;
                        }).error(function(error, status) {
                            console.log(error);

                        });
                    }
                },
                function(err) {}
            );
        }
    };
    //For Billing Address
    $scope.regionsStatesDistrictsCityDataForBilling = function(stateData, districtData) {
        if (districtData) {
            $scope.districtForBilling = districtData.tableDistrictLongName;
            $scope.getLatitudeLongitudeForBilling($scope.showResultForBilling).then(
                function(v) {
                    console.log(v);
                    if (v || !v) {
                        console.log(districtData);
                        $scope.regionsStatesDistrictsCityArrayForBilling = [];
                        $scope.districtIdForBilling = districtData.idtableDistrictId;
                        var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + stateData.idtableStateId + "/districts/" + districtData.idtableDistrictId + "/cities";
                        $http.get(regionsStatesDistrictsCityUrl).success(function(data)
                        {
                            $scope.regionsStatesDistrictsCityArrayForBilling = data;

                        }).error(function(error, status) {
                            console.log(error);
                        });
                    }
                },
                function(err) {}
            );
        }
    };
    $scope.changeCity = function(city) {
        if (city) {
            $scope.cityVal = city.tableCityLongName;
            $scope.getLatitudeLongitude($scope.showResult).then(
                function(v) {},
                function(err) {}
            );
        }
    };
    $scope.changeCityForBilling = function(city) {
        if (city) {
            $scope.cityValForBilling = city.tableCityLongName;
            $scope.getLatitudeLongitudeForBilling($scope.showResultForBilling).then(
                function(v) {},
                function(err) {}
            );
        }
    };

    // dialog box to add new customer
    $scope.showCustomerBox = function(ev) {
        $scope.shipAddrClicked = true;
        $scope.billingAddrClicked = true;
        $scope.returnParamsClicked = true;
        $('#addCustomerDialog').on('show.bs.modal' , function (e){
            $( "#customertabs a:first"  ).tab('show');
        });
        $('#addCustomerDialog').modal('show');
    };

    $scope.checkVat = function(customerid,stateid)
    {
        if(customerid == null || stateid == null)
        {
            return;
        }
        var q = $q.defer();
        var vatCheckURL = MavenAppConfig.baseUrlSource+ '/omsservices/webapi/customers/' + customerid+ '/vats/checkvat/' + stateid;
        $http.get(vatCheckURL).success(function(data)
        {
            if(data)
            {
                if($scope.billingaddress == true)
                {
                    $scope.genericData.customerVatTinBilling = data.tableCustomerStateWiseVatNo;
                }
                else
                {
                    $scope.genericData.customerVatTinShipping = data.tableCustomerStateWiseVatNo;
                    $scope.tableGstTypeShipping.tableGstType = data.tableGstType;
                }
            }else{
                $scope.genericData.customerVatTinShipping = null;
                $scope.tableGstTypeShipping.tableGstType = {};
            }
            q.resolve(true);
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);
            q.resolve(true);
        });
        return q.promise;
    }


    $scope.addStateWiseVat = function(stateWiseVat,customerid,mode) {
        var q = $q.defer();
        //Add state wise GSTIN if customer is B2B and GSTIN is provided
        var methodType;
        var url;
        if (mode == 'edit')
        {
            methodType = 'PUT';
            url = MavenAppConfig.baseUrlSource+ '/omsservices/webapi/customers/' + customerid + '/vats/' +stateWiseVat.idtableCustomerStateWiseVatId;
        }
        else
        {
            methodType = 'POST';
            url = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customerid + '/vats';
        }

        if(stateWiseVat.tableCustomerStateWiseVatNo != null && stateWiseVat.tableCustomerStateWiseVatNo != undefined && stateWiseVat.tableCustomerStateWiseVatNo != '')
        {
            $http({
                method: methodType,
                url: url,
                data: stateWiseVat,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (res)
            {
                q.resolve(true);
            }).error(function (error,status) {
                if(status == 400){
                    $scope.notify(error.errorMessage,'danger');
                }
                else{
                    $scope.notify("Failed to add vat",'danger');
                }
                q.resolve(false);
            });
        }
        else
        {
            q.resolve(true);
        }

        return q.promise;
    }


    $scope.saveCustomer = function(customersData,shippingAddress,billingAddress,stateWiseVat,billingAddressGstin,form)
    {
        customersData.tableCustomerIsActive = true;
        customersData.tableCustomerIsBlacklisted = false;

        var postCustomerData = customersData;

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers',
            data: postCustomerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.customersData.idtableCustomerId = res.idtableCustomerId;
            $scope.notify("Customer added successfully",'success');
            var postShippingAddressData = {};
            postShippingAddressData.tableAddress = shippingAddress;
            postShippingAddressData.tableAddress.tableAddressContactPerson1 = res.tableCustomerFullName;
            postShippingAddressData.tableAddress.tableAddressPhone1 = res.tableCustomerPhone;
            postShippingAddressData.tableAddress.tableAddressEmail1 = res.tableCustomerEmail;

            var shippingAddressWithGst = {};

            shippingAddressWithGst.tableCustomerShippingAddressList = postShippingAddressData;
            shippingAddressWithGst.tableCustomerStateWiseVat =   stateWiseVat;


            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + res.idtableCustomerId + '/shippingaddress/withgst',
                data: shippingAddressWithGst,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(shippingAddressResponse)
            {
                var postBillingAddressData = {};
                postBillingAddressData.tableAddress = billingAddress;
                postBillingAddressData.tableAddress.tableAddressContactPerson1 = res.tableCustomerFullName;
                postBillingAddressData.tableAddress.tableAddressPhone1 = res.tableCustomerPhone;
                postBillingAddressData.tableAddress.tableAddressEmail1 = res.tableCustomerEmail;

                var billingAddressWithGst = {};

                billingAddressWithGst.tableCustomerBillingAddressList = postBillingAddressData;
                billingAddressWithGst.tableCustomerStateWiseVat =   billingAddressGstin;

                $http({
                    method: 'POST',
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' +  res.idtableCustomerId  + '/billingaddress/withgst',
                    data: billingAddressWithGst,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(billingAddressResponse)
                {
                    $scope.cancelCustomerData(form);
                    if($scope.listOfCustomerCount !== undefined)
                    {
                        if ($scope.modeCustomer == 'normal') {
                            $scope.listOfCustomerCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeCustomer == 'mutual') {
                            $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeCustomer == 'skuFull') {
                            $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                        }
                    }

                }).error(function(error,status)
                {
                    $scope.cancelCustomerData(form);
                    if($scope.listOfCustomerCount !== undefined)
                    {
                        if ($scope.modeCustomer == 'normal') {
                            $scope.listOfCustomerCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeCustomer == 'mutual') {
                            $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                        }
                        if ($scope.modeCustomer == 'skuFull') {
                            $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                        }
                    }
                    if(status == 400){
                        $scope.notify(error.errorMessage,'danger');
                    }
                    else{
                        $scope.notify("Failed to add customer billing address",'danger');
                    }
                });

            }).error(function(error,status)
            {
                $scope.cancelCustomerData(form);
                if($scope.listOfCustomerCount !== undefined)
                {
                    if ($scope.modeCustomer == 'normal') {
                        $scope.listOfCustomerCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeCustomer == 'mutual') {
                        $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                    }
                    if ($scope.modeCustomer == 'skuFull') {
                        $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                    }
                }
                if(status == 400){
                    $scope.notify(error.errorMessage,'danger');
                }
                else{
                    $scope.notify("Failed to add customer shipping address",'danger');
                }

            });

        }).error(function(error, status) {

            if(status == 400){
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Failed to add new customer",'');
            }
        });
    };


    $scope.customercreatedsuccessfully = function(form)
    {
        if($scope.listOfCustomerCount !== undefined){
            if ($scope.modeCustomer == 'normal')
            {
                $scope.listOfCustomerCount($scope.vmPager.currentPage);
            }
            if ($scope.modeCustomer == 'mutual')
            {
                $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
            }
            if ($scope.modeCustomer == 'skuFull')
            {
                $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
            }
        }
        $scope.cancelCustomerData(form);
    }

    // Edit Customer Data to backend OMS Customer API
    $scope.editCustomerData = function(customersData,form)
    {
        var putCustomerData = customersData ;

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customersData.idtableCustomerId,
            data: putCustomerData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res)
            {
                $scope.notify("Customer updated successfully",'success');
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
                if($scope.shipAddressMode=='add' || $scope.submitActionButton == 'add'){
                    $scope.saveShippingAddressData(form);
                }
                else if($scope.shipAddressMode=='edit'  || $scope.submitActionButton == 'edit'){
                    $scope.editShippingAddressData(form);
                }


            }
        }).error(function(error, status) {
            $scope.cancelCustomerData(form);
            if(status == 400){
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Failed to update customer detail",'danger');
            }
        });
    };

    $scope.validateCustomerData =  function (customersData)
    {

        if (!customersData.tableCustomerClientCustomerCode)
        {
        }
        else
        {
            if (customersData.tableCustomerClientCustomerCode.length > 45)
            {
                $scope.notify("Customer code should be less than 45 characters",'warning');
                return false;
            }
        }

        if (!customersData.tableCustomerFirstName)
        {
            $scope.notify("Contact person first name is mandatory",'warning');
            return false;
        }
        if (customersData.tableCustomerFirstName.length > 45)
        {
            $scope.notify("First name cannot be greater than 45 characters",'warning');
            return false;
        }
        if(customersData.tableCustomerLastName){
            if (customersData.tableCustomerLastName.length > 45)
            {
                $scope.notify("Last name cannot be greater than 45 characters",'warning');
                return false;
            }}
        if (!customersData.tableCustomerEmail)
        {
            $scope.notify("Enter a valid email address",'warning');
            return false;
        }

        if (!customersData.tableCustomerPhone)
        {
            $scope.notify("Enter a valid 10-12 digit phone number!",'warning');
            return false;
        }
        else
        {
            if (customersData.tableCustomerPhone.length != 10)
            {
                $scope.notify('Please enter a 10 digit valid mobile no.','warning');
                return false;
            }
        }
        if (customersData.tableCustomerPhone.length < 10 || customersData.tableCustomerPhone.length > 12)
        {
            $scope.notify("Enter a valid 10-12 digit phone number!",'warning');
            return false;
        }

        return true;

    }

    $scope.validateAddress = function (address,supportdata)
    {
        if (!address.tableAddressContactPerson1)
        {
            $scope.notify("Please enter the contact person name",'warning');
            return false;
        }
        if (!address.tableAddressEmail1)
        {
            $scope.notify("Please enter a valid email address",'warning');
            return false;
        }
        if (!address.tableAddressPhone1)
        {
            $scope.notify("Please enter a valid 10-12 digit Phone Number!",'warning');
            return false;
        }
        if (address.tableAddressPhone1.length < 10 || address.tableAddressPhone1.length > 12)
        {
            $scope.notify("Please enter a valid 10-12 digit Phone Number!",'warning');
            return false;
        }
        if (!address.tableAddress1)
        {
            $scope.notify("Please enter a Valid Address Line 1",'warning');
            return false;
        }
        if (!supportdata.stateData)
        {
            $scope.notify("Please choose state from the available states!",'warning');
            return false;
        }
        if (!supportdata.districtData)
        {
            $scope.notify("Please choose district from the available districts!",'warning');
            return false;
        }
        if (!address.tableCity)
        {
            $scope.notify("Please choose city from the available cities!",'warning');
            return false;
        }
        if (!address.tableAddressPin)
        {
            $scope.notify("Please enter valid 6 digit postal code!",'warning');
            return false;
        }
        if (address.tableAddressPin.length != 6) {
            $scope.notify("Please enter valid 6 digit postal code!",'warning');
            return false;
        }
        return true;
    }

    var regex = new RegExp("^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][0-9]Z[A-Z0-9]");

    $scope.validateAddressMin = function (address,supportdata,GSTIN)
    {

        if (!address.tableAddress1)
        {
            $scope.notify("Please enter a valid Address Line 1",'warning');
            return false;
        }
        if (!supportdata.stateData)
        {
            $scope.notify("Please choose state from the available states!",'warning');
            return false;
        }
        if (!supportdata.districtData)
        {
            $scope.notify("Please choose district from the available districts!",'warning');
            return false;
        }
        if (!address.tableCity)
        {
            $scope.notify("Please choose city from the available cities!",'warning');
            return false;
        }
        if (!address.tableAddressPin)
        {
            $scope.notify("Please enter valid 6 digit postal code!",'warning');
            return false;
        }
        if (address.tableAddressPin.length != 6) {
            $scope.notify("Please enter valid 6 digit postal code!",'warning');
            return false;
        }
        var m = null;
        if(GSTIN!= null && GSTIN.length > 0)
        {
            m = regex.exec(GSTIN);
            if(m == null)
            {
                $scope.notify("Provided GST doesn't seem to match the prescribed format",'warning');
                return false;
            }
            else
            {
                var stateCode = GSTIN.substr(0,2);
                if(supportdata.stateData.tableStateCode != stateCode)
                {
                    $scope.notify("State code provided in GSTIN does not match the state code of selected state. Select the state again",'warning');
                    return false;
                }
            }
        }
        return true;
    }

    // ADD Customer Data to backend OMS Customer API
    $scope.saveCustomerData = function(customersData, customerMode,form)
    {

        if($scope.validateCustomerData(customersData) == true)
        {
            if (customerMode == "add") {
                $scope.checkCustomerCode(customersData.tableCustomerClientCustomerCode).then(function (retval) {
                    if (retval == false) {
                        return false;
                    }
                    else {
                        $scope.checkEmail(customersData.tableCustomerEmail).then(function (retvalue) {
                            if (retvalue == false) {
                                return false;
                            }
                            else {
                                $scope.checkPhoneNo(customersData.tableCustomerPhone).then(function (retvalue) {
                                    if (retvalue == false) {
                                        return false;
                                    }
                                    else {
                                        if($scope.customersData.tableCustomerReturnValue != 'undefined' && $scope.customersData.tableCustomerReturnValue != null && ($scope.customersData.tableCustomerReturnValue > 100 || $scope.customersData.tableCustomerReturnValue < 0)){
                                            $scope.notify("Return value percentage can not be more than 100 OR less than 0",'warning');
                                            return;
                                        }

                                        if($scope.customersData.tableCustomerReturnQuantity != 'undefined' && $scope.customersData.tableCustomerReturnQuantity != null && ($scope.customersData.tableCustomerReturnQuantity > 100 || $scope.customersData.tableCustomerReturnQuantity < 0)){
                                            $scope.notify("Return Quantity percentage can not be more than 100 OR less than 0",'warning');
                                            return;
                                        }
                                        if (customerMode == "add") {
                                            if ($scope.validateAddressMin($scope.shippingAddress, $scope.customerAddress,$scope.genericData.customerVatTinShipping) == false) {
                                                return false;
                                            }
                                            if ($scope.genericData.shipAddrBillAddrSame == false) {
                                                if ($scope.validateAddressMin($scope.billingAddress, $scope.customerBillingAddress,$scope.genericData.customerVatTinBilling) == false) {
                                                    return false;
                                                }
                                            }
                                            else {
                                                $scope.billingAddress = $scope.shippingAddress;
                                            }
                                            $scope.shippingAddress.tableAddressLatitude = $scope.searchLocation.latitude;
                                            $scope.shippingAddress.tableAddressLongitude = $scope.searchLocation.longitude;

                                            var statewisevat = {};
                                            statewisevat.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTinShipping;
                                            statewisevat.tableState = $scope.customerAddress.stateData;
                                            statewisevat.tableGstType = $scope.tableGstTypeShipping.tableGstType;
                                            if($scope.customerBillingAddress.stateData && $scope.customerAddress.stateData.idtableStateId != $scope.customerBillingAddress.stateData.idtableStateId)
                                            {
                                                var billingAddressGstin = {};
                                                if ($scope.genericData.shipAddrBillAddrSame == false) {
                                                    billingAddressGstin.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTinBilling;
                                                    billingAddressGstin.tableState = $scope.customerBillingAddress.stateData;
                                                    billingAddressGstin.tableGstType = $scope.tableGstTypeBilling.tableGstType;
                                                }
                                                else
                                                {
                                                    billingAddressGstin.tableCustomerStateWiseVatNo = statewisevat.tableCustomerStateWiseVatNo;
                                                    billingAddressGstin.tableState = statewisevat.tableState;
                                                    billingAddressGstin.tableGstType = statewisevat.tableGstType;
                                                }
                                            }

                                            $scope.saveCustomer(customersData, $scope.shippingAddress, $scope.billingAddress, statewisevat,billingAddressGstin,form);

                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else if (customerMode == "edit"){
                $scope.editCustomerData(customersData,form);
            }
        }
    };

    //Blacklist customer
    $scope.blacklistCustomer = function(customersData) {
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customersData.idtableCustomerId + '/blacklist',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.genericData.customerMode = "add";
                $scope.notify("Customer blacklisted successfully",'success');
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else
            {
                $scope.notify("Error while updating blacklist",'danger');
            }
        });
    };

    $scope.whitelistCustomer = function(customersData) {
        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customersData.idtableCustomerId + '/whitelist',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res) {
            console.log(res);
            if (res) {
                $scope.genericData.customerMode = "add";
                $scope.notify("Customer whitelisted successfully");
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }
        }).error(function(error, status) {
            console.log(error);
            console.log(status);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Error while updating whiltelist",'danger');
            }
        });
    };

    //Closing Add Customer Dialog Box
    $scope.cancelCustomerData = function(form)
    {
        $scope.customersData = null;
        $scope.genericData.shipAddrBillAddrSame = false;
        $scope.shippingAddress = {};
        $scope.billingAddress = {};
        $scope.billingAddrClicked=false;
        $scope.customerBillingAddress = {};
        $scope.customerBillingAddress.stateData={};
        $scope.customerBillingAddress.districtData={};
        $scope.billingAddressGstin = {}
        $scope.customerVatTin = {};
        $scope.genericData.customerVatTinShippingPlaceholder = null;
        $scope.genericData.customerVatTinBillingPlaceholder = null;
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#addCustomerDialog').modal('hide');

    };

    //dialog box to add new shipping address
    $scope.addShippingAddress = function(customerData) {

        $scope.customersData = customerData;
        $scope.shipAddressMode = 'add';
        $scope.customerAddress = {};
        $scope.shippingAddress = {};
        $scope.customerVatTin = {};
        $scope.tableGstTypeShipping = {};
        $scope.tableGstTypeShipping.tableGstType = {};
        $scope.tableGstTypeShipping.tableGstType.tableGstTypeName = "Unknown";

        $scope.genericData.customerVatTinShipping = null;
        $scope.genericData.customerVatTinShippingPlaceholder = null;

        var customersByIDUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/" + $scope.customersData.idtableCustomerId;
        $http.get(customersByIDUrl).success(function(data)
        {
            $scope.customersData = data;
            $scope.shippingAddress.tableAddressContactPerson1 = data.tableCustomerFullName;
            $scope.shippingAddress.tableAddressEmail1 = data.tableCustomerEmail;
            $scope.shippingAddress.tableAddressPhone1 = data.tableCustomerPhone;
        }).error(function(error, status)
        {
            console.log(error);
            console.log(status);

        });

        $('#shippingAddressModal').modal('show');
    };

    //dialog box to add new billing address
    $scope.addBillingAddress = function(customerData) {

        $scope.customersData = customerData;
        $scope.billAddressMode = 'add';
        $scope.customerAddress = {};
        $scope.state = "";
        $scope.district = "";
        $scope.cityVal = "";

        $scope.tableGstTypeBilling = {};
        $scope.tableGstTypeBilling.tableGstType = {};
        $scope.tableGstTypeBilling.tableGstType.tableGstTypeName = "Unknown";

        $scope.genericData.customerVatTinBilling = null;
        $scope.genericData.customerVatTinBillingPlaceholder = null;

        var customersByIDUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/" + customerData.idtableCustomerId;
        $http.get(customersByIDUrl).success(function(data)
        {
            $scope.customersData = data;
            $scope.customerId = data.idtableCustomerId;
            $scope.billingAddress.tableAddressContactPerson1 = data.tableCustomerFullName;
            $scope.billingAddress.tableAddressEmail1 = data.tableCustomerEmail;
            $scope.billingAddress.tableAddressPhone1 = data.tableCustomerPhone;
        }).error(function(error) {
            console.log(error);
        });

        $('#billingAddressModal').modal('show');
    };

    $scope.billingAddresses = function(customerId) {
        var q = $q.defer();

        $scope.billingAddressArray = [];
        var billingAddressUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customerId + '/billingaddress';
        $http.get(billingAddressUrl).success(function(data) {
            console.log(data);
            if($scope.singleorderData && $scope.singleorderData.billingAddress){
                $scope.singleorderData.billingAddress = null;
            }
            $scope.billingAddArray = data;
            $scope.billingAddressArray = [];
            for (var i = 0; i < $scope.billingAddArray.length; i++) {
                $scope.billingAddressArray.push($scope.billingAddArray[i].tableAddress);
            }
            console.log($scope.billingAddressArray);
            q.resolve(true);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    }

    $scope.deliveryAddresses = function(customerId) {
        var q = $q.defer();

        $scope.deliveryAddressArray = [];
        var deliveryAddressUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customerId + '/shippingaddress';
        $http.get(deliveryAddressUrl).success(function(data) {
            console.log(data);
            $scope.deliveryAddArray = data;
            $scope.deliveryAddressArray = [];
            for (var i = 0; i < $scope.deliveryAddArray.length; i++) {
                $scope.deliveryAddressArray.push($scope.deliveryAddArray[i].tableAddress);
            }
            console.log($scope.deliveryAddressArray);
            q.resolve(true);
        }).error(function(error, status) {
            q.reject(false);
            console.log(error);
            console.log(status);

        });
        return q.promise;
    }

    $scope.setFormButtonValue = function (value) {
        $scope.submitActionButton = value;
    }
    $scope.submitshippingAddressForm =  function (form) {
        if($scope.shipAddressMode=='add' && $scope.submitActionButton == 'add'){
            $scope.saveShippingAddressData(form);
        }
        else if($scope.shipAddressMode=='edit'  && $scope.submitActionButton == 'edit'){
            $scope.editShippingAddressData(form);
        }
    }
    //saving shipping address data based on customer id
    $scope.saveShippingAddressData = function(form)
    {
        if(Object.keys($scope.shippingAddress).length == 0){
            $scope.cancelCustomerData(form);
            return;
        }
        if($scope.validateAddress($scope.shippingAddress,$scope.customerAddress) == false)
        {
            return;
        }

        $scope.shippingAddress.tableAddressLatitude = $scope.searchLocation.latitude;
        $scope.shippingAddress.tableAddressLongitude = $scope.searchLocation.longitude;

        var statewisevat = {};
        statewisevat.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTinShipping;
        statewisevat.tableState = $scope.customerAddress.stateData;
        statewisevat.tableGstType = $scope.tableGstTypeShipping.tableGstType;

        var postShippingAddressData = {};
        postShippingAddressData.tableAddress = $scope.shippingAddress;
        postShippingAddressData.tableCustomerShippingAddressListIsPrimary = angular.copy($scope.shippingAddress.tableCustomerShippingAddressListIsPrimary);

        delete(postShippingAddressData.tableAddress.tableCustomerShippingAddressListIsPrimary);

        var shippingAddressWithGst = {};

        shippingAddressWithGst.tableCustomerShippingAddressList = postShippingAddressData;
        shippingAddressWithGst.tableCustomerStateWiseVat =   statewisevat;

        var cusId = $scope.customersData.idtableCustomerId;
        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + cusId + '/shippingaddress/withgst',
            data: shippingAddressWithGst,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.shipAddressMode = "add";

            $scope.customerAddress = {};
            $scope.notify("Shipping address added successfully",'success');
            $scope.cancelShippingAddress(form);

            $scope.deliveryAddresses($scope.customersData.idtableCustomerId);
            $scope.cancelCustomerData(form);
            if($scope.listOfCustomerCount !== undefined)
            {
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }

        }).error(function(error,status) {
            console.log(error);
            $scope.cancelShippingAddress(form);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Failed to add shipping address",'danger');
            }

        });

    };

    $scope.submitBillingAddressForm =  function (form) {
        if($scope.billAddressMode=='add' && $scope.submitActionButton == 'add')
        {
            $scope.saveBillingAddressData(form);
        }
        else if($scope.billAddressMode=='edit' && $scope.submitActionButton == 'edit')
        {
            $scope.editBillingAddressData(form);

        }
    }

    //saving billing address data based on customer id
    $scope.saveBillingAddressData = function(form)
    {
        if($scope.validateAddressMin($scope.billingAddress,$scope.customerBillingAddress,$scope.genericData.customerVatTinBilling) == false)
        {
            return;
        }

        var postBillingAddressData = {};
        postBillingAddressData.tableAddress = $scope.billingAddress;
        postBillingAddressData.tableCustomerBillingAddressListIsPrimary = angular.copy($scope.billingAddress.tableCustomerBillingAddressListIsPrimary);


        delete(postBillingAddressData.tableAddress.tableCustomerBillingAddressListIsPrimary);

        $scope.billingAddress.tableAddressLatitude = $scope.searchLocationBilling.latitude;
        $scope.billingAddress.tableAddressLongitude = $scope.searchLocationBilling.longitude;

        var statewisevat = {};

        statewisevat.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTinShipping;
        statewisevat.tableState = $scope.customerAddress.stateData;
        statewisevat.tableGstType = $scope.tableGstTypeBilling.tableGstType;

        var billingAddressDataWithGst = {};
        billingAddressDataWithGst.tableCustomerBillingAddressList = postBillingAddressData;

        billingAddressDataWithGst.tableCustomerStateWiseVat = statewisevat;

        $http({
            method: 'POST',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/billingaddress/withgst',
            data: billingAddressDataWithGst,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.notify("Billing address added successfully",'success');
            $scope.cancelBillingAddress(form);
            $scope.billingAddresses($scope.customersData.idtableCustomerId);
            if($scope.listOfCustomerCount !== undefined)
            {
                if ($scope.modeCustomer == 'normal') {
                    $scope.listOfCustomerCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'mutual') {
                    $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
                }
                if ($scope.modeCustomer == 'skuFull') {
                    $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
                }
            }

        }).error(function(error,status) {
            console.log(error);
            $scope.cancelBillingAddress(form);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Failed to add billing address",'danger');
            }
        });

    };

    //EDIT shipping address data based on customer id and ship address id
    $scope.editShippingAddressData = function(form)
    {
        if(Object.keys($scope.shippingAddress).length == 0){
            $scope.cancelCustomerData(form);
            return;
        }
        if($scope.validateAddress($scope.shippingAddress,$scope.customerAddress) == false)
        {
            return;
        }
        var statewisevat = {};
        statewisevat.tableState = $scope.customerAddress.stateData;
        statewisevat.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTinShipping;
        statewisevat.tableGstType = $scope.tableGstTypeShipping.tableGstType;

        $scope.shippingAddress.tableAddressLatitude = $scope.searchLocation.latitude;
        $scope.shippingAddress.tableAddressLongitude = $scope.searchLocation.longitude;

        var shippingAddressWithGst = {};

        shippingAddressWithGst.tableCustomerShippingAddressList = {};
        shippingAddressWithGst.tableCustomerShippingAddressList.tableAddress = $scope.shippingAddress;

        shippingAddressWithGst.tableCustomerShippingAddressList.tableCustomerShippingAddressListIsPrimary = angular.copy($scope.shippingAddress.tableCustomerShippingAddressListIsPrimary);

        delete(shippingAddressWithGst.tableCustomerShippingAddressList.tableAddress.tableCustomerShippingAddressListIsPrimary);

        shippingAddressWithGst.tableCustomerStateWiseVat =   statewisevat;


        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/shippingaddress/withgst/' + $scope.addressId,
            data: shippingAddressWithGst,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.notify("Shipping address updated",'success');
            if ($scope.modeCustomer == 'normal') {
                $scope.listOfCustomerCount($scope.vmPager.currentPage);
            }
            if ($scope.modeCustomer == 'mutual') {
                $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
            }
            if ($scope.modeCustomer == 'skuFull') {
                $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
            }
            $scope.cancelShippingAddress(form)
            $scope.cancelCustomerData(form);

        }).error(function(error,status) {
            console.log(error);
            $scope.cancelShippingAddress(form);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Customer Shipping Address Cannot Be Edited",'danger');
            }

        });
    }


    //EDIT billing address data based on customer id and ship address id
    $scope.editBillingAddressData = function(form)
    {
        if($scope.validateAddressMin($scope.billingAddress,$scope.customerBillingAddress,$scope.genericData.customerVatTinBilling) == false)
        {
            return;
        }

        var statewisevat = {};

        $scope.billingAddress.tableAddressLatitude = $scope.searchLocationBilling.latitude;
        $scope.billingAddress.tableAddressLongitude = $scope.searchLocationBilling.longitude;

        statewisevat.tableState = $scope.customerBillingAddress.stateData;
        if($scope.tableGstTypeBilling != undefined) {
            statewisevat.tableGstType = $scope.tableGstTypeBilling.tableGstType;
        }
        statewisevat.tableCustomerStateWiseVatNo = $scope.genericData.customerVatTinBilling;

        var billingAddressDataWithGst = {};
        billingAddressDataWithGst.tableCustomerBillingAddressList = {};
        billingAddressDataWithGst.tableCustomerBillingAddressList.tableAddress = $scope.billingAddress;

        billingAddressDataWithGst.tableCustomerBillingAddressList.tableCustomerBillingAddressListIsPrimary = angular.copy($scope.billingAddress.tableCustomerBillingAddressListIsPrimary);
        delete(billingAddressDataWithGst.tableCustomerBillingAddressList.tableAddress.tableCustomerBillingAddressListIsPrimary);


        billingAddressDataWithGst.tableCustomerStateWiseVat = statewisevat;

        $http({
            method: 'PUT',
            url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/billingaddress/withgst/' + $scope.addressId,
            data: billingAddressDataWithGst,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(res)
        {
            $scope.notify("Billing address updated",'success');
            if ($scope.modeCustomer == 'normal') {
                $scope.listOfCustomerCount($scope.vmPager.currentPage);
            }
            if ($scope.modeCustomer == 'mutual') {
                $scope.listOfMutualCustomersCount($scope.vmPager.currentPage);
            }
            if ($scope.modeCustomer == 'skuFull') {
                $scope.listOfMutualSkuCount($scope.vmPager.currentPage);
            }
            $scope.cancelBillingAddress(form);


        }).error(function(error,status) {
            console.log(error);
            $scope.cancelBillingAddress(form);
            if(status == 400)
            {
                $scope.notify(error.errorMessage,'danger');
            }
            else {
                $scope.notify("Failed to update billing address",'danger');
            }
        });
    }


    //=============================== bulk add customer ======================= //

    $scope.singleCustomerTabMode = function() {
        $scope.singleCustomerTab = true;
        $scope.bulkCustomerTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkCustomerTabMode = function() {
        $scope.singleCustomerTab = false;
        $scope.bulkCustomerTab = true;
    }

    $scope.addCustomer = function(ev) {

        $scope.singleCustomerTab = true;
        $scope.bulkCustomerTab = false;

        $scope.genericData.customerMode = "add";
        $scope.creationSourceData("Manual");
        $scope.customersData = {};
        $scope.tableGstTypeShipping = {};
        $scope.tableGstTypeShipping.tableGstType = {};
        $scope.tableGstTypeShipping.tableGstType.tableGstTypeName = "Unknown";

        $scope.tableGstTypeBilling = {};
        $scope.tableGstTypeBilling.tableGstType = {};
        $scope.tableGstTypeBilling.tableGstType.tableGstTypeName = "Unknown";

        $scope.genericData.customerVatTinShipping = null;
        $scope.genericData.customerVatTinShippingPlaceholder = null;

        $scope.genericData.customerVatTinBilling = null;
        $scope.genericData.customerVatTinBillingPlaceholder = null;

        $scope.customerAddress = {};
        $scope.customerBillingAddress = {};
        $scope.genericData.shipAddrBillAddrSame = false;
        $scope.shipAddrClicked = false;
        $scope.returnParamsClicked = false;
        $scope.genericData.returnType = "";
        $scope.showCustomerBox(ev);
    };

    $scope.editCustomer = function(ev, customerId) {
        $scope.singleCustomerTab = true;
        $scope.bulkCustomerTab = false;
        $scope.genericData.customerMode = "edit";
        $scope.returnParamsClicked = false;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customerId).success(function(response) {
            console.log(response);
            $scope.customersData = response;
            var idtableSalesChannelValueInfoId = $scope.customersData.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId;
            console.log($scope.creationSourceArray);
            $scope.creationSourceData().then(function (res) {
                if(res){
                    var tableSalesChannelValueInfo = $scope.creationSourceArray.filter(function(obj){
                        return obj.idtableSalesChannelValueInfoId == idtableSalesChannelValueInfoId;
                    })
                    $scope.customersData.tableSalesChannelValueInfo = tableSalesChannelValueInfo[0];

                }
            });

            if ($scope.customersData != null)
            {
                if($scope.customersData.tableCustomerReturnQuantity)
                {
                    $scope.genericData.returnType = 'quantitybased';
                }
                if($scope.customersData.tableCustomerReturnValue)
                {
                    $scope.genericData.returnType = 'valuebased';
                }
                if(!$scope.customersData.tableCustomerReturnValue && !$scope.customersData.tableCustomerReturnQuantity)
                {
                    $scope.genericData.returnType = "";
                }
                $scope.showCustomerBox(ev);
            }
        });
    };

    $scope.editCustomer2 = function(ev, customerId) {
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + customerId).success(function(response) {
            console.log(response);
            $scope.customersData = response;
            var idtableSalesChannelValueInfoId = $scope.customersData.tableSalesChannelValueInfo.idtableSalesChannelValueInfoId;
            console.log($scope.creationSourceArray);
            $scope.creationSourceData().then(function (res) {
                if(res){
                    var tableSalesChannelValueInfo = $scope.creationSourceArray.filter(function(obj){
                        return obj.idtableSalesChannelValueInfoId == idtableSalesChannelValueInfoId;
                    })
                    $scope.customersData.tableSalesChannelValueInfo = tableSalesChannelValueInfo[0];

                }
            });

            if ($scope.customersData != null)
            {
                if($scope.customersData.tableCustomerReturnQuantity)
                {
                    $scope.genericData.returnType = 'quantitybased';
                }
                if($scope.customersData.tableCustomerReturnValue)
                {
                    $scope.genericData.returnType = 'valuebased';
                }
                if(!$scope.customersData.tableCustomerReturnValue && !$scope.customersData.tableCustomerReturnQuantity)
                {
                    $scope.genericData.returnType = "";
                }
            }
        });
    };

    $scope.editShippingAddressCustomer = function(customerData, addressId)
    {
        $scope.customersData = customerData;
        $scope.addressId = addressId;
        $scope.shipAddressMode = 'edit';
        $scope.customerAddress = {};
        $scope.shippingAddress = {};
        $scope.billingaddress = false;
        $scope.tableGstTypeShipping = {};
        $scope.tableGstTypeBilling = {};
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/shippingaddress/' + addressId).success(function(response)
        {
            $scope.shippingAddress = response.tableAddress;
            $scope.shippingAddress.tableCustomerShippingAddressListIsPrimary = response.tableCustomerShippingAddressListIsPrimary;
            var stateid = response.tableAddress.tableCity.tableDistrict.tableState.idtableStateId;
            $scope.customerAddress.stateData = initializeDropdowns($scope.regionsStatesArray, 'idtableStateId', stateid);
            $scope.state = $scope.customerAddress.stateData.tableStateLongName;
            $scope.regionsStatesDistrictArray = [];
            var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + stateid + "/districts";
            $scope.regionsStatesDistrictsCityArray = [];
            var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + $scope.customerAddress.stateData.idtableStateId + "/districts/" + response.tableAddress.tableCity.tableDistrict.idtableDistrictId + "/cities";
            var vatCheckURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId+ '/vats/checkvat/' + stateid;
            $q.all([$http.get(regionsStatesDistrictUrl),$http.get(regionsStatesDistrictsCityUrl),$http.get(vatCheckURL)])
                .then(function (res) {
                    $scope.regionsStatesDistrictArray =  res[0].data;
                    $scope.customerAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArray, 'idtableDistrictId', response.tableAddress.tableCity.tableDistrict.idtableDistrictId);
                    $scope.district = $scope.customerAddress.districtData.tableDistrictLongName;
                    $scope.regionsStatesDistrictsCityArray = res[1].data;
                    $scope.shippingAddress.tableCity = initializeDropdowns($scope.regionsStatesDistrictsCityArray, 'idtableCityId', response.tableAddress.tableCity.idtableCityId);
                    $scope.cityVal = $scope.shippingAddress.tableCity.tableCityLongName;
                    if(res[2].data)
                    {
                        if($scope.billingaddress)
                        {
                            $scope.genericData.customerVatTinBilling = res[2].data.tableCustomerStateWiseVatNo;
                            $scope.tableGstTypeBilling.tableGstType = res[2].data.tableGstType;
                        }
                        else
                        {
                            $scope.genericData.customerVatTinShipping = res[2].data.tableCustomerStateWiseVatNo;
                            $scope.tableGstTypeShipping.tableGstType = res[2].data.tableGstType;
                        }
                    }
                    $('#shippingAddressModal').modal('show');
                })
                .catch(function (error) {

                });
            $scope.searchLocation = {
                latitude: response.tableAddress.tableAddressLatitude,
                longitude: response.tableAddress.tableAddressLongitude
            }

        });
    };

    $scope.billingaddress = false;

    $scope.editBillingAddressCustomer = function(customerData, addressId) {
        $scope.customersData = customerData;
        $scope.billAddressMode = 'edit';
        $scope.addressId = addressId;
        $scope.customerAddress = {};
        $scope.billingAddress = {};
        $scope.billingAddressGstin = {};
        $scope.customerBillingAddress = {};
        $scope.tableGstTypeBilling = {};
        $scope.tableGstTypeBilling.tableGstType = {};
        $scope.billingaddress = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId + '/billingaddress/' + addressId).success(function(response) {
            var stateid = response.tableAddress.tableCity.tableDistrict.tableState.idtableStateId;
            $scope.billingAddress = angular.copy(response.tableAddress);
            $scope.billingAddress.tableCustomerBillingAddressListIsPrimary = response.tableCustomerBillingAddressListIsPrimary;
            $scope.customerBillingAddress.stateData = initializeDropdowns($scope.regionsStatesArray, 'idtableStateId', stateid); //response.tableAddress.tableCity.tableDistrict.tableState;
            $scope.state = $scope.customerBillingAddress.stateData.tableStateLongName;
            $scope.regionsStatesDistrictArrayForBilling = [];
            var regionsStatesDistrictUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + $scope.customerBillingAddress.stateData.idtableStateId + "/districts";
            $scope.regionsStatesDistrictsCityArrayForBilling = [];
            var regionsStatesDistrictsCityUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/countries/1/states/" + $scope.customerBillingAddress.stateData.idtableStateId + "/districts/" + response.tableAddress.tableCity.tableDistrict.idtableDistrictId + "/cities";
            var vatCheckURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/' + $scope.customersData.idtableCustomerId+ '/vats/checkvat/' + stateid;
            $q.all([$http.get(regionsStatesDistrictUrl),$http.get(regionsStatesDistrictsCityUrl),$http.get(vatCheckURL)])
                .then(function (res) {
                    console.log(res);
                    $scope.billingAddressGstin = res[2].data;
                    $scope.regionsStatesDistrictArrayForBilling =  res[0].data;
                    $scope.customerBillingAddress.districtData = initializeDropdowns($scope.regionsStatesDistrictArrayForBilling, 'idtableDistrictId', response.tableAddress.tableCity.tableDistrict.idtableDistrictId);
                    $scope.district = $scope.customerBillingAddress.districtData.tableDistrictLongName;
                    $scope.regionsStatesDistrictsCityArrayForBilling = res[1].data;
                    $scope.billingAddress.tableCity = initializeDropdowns($scope.regionsStatesDistrictsCityArrayForBilling, 'idtableCityId', response.tableAddress.tableCity.idtableCityId);
                    $scope.cityVal = $scope.billingAddress.tableCity.tableCityLongName;
                    if(res[2].data){
                        if($scope.billingaddress)
                        {
                            $scope.genericData.customerVatTinBilling = res[2].data.tableCustomerStateWiseVatNo;
                            $scope.tableGstTypeBilling.tableGstType = res[2].data.tableGstType;
                        }
                        else
                        {
                            $scope.genericData.customerVatTinShipping = res[2].data.tableCustomerStateWiseVatNo;
                            $scope.tableGstTypeShipping.tableGstType = res[2].data.tableGstType;
                        }
                    }
                    $('#billingAddressModal').modal('show');
                })
                .catch(function (error) {

                });
            $scope.searchLocationBilling = {
                latitude: response.tableAddress.tableAddressLatitude,
                longitude: response.tableAddress.tableAddressLongitude
            }

        });
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

    $scope.cancelShippingAddress = function(form)
    {
        $scope.customerAddress = {};
        $scope.shippingAddress = {};
        $scope.customerVatTin = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#shippingAddressModal').modal('hide');
    };

    $scope.cancelBillingAddress = function(form)
    {
        $scope.customerAddress = {};
        $scope.billingAddress = {};
        $scope.billingAddressGstin = {};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#billingAddressModal').modal('hide');
    };

    $scope.validatePhone = function(phoneCase) {
        $scope.notify("Please Enter Valid Phone Number",'warning');
        document.myForm.phNo.focus();
    };

    $scope.checkCustomerCode = function(customercode)
    {
        var q = $q.defer();
        if(customercode != null && customercode != undefined && customercode != "")
        {
            if (customercode.length > 45)
            {
                $scope.notify("Customer code should be less than 45 characters",'warning');
                q.resolve(false);
            }
            else
            {
                var checkCustomerCodeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/checkcustomercode?customercode=" + customercode;
                $http.get(checkCustomerCodeUrl).success(function (data)
                {
                    if (data.status == false) {
                        $scope.notify(data.statusMessage,'danger');
                        q.resolve(false);
                    }
                    if (data.status == true)
                    {
                        q.resolve(true);
                    }
                });
            }
        }
        else{
            q.resolve(true);
        }
        return q.promise;
    };


    $scope.checkEmail = function (customeremail) {
        if(!customeremail){
            $scope.notify("Please Enter correct Email ID",'warning');
            return;
        }
        var q = $q.defer();
        var checkEmailUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/checkemail?email=" + customeremail ;
        $http.get(checkEmailUrl).success(function(data)
        {
            if (data.status == false)
            {
                $scope.notify(data.statusMessage,'danger');
                q.resolve(false);
            }

            if (data.status == true)
            {
                q.resolve(true);
            }
        });
        return q.promise;
    }

    $scope.checkPhoneNo = function(phoneno)
    {
        var q = $q.defer();

        if (phoneno.length != 10)
        {
            $scope.notify('Please enter a 10 digit valid mobile no.');
            q.resolve(false);
        }
        else
        {
            var checkPhoneUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/checkphonenumber?phone=" + phoneno ;
            $http.get(checkPhoneUrl).success(function(data)
            {
                if (data.status == false)
                {
                    $scope.notify(data.statusMessage,'danger');
                    q.resolve(false);
                }

                if (data.status == true)
                {
                    q.resolve(true);
                }
            });
        }

        return q.promise;
    };

    var skuStart=0,size=10;
    $scope.skuLoadBusy = false;
    $scope.stopSkuLoad = false;
    $scope.skuPagingFunction = function () {
        if($scope.stopSkuLoad){
            return;
        }
        $scope.skuLoadBusy = true;
        mastersService.fetchSkusNext(MavenAppConfig.baseUrlSource,skuStart,size).then(function(data){
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

    $scope.masterSkuDialog = function(ev) {

        mastersService.fetchSkus(MavenAppConfig.baseUrlSource,function(data) {
            $scope.genericData.skusListFiltered = data;
            $timeout(function() {
                $('#dialogmastersku').modal('show');
                $scope.skuLoadBusy = false;
                $scope.stopSkuLoad = false;
            }, 500);
        });

    }

    $scope.selectSku = function(id, ev){
        $scope.stopSkuLoad = true;
        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/'+id).success(function(data) {
            console.log(data);

            $scope.$broadcast("angucomplete-alt:changeInput", "products", data);

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
        $('#dialogmastersku').modal('hide');

    }

    $scope.changeReturnType = function(){
        if($scope.genericData.returnType == 'quantitybased')
        {
            $scope.customersData.tableCustomerReturnValue = null;
        }
        if($scope.genericData.returnType == 'valuebased')
        {
            $scope.customersData.tableCustomerReturnQuantity = null;
        }

    }

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
                $scope.notify(error.errorMessage,'danger');
            }
            else{
                console.log("Failed to get GST Types");
            }
        });
    }

    $scope.onStateChangedShipping = function () {

        $scope.genericData.customerVatTinShippingPlaceholder = $scope.customerAddress.stateData.tableStateCode;
    }

    $scope.onStateChangedBilling = function () {

        $scope.genericData.customerVatTinBillingPlaceholder = $scope.customerBillingAddress.stateData.tableStateCode;
    }

    //=============================== bulk add customer ======================= //

    $scope.singleCustomerTabMode = function() {
        $scope.singleCustomerTab = true;
        $scope.bulkCustomerTab = false;
    }

    //bulkOrder Tab Mode
    $scope.bulkCustomerTabMode = function() {
        $scope.singleCustomerTab = false;
        $scope.bulkCustomerTab = true;
    }

    $scope.cancelCustomerBulkData = function (form) {
        $scope.uploadedFile={};
        if(form){
            var controlNames = Object.keys(form).filter(function(key){key.indexOf('$') !== 0});
            for (var name in controlNames) {
                var control = form[name];
                control.$setViewValue(undefined);
            }
            form.$setPristine();
            form.$setUntouched();
        }
        $('#customersBulkUpload').modal('hide');
    }

    $scope.disableBulkUpload = false;
    $scope.uploadBulkOrderFile = function(bulkOrderUploadfile,form) {
        console.log(bulkOrderUploadfile);
        file = bulkOrderUploadfile;
        $scope.disableBulkUpload = true;
        if (file) {
            if (!file.$error) {
                var uploadUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/customers/customersbulkupload';

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
                    $scope.notify("Upload is being processed in the background",'info');
                    console.log(resp);
                    if ($scope.modeCustomer == 'normal') {
                        var page = undefined;
                        //$scope.listOfCustomerCount(page);
                    }

                    if ($scope.modeCustomer == 'mutual') {
                        var page = undefined;
                        //$scope.listOfMutualCustomersCount(page);
                    }

                    if ($scope.modeCustomer == 'skuFull') {
                        var page = undefined;
                        //$scope.listOfMutualSkuCount(page);
                    }

                    $scope.uploadedFile={};
                    $scope.cancelCustomerBulkData(form);
                    $cookies.put('BulkUploadData','customer');
                    $cookies.put('ActiveTab','customer');
                    $scope.notify("File has been uploaded successfully.It may take a few minutes to reflect the changes.<br><a href='#/bulkuploads/' style='color: #00ACE4; font-weight: 600;cursor: pointer;'>View bulk upload reports.</a>",'success','','',0);
                    $scope.disableBulkUpload = false;
                }, function(error)
                {
                    $scope.uploadedFile={};
                    $scope.cancelCustomerBulkData(form);
                    if(error.status == 400)
                    {
                        $scope.notify(error.data.errorMessage,'danger');
                    }
                    else
                    {
                        $scope.notify("Failed to upload file.",'danger');
                    }
                    $scope.disableBulkUpload = false;
                }, function(evt) {
                    // progress notify
                });
            }
        }
    };

    $scope.closeBulkUploadDialog = function(){
        $mdDialog.hide();
        $cookies.put('BulkUploadData','customer');
        $cookies.put('ActiveTab','customer');
        $timeout(function() {
            $location.path('/bulkuploads');
            console.log('update with timeout fired')
        }, 1000);
    }

    $scope.downloadCustomerBulkUploadTemplate = function () {

        var orderListUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/customers/bulkuploadtemplate";

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
                    $scope.notify("There is some error in downloading template. Please try after some time.",'danger');
                }else{
                    var blob = new Blob([data], {type: 'application/vnd.ms-excel'});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "Glaucus_Customer_Bulk_Upload_Template.xls";
                    document.body.appendChild(a);
                    a.click();
                };

            }).error(function(error,status){
            if(status == 400){
                $scope.notify(data.errorMessage,'danger');
            }
            else{
                $scope.notify("There is some error in downloading template. Please try after some time.",'danger');
            }

        });

    }
    $scope.$on('$destroy', function () {
        $("#dialogmastersku").remove();
        $('.modal-backdrop').remove();
    });

}]);
