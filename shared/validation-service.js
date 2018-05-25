/*** @author Prakhar */
angular.module('MavenApp.validationService', []).factory(
'validationService', [ '$http', 'MavenAppConfig',
function($http, config) {
	
	var validationService = {};
	
	validationService.isValidData=function(value){
	return !value;
	};

validationService.isNotValidData=function(value){
	return !value;
};

validationService.notValidName=function(name) {
	if(!validationService.isNotValidData(name)){
		if (/^[a-z][a-z._\-]*$/.exec(name.toLowerCase())) {
		    return false;
		  }
	}
	  
	  return true;
};
validationService.capitalizeFirstCharOfWord=function(word){
	return (word.charAt(0)+"").toUpperCase() + word.slice(1);
};
validationService.notValidMobile=function(value){
	if(!validationService.isNotValidData(value)){
		var indNum = /^[0]?[789]\d{9}$/;

	     if(indNum.test(value)){
	        return false;
	    }
	}
	return true;
};
validationService.notValidDate=function (value){
	if(!validationService.isNotValidData(value)){
		if(value.match(/^(0[1-9]|[12][0-9]|3[01])[\- \/.](?:(0[1-9]|1[012])[\- \/.](201)[2-9]{1})$/)){}{
			return false;
		}
	}
	return true;
};
validationService.notValidEmail=function (value){
	if(!validationService.isNotValidData(value)){
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))  {
		return false;
		}
	}
	return true;
	};
validationService.showErrorMessage=function(message){
	//$.notify(message, { position:"top center" , className: 'error'});
	message=message.split("\n");
	var liBox="";
	$.each(message,function(index,value){
		if($.trim(value).length>0){
			liBox=liBox+"<li>"+value+"</li>";	
		}
		
	});
	$("#erroMessageHeaderSection").find(".insta-bima-error").html("<ul>"+liBox+"</ul>");
	$("#erroMessageHeaderSection").modal({backdrop:'static'});
	return ;
};
validationService.showInfoMessage=function(message){
	$.notify(message, { position:"top center" , className: 'info',autoHideDelay:3000});
	return ;
};
validationService.showSuccessMessage=function(message){
	$.notify(message, { position:"top center" , className: 'success'});
	return ;
};


return validationService;
	
}]);