var UserInfo = (function() {
  var current_users = $('.repos.watching li > a, div.alert div.title > a:first-child, div.alert.member_add div.title > a:nth-child(3), a.committer, div.alert.follow a'), 
      stored_users = loadStoredUsers(),
      api_path = '/api/v2/json/user/show/',
      finished_loading = false,
      on_finished_loading = []

  function init() {
    var users = [], key
    for(var i = 0; i < current_users.length; i++) {
      key = userIdFromUrl($(current_users[i]).attr('href'));
      if ((stored_users[key] === undefined) && (users.indexOf(key) === -1)) {
        users.push(key);
      }
    }
    addTooltips();
    getAndStoreUsersData(users);
  }
  
  function loadStoredUsers() {
    return JSON.parse(localStorage.getItem('users')  || "{}")
  }
  
  function saveStoredUsers() {
    localStorage.setItem('users', JSON.stringify(stored_users));
  }
  
  function userIdFromUrl(url) {
    return url.replace(/^\//, '');
  }

  function userJSONToHTML(repo) {
    var json = stored_users[repo];
    if (json) {
      var key, value, tr, property,
          table = $(document.createElement('table')),
          fragment = document.createDocumentFragment(),
          wrapper = $(fragment.appendChild(document.createElement('div'))),
          keys = orderedJSONKeysForDisplay();
      wrapper.append(table);
      for(var i = 0; i < keys.length; i++) {      
        property = keys[i];
        key = printedKeyForProperty(property);
        value = printedValueForProperty(property, json[property])
        tr = $(document.createElement('tr'))
          .append($(document.createElement('td')).html(key))
          .append($(document.createElement('td')).html(value));
        table.append(tr);        
      }
      return fragment.childNodes[0].innerHTML;      
    } else {
      return 'loading...';
    }
  }

  function orderedJSONKeysForDisplay() {
    return ['name', 'email', 'company', 'location', 'blog', 'followers_count', 'following_count', 'public_repo_count', 'public_gist_count', 'created_at'];
  }

  function printedKeyForProperty(key) {
    return (key[0].toUpperCase() + key.substr(1) + ':').replace(/_/g, ' ');
  }
  
  function printedValueForProperty(key, value) {
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
        case 'created_at':
          return new Date(value).toLocaleDateString();
        case 'blog':
          return ('<a href="' + value + '">' + value  + '</a>');
        default:
          return String(value);
      }      
    }
  }
  
  function addTooltips() {
    var feed_users = $('div.alert.follow a, div.alert div.title > a:first-child, div.alert.member_add div.title > a:nth-child(3), a.committer');
    for(var i = 0; i < feed_users.length; i++) {
      addTooltip($(feed_users[i]));
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
        var user_id = UserInfo.userIdFromUrl(el.attr('href'));
        this.update(UserInfo.userJSONToHTML(user_id));
        this.setPos(span.offset().left, span.offset().top + 13);
      }
    });    
  }

  function getAndStoreUsersData(users) {
    if (users.length > 0) {
      getAndStoreUserData(users.pop())
      setTimeout(function() {
        getAndStoreUsersData(users);
      }, 1000);      
    } else {
      finished_loading = true;
      runFinishedLoadingCallbacks();
    }
  }
  
  function getAndStoreUserData(user) {
    $.getJSON(api_path + user, function(json) {
      storeUserJSON(user, json['user']);
    });
  }
  
  function storeUserJSON(user, json) {
    stored_users[user] = json;
    saveStoredUsers();
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
    onFinishedLoading: onFinishedLoading,
    userIdFromUrl: userIdFromUrl,
    userJSONToHTML: userJSONToHTML,
    addTooltip: addTooltip
  }

})()
