var RepoInfo = (function() {
  var current_watched = $('.repos.watching li').not('.private'), 
      stored_watched = loadStoredWatched(),
      api_path = '/api/v2/json/repos/show/',
      finished_loading = false,
      on_finished_loading = [];
  
  function init() {
    var repos = [], key
    for(var i = 0; i < current_watched.length; i++) {
      key = $(current_watched[i]).find('b > a').attr('href').replace(/^\/(.*)\/tree/, '$1');
      if(stored_watched[key] === undefined) {
        repos.push(key);
      }
    }
    getAndStoreReposData(repos)
  }
  
  function loadStoredWatched() {
    return (JSON.parse(localStorage.getItem('watched_repositories')) || {})
  }
  
  function saveStoredWatched() {
    localStorage.setItem('watched_repositories', JSON.stringify(stored_watched));
  }
  
  function getAndStoreReposData(repos) {
    if (repos.length > 0) {
      getAndStoreRepoData(repos.pop())
      setTimeout(function() {
        getAndStoreReposData(repos);
      }, 1000);      
    } else {
      finished_loading = true
      runFinishedLoadingCallbacks();
    }
  }
  
  function getAndStoreRepoData(repo) {
    $.get(api_path + repo, function(json) {
      storeRepoJSON(repo, JSON.parse(json)['repository']);
    });
  }
  
  function storeRepoJSON(repo, json) {
    stored_watched[repo] = json;
    saveStoredWatched();
  }
    
  function finishedLoading() {
    return !!finished_loading;
  }
  
  function onFinishedLoading(callBack) {
    on_finished_loading.push(callBack);
  }
  
  function runFinishedLoadingCallbacks() {
    for(var i = 0; i < on_finished_loading.length; i++) {
      try {
        on_finished_loading[i].call(window);
      } catch(e) {
        console && console.error(e.message);
      }
    }
  }

  return {
    init: init,
    finishedLoading: finishedLoading,
    onFinishedLoading: onFinishedLoading
  }

})()