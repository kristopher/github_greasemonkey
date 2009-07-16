var Info = (function() {
  var tooltip_styles = '\
  .tooltip { \n\ 
    position: absolute; \n\
    top: 0; \n\
    left: 0; \n\
    z-index: 3; \n\
    display: none; \n\
    background: #F0F0F0; \n\
    border: 5px solid #D8D8D8; \n\
    color: #666; \n\
    padding: 7px; \n\
  } \n\
    \n\
  .tooltip div { \n\
    margin-top: 10px; \n\
    max-width: 400px; \n\
    min-width: 300px; \n\
    border-top: \n\
    2px solid #666 \n\
  } \n\
    \n\
  .tooltip td { padding: 1px 10px; 1px 0 } \n\
  .tooltip p { padding: 15px } \n';


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
