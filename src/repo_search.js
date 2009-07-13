var RepoSearch = function(el) {
  this.label_text = 'Search ' + el.children('h1').contents().filter(function() { 
    return (this.nodeType === 3);
  })[0].nodeValue;
  this.label_color = '#666';
  this.original_content_fragment = document.createDocumentFragment();
  this.search_input_css = { 'width': '24em', 'padding': '3px 11px 0 0', 'color': this.label_color };
  this.search_div_css = { 'margin': '5px 0 10px 0' };
  this.stored_repositories = this.loadStoredRepositories();      
  this.initialize(el);
}

RepoSearch.InstanceMethods = {
  initialize: function(el) {  
    if (this.repos = $(el)) {
      this.addSearchInputs();
      this.addSearchText();      
      this.original_content_fragment.appendChild(this.repos.children('ul')[0].cloneNode(true))
    } 
  },

  addSearchInputs: function() {
    var div = $(document.createElement('div')).css(this.search_div_css).addClass('repo_search'),
        input = $(document.createElement('input')).attr({ 'type': 'text', 'value': this.label_text }).css(this.search_input_css);
    this.attachSearchInputEvents(input);
    this.repos.children('ul').before(div.append(input));
  },

  addSearchText: function() {
    var span, key,
        description_text = '',
        lis = this.repos.children('ul').children('li');

    for(var i = 0; i < lis.length; i++) {
      li = $(lis[i]);
      key = li.find('b > a').attr('href').replace(/(?:^\/|http:\/\/github.com\/)(.*)\/tree/, '$1')
      if (this.stored_repositories[key]) {
        description_text = (this.stored_repositories[key]['description'] || '');        
      } else {
        description_text = '';
      }
      span = $(document.createElement('span')).addClass('search_text').hide();
      span.text($.trim(li.text() + ' ' + description_text).toLowerCase());
      li.append(span);
      this.addDescription(li, description_text)
    }
  },
  
  addDescription: function(li, description) {
    if (description !== '') {
      var div = $(document.createElement('div')).addClass('description').css({'border-top': '1px solid #333', 'margin-top': '5px', 'padding': '2px 5px 2px 5px'}).hide(),
          p = $(document.createElement('p')).css({'font-size': '12px', 'color': '#333'}).text(description);
      div.append(p);
      li.append(div);
    }              
  },
  
  attachSearchInputEvents: function(input) {
    var self = this;
    input.keyup(function(e) {
      var el = $(e.target);
      if(el.attr('value') === '') {
        el.removeClass('dirty');
      } else {
        el.addClass('dirty');
      }
      self.performSearch($(e.target));      
    });
    input.blur(function(e) {
      var el = $(e.target);
      if(!el.hasClass('dirty')) {
        el.attr('value', self.label_text);
        el.css('color', self.label_color);
      } 
    });
    input.focus(function(e) {
      var el = $(e.target);
      if(!el.hasClass('dirty')) {
        el.attr('value', '');
        el.css('color', '#000');
      }
    });
  },
  
  performSearch: function(el) {        
    var text = el.attr('value'), document_ul = this.repos.children('ul'), ul;
    if (text !== '') {
      var score,
          scores = [], 
          lis = document_ul.children('li'),
          fragment = document.createDocumentFragment();

      ul = $(fragment.appendChild(document.createElement('ul')));      
      for(var i = 0; i < lis.length; i++) {
        score = $.trim($(lis[i]).children('.search_text').text()).score(text);
        scores.push([score, i]);        
      }
      scores = scores.sort().reverse();        
      for(var i = 0; i < scores.length; i++) {
        li = $(lis[scores[i][1]]);
        scores[i][0] && li.show() || li.hide();
        ul[0].appendChild(li[0]);
      }
      ul.find('div.description').show();
    } else {
      ul = $(this.original_content_fragment.childNodes[0].cloneNode(true));
    }
    document_ul.replaceWith(ul);
  },

  loadStoredRepositories: function() {
    return JSON.parse(localStorage.getItem('repositories') || "{}");
  }
}

$.extend(RepoSearch.prototype, RepoSearch.InstanceMethods);
delete RepoSearch.InstanceMethods;

for(var i = 0; i < $('div.repos').length; i++) {
  new RepoSearch($($('div.repos')[i]), this);  
}

