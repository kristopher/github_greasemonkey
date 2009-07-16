var UserInfo = (function() {
  var current_users = $('.repos.watching li > a, div.alert div.title > a:first-child, div.alert.member_add div.title > a:nth-child(3), a.committer'), 
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
    var div,
        fragment = document.createDocumentFragment(),
        wrapper = $(fragment.appendChild(document.createElement('div'))),
        json = stored_users[repo];
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
    current_users.each(function() {
      el = $(this)
      el.tooltip({
        showURL: false,
        bodyHandler: function() {
          var user_id = UserInfo.userIdFromUrl(el.attr('href'))          
          return UserInfo.userJSONToHTML(user_id);
        }
      }, function() {});
    })
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
    userJSONToHTML: userJSONToHTML
  }

})()
