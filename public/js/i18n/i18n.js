$.uipage = $.uipage || {};

////////////////
////  i18n  ////
////////////////
$.ajax({
  url: $.uipage.i18nURL,
  type: 'GET',
  async : false,
  dataType  : "json",
  data: {},
  error: function(xhr) {
    alert("Can't find language data...");
  },
  success: function(response) {
	$.uipage.i18n = response;
  }
});