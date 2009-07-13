var Info = function() {
  
}

try {
  RepoInfo.onFinishedLoading(function() {
    UserInfo.init();
  })  
} catch(e) {
  console.debug(e.message);
}

RepoInfo.init();
