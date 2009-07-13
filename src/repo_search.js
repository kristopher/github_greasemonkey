var RepoSearch = function(el) {
  this.label_text = 'Search ' + el.children('h1').contents().filter(function() { 
    return (this.nodeType === 3);
  })[0].nodeValue;
  this.label_color = '#666';
  this.original_content_fragment = document.createDocumentFragment();
  this.search_input_css = { 'width': '24em', 'padding': '3px 11px 0 0', 'color': this.label_color };
  this.search_div_css = { 'margin': '5px 0 10px 0' };
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
    var span;
    this.repos.children('ul').children('li').each(function(i) {
      li = $(this);
      span = $(document.createElement('span')).addClass('search_text').hide();
      span.text($.trim(li.text()).toLowerCase());
      li.append(span);
    });
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
    } else {
      ul = $(this.original_content_fragment.childNodes[0].cloneNode(true));
    }
    document_ul.replaceWith(ul);
  }  
}

$.extend(RepoSearch.prototype, RepoSearch.InstanceMethods);
delete RepoSearch.InstanceMethods;

$('div.repos').each(function() {
  new RepoSearch($(this));  
})
