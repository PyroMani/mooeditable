/*
---

name: MooEditable.Image

description: Extends MooEditable to insert image with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.Actions

provides: [MooEditable.UI.ImageDialog, MooEditable.Actions.image]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <link rel="stylesheet" href="MooEditable.Image.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.Image.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable({
      actions: 'bold italic underline strikethrough | image | toggleview'
    });
  });
  </script>

...
*/

MooEditable.Locale.define({
	imageAlt: 'Alternativ text',
	imageClass: 'Class',
	imageAlign: 'Alignment',
	imageAlignNone: 'none',
	imageAlignLeft: 'left',
	imageAlignCenter: 'center',
	imageAlignRight: 'right',
	addEditImage: 'Add/Edit Image',
	imageURL: 'Image URL',
	imagePadding: 'Padding',
	imageAlignBaseline: 'Baseline',
	imageAlignTop: 'Top',
	imageAlignMiddle: 'Middle',
	imageAlignBottom: 'Bottom',
	imageAlignTextTop: 'Text top',
	imageAlignTextBottom: 'Text bottom'
});

MooEditable.UI.ImageDialog = function(editor){
	var html = ''
	    +'<div class="mooeditable-ui-panebox">'
    	    + '<div class="mooeditable-ui-pane" label="General">'
    	        + '<div class="mooeditable-ui-groupbox" label="General">'
    	            + '<table width="100%"><tr><td width="90">'
            	    + MooEditable.Locale.get('imageURL') + '</td><td>'
            	    + '<input type="text" class="dialog-url" value="" style="width: 90%"></td></tr><tr><td>'
            		+ MooEditable.Locale.get('imageAlt') + '</td><td>'
            	    + '<input type="text" class="dialog-alt" value="" style="width: 90%"></td></tr><tr><td>'
            		+ MooEditable.Locale.get('imageClass') + '</td><td>'
            	    + '<input type="text" class="dialog-class" value="" size="8"></td></tr><tr><td>'
            		+ '</table>'
                + '</div>'
            + '</div>'
    	    + '<div class="mooeditable-ui-pane" label="Appearance">'
    	        + '<table width="100%"><tr><td width="90">'
                + MooEditable.Locale.get('imageAlign') + '</td><td>'
                + ' <select class="dialog-align">'
        			+ '<option value="">' + MooEditable.Locale.get('imageAlignNone') + '</option>'
        			+ '<option value="baseline">' + MooEditable.Locale.get('imageAlignBaseline') + '</option>'
        			+ '<option value="top">' + MooEditable.Locale.get('imageAlignTop') + '</option>'
        			+ '<option value="middle">' + MooEditable.Locale.get('imageAlignMiddle') + '</option>'
        			+ '<option value="bottom">' + MooEditable.Locale.get('imageAlignBottom') + '</option>'
        			+ '<option value="text-top">' + MooEditable.Locale.get('imageAlignTextTop') + '</option>'
        			+ '<option value="text-bottom">' + MooEditable.Locale.get('imageAlignTextBottom') + '</option>'
        			+ '<option value="left">' + MooEditable.Locale.get('imageAlignLeft') + '</option>'
        			+ '<option value="center">' + MooEditable.Locale.get('imageAlignCenter') + '</option>'
        			+ '<option value="right">' + MooEditable.Locale.get('imageAlignRight') + '</option>'
        		+ '</select></td></tr><tr><td>'
                + MooEditable.Locale.get('imagePadding')+' (px)' + '</td><td>'
            		+ '<div style="text-align: center; width: 150px;">'
            		+   '<div ><input class="mooeditable-image-paddingtop" type="text" size="2" /></div>'
            		+   '<div style="margin: auto; margin-top: 4px; margin-bottom: 4px; width: 50px; border: 1px solid silver; '
            		+   'position: relative; background-color: #f6f6f6; height: 50px; left: 1px;">'
            		+     '<div style="position: absolute; left: -50px; top:17px">'
                    +     '<input class="mooeditable-image-paddingleft" type="text" size="2" /></div>'
            		+     '<div style="position: absolute; right: -50px; top:17px">'
            		+     '<input class="mooeditable-image-paddingright" type="text" size="2" /></div>'
            		+   '</div>'
            		+   '<div ><input class="mooeditable-image-paddingbottom" type="text" size="2" /></div>'
            		+ '</div>'
        		+ '</td></tr></table>'
            + '</div>'
        + '</div>'
		+ '<div class="mooeditable-dialog-actions">'
		  + '<button class="dialog-button dialog-ok-button">' + MooEditable.Locale.get('ok') + '</button> '
		  + '<button class="dialog-button dialog-cancel-button">' + MooEditable.Locale.get('cancel') + '</button>'
		+ '</div>';
		
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-image-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-url');
			var node = editor.selection.getNode();
			if (node && node.get('tag') == 'img'){
				this.el.getElement('.dialog-url').set('value', node.get('src'));
				this.el.getElement('.dialog-alt').set('value', node.get('alt'));
				this.el.getElement('.dialog-class').set('value', node.className);
				this.el.getElement('.dialog-align').set('align', node.get('align'));
				
				var getValue = function( p ){
				    if( !node.get('style').test(p+': [^;]*;') )
				        return '';
				    else
				        return node.getStyle( p ).toInt();
				}
				
				this.el.getElement('.mooeditable-image-paddingtop').set('value', getValue('padding-top'));
				this.el.getElement('.mooeditable-image-paddingright').set('value', getValue('padding-right'));
				this.el.getElement('.mooeditable-image-paddingbottom').set('value', getValue('padding-bottom'));
				this.el.getElement('.mooeditable-image-paddingleft').set('value', getValue('padding-left'));
			} else {
				this.el.getElement('.dialog-url').set('value', '');
				this.el.getElement('.dialog-alt').set('value', '');
				this.el.getElement('.dialog-class').set('value', '');
				this.el.getElement('.dialog-align').set('align', '');
				this.el.getElement('.mooeditable-image-paddingtop').set('value', '');
				this.el.getElement('.mooeditable-image-paddingright').set('value', '');
				this.el.getElement('.mooeditable-image-paddingbottom').set('value', '');
				this.el.getElement('.mooeditable-image-paddingleft').set('value', '');
			}
			(function(){
				input.focus();
				input.select();
			}).delay(10);
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				this.close();
				var dialogAlignSelect = this.el.getElement('.dialog-align');
				var node = editor.selection.getNode();
				var src = this.el.getElement('.dialog-url').get('value').trim();
				if( src == "" ) return;
				
				var getValue = function(p,ex){
				    return this.el.getElement( p ).value?this.el.getElement( p ).value+ex:'';
				}.bind(this);
				
			    var styles = {
				  'padding-top': getValue('.mooeditable-image-paddingtop','px'),
				  'padding-right': getValue('.mooeditable-image-paddingright','px'),
				  'padding-bottom': getValue('.mooeditable-image-paddingbottom','px'),
				  'padding-left': getValue('.mooeditable-image-paddingleft','px')
				};

				if ( node && node.get('tag') == 'img'){
					node.set('src', src);
					node.set('alt', this.el.getElement('.dialog-alt').get('value').trim());
					node.className = this.el.getElement('.dialog-class').get('value').trim();
					node.set('align', $(dialogAlignSelect.options[dialogAlignSelect.selectedIndex]).get('value'));
					node.setStyles(styles);
				} else {
					var div = new Element('div');
					var img = new Element('img', {
						src: this.el.getElement('.dialog-url').get('value').trim(),
						alt: this.el.getElement('.dialog-alt').get('value').trim(),
						'class': this.el.getElement('.dialog-class').get('value').trim(),
						align: $(dialogAlignSelect.options[dialogAlignSelect.selectedIndex]).get('value'),
						styles: styles
					}).inject(div);
					
					editor.selection.insertContent(div.get('html'));
				}
			}
		}
	});
};

MooEditable.Actions.image = {
	title: MooEditable.Locale.get('addEditImage'),
	options: {
		shortcut: 'm'
	},
	states: {
		tags: ['img']
	},
	dialogs: {
		prompt: function(editor){
			return MooEditable.UI.ImageDialog(editor);
		}
	},
	command: function(){
		this.dialogs.image.prompt.open();
	}
};
