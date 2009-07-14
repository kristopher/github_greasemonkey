var Info = function() {
  
}

RepoInfo.onFinishedLoading(function() {
  UserInfo.init();
  if (this.updated) {
    $.each(RepoSearch.instances, function(i) {
      this.updateStoredRepositories();
    })
  }
})  

UserInfo.onFinishedLoading(function() {
  
})

RepoInfo.init();
