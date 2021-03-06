var RepoInfo = (function() {
  var current, 
      current_feed = [],
      watch_alerts = $('div.alert.watch_started div.title > a:nth-child(3)').get(),
      push_alerts = $('div.alert.push div.title > a:nth-child(3)').get(),
      member_add_alerts = $('div.alert.member_add div.title > a:nth-child(4), div.alert.member_add div.message > a').get(),
      issues_opened_alerts = $('div.alert.issues_opened div.title > a:nth-child(4)').get(),
      issues_closed_alerts = $('div.alert.issues_closed div.title > a:nth-child(4)').get(),
      fork_apply_alerts = $('div.alert.fork_apply div.title > a:nth-child(3)').get(),
      repo_fork_alerts = $('div.alert.fork div.title > a:nth-child(3)').get(),
      repo_create_alerts = $('div.alert.create div.title > a:nth-child(3), div.alert.create div.message a').get(),
      download_alerts = $('div.alert.download div.message a, div.alert.download div.title > a:nth-child(3)').get(),
      stored = loadStoredWatched(),
      api_path = '/api/v2/json/repos/show/',
      finished_loading = false,
      on_finished_loading = [];

  function init() {
    current_feed = current_feed
      .concat(watch_alerts)
      .concat(push_alerts) 
      .concat(member_add_alerts)
      .concat(issues_opened_alerts)
      .concat(issues_closed_alerts) 
      .concat(fork_apply_alerts)
      .concat(repo_fork_alerts)
      .concat(repo_create_alerts) 
      .concat(download_alerts);

    current = $('div.repos li b > a').get().concat(current_feed);
    addTooltips();
  }

  function update() {
    var repos = [], key
    for(var i = 0; i < current.length; i++) {
      key = repoIdFromUrl($(current[i]).attr('href'));
      if((stored[key] === undefined) && (repos.indexOf(key) === -1)) {
        repos.push(key);
      }
    }
    getAndStoreReposData(repos)      
    
  }
  function repoIdFromUrl(url) {
    return url.match(/(?:^\/|http:\/\/github.com\/)((.*?)\/(.*?))(?:\/|$)/)[1];
  }

  function repoJSONToHTML(repo) {
    var json = stored[repo];
    if (json) {
      var key, value, tr, property, div,
          table = $(document.createElement('table')),
          fragment = document.createDocumentFragment(),
          wrapper = $(fragment.appendChild(document.createElement('div'))),
          keys = orderedJSONKeysForDisplay();
      wrapper.append(table);
      for(var i = 0; i < keys.length; i++) {      
        property = keys[i]
        key = printedKeyForProperty(property);
        value = printedValueForProperty(property, json[property])
        tr = $(document.createElement('tr'))
          .append($(document.createElement('td')).html(key))
          .append($(document.createElement('td')).html(value));
        table.append(tr);        
      }
      if (json['description']) {
        div = $(document.createElement('div'))
          .append($(document.createElement('p')).html(json['description']));
        wrapper.append(div);        
      }
      return fragment.childNodes[0].innerHTML;      
    } else {
      return 'loading...';
    }
  }
  
  function orderedJSONKeysForDisplay() {
    return ['name', 'owner', 'watchers', 'forks', 'open_issues', 'fork', 'private', 'homepage'];
  }
  
  function printedKeyForProperty(key) {
    return (key[0].toUpperCase() + key.substr(1) + ':').replace(/_/g, ' ');
  }
  
  function printedValueForProperty(key, value) {
    //TODO Dry
    if (typeof value === 'string') {
      value = $.trim(value);
      if (value.length > 40) {
        value = value.substr(0, 40) + '...';
      }
    }
    if (value == null || value === '') {
      return 'N/A'
    } else {
      switch(key) {
        case 'homepage':
          return ('<a href="' + value + '">' + value + '</a>');
        case 'fork':
          return (value ? 'Yes' : 'No');
        case 'private':
          return (value ? 'Yes' : 'No');
        default:
          return String(value);
      }      
    }
  }
  
  function addTooltips() {
    for(var i = 0; i < current_feed.length; i++) {
      addTooltip($(current_feed[i]));
    }
  }
  
  function addTooltip(el) {
    var span = el.parent()
    if (!span.hasClass('tooltip_wrapper')) {
      span = $(document.createElement('span'))
        .addClass('tooltip_wrapper')
        .css('background', '#fff');
      el.wrap(span);
      span = el.parent();
    }
    
    var tooltip = span.simpletip({
      content: '',
      onShow: function() {        
        var repo_id = RepoInfo.repoIdFromUrl(el.attr('href'))
        this.update(RepoInfo.repoJSONToHTML(repo_id));
        this.setPos(span.offset().left, span.offset().top + 13);
      }
    });    
  }

  function loadStoredWatched() {
    return JSON.parse(localStorage.getItem('repositories') || "{}" )      
  }
  
  function saveStoredWatched() {
    localStorage.setItem('repositories', JSON.stringify(stored));
  }
  
  function getAndStoreReposData(repos) {
    addStatusIndicator();
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
    $.getJSON(api_path + repo, function(json) {
      if (json['error']) {
        data = {
          'private': true,
          'description': null
        };
      } else {
        data = json['repository'];
      }
      storeRepoJSON(repo, data);
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
    var indicator
    $.each(RepoSearch.instances, function() {
      indicator = this.repos.children('div.status_indicator');
      if (!indicator[0]) {
        var div = $(document.createElement('div'))
            .addClass('status_indicator')
            .css('color', '#666')
            .text('Updating Repository Descriptions...');
        var image = $(new Image())
            .attr('src', '/images/modules/ajax/indicator.gif')
            .css('float', 'right');
        div.append(image);
        this.repos.children('.repo_search').before(div);        
      } else {
        indicator.show();
      }
    });
  }
  
  function removeStatusIndicator() {
    $.each(RepoSearch.instances, function() {
      this.repos.children('div.status_indicator').hide();
    });
  }
  
  return {
    init: init,
    update: update,
    finishedLoading: finishedLoading,
    onFinishedLoading: onFinishedLoading,
    repoIdFromUrl: repoIdFromUrl,
    repoJSONToHTML: repoJSONToHTML,
    addTooltip: addTooltip
  }

})()

RepoInfo.init();
