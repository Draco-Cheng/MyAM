$.uipage = $.uipage || {};
$.uipage.serverURL = $.uipage.serverURL || "severSide/";
$.uipage.aniSetting = $.uipage.aniSetting || {};
$.uipage.aniSetting.inProgress = $.uipage.aniSetting.inProgress || [];
$.uipage.aniSetting.fadeOutDefaultDuration = $.uipage.aniSetting.fadeOutDefaultDuration ||  250;
$.uipage.aniSetting.fadeInDefaultDuration = $.uipage.aniSetting.fadeInDefaultDuration  || 250;
//$.uipage.inprogress = false;
//$.uipage.islogin = false;

localStorage = localStorage || "";

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

/* before ready setting */
(function(){
	
	////////////////
	////  Load  ////
	////////////////
	/*$.uipage.load = function(uipageObj){_load(uipageObj);};
	var  _load= function(uipageObj){
		var _DOM = uipageObj.DOM || false;
		var _url = uipageObj.url || false;
		var _css = uipageObj.css || false;
		var _js = uipageObj.js || false;
		var _callback = uipageObj.callback || function(){};
		var _empty = uipageObj.empty;
		
		if(!_DOM ) return;
		
		if(_empty)
			$(_DOM).empty();
			
		if(!!_url ){
			$(_DOM).addClass("ani_opacity").css("opacity",0);
			$(_DOM).load(_url,function(){
				_translation($(_DOM));
			
				if(_css){
					_css=$('<link rel="stylesheet" type="text/css" />').attr('href', _css)
					$(_DOM).append(_css);
				}
				if(_js){
					_js=$('<script></script>').attr('src', _js)
					$(_DOM).append(_js);
				}				
				_callback(_DOM);
				$(_DOM).css("opacity",1).removeClass("ani_opacity");
			});
		}else{
				if(_css){
					_css=$('<link rel="stylesheet" type="text/css" />').attr('href', _css)
					$(_DOM).append(_css);
				}
				if(_js){
					_js=$('<script></script>').attr('src', _js)
					$(_DOM).append(_js);
				}				
				_callback(_DOM);		
		};
		
	};
	
	var _translation = function(_DOM){
		$(_DOM).html($(_DOM).html().replace(/{t{/g,""));
		$(_DOM).html($(_DOM).html().replace(/}t}/g,""));
	}*/


	////////////////
	///// AJAX /////
	////////////////	
	var _Token = "";
	var _lastSalt = 0;
	var _isAjax = false;

	var _ajax = function(uipageObj){
			uipageObj = uipageObj || {};

			if(_isAjax){
				setTimeout(function(){
					$.uipage.ajax(uipageObj);		
				},100);
				return;			
			}


			if(uipageObj.requireLogin /*&& !$.uipage.islogin*/){
				$.log("warn",uipageObj.url + " require login... try again later...");
				setTimeout(function(){_ajax(uipageObj)},100);
				return;
			}
				
			var _callback=uipageObj.callback || function(){};
			var _errorCallback=uipageObj.errorCallback || _callback;
			var _data = uipageObj.data || {};
			var _url = uipageObj.url;
			var _type = uipageObj.type || "post";
			var _Scope = uipageObj.scope;
			var _Salt = new Date().getTime();
			var _http = uipageObj.http || null;

			uipageObj.retryTimes = uipageObj.retryTimes || 0;

			if(_Salt == _lastSalt) 
				_Salt = _Salt +1;

			_lastSalt = _Salt;
			
			if(!_url) return;
		
			if(_url.indexOf("//") == "-1")
				_url = $.uipage.serverURL + _url,
			
			_data = $.extend( _data, { "Token" : $.uipage.encrypt(_Token+_Salt) , "salt" : _Salt} );

			if(!_http){
				$.ajax({
					type: _type,
					url: _url,
					data: _data,
					success: function(json){
						var _response = {};
						_response.successful = true;
						_response.code = 200;
						_response.data = json;

						_isAjax = false;
						_callback(_response);
						$.uipage.forceRerender();
					},
					error : function(xhr, ajaxOptions, thrownError){
						_isAjax = false;

						if(xhr.status == 401 && uipageObj.retryTimes<3){
							uipageObj.retryTimes++;
							$.log("warn","Retry ajax:\""+_url+"\" "+uipageObj.retryTimes+" time(s) ...");
							_ajax(uipageObj);
						}else{
							var _response = {};
							_response.successful = false;
							_response.message = xhr.responseText || thrownError || xhr.statusText;
							_response.code = xhr.status;

							_errorCallback(_response);
						}

						$.uipage.forceRerender();
					}
				});
			}else{
				_http({
					method: _type, 
					url: _url,
					data: $.param(_data),
					headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				}).
				success(function(data, status, headers, config) {
					// this callback will be called asynchronously
					// when the response is available
					var _response = {};
					_response.successful = true;
					_response.status = 200;
					_response.data = json;

					_isAjax = false;
					_callback(_response);

				}).	
				error(function(data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
					_isAjax = false;
					
					if(status == 401 && uipageObj.retryTimes<3){
						uipageObj.retryTimes++;
						$.log("warn","Retry ajax:\""+_url+"\" "+uipageObj.retryTimes+" time(s) ...");
						_ajax(uipageObj);
					}else{
						console.log(data, status, headers, config)
						var _response = {};
						_response.successful = false;
						_response.message = data;
						_response.code = status;

						_errorCallback(_response);
					}

				});			
			}

	};
	$.uipage.ajax = function(uipageObj){_ajax(uipageObj);};
	
	
	/*var _loginAjax = function(uipageObj,$http){
			$.log("login...")
			var _callback=uipageObj.callback || function(){};
			var _Salt = new Date().getTime();
			var _pwd = uipageObj.pwd;
			var _loginToken = uipageObj.loginToken;
			var _id = uipageObj.id;
			var _loginSuccess = uipageObj.loginSuccess || function(){};
			var _loginFail = uipageObj.loginFail || function(){};
			var _rememberMe = uipageObj.rememberMe;
			
			var _useToken = false;
			var _pwdS = "";
			if(!_id) return $.uipage.inprogress = false;
			if(!!_loginToken){
				_useToken = true;
				_loginToken = $.uipage.encrypt(_loginToken +_Salt);
			}else{
				if(!_pwd) return $.uipage.inprogress = false;
				else{
					_pwd = $.uipage.encrypt(_pwd);
					_pwdS = $.uipage.encrypt(_pwd+_Salt);	
				}
			}
			
			if(!$http){
				$.ajax({
					type: "POST",
					url: $.uipage.serverURL + "?login",
					data: { "id" : _id , "pwd" : _pwdS ,"loginToken" : _loginToken  , "salt" : _Salt , "rememberMe" : _rememberMe},
					async : false,
					xhrFields: {withCredentials: false},
					success: function(json){
						if(!_useToken){
							_Token = $.uipage.encrypt(_pwdS+_pwd);
							if(_rememberMe){
								if(localStorage){
									localStorage.setItem("id",_id);
									localStorage.setItem("rememberme",$.uipage.encrypt(_pwdS+_Salt));
								}else{
									$.cookie("id",_id,{expires : 9999});
									$.cookie("rememberme",$.uipage.encrypt(_pwdS+_Salt),{expires : 9999});									
								}

							}else{
								$.removeCookie("id");
								$.removeCookie("rememberme");	
								if(localStorage){
									localStorage.removeItem("id");
									localStorage.removeItem("rememberme");
								}				
							}				
						}else{
							_Token = _loginToken;
							
							if(localStorage){
								localStorage.setItem("rememberme",$.uipage.encrypt(_Token+_Salt));
							}else{
								$.cookie("rememberme",$.uipage.encrypt(_Token+_Salt),{expires : 9999});
							}	
						}
						
						$.uipage.islogin = true;
						
						var  json = eval("{"+json.responseText+"}") || {};
						_loginSuccess(json);
					},
					error: function(json){
						_Token = "";
						$.removeCookie("id");
						$.removeCookie("rememberme");
						if(localStorage){
							localStorage.removeItem("id");
							localStorage.removeItem("rememberme");
						}
						$.uipage.islogin = false;
						_loginFail(json);
					}
				});
			}else{
				$http({
					method: "POST", 
					url: $.uipage.serverURL + "?login",
					data: $.param({ "id" : _id , "pwd" : _pwdS ,"loginToken" : _loginToken  , "salt" : _Salt , "rememberMe" : _rememberMe}),
					headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				}).
				success(function(data, status, headers, config) {
					// this callback will be called asynchronously
					// when the response is available
					if(!_useToken){
						_Token = $.uipage.encrypt(_pwdS+_pwd);
						if(_rememberMe){
							if(localStorage){
								localStorage.setItem("id",_id);
								localStorage.setItem("rememberme",$.uipage.encrypt(_pwdS+_Salt));
							}else{
								$.cookie("id",_id,{expires : 9999});
								$.cookie("rememberme",$.uipage.encrypt(_pwdS+_Salt),{expires : 9999});
							}
						}else{
							$.removeCookie("id");
							$.removeCookie("rememberme");
							if(localStorage){
								localStorage.removeItem("id");
								localStorage.removeItem("rememberme");
							}				
						}				
					}else{
						_Token = _loginToken;
						$.cookie("rememberme",$.uipage.encrypt(_Token+_Salt),{expires : 9999});			
					}
					

					$.uipage.islogin = true;
					var  json = eval("{"+data.responseText+"}") || {};
					_loginSuccess(data);
				}).	
				error(function(data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
					_Token = "";
					$.removeCookie("id");
					$.removeCookie("rememberme");
					if(localStorage){
						localStorage.removeItem("id");
						localStorage.removeItem("rememberme");
					}
					$.uipage.islogin = false;
					_loginFail(data);
				});
			}


	};
	$.uipage.loginAjax = function(uipageObj,$http){_loginAjax(uipageObj,$http);};*/

	$.uipage.alert = function(str, callback){
		str && alert(str);
		callback && callback();
	};

	$.uipage.confirm = function(str, callback1, callback2){
		var _callback = (confirm(str) ? callback1 : callback2);
		_callback && _callback();
	};

	$.uipage.encrypt = function(str){
			str = str.split("");
			var _tempStr = $.md5("");
			for(var i=0;i<str.length;i++)
				_tempStr = $.md5(_tempStr + $.md5(str[i]));
			return $.md5(_tempStr);
	};


	/*$.uipage.checkLogin = function(_req){
		if(!!$.uipage.islogin == _req) return;
		else{
			if(_req)
				setTimeout(
					function(){
						location.hash = "/login";
					}
				)
			else
				setTimeout(
					function(){
						location.hash = "/lobby";
					}
				)
		}
	}*/

	$.uipage.forceRerender = function(){
		// force trigger view ready "$scope.$on('$viewContentLoaded', function(){});"
		var _controller = $.uipage.angular.controller;
		var _phase = _controller["$rootScope"].$root.$$phase;

		_controller[_controller["$rootScope"].$state.$current.name].scope.$emit("$viewContentLoaded");
		// force trigger view rendering.....
		
		if(_phase !== '$apply' && _phase !== '$digest')
			_controller["$rootScope"].$apply();	
		
		///// also can use /////
		//	$scope.$digest()  //
		//	$scope.$apply()   //
		////////////////////////
	}

	$.uipage.redirect = function(path, param){
		$.uipage.angular.controller.$rootlocation.url(path,param);

		//setTimeout(function(){
			$.uipage.forceRerender();
		//})
	}

	////////////////
	///// Loger /////
	////////////////
	$.log = function(){
		try{
			if(!!arguments[1]){
				if(console[arguments[0]])
					console[arguments[0]](arguments[1])
				else
					console["log"](arguments[1])
			}else
				console["log"](arguments[0])
		}catch(e){}
	}



	//////////////////////
	///// auto login /////
	//////////////////////
	/*if(localStorage.getItem("id") && localStorage.getItem("rememberme"))
		_loginAjax({id : localStorage.getItem("id"), loginToken : localStorage.getItem("rememberme")})
	else{
		if($.cookie("id") && $.cookie("rememberme")){
			_loginAjax({id : $.cookie("id"), loginToken : $.cookie("rememberme")})
		}		
	}*/


	var _blocking = false;
	$.uipage.blocking = function(){
		if(_blocking)
			return false;

		_blocking = true;
		return true;
	}

	$.uipage.unblocking = function(){
		_blocking = false;
	}

	$.uipage.storage = function(key, val){
		if(window.localStorage){
			if(val === undefined)
				return localStorage.getItem(key);
			if(val === "")
				return localStorage.removeItem(key);

			return localStorage.setItem(key, val);
		}else{
			if(val === undefined)
				return $.cookie(key);
			if(val === "")
				return $.removeCookie(key);

			var now = new Date();
            var time = now.getTime();
            time += 60 * 60 * 24 * 365 * 1000;
            now.setTime(time);
			var _option = { "expires" : now };

			return $.cookie(key, val, _option);
		}
	}	

	$.uipage.errHandler = function(obj){
		//declare the fatal error here and if return false will interrupt the flow;
		switch(obj.code){
			case 412:
				var _msg = $.uipage.i18n.code[obj.code].format($.uipage.storage("MyAM_userDB")) || obj.message;
				$.uipage.alert(_msg, function(){
					$.uipage.storage("MyAM_userDB", "");
					$.uipage.func.resetCache();
					$.uipage.redirect("/");
				});
				return true;
				break;
			default:
				return false;
		}
	}

})();



