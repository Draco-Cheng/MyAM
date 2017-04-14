$.uipage = $.uipage || {};
$.uipage.angular = $.uipage.angular || {};
$.uipage.angular.MVC_Template = $.uipage.angular.MVC_Template || [];
$.uipage.SCOPE = {};
(function() {

  var _views = {};
  var _temp = {
    name: "initialPanel.manageDB",
    state: {
      url: "/manageDB",
      resolve: {},
      views: _views,
      //abstract : true
    }
  };


  _views['initialPanel'] = {
    templateUrl: $.uipage.templateURL + '04.manageDB.html',
    controller: ['$scope', '$http', 'i18n', function($scope, $http, i18n) {
      $.log("initial \"" + _temp.name + "\" controller ...");
      var _controller = $.uipage.angular.controller[_temp.name] = {};
      _controller.scope = $scope;
      _controller.http = $http;

      $scope.data = $scope.data || {};
      $scope.i18n = i18n;
      $scope.str = $scope.str || {};
      $scope.selectedDB = $.uipage.storage("MyAM_userDB");

      var _getdbList = function(callback) {
        $.uipage.ajax({
          url: "db/dbList",
          type: "get",
          callback: function(json) {
            if (json.successful) {
              json.data.forEach(function(data) {
                data.rename = data.name;
              });
              $scope.databases = json.data;
              callback && callback();
            }

          }
        });
      }
      _getdbList();


      var _fileNameChanged = function() {
        var _uploadDBfile = $("#manageDB #uploadDBfile");
        var _progressBlock = $("<div>").addClass("progress-block");
        var _progressMsg = $("<div>").addClass("progress-msg");
        var _progressBar = $("<div>").addClass("progress-bar");
        var _file = _uploadDBfile[0].files[0];
        _uploadDBfile.val("");

        $("#progress-panel").html(_progressBlock.append(_progressMsg).append(_progressBar));

        $.uipage.formApi.uploadFiles({
          name: "fileUpload",
          files: _file,
          progressCallback: function(percentage) {
            var _percentage = (percentage * 100).toFixed(2) + "%";

            if (_percentage === "100.00%")
              _progressMsg.html(i18n.manageDB["porting"] + " - " + _file.name)
            else
              _progressMsg.html(_percentage + " - " + _file.name);

            _progressBar.width(_percentage);
          },
          callback: function(json) {
            var _response = json[0];
            $scope.selectDatabase = "";

            if (_response.isCorrect) {
              _getdbList(function() {
                _progressBlock.addClass("done");
                _progressMsg.html(i18n.manageDB["uploadFinish"] + " - " + _file.name);
                $("#manageDB select").val(_file.name);
                $.uipage.storage("MyAM_userDB", _file.name);
                $.uipage.func.resetCache();
                _getdbList();
              });
            } else {
              console.log(_response.message)
              var _error = i18n.code[_response.message.code] || _response.message.code || "";
              _progressMsg.html(_error + "-" + _file.name)
              _progressBlock.addClass("error");
            }

          }
        })
      };

      $scope.rename = function(database) {
        $.uipage.ajax({
          url: "db/rename",
          type: "post",
          data: { "db": database.name, "dbFileRename": database.rename },
          callback: function(json) {
            if (json.successful) {
              if (database.name == $scope.selectedDB) {
                $scope.selectedDB = database.rename;
                $.uipage.storage("MyAM_userDB", database.rename);
              }

              _getdbList();
            } else {
              var _message = i18n.manageDB[json.code] || json.message;
              $.uipage.alert(_message.format(database.rename));
            }
          }
        });
      }

      $scope.setDB = function(database) {
        $.uipage.storage("MyAM_userDB", database.name);
        $scope.selectedDB = database.name;
        $.uipage.func.resetCache();
      }

      $scope.uploadDB = function(database) {
        $("#uploadDBfile")[0].onchange = _fileNameChanged;
        $("#uploadDBfile").click();
        $.uipage.storage("MyAM_userDB", "");
        $.uipage.func.resetCache();
      }

      $scope.delDB = function(database) {
        $.uipage.confirm(i18n.manageDB.confirmDel, function() {
          $.uipage.ajax({
            url: "db/del",
            type: "post",
            data: { "db": database.name },
            callback: function(json) {
              if (json.successful) {
                if (database.name == $scope.selectedDB) {
                  $scope.selectedDB = "";
                  $.uipage.storage("MyAM_userDB", "");
                }
                _getdbList();
              }
            }
          });
        })
      }

      $scope.downloadDB = function(database) {
        $.uipage.ajax({
          url: "db/download",
          type: "post",
          data: { "db": database.name },
          callback: function(json) {

            var a = window.document.createElement('a');
            //a.href = window.URL.createObjectURL(new Blob([json]));
            //a.download = database.name;
            a.href = json.data;

            // Append anchor to body.
            document.body.appendChild(a)
            a.click();

            // Remove anchor from body
            document.body.removeChild(a)
          }
        });
      }

      $scope.done = function() {
        if ($.uipage.storage("MyAM_userDB"))
          $.uipage.redirect("lobby");
        else
          $.uipage.alert(i18n.manageDB.plzSelectDB);
      }
    }]
  };


  $.uipage.angular.MVC_Template.push(_temp);

})();
