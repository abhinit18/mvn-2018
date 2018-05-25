/**
 * Upadated by Prakhar on 24-11-2017.
 */
angular.module('OMSApp.category', []).config(function config($stateProvider) {
    $stateProvider.state('/category/', {
        name: '/category/',
        url: '/category/',
        views: {
            "main": {
                controller: 'categoryController',
                templateUrl: 'category/category.html'
            },
            "header": {
                controller: 'headerCtrl',
                templateUrl: '../shared/templates/header.html'
            }
        },
        data: {pageTitle: 'Category'}
    })

}).controller('categoryController', ['$scope', '$http', '$location', '$q', '$cookies', 'Upload', '$timeout', '$cookies', '$rootScope', '$controller', 'MavenAppConfig',

function categoryController($scope, $http, $location, $q, $cookies, Upload, $timeout, $cookies, $rootScope, $controller, MavenAppConfig) {

    //==================================== Blank arrays and global variable=========================== //
    $controller('categorybaseController', {$scope: $scope});
    $scope.categorySearchUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/search?search=";
    $scope.menuItems = [];
    $scope.activeMenu = [];
    $scope.SecondChildMenuItems = [];
    $scope.FirstChildMenuItems = [];
    $scope.ChildMenuItems = [];
    $scope.FinalList = [];
    $scope.selection = [];
    $scope.selecteNodeToManageAttributes = {};
    $scope.manageAttributeMode = "add";
    var numberVariable = 5;
    $scope.firstChildAddCategory = false;
    $scope.secondChildAddCategory = false;
    $scope.thirdChildAddCategory = false;
    $scope.SkuCategoryData = {};
    $scope.genericData = {};

    $scope.getClientProfile = function () {
        var clientProfileUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles";
        $http.get(clientProfileUrl).success(function (data) {
            if (data.length > 0) {
                console.log('invoice data')
                console.log(data);
                if(data[0].tableClientProfileEnableInvoice && data[0].tableGstType) {
                    $scope.clientInvoice = data[0].tableClientProfileEnableInvoice;
                    $scope.clientGSTtype = data[0].tableGstType.tableGstTypeName;
                }
            }
            else {
                $scope.clientInvoice = false;
            }
        }).error(function (error, status) {
            $scope.clientInvoice = false;
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to load client profile");
            }
        });
    }
    $scope.getClientProfile();

    $scope.setSelected = function (selected) {
        $scope.genericData.selectedCategory = selected;

        var getAllParentsUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.genericData.selectedCategory.idskuNodeId + "/parents";
        $http.get(getAllParentsUrl).success(function (data) {
            console.log(data);
            var level = 0;
            level += $scope.genericData.startIndex;
            var httpArr = [];
            for (var parentcounter = data.length - 1; parentcounter >= 0; parentcounter--) {
                if ($scope.selectedcategory[level] == null) {
                    $scope.selectedcategory.push({});
                }
                $scope.selectedcategory[level].selected = data[parentcounter];

                if ($scope.selectedcategory.length > level + 1) {
                    $scope.selectedcategory.splice(level + 1, $scope.selectedcategory.length);
                }

                if ($scope.category.length > level + 1) {
                    $scope.category.splice(level + 1, $scope.category.length);
                }

                var getChildNodesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.selectedcategory[level].selected.idskuNodeId + "/childnodes";

                var req = {
                    method: 'GET',
                    timeout: 30000,
                    url: getChildNodesUrl
                };

                httpArr.push($http(req));


                level++;
            }

            if ($scope.selectedcategory[level] == null) {
                $scope.selectedcategory.push({});
            }
            $scope.selectedcategory[level].selected = selected;

            $q.all(httpArr).then(function (response) {

                var respcounter = 0;
                for (respcounter = 0; respcounter < data.length; respcounter++) {
                    $scope.category.push(response[respcounter].data);
                }

            }).catch(function (response) {
                //error resonse
            })

        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
        });

        //TODO:
        //Send a backend request to get all parents and set them selected //use {nodeid}/parents
        //traverse in reverse order
    }

    //======================== cancel generate template dialog =============== //

    $scope.cancelGenerateTemplateDialog = function () {
        $scope.selection = [];
    };


    //========================On category selected ===========================//

    $scope.searchedCategorySelected = function (selected) {
        if (selected != null) {
            $scope.searchedCategory = selected;
        }
    }

    //========================On category selected ===========================//

    //=============================== fist time data whethter its selected or not ===================== //

    $scope.LoadSelectedSkuNode = function () {
        var SelectedNodeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode?selected=true";
        $http.get(SelectedNodeUrl).success(function (data) {
            console.log(data);
            $scope.FinalList = data;
            angular.forEach($scope.FinalList, function (node) {
                node.skuNodePathName = node.skuNodePathName.split(',');
            });

        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to get selected categories.");
            }
        });
    };

    //====================================== ends here  ============================ //

    $scope.setActive = function (menuItem, nodeType) {
        console.log(menuItem);
        var crumbPath = menuItem.skuNodePathName.split(',');
        $scope.activeMenu = [];
        $scope.activeMenu = crumbPath;
        console.log($scope.activeMenu);
        if (nodeType == 'parent') {
            $scope.parentMenu = menuItem;
        }
        if (nodeType == 'first') {
            $scope.firstMenu = menuItem;
        }
        if (nodeType == 'second') {
            $scope.secondMenu = menuItem;
        }
        if (nodeType == 'third') {
            $scope.thirdMenu = menuItem;
        }
    };

    //Generic Start

    $scope.genericData.startIndex = 0;
    $scope.category = [];
    $scope.selectedcategory = [];

    $scope.onLeftArrowClicked = function () {

        if ($scope.genericData.startIndex > 0) {
            $scope.genericData.startIndex--;
        }
    }

    $scope.onRightArrowClicked = function () {

        if ($scope.genericData.startIndex + 4 < $scope.category.length) {
            $scope.genericData.startIndex++;
        }
    }

    $scope.onCategorySelected = function (level, category) {
        level += $scope.genericData.startIndex;
        if ($scope.selectedcategory[level] == null) {
            $scope.selectedcategory.push({});
        }
        $scope.selectedcategory[level].selected = category;

        if ($scope.selectedcategory.length > level + 1) {
            $scope.selectedcategory.splice(level + 1, $scope.selectedcategory.length);
        }

        if ($scope.category.length > level + 1) {
            $scope.category.splice(level + 1, $scope.category.length);
        }

        var getChildNodesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.selectedcategory[level].selected.idskuNodeId + "/childnodes";
        $http.get(getChildNodesUrl).success(function (data) {
            $scope.category.push(data);
        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to get child categories for selected category.");
            }
        });

    }

    $scope.onAddCategoryClicked = function (level) {
        level += $scope.genericData.startIndex;
        $scope.genericData.selectedlevel = level;
        $('#AddCategoryTemp').modal('show');
    }

    $scope.onSaveCategoryClicked = function () {

        var addCategoryUrl = "";
        if ($scope.genericData.selectedlevel == 0) {
            addCategoryUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunode';
        }
        else {
            addCategoryUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunode/' + $scope.selectedcategory[$scope.genericData.selectedlevel - 1].selected.idskuNodeId + '/addchild';
        }
        if ($scope.categoryName == null || $scope.categoryName == undefined || $scope.categoryName == "") {
            $scope.notify('Category name is required.');
            return;
        }
        else {
            var postcategoryData = {
                "skuNodeName": $scope.categoryName,
                "skuNodeHasChild": false,
                "skuNodeBrowseNodeId": null,
                "skuNodePathName": null,
                "skuNodeIsSelected": false,
                "skuNodeIsStandard": false,
                "tableSkuNodeAttributeTypes": []
            };
            $http({
                method: 'POST',
                url: addCategoryUrl,
                data: postcategoryData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                $('#AddCategoryTemp').modal('hide');
                $scope.categoryName = "";
                if ($scope.genericData.selectedlevel != 0) {
                    $scope.selectedcategory[$scope.genericData.selectedlevel - 1].selected.skuNodeHasChild = true;
                }
                if ($scope.category[$scope.genericData.selectedlevel] == null) {
                    $scope.category.push(new Array());
                }
                $scope.category[$scope.genericData.selectedlevel].push(data);
                $scope.notify('Category added successfully.','success');
            }).error(function (error, status) {
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Failed to add category.");
                }
            });
        }
    }

    $scope.getParentNodes = function () {
        var getParentNodesUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/parentnodes";
        $http.get(getParentNodesUrl).success(function (data) {
            $scope.category.push(data);
        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to get parent nodes");
            }
        });
    };

    //Generic End

    //======================= selected parent Node ====================== //


    $scope.variablePath = [];
    $scope.ActiveParentNode = function (itemValue) {
        $scope.SkuCategoryData.idskuNodeId = itemValue.idskuNodeId;
        $scope.SecondChildMenuItems = [];
        $scope.FirstChildMenuItems = [];
        $scope.ChildMenuItems = [];
        var childNodeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.SkuCategoryData.idskuNodeId + "/childnodes";
        $http.get(childNodeUrl).success(function (data) {
            console.log(data);
            $scope.firstChildAddCategory = true;
            $scope.secondChildAddCategory = false;
            $scope.thirdChildAddCategory = false;
            angular.forEach(data, function (response) {
                $scope.variablePath = response.skuNodePathName.split(',');
                console.log($scope.variablePath);
            });
            $scope.ChildMenuItems = data;

        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to get child categories for selected category.");
            }
        });
    };


//    ================================== first child Nodes =================================== //

    $scope.firstChildNode = function (itemValue) {
        $scope.SkuCategoryData.idskuNodeId = itemValue.idskuNodeId;
        $scope.SecondChildMenuItems = [];
        $scope.FirstChildMenuItems = [];
        var firstChildNodeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.SkuCategoryData.idskuNodeId + "/childnodes";
        $http.get(firstChildNodeUrl).success(function (data) {
            console.log(data);
            $scope.secondChildAddCategory = true;
            angular.forEach(data, function (response) {
                $scope.variablePath = response.skuNodePathName.split(',');
                console.log($scope.variablePath);
            });

            $scope.FirstChildMenuItems = data;

        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to get child categories for selected category.");
            }
        });
    };


//    ====================================== second Child node ===================== //

    $scope.secondChildNode = function (itemValue) {
        $scope.SkuCategoryData.idskuNodeId = itemValue.idskuNodeId;
        var secondChildNodeUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.SkuCategoryData.idskuNodeId + "/childnodes";
        $http.get(secondChildNodeUrl).success(function (data) {
            console.log(data);
            $scope.thirdChildAddCategory = true;
            angular.forEach(data, function (response) {
                $scope.variablePath = response.skuNodePathName.split(',');
                console.log($scope.variablePath);
            });

            $scope.SecondChildMenuItems = data;

        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to get child categories for selected category.");
            }
        });
    };

    $scope.CategoryDeleteObj = {};
    $scope.CategoryDeleteConfirmation = function (data, index) {
        $scope.CategoryDeleteObj.categoryItemData = data;
        $scope.CategoryDeleteObj.categoryItemDataIndex = index;
        $('#DeleteCategoryModal').modal('show');
    };
    $scope.DeleteSelectedItemFromCategoryList = function () {
        $scope.SelectThirdChildNode($scope.CategoryDeleteObj.categoryItemData, 'delete', $scope.CategoryDeleteObj.categoryItemDataIndex);
    };
    $scope.cancelDeleteCategoryModal = function () {
        $('#DeleteCategoryModal').modal('hide');
    };

    $scope.hsn = {};
    $scope.askHSNNumber = function (data, index) {
        if(!data){
            $scope.notify('Please select a category first!');
        }else{
            $scope.CategoryDeleteObj.categoryItemData = data;
            $scope.CategoryDeleteObj.categoryItemDataIndex = index;
            $scope.hsn.mode = 'create';
            if (($scope.clientInvoice) && ($scope.clientGSTtype == "Regular GST" || $scope.clientGSTtype == "Composition GST")) {
                $('#askHSNNumberModal').modal('show');
            }
            else {
                $scope.SelectThirdChildNode($scope.CategoryDeleteObj.categoryItemData, 'select', $scope.CategoryDeleteObj.categoryItemDataIndex);
            }
        }
    }

    $scope.editHSNNumber = function (data, index) {
        $scope.CategoryDeleteObj.categoryItemData = angular.copy(data);
        $scope.hsn.oldnumber = $scope.CategoryDeleteObj.categoryItemData.tableHsn;
        $scope.CategoryDeleteObj.categoryItemDataIndex = index;
        $scope.hsn.mode = 'edit';
        $('#askHSNNumberModal').modal('show');
    }

    $scope.cancelAskHSNNumberModal = function () {
        if ($scope.hsn.mode == 'edit') {
            $scope.CategoryDeleteObj.categoryItemData.tableHsn = $scope.hsn.oldnumber;
        }
        $scope.CategoryDeleteObj = {};
        $('#askHSNNumberModal').modal('hide');
    }


    $scope.SelectThirdChildNode = function (data, buttonAction, index) {

        if (data == null || data == undefined) {
            $scope.notify('Select a category first');
            return;
        }
        $scope.SkuCategoryData = data;
        console.log(data);
        console.log(index);
        console.log(buttonAction);

        if (buttonAction == 'select' || buttonAction == 'selectWithoutHSN') {
            for (var nodeCounter = 0; nodeCounter < $scope.FinalList.length; nodeCounter++) {
                if ($scope.FinalList[nodeCounter].idskuNodeId == data.idskuNodeId) {
                    $scope.notify('Category already selected');
                    if ($scope.searchedCategory != null) {
                        $scope.searchedCategory = null;
                        $scope.$broadcast('angucomplete-alt-long:clearInput', 'category');
                    }
                    return;
                }
            }
        }
        if(buttonAction == 'selectWithoutHSN'){
            delete data.tableHsn;
        }

        if (buttonAction == 'delete') {
            var childSelectionUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunode/' + $scope.SkuCategoryData.idskuNodeId + "/select?selected=" + false;
        }
        else {
            childSelectionUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunode/' + $scope.SkuCategoryData.idskuNodeId + "/select?selected=" + true + "&hsnnumber=" + ((data.tableHsn && data.tableHsn.tableHsnCode) ? data.tableHsn.tableHsnCode : '');
        }
        $http({
            method: 'PUT',
            url: childSelectionUrl,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (response) {
            console.log(response);
            if (buttonAction == 'select' || buttonAction == 'selectWithoutHSN') {
                data.skuNodePathName = (data.skuNodePathName instanceof Array) ? data.skuNodePathName : data.skuNodePathName.split(',');
                $scope.FinalList.push(data);
                $scope.searchedCategory = null;
                $scope.$broadcast('angucomplete-alt-long:clearInput', 'category');
               $scope.notify('Category added successfully','success');
                console.log($scope.FinalList);
                $('#askHSNNumberModal').modal('hide');
            }
            else if ($scope.hsn.mode == 'edit') {
                $('#askHSNNumberModal').modal('hide');
                $scope.notify('Successfully updated HSN Number','success');
            }
            else {
                $scope.FinalList.splice(index, 1);
                $('#DeleteCategoryModal').modal('hide');
                $scope.notify('Category removed successfully','success');
            }
            $scope.hsn = {};
            $scope.LoadSelectedSkuNode();
        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to remove category.");
            }

        });
        console.log($scope.FinalList);
    };

//    ==================================== function for generating template ============================ //

    $scope.PostTemplateData = function (data) {
        console.log($scope.selection);
        var postTemplateData = [];
        postTemplateData = angular.copy(data);
        angular.forEach(postTemplateData, function (value) {
            console.log(value);
            value.skuNodePathName = value.skuNodePathName.join();
        });

        if (postTemplateData.length > numberVariable) {
            $scope.notify('You are not allowed to select more than ' + numberVariable + ' categories for template generation.');
            return;
        }
        if (postTemplateData.length < 1) {
            $scope.notify('Select at least one category.');
            return;
        }
        else {
            $http({
                method: 'POST',
                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skus/gettemplateforskuupload',
                data: postTemplateData,
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
                a.download = "Glaucus_SKU_Bulk_Upload_Template.xls";
                document.body.appendChild(a);
                a.click();
                $scope.notify('Template generated successfully.','success');
                $("#generateTemp").modal('hide');
                $scope.cancelGenerateTemplateDialog();
            }).error(function (error, status) {
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Failed to generate template.");
                }
            });
        }

    };

//    ============================================= generate template ================================== //

    $scope.bitchange = function (site) {

        var idx = $scope.selection.indexOf(site);
        console.log(idx);
        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(site);
        }
        console.log($scope.selection);

    };

    $('#generateTemp').on('show.bs.modal', function (e) {

        $scope.LoadSelectedSkuNode();
    });

    $scope.GenerateTemplate = function (data) {
        console.log(data);

        if (data.length <= numberVariable) {
            $scope.PostTemplateData(data);
        }
        else {
            data = [];
            $scope.selection = [];
            $('#generateTemp').modal('show');
        }
    };
    $scope.SendTemplate = function () {
        $scope.PostTemplateData($scope.selection);
    };

//    ========================================== add categories -================================ //

    var addCategoryUrl;
    $scope.addCategories = function (value) {
        $scope.addCategorybtnType = value;
        if ($scope.addCategorybtnType == 'parent') {
            addCategoryUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunode';
        } else {
            addCategoryUrl = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunode/' + $scope.SkuCategoryData.idskuNodeId + '/addchild';
        }
        $('#AddCategoryTemp').modal('show');
    };
    $scope.SendCategoryName = function () {
        if ($scope.categoryName == null || $scope.categoryName == undefined || $scope.categoryName == "") {
            $scope.notify('Category name is required.');
            return;
        }
        else {
            if ($scope.addCategorybtnType == 'third') {
                $scope.SkuCategoryData.skuNodeHasChild = false;
            }
            else {
                $scope.SkuCategoryData.skuNodeHasChild = true;
            }
            var postcategoryData = {
                "skuNodeName": $scope.categoryName,
                "skuNodeHasChild": $scope.SkuCategoryData.skuNodeHasChild,
                "skuNodeBrowseNodeId": null,
                "skuNodePathName": null,
                "skuNodeIsSelected": false,
                "skuNodeIsStandard": false,
                "tableSkuNodeAttributeTypes": []
            };
            $http({
                method: 'POST',
                url: addCategoryUrl,
                data: postcategoryData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                console.log(data);
                if ($scope.addCategorybtnType == 'parent') {
                    $scope.menuItems.push(data);
                }
                if ($scope.addCategorybtnType == 'first') {
                    $scope.ChildMenuItems.push(data);
                }
                if ($scope.addCategorybtnType == 'second') {
                    $scope.FirstChildMenuItems.push(data);
                }
                if ($scope.addCategorybtnType == 'third') {
                    $scope.SecondChildMenuItems.push(data);
                }
                $scope.categoryName = "";
                $('#AddCategoryTemp').modal('hide');
                $scope.notify('Category added successfully.','success');
            }).error(function (error, status) {
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify("Failed to add category.");
                }
            });
        }
    }

//    ================================================== Manage attribute ========================================== //

    $scope.LoadAttribute = function (data) {
        $scope.attrDetails = data.tableSkuNodeAttributeTypes;
    };

    $scope.attributeValues = [];
    $scope.attributeValues[0] = {};
    $scope.addElement = function () {
        $scope.attributeValues.push({});
        console.log($scope.attributeValues);
    };
    $scope.manageAttr = function (data) {
        $scope.selecteNodeToManageAttributes = data;

        var attrUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.selecteNodeToManageAttributes.idskuNodeId;
        $http.get(attrUrl).success(function (response) {
            $scope.selecteNodeToManageAttributes.tableSkuNodeAttributeTypes = response;
            console.log(data);
            $scope.LoadAttribute(data);
            $('#AttributeTemp').modal('show');
        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify('Error while getting attributes for this category')
            }
        });
    }


    $scope.editSkuNodeAttribute = function (index) {
        $scope.manageAttributeMode = "edit";
        $scope.attributeIndex = index;

        $scope.newAttributeType = $scope.attrDetails[index];

        var attrPossibleValues = $scope.attrDetails[index].tableSkuNodeAttributePossibleValueses
        if (attrPossibleValues == null || attrPossibleValues.length == 0) {
            $scope.attributeValues[0] = {};
        }
        else {
            $scope.attributeValues = [];
            $scope.attributeValues = attrPossibleValues;
        }


    }

    $scope.makeAttributeVariant = function (index, value) {

        var variantCount = false;

        for (var i = 0; i < $scope.attrDetails.length; i++) {

            if ($scope.attrDetails[i].attributeTypeVariant) {
                ++variantCount;
            }
        }

        if (value == true) {

            $scope.checkVariantCount().then(
                function (v) {
                    variantCount = v;
                    if (variantCount == true) {

                        var dataObject = $scope.attrDetails[index];
                        var idAttributeType = $scope.attrDetails[index].idattributeTypeId;
                        dataObject.attributeTypeVariant = value;
                        $http(
                            {
                                method: "PUT",
                                url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunodeattributetype/setasvariant',
                                data: dataObject,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        ).success(function (response) {

                            $scope.notify("Successfully updated.",'success');

                        }).error(function (error) {
                            $scope.notify(error);
                        });
                    } else {
                        $scope.notify("You have already selected 3 attributes as variants.");
                        $scope.attrDetails[index].attributeTypeVariant = false;
                    }
                },
                function (err) {
                }
            );

        }else{
            var dataObject = $scope.attrDetails[index];
            var idAttributeType = $scope.attrDetails[index].idattributeTypeId;
            dataObject.attributeTypeVariant = value;
            $http(
                {
                    method: "PUT",
                    url: MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunodeattributetype/setasvariant',
                    data: dataObject,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ).success(function (response) {

                $scope.notify("Successfully updated.",'success');

            }).error(function (error) {
                $scope.notify(error);
            });
        }
        console.log("################### Variant Count:"+ variantCount);
    }

    $scope.checkVariantCount = function () {

        var q = $q.defer();

        $http.get(MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunodeattributetype/checkvariantcount/' + $scope.selecteNodeToManageAttributes.idskuNodeId).success(function(response) {

            $scope.variantCountCheck = response;

            q.resolve($scope.variantCountCheck);
        }).error(function(error) {
            q.reject(-1);
        });

        return q.promise;
    }

    $scope.removeSkuNodeAttribute = function (index) {

        var removeAttributeTypeURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunodeattributetype/' + $scope.attrDetails[index].idattributeTypeId;
        $http({
            method: 'DELETE',
            url: removeAttributeTypeURL,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res) {
            if (res)
            {
                $scope.notify("Attribute removed",'success');
                $scope.attrDetails.splice(index, 1);

                //If user has also selected the same for edit, clear the form
                if($scope.attributeIndex == index)
                {
                    $scope.cancelManageAttributes();
                }
            }
            else {
                $scope.notify("Failed to remove attribute");
            }
        }).error(function (error, status) {
            console.log(error);
            console.log(status);
            if (status == 400) {
                $scope.notify(error.errorMessage);
                return;
            }

        });


    }

    $scope.saveNewAttributeAndValues = function () {
        if ($scope.newAttributeType == undefined || $scope.newAttributeType.attributeTypeString == '' || $scope.newAttributeType.attributeTypeString == null || $scope.newAttributeType.attributeTypeString == undefined) {
            $scope.notify("Attribute name is mandatory");
            return;
        }
        if (isNaN(parseFloat($scope.newAttributeType.attributeTypeString)) == false) {
            $scope.notify("Attribute name can not be digits");
            return;
        }

        var foundvalidval = false;
        for (var attrValCounter = 0; attrValCounter < $scope.attributeValues.length; attrValCounter++) {
            if ($scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue != null && $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue != undefined && $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue != '') {
                foundvalidval = true;
                $scope.attributeType = 'select';
            }
        }
        if (foundvalidval == false) {
            $scope.attributeType = 'text';
        }


        console.log($scope.selecteNodeToManageAttributes);
        console.log($scope.newAttributeType);
        console.log($scope.attributeValues);

        var attributeValsList = [];

        for (var attrValCounter = 0; attrValCounter < $scope.attributeValues.length; attrValCounter++) {
            if ($scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue == null || $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue == undefined || $scope.attributeValues[attrValCounter].nodeAttributePossibleValuesValue == '') {
                continue;
            }
            else {
                if ($scope.attributeValues[attrValCounter].nodeAttributePossibleIsStandard == null || $scope.attributeValues[attrValCounter].nodeAttributePossibleIsStandard == undefined) {
                    $scope.attributeValues[attrValCounter].nodeAttributePossibleIsStandard = false;
                }
                attributeValsList.push($scope.attributeValues[attrValCounter]);
            }
        }

        var saveAttributeTypeURL = MavenAppConfig.baseUrlSource + '/omsservices/webapi/skunode/' + $scope.selecteNodeToManageAttributes.idskuNodeId + '/attributetypes';
        if ($scope.newAttributeType.attributeTypeIsStandard == null || $scope.newAttributeType.attributeTypeIsStandard == undefined) {
            $scope.newAttributeType.attributeTypeIsStandard = false;
        }
        $scope.newAttributeType.tableSkuNodeAttributePossibleValueses = attributeValsList;
        $scope.newAttributeType.attributeType = $scope.attributeType;
        var postData = $scope.newAttributeType;

        var httpmethod = '';
        if ($scope.manageAttributeMode == 'add') {
            httpmethod = "POST";
        }
        if ($scope.manageAttributeMode == 'edit') {
            httpmethod = "PUT";
        }

        $http({
            method: httpmethod,
            url: saveAttributeTypeURL,
            data: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (res) {
            console.log(res);
            if (res) {
                if ($scope.manageAttributeMode == 'add') {
                    $scope.notify("Attribute added successfully",'success');
                    $scope.attrDetails.push(res);
                }
                if ($scope.manageAttributeMode == 'edit') {
                    $scope.attrDetails.splice($scope.attributeIndex);
                    $scope.attrDetails.push(res);
                    $scope.notify("Attribute updated successfully",'success');
                }
                $scope.cancelManageAttributes();
            }
        }).error(function (error, status) {
            console.log(error);
            console.log(status);
            if (status == 400) {
                $scope.notify(error.errorMessage);
                return;
            }
            if ($scope.manageAttributeMode == 'add') {
                $scope.notify("Failed to add attribute");
            }
            if ($scope.manageAttributeMode == 'edit') {
                $scope.notify("Failed to update attribute");
            }
        });


    }

    $scope.hideManageAttributeDialog = function () {
        $('#AttributeTemp').modal('hide');
    }


    $scope.cancelManageAttributes = function () {

        $scope.attributeIndex = null;
        $scope.newAttributeType = {};
        $scope.attributeValues = [];
        $scope.attributeValues[0] = {}; //Need one for placeholder
        $scope.manageAttributeMode = "add";

    }
    $scope.askcategorymaster = false;
    $scope.getCategoryMasterFlag = function () {

        var getCategoryMasterFlagURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles/askcategorymaster";

        $http.get(getCategoryMasterFlagURL).success(function (data) {
            $scope.askcategorymaster = data;


        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to get category master");
            }
        });
    }

    $scope.getCategoryMasterFlag();

    $scope.updateCategoryToStandard = function () {
        var setCategoryMasterURL = MavenAppConfig.baseUrlSource + "/omsservices/webapi/clientprofiles/categorymaster?option=Standard";

        $http({
            method: 'PUT',
            url: setCategoryMasterURL,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (response) {
            $scope.askcategorymaster = false;

        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify('Failed to set ' + $scope.genericData.selectedCategoryMaster + ' as default category master  ');
            }
        });
    }


    $scope.selectedBarcodeAttributes = [];
    $scope.manageBarcodeAttr = function (data) {
            $scope.selecteNodeToManageAttributes = data;

            var attrUrl = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunodeattributetype/byskunode/" + $scope.selecteNodeToManageAttributes.idskuNodeId;
            var selectedAttribute = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.selecteNodeToManageAttributes.idskuNodeId + "/barcodeattributes";
            $http.get(attrUrl).success(function (response) {
                $scope.selecteNodeToManageAttributes.tableSkuNodeAttributeTypes = response;
                console.log(data);
                $scope.LoadAttribute(data);
                if(!response.length){
                    $scope.notify('Please add attributes first');
                }else{
                    $http.get(selectedAttribute).success(function (data) {
                        for (var i = 0; i < response.length; i++) {
                            for (var j = 0; j < data.length; j++) {
                                if (data[j].tableBarcodeAttributeMapAttributeName == response[i].attributeTypeString) {
                                    $scope.selectedBarcodeAttributes.push(response[i]);
                                    break;
                                }
                            }
                        }
                    }).error(function (error, status) {
                        if (status == 400) {
                            $scope.notify(error.errorMessage);
                        }
                        else {
                            $scope.notify('Error while getting selected barcodeattributes for this category')
                        }
                    })
                    $('#barcodeattributeform').modal('show');
                }
            }).error(function (error, status) {
                if (status == 400) {
                    $scope.notify(error.errorMessage);
                }
                else {
                    $scope.notify('Error while getting attributes for this category')
                }
            });
    }

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            if (list.length >= 4) {
                $scope.notify("You can not select more than 4 attributes");
            }
            else {
                list.push(item);
            }
        }
    };

    $scope.cancelBarcodeAttributeForm = function (form) {
        $scope.selectedBarcodeAttributes = [];
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
        $('#barcodeattributeform').modal('hide');
    }

    $scope.submitBarcodeUpdateForm = function (form) {
        var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/" + $scope.selecteNodeToManageAttributes.idskuNodeId + "/barcodeattributes";
        $http({
            method: 'PUT',
            url: url,
            data: $scope.selectedBarcodeAttributes,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            $scope.cancelBarcodeAttributeForm(form);
            $scope.notify('Barcode Attribute updated successfully.','success');
        }).error(function (error, status) {
            if (status == 400) {
                $scope.notify(error.errorMessage);
            }
            else {
                $scope.notify("Failed to update barcode attribute.");
            }
        });
    }

    $scope.getParentNodes();
    $scope.LoadSelectedSkuNode();
    $scope.openImageUploadModal = function (data) {
        $scope.clear();
        $scope.tableSkuNodeforImageUplaod = data;
        $scope.tableSkuNodeImageUrl = 'https://s3-us-west-2.amazonaws.com/glaucusdev/'+ data.tableSkuNodeImage;
        $scope.isImageApproved = data.tableSkuNodeImageApproved;
        $scope.enableCheckBoxValue = data.tableSkuNodeImageApproved;
        $('#uploadImageDialog').modal("show");
    }


    $scope.imageApprovalConfirmationValue = null;

    $scope.approveImageDialog = function (data) {

        $scope.imageApprovalConfirmationValue = data;

        $('#approveImageDialog').modal("show");
    }

    $scope.closeApproveImageDialog = function () {
        $('#approveImageDialog').modal("hide");
    }

    $scope.fileChanged = function(e) {

        var files = e.target.files;

        var fileReader = new FileReader();
        fileReader.readAsDataURL(files[0]);

        fileReader.onload = function(e) {
            $scope.imgSrc = this.result;
            $scope.$apply();
        };

    }

    $scope.clear = function() {
        $scope.imageCropStep = 1;
         $scope.imgSrc = null;
         $scope.result = null;
         $scope.resultBlob = null;
        document.getElementById('fileInput').value = null;
    };

    $scope.saveImageToServer=function(data){

        var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/"+$scope.tableSkuNodeforImageUplaod.idskuNodeId+"/images";

       /* var fd = new FormData();
        fd.append('uploadFile', $scope.result);*/

        $http({
            method: 'POST',
            url: url,
            data: $scope.result,
            headers: {
                'Content-Type': undefined
            }
        }).success(function(data)
        {
            $scope.clear();
            $scope.notify('Image Uploaded Successfully','success');
            $('#uploadImageDialog').modal("hide");
            $scope.LoadSelectedSkuNode();
        }).error(function(error,status)
        {
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else
            {
                $scope.notify("Failed to upload image. Please try after sometime.");
            }
        });


    }

    $scope.approveImage = function(value)
    {
        var url = MavenAppConfig.baseUrlSource + "/omsservices/webapi/skunode/"+$scope.tableSkuNodeforImageUplaod.idskuNodeId+"/approveImage?value=" + value;
        $http({
            method: 'PUT',
            url: url,
            data : '',
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data)
        {
            $scope.clear();
            if(value == true) {
                $scope.notify('Image approved');
            }
            if(value == false) {
                $scope.notify('Image marked unapproved');
            }
            $('#uploadImageDialog').modal("hide");
            $('#approveImageDialog').modal("hide");
            $scope.LoadSelectedSkuNode();
        }).error(function(error,status)
        {
            if(status == 400)
            {
                $scope.notify(error.errorMessage);
            }
            else
            {
                $scope.notify("Failed to approve photo. Please try after sometime.");
            }
        });
    }
}]);
