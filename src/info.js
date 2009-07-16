var Info = (function() {
  function init() {
    
  }
  
  return {
    init: init
  }

})();

RepoInfo.onFinishedLoading(function() {
  UserInfo.init();
})  

UserInfo.onFinishedLoading(function() {
  Info.init();
})

RepoInfo.init();
