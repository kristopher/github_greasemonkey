var UserInfo = (function() {
  var current_users = $('.repos.watching li > a, div.alert div.title > a:first-child'), 
      stored_users = loadStoredUsers(),
      api_path = '/api/v2/json/user/show/',
      finished_loading = false,
      on_finished_loading = []

  function init() {
    var users = [], key
    for(var i = 0; i < current_users.length; i++) {
      key = $(current_users[i]).attr('href').replace(/^\//, '');
      if ((stored_users[key] === undefined) && (users.indexOf(key) === -1)) {
        users.push(key);
      }
    }
    getAndStoreUsersData(users);
  }
  
  function loadStoredUsers() {
    return (JSON.parse(localStorage.getItem('users')) || {})
  }
  
  function saveStoredUsers() {
    localStorage.setItem('users', JSON.stringify(stored_users));
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
    $.get(api_path + user, function(json) {
      storeUserJSON(user, JSON.parse(json)['user']);
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
    onFinishedLoading: onFinishedLoading
  }

})()
