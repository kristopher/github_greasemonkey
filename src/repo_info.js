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
      key = repoIdFromUrl($(current[i]).attr('href'));
      if((stored[key] === undefined) && (repos.indexOf(key) === -1)) {
        repos.push(key);
      }
    }
    addTooltips()
    addStatusIndicator();
    getAndStoreReposData(repos)      
  }
  
  function repoIdFromUrl(url) {
    return url.replace(/(?:^\/|http:\/\/github.com\/)(.*)\/tree(?:.*)?/, '$1');
  }

  function repoJSONToHTML(repo) {
    var div,
        fragment = document.createDocumentFragment(),
        wrapper = $(fragment.appendChild(document.createElement('div'))),
        json = stored[repo];
    for(var property in json) {
      div = $(document.createElement('div'))
        .append($(document.createElement('span')).html(property + ':'))
        .append($(document.createElement('span')).html(json[property]))
      wrapper.append(div)
    }
    return fragment.childNodes[0].innerHTML;
  }
  
  function addTooltips() {
    var el
    $(current).each(function() {
      el = $(this)
      el.tooltip({
        showURL: false,
        bodyHandler: function() {
          var repo_id = RepoInfo.repoIdFromUrl(el.attr('href'))          
          return RepoInfo.repoJSONToHTML(repo_id);
        }
      }, function() {});
    })
  }
  
  function loadStoredWatched() {
    return JSON.parse(localStorage.getItem('repositories') || "{}" )      
  }
  
  function saveStoredWatched() {
    localStorage.setItem('repositories', JSON.stringify(stored));
  }
  
  function getAndStoreReposData(repos) {
    if (repos.length > 0) {
      this.updated = true;
      getAndStoreRepoData(repos.pop())
      setTimeout(function() {
        getAndStoreReposData(repos);
      }, 1000);      
    } else {
      removeStatusIndicator();
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
    $.each(RepoSearch.instances, function() {
      this.updateStoredRepositories(repo, json);
    })
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
        on_finished_loading[i].call(this);
      } catch(e) {
        console && console.error(e.message);
      }
    }
  }
  
  function addStatusIndicator() {
    $.each(RepoSearch.instances, function() {
      var div = $(document.createElement('div'))
          .addClass('status_indicator')
          .css('color', '#666')
          .text('Updating Repository Descriptions...');
      var image = $(new Image())
          .attr('src', '/images/modules/ajax/indicator.gif')
          .css('float', 'right');
      div.append(image);
      this.repos.children('.repo_search').before(div);
    });
  }
  
  function removeStatusIndicator() {
    $.each(RepoSearch.instances, function() {
      this.repos.children('div.status_indicator').remove();
    });
  }
  
  return {
    init: init,
    finishedLoading: finishedLoading,
    onFinishedLoading: onFinishedLoading,
    repoIdFromUrl: repoIdFromUrl,
    repoJSONToHTML: repoJSONToHTML
  }

})()