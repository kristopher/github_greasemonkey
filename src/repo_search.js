var RepoSearch = function(el) {
  this.original_content_fragment = document.createDocumentFragment();
  this.search_input_css = { 'width': '24em', 'padding-right': '11px' };
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
        input = $(document.createElement('input')).attr('type', 'text').css(this.search_input_css);
    this.attachSearchInputEvents(input);
    this.repos.children('h1').after(div.append(input));
  },

  addSearchText: function() {
    var span;
    this.repos.children('ul').children('li').each(function(i) {
      li = $(this);
      span = $(document.createElement('span')).addClass('search_text').hide();
      span.text($.trim(li.text()));
      li.append(span);
    });
  },

  attachSearchInputEvents: function(input) {
    var self = this;
    input.keyup(function(e) {
      self.preformSearch($(e.target));
    })
  },
  
  preformSearch: function(el) {        
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
