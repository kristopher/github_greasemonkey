var Info = function() {
  
}

RepoInfo.onFinishedLoading(function() {
  UserInfo.init();
  if (this.updated) {
    JQuery.each(RepoSearch.instances, function() {
      this.updateStoreRepositories();
    })
  }
})  

UserInfo.onFinishedLoading(function() {
  
})

RepoInfo.init();
