$(function(){
	var formApi = {};
	$.uipage = $.uipage || {};
	$.uipage.formApi = formApi;

	formApi.uploadFiles = function(filesJson) {
		var _file = filesJson.files || "";
		var _url = $.uipage.serverURL + ( filesJson.url || "db/upload" );
		var ObjName = filesJson.ObjName || "";
		var formData = filesJson.FormData || "";
		
		if(ObjName){
			if(FileList[ObjName]){
				_file=FileList[ObjName];
				delete FileList[ObjName];
			}else
				return;
		}
		
		
		if(!formData){
			formData = new FormData();
			formData.append("theupload[]", _file);
		}		

		var xhr = new XMLHttpRequest();
		
		if(ObjName){
			xhr.upload.addEventListener("progress", function (evt) {
				if (evt.lengthComputable) {
					console.log(ObjName, evt.loaded / evt.total)
				}
				else {
					// No data to calculate on
				}
			}, false);
			
			xhr.addEventListener("load", function () {
				console.log(ObjName, "finished");
			}, false);
		}
		xhr.open('POST', _url, true);
		xhr.onload = function(e) { 
			console.warn("xhr.onload",e)
		};
		xhr.send(formData);  // multipart/form-data


		return formData;
	}

	formApi.formPost = function(filesJson) {
		var _type = filesJson.type || "POST";
		var _url = filesJson.url || "";
		var formData = filesJson.FormData || "";
		var _data = filesJson.data || {};
		
		
		if(!formData){
			formData = new FormData();
			for(var _name in _data){
				formData.append(_name, _data[_name]);
			}
		}		

		var xhr = new XMLHttpRequest();
		
		xhr.open(_type, _url, true);
		xhr.onload = function(e) { 
			console.warn("xhr.onload",e)
		};
		xhr.send(formData);  // multipart/form-data
	}

	formApi.iframePost = function(filesJson) {
		var _type = filesJson.type || "POST";
		var _url = filesJson.url || "";
		var _data = filesJson.data || {};
		var _iframe = $("<iframe>");
		_form = $("<form>");

		_form.attr("method",_type);
		_form.attr("action",_url);
		

		for(var _name in _data){
			var _newInput = $("<input>")
			_newInput.attr("name", _name);
			_newInput.attr("value", _data[_name]);
			_form.append(_newInput);
		}

		_iframe.attr("onload",function(){
			setTimeout(function(){
				_iframe.remove();
				filesJson.callback && filesJson.callback();
			},500)
		})
		
		_iframe.height(0).width(0).hide();

		$("body").append(_iframe);
		_iframe.contents().find("body").append(_form);
		_form.submit()
		
	}

})