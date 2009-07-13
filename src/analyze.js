var Analyze = function() {
  this.analyze_base_path = 'http://analyze.github.com';
  this.button_style = {
    'padding-top': '2px'
  };
  this.button_link_style = {
    'text-decoration': 'none',
    'color': '#333',
    'padding': '3px 3px 2px 3px',
    'background': 'transparent url(/images/modules/repos/pills/middle.png) repeat-x scroll 0 0'
  };

  this.link_style = {};
}

Analyze.InstanceMethods = {
  
  initialize: function() {
    this.addLinks();
  },

  createButton: function(url) {
    url = encodeURI(url);
    var link = $(document.createElement('a')).attr('href', url).css(this.button_link_style).text('analyze');
    var span = $(document.createElement('span')).addClass('analyze').css(this.button_style).append(link);
    span.append('<img src="http://assets1.github.com/images/modules/repos/pills/right.png" alt=""/>');
    span.prepend('<img src="http://assets3.github.com/images/modules/repos/pills/watchers.png" alt=""/>')
    return span;
  },
  
  createLink: function(url) {
    url = encodeURI(url);
    var link = $(document.createElement('a')).attr('href', url).addClass('analyze').css(this.link_style).text('analyze');
    return link;
  },
  
  addLinks: function() {}
  
}

$.extend(Analyze.prototype, Analyze.InstanceMethods);
delete Analyze.InstanceMethods;

Analyze.LoggedInProfile = function() {
  this.initialize();
}

Analyze.LoggedInProfile.prototype = new Analyze;

Analyze.LoggedInProfile.prototype.initialize = function() {
  this.user_box = $('.userbox');
  this.analyze_profile_name = $('.userbox div.name a').text();
  this.analyze_profile_path = this.analyze_base_path + '/' + this.analyze_profile_name;
  this.addLinks();
}

Analyze.LoggedInProfile.prototype.addLinks = function() {
  if (this.user_box[0]) {
    var link = this.createLink(this.analyze_base_path + '/' + this.analyze_profile_name);
    this.user_box.find('div.site_links')
      .prepend($(document.createTextNode(' | ')))
      .prepend(link);    
  }
}
  
Analyze.Profile = function() {
  this.initialize();
}

Analyze.Profile.prototype = new Analyze;

Analyze.Profile.prototype.initialize = function() {
  this.repo_button_style = {
    'display': 'inline-block',
    'margin': '4px 6px 0 0',
    'padding': '0',    
  };
  this.repo_button_link_style = {
    'position': 'relative',
    'bottom': '5px',
    'padding-top': '0',
    'display': 'inline-block'
  }
  this.button_box_link_style = {
    'position': 'relative',
    'bottom': '4px'
  };
  this.button_box = $('.profile div.buttons');
  this.repo_buttons = $('li.project > div:first-child');
  this.analyze_profile_name = $('div.profile > div.identity > h1').text();
  this.analyze_profile_path = this.analyze_base_path + '/' + this.analyze_profile_name;
  this.addLinks();
}

Analyze.Profile.prototype.addLinks = function() {
  if (this.button_box[0]) {
    var repo_name, button = this.createButton(this.analyze_profile_path).children('a').css(this.button_box_link_style).end();
    this.button_box.append(button);
    for(var i = 0; i < this.repo_buttons.length; i++) {
      repo_name = $(this.repo_buttons[i]).parent().find('.title a').text();
      button = this.createButton(this.analyze_profile_path + '/' + repo_name)
        .css(this.repo_button_style)
        .children('a')
        .css(this.repo_button_link_style)
        .end();
      this.repo_buttons[i].appendChild(button[0])
    }    
  }
}

Analyze.Repository = function() {
  this.initialize();
}

Analyze.Repository.prototype = new Analyze;

Analyze.Repository.prototype.initialize = function() {
  this.repo_button_style = {
    'display': 'inline-block',
    'height': '18px',
    'padding': '0',
    'position': 'relative',
    'bottom': '1px',
    'margin-left': '4px'
  };

  this.repo_buttons = $('#repo_details div.title div.path');
  this.repo_name = this.repo_buttons.find('b > a').text();
  this.analyze_profile_name = this.repo_buttons.children('a:first').text();  
  this.analyze_profile_path = this.analyze_base_path + '/' + this.analyze_profile_name;
  this.addLinks();
}

Analyze.Repository.prototype.addLinks = function() {
  if(this.repo_buttons[0]) {
    this.repo_buttons.append(this.createButton(this.analyze_profile_path + '/' + this.repo_name).css(this.repo_button_style));    
  }
}

new Analyze.LoggedInProfile();
new Analyze.Profile();
new Analyze.Repository();