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
      this.buildJsonSearchObject()
      this.createJSONSearch();        
      this.original_content_fragment.appendChild(this.repos.children('ul')[0].cloneNode(true))
    } 
  },

  addSearchInputs: function() {
    var div = $(document.createElement('div'))
          .css(this.search_div_css).addClass('repo_search');

    var input = $(document.createElement('input'))
          .attr({ 'type': 'text', 'value': this.label_text })
          .css(this.search_input_css);
    div.append(input);      
    this.attachSearchInputEvents(input);
    this.repos.children('ul').before(div);
  },
  
  buildJsonSearchObject: function() {
    var li, key, row, search_data = [], lis = this.repos.children('ul').children('li');
    for(var i = 0; i < lis.length; i++) {
      li = $(lis[i]);
      key = li.find('b > a').attr('href').replace(/(?:^\/|http:\/\/github.com\/)(.*)\/tree/, '$1')
      row = {
        'class': key.replace(/\//, '_'),
        user: $.trim(key.split(/\//)[0]),
        repo: $.trim(key.split(/\//)[1]),
        description: ''
      }
      if (this.stored_repositories[key]) {
        row['description'] = (this.stored_repositories[key]['description'] || '');
      }
      li.addClass(row['class']);
      this.addDescription(li, row['description']);
      search_data.push(row);
    }
    this.search_data = search_data;
  },
  
  createJSONSearch: function() {
    this.json_search = new JSONSearch({
      fields: {
        user: 'prefix',
        repo: 'prefix',
        description: 'word_prefix'
      },
      ranks: {
        user: 1,
        repo: 2,
        description: 0
      }
    })
  },
  
  addDescription: function(li, description) {
    if (description !== '') {
      var div = $(document.createElement('div'))
        .addClass('description')
        .css({'border-top': '1px solid #333', 'margin-top': '5px', 'padding': '2px 5px 2px 5px'})
        .hide();
      var p = $(document.createElement('p'))
        .css({'font-size': '12px', 'color': '#333'})
        .text(description);
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
    var token = el.attr('value'), document_ul = this.repos.children('ul'), ul
    if(token !== '') {
      // Ugly but substantially faster than a pure JQuery implementation
      var description, li, lis = [], results, fragment = document.createDocumentFragment();
      ul = $(fragment.appendChild(document.createElement('ul')));
      results = this.json_search.getResults(token, this.search_data)
      search_data_ordered_by_results = $.unique(results.concat(this.search_data))
      
      for(var i = 0; i < search_data_ordered_by_results.length; i++) {
        li = document_ul[0].getElementsByClassName(search_data_ordered_by_results[i]['class'])[0];
        description = li.getElementsByClassName('description')[0];
        if(description) {
          description.style.display = '';
        }
        li.style.display = 'none'
        ul[0].appendChild(li);        
        lis.push(li);        
      }
      for(var i = 0; i < results.length; i++) {
        lis[i].style.display = ''
      } 
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

$('div.repos').each(function() {
  new RepoSearch($(this));
})

