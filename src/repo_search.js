var RepoSearch = function(el) {
  this.constructor.instances.push(this);
  this.label_text = 'Search ' + el.children('h1').contents().filter(function() { 
    return (this.nodeType === 3);
  })[0].nodeValue;
  this.label_color = '#666';
  this.original_content_fragment = $(document.createDocumentFragment());
  this.search_input_css = { 'width': '24em', 'padding': '3px 11px 0 0', 'color': this.label_color };
  this.search_div_css = { 'margin': '5px 0 10px 0' };
  this.status_indicator_css = { 'display': 'none', 'bottom': '19px', 'float': 'right', 'position': 'relative', 'left': '-3px'};
  this.current_search_input_value = '';
  this.list_reset = true;
  this.polling_frequency = 50;
  this.stored_repositories = this.loadStoredRepositories();      
  this.initialize(el);
  this.reset(true);
}

RepoSearch.InstanceMethods = {
  initialize: function(el) {  
    if (this.repos = $(el)) {
      this.addSearchInputs();
      this.original_content_fragment[0].appendChild(this.repos.children('ul')[0].cloneNode(true))
      this.buildJsonSearchObject()
      this.createJSONSearch();
    } 
  },

  reset: function(force) {
    clearTimeout(this.polling_timer);
    this.resetList(force);
    this.removeStatusIndicator();
    this.startSearchPollingTimer();
  },
  
  resetList: function(force) {
    if (force || !this.list_reset) {
      var ul = $(this.original_content_fragment[0].childNodes[0].cloneNode(true));      
      this.repos.children('ul').replaceWith(ul);      
      this.list_reset = true;
    }
  },
  
  loadStoredRepositories: function() {
    return JSON.parse(localStorage.getItem('repositories') || "{}");
  },

  updateStoredRepositories: function(repo, json) {
    this.stored_repositories = this.loadStoredRepositories()
    this.updateDescriptions(repo, json['description']);
    this.updateSearchData(repo, json);
    if(!this.repos.find('input').hasClass('dirty')) {
      this.resetList(true);
    }
  },
  
  startSearchPollingTimer: function() {
    var self = this;
    this.polling_timer = setTimeout(function () {
      self.checkForSearchInputChanges();
    }, this.polling_frequency);
  },
  
  checkForSearchInputChanges: function() {
    var token = this.search_input.attr('value')
    if (this.search_input.hasClass('dirty')) {
      if(this.searchInputValueHasChanged(token)) {
        this.performSearch(token);                
      }
      this.current_search_input_value = token;
    } else {
      this.current_search_input_value = '';
    }
    this.removeStatusIndicator();
    this.startSearchPollingTimer();
  },
  
  searchInputValueHasChanged: function(token) {
    return (token !== this.current_search_input_value);
  },
  
  addSearchInputs: function() {
    var div = $(document.createElement('div'))
          .css(this.search_div_css).addClass('repo_search');
    var image = $(new Image())
          .attr('src', '/images/modules/ajax/indicator.gif') 
    this.status_indicator = $(document.createElement('span'))
          .css(this.status_indicator_css)
    this.status_indicator.append(image);
    this.search_input = $(document.createElement('input'))
          .attr({ 'type': 'text', 'value': this.label_text })
          .css(this.search_input_css);
    div.append(this.search_input);      
    div.append(this.status_indicator);
    this.attachSearchInputEvents();
    this.repos.children('ul').before(div);
  },
  
  buildJsonSearchObject: function() {
    var li, key, row, search_data = [], lis = this.original_content_fragment.children('ul').children('li');
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
  
  updateSearchData: function(repo, json) {
    var klass = repo.replace(/\//, '_');
    if (this.original_content_fragment.children('.' + klass)[0]) {
      this.search_data[repo] = {
        'class': klass,
        user: json['owner'],
        repo: json['name'],
        description: json['description']
      }      
    }
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
  
  updateDescriptions: function(repo, description) {
    var ul = this.original_content_fragment.children(),
        li = ul.children('li.' + repo.replace(/\//, '_'));
    if (li[0]) {
      li.children('div.description').remove();
      this.addDescription(li, description);
    }        
  },
  
  attachSearchInputEvents: function(input) {
    var self = this;
    this.search_input.keyup(function(e) {
      var el = $(e.target);
      if(el.attr('value') === '') {
        el.removeClass('dirty');
        self.reset()
      } else {
        self.addStatusIndicator();
        el.addClass('dirty');
      }
    });
    this.search_input.blur(function(e) {
      var el = $(e.target);
      if(!el.hasClass('dirty')) {
        el.attr('value', self.label_text);
        el.css('color', self.label_color);
      } 
    });
    this.search_input.focus(function(e) {
      var el = $(e.target);
      if(!el.hasClass('dirty')) {
        el.attr('value', '');
        el.css('color', '#000');
      }
    });
  },
  
  performSearch: function(token) {        
    // Ugly but substantially faster than a pure JQuery implementation
    this.list_reset = false;
    var description, li, ul, results, lis = [],
        fragment = document.createDocumentFragment(),
        document_ul = this.repos.children('ul'),
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
    document_ul.replaceWith(ul);
  },
  
  addStatusIndicator: function() {
    this.status_indicator.show();
  },
  
  removeStatusIndicator: function() {
    this.status_indicator.hide()
  }
  
}

RepoSearch.instances = [];

$.extend(RepoSearch.prototype, RepoSearch.InstanceMethods);
delete RepoSearch.InstanceMethods;

$('div.repos').each(function() {
  new RepoSearch($(this));
})
