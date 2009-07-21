var Analyze = function() {
  this.analyze_base_path = 'http://analyze.github.com';  
  this.wrapper_style = {};
  this.span_style = {
    'background': 'transparent url(/images/modules/repos/pills/middle.png) repeat-x scroll 0 0',
    'position': 'relative',
    'padding-right': '3px',
    'padding-left': '3px'
  };
  this.link_style = {
    'text-decoration': 'none',
    'color': '#333'
  };
  this.right_image_style = {};
  this.left_image_style = {}
}

Analyze.InstanceMethods = {
  
  initialize: function() {
    this.addLinks();
  },

  createButton: function(url) {
    url = encodeURI(url);
    var link = $(document.createElement('a'))
      .attr('href', url)
      .css(this.link_style)
      .text('analyze');
    var span = $(document.createElement('span'))
      .css(this.span_style)
      .append(link);
    var right_image = $(new Image())
      .attr('src', 'http://assets1.github.com/images/modules/repos/pills/right.png')
      .css(this.right_image_style);
    var left_image = $(new Image())
      .attr('src', 'http://assets3.github.com/images/modules/repos/pills/watchers.png')
      .css(this.left_image_style);
    var wrapper = $(document.createElement('span'))
      .addClass('analyze')
      .css(this.wrapper_style)
      .append(left_image)
      .append(span)
      .append(right_image);
    return wrapper;
  },
  
  createLink: function(url) {
    url = encodeURI(url);
    var link = $(document.createElement('a'))
      .attr('href', url)
      .addClass('analyze')
      .text('analyze');
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
  if (this.user_box[0]) {
    this.analyze_profile_name = $('.userbox div.name a').text();
    this.analyze_profile_path = this.analyze_base_path + '/' + this.analyze_profile_name;
    this.addLinks();
  }
}

Analyze.LoggedInProfile.prototype.addLinks = function() {
  var link = this.createLink(this.analyze_base_path + '/' + this.analyze_profile_name);
  this.user_box.find('div.site_links')
    .prepend($(document.createTextNode(' | ')))
    .prepend(link);    
}
  
Analyze.Profile = function() {
  this.initialize();
}

Analyze.Profile.prototype = new Analyze;

Analyze.Profile.prototype.initialize = function() {
  this.span_style = $.extend(this.span_style, {
    'display': 'inline-block',
    'padding-top': '0.06em',
    'bottom': '0.285em'
  });
  
  this.button_box = $('.profile div.buttons');
  if (this.button_box[0]) {
    this.repo_buttons = $('li.project > div:first-child');
    this.analyze_profile_name = $('div.profile > div.identity > h1').text();
    this.analyze_profile_path = this.analyze_base_path + '/' + this.analyze_profile_name;
    this.addLinks();
  }
}

Analyze.Profile.prototype.addLinks = function() {
  var button = this.createButton(this.analyze_profile_path)
  this.button_box.append(button);
}

Analyze.Repository = function() {
  this.initialize();
}

Analyze.Repository.prototype = new Analyze;

Analyze.Repository.prototype.initialize = function() {
  this.wrapper_style = $.extend(this.wrapper_style, {
    'margin-left': '4px'
  });
  
  this.span_style = $.extend(this.span_style, {
    'display': 'inline-block',
    'font-size': '19px',
    'vertical-align': '0.01em'
  });
  
  this.repo_buttons = $('#repo_details div.title div.path');
  if(this.repo_buttons[0]) {
    this.repo_name = this.repo_buttons.find('b > a').text();
    this.analyze_profile_name = this.repo_buttons.children('a:first').text();  
    this.analyze_profile_path = this.analyze_base_path + '/' + this.analyze_profile_name;
    this.addLinks();
  }
}

Analyze.Repository.prototype.addLinks = function() {
  var button = this.createButton(this.analyze_profile_path + '/' + this.repo_name);
  this.repo_buttons.append(button);    
}

new Analyze.LoggedInProfile();
new Analyze.Profile();
new Analyze.Repository();  
