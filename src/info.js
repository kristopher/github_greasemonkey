var Info = (function() {
  var tooltip_styles = '\
  #tooltip { \n\
    text-align: left; \n\
	  position: absolute; \n\
	  z-index: 3000; \n\
	  border: 1px solid #111; \n\
	  background-color: #eee; \n\
	  padding: 5px; \n\
	  opacity: 0.85; \n\
  } \n\
    \n\
  #tooltip h3, #tooltip div { margin: 0; }\n\
  #tooltip td { padding-right: 5px }\n';
  
  
  function init() {
    var style = $(document.createElement('style')).html(tooltip_styles);        
    $('head').append(style);
  }
  
  return {
    init: init
  }

}).call(unsafeWindow);

RepoInfo.onFinishedLoading(function() {
  UserInfo.init();
})  

UserInfo.onFinishedLoading(function() {
  Info.init();
})

RepoInfo.init();
