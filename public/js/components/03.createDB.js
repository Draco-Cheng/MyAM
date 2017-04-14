$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function() {

  var _views = {};
  var _temp = {
    name: "initialPanel.createDB",
    state: {
      url: "/createDB",
      resolve: {},
      views: _views,
      //abstract : true
    }
  };


  _views['initialPanel'] = {
    templateUrl: $.uipage.templateURL + '03.createDB.html',
    controller: ['$scope', '$http', 'i18n', function($scope, $http, i18n) {
      $.log("initial \"" + _temp.name + "\" controller ...");
      var _controller = $.uipage.angular.controller[_temp.name] = {};
      _controller.scope = $scope;
      _controller.http = $http;
      $scope.data = $scope.data || {};
      $scope.i18n = i18n;

      $scope.str = $scope.str || {};

      $scope.submit = function() {
        if (!$.uipage.blocking()) return;

        var _dbId = $scope.name + i18n["createDB"]["NameSuffix"]
        $.uipage.ajax({
          url: "db/create",
          data: {
            db: _dbId,
            mainCurrenciesType: $scope.currencyType
          },
          callback: function(json) {
            $.uipage.unblocking();

            if (json.successful) {
              $.uipage.storage("MyAM_userDB", _dbId);
              $.uipage.func.resetCache();
              $.uipage.redirect("lobby");
            } else {

              var _code = json.code;
              var _message = i18n["createDB"][_code] || i18n["code"][_code] || json.message;

              switch (_code) {
                case 409:
                  $.uipage.confirm(_message.format(_dbId), function() {
                    console.log("Next!!", _dbId);
                    $.uipage.storage("MyAM_userDB", _dbId);
                    $.uipage.func.resetCache();
                    $.uipage.redirect("lobby");
                  })
                  break;
                default:
                  $.uipage.alert(_message);
              }
            }


          }
        })

      }

    }]
  };



  $.uipage.angular.MVC_Template.push(_temp);

})();
