var RepoInfo = (function() {
  var current,
      current_watched = $('.repos.watching li.public b > a').get(),
      current_owned = $('#repo_listing li.public b > a').get(),
      current_feed = $('div.alert.watch_started div.title > a:nth-child(3), div.alert.push div.title > a:nth-child(3), div.alert.member_add div.title > a:nth-child(4)').get(),
      stored = loadStoredWatched(),
      api_path = '/api/v2/json/repos/show/',
      finished_loading = false,
      on_finished_loading = [];
  
  function init() {
    current = current_watched.concat(current_owned).concat(current_feed);
    var repos = [], key
    for(var i = 0; i < current.length; i++) {
      key = $(current[i]).attr('href').replace(/(?:^\/|http:\/\/github.com\/)(.*)\/tree(?:.*)?/, '$1');
      if((stored[key] === undefined) && (repos.indexOf(key) !== -1)) {
        repos.push(key);
      }
    }
    getAndStoreReposData(repos)      
  }
  
  function loadStoredWatched() {
    return JSON.parse(localStorage.getItem('repositories') || "{}" )      
  }
  
  function saveStoredWatched() {
    localStorage.setItem('repositories', JSON.stringify(stored));
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
    // TODO handle api("error": [{"error": "repository not found"}]}) reponses
    $.getJSON(api_path + repo, function(json) {
      storeRepoJSON(repo, json['repository']);
    });
  }
  
  function storeRepoJSON(repo, json) {
    stored[repo] = json;
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