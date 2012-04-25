/*
---

name: MooEditable.Table

description: Extends MooEditable to insert table with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej
- Ryan Mitchell
- MArc Schmidt <marc@kryn.org>

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.Actions

provides:
- MooEditable.Plugins.Table
- MooEditable.UI.TableDialog
- MooEditable.Actions.tableadd
- MooEditable.Actions.tableedit
- MooEditable.Actions.tablerowadd
- MooEditable.Actions.tablerowedit
- MooEditable.Actions.tablerowspan
- MooEditable.Actions.tablerowsplit
- MooEditable.Actions.tablerowdelete
- MooEditable.Actions.tablecoladd
- MooEditable.Actions.tablecoledit
- MooEditable.Actions.tablecolspan
- MooEditable.Actions.tablecolsplit
- MooEditable.Actions.tablecoldelete

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <link rel="stylesheet" href="MooEditable.Table.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.Table.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable({
      actions: 'bold italic underline strikethrough | table | toggleview'
    });
  });
  </script>

...
*/

MooEditable.Locale.define({
    tableColumns: 'Columns',
    tableRows: 'Rows',
    tableWidth: 'Width',
    tableClass: 'Class',
    tableType: 'Type',
    tableHeader: 'Header',
    tableCell: 'Cell',
    tableAlign: 'Align',
    tableAlignNone: 'None',
    tableAlignLeft: 'Left',
    tableAlignCenter: 'Center',
    tableAlignRight: 'Right',
    tableValign: 'Vertical align',
    tableValignNone: 'None',
    tableValignTop: 'Top',
    tableValignMiddle: 'Middle',
    tableValignBottom: 'Bottom',
    addTable: 'Add Table',
    editTable: 'Edit Table',
    deleteTable: 'Delete Table',
    addTableRow: 'Add Table Row',
    editTableRow: 'Edit Table Row',
    mergeTableRow: 'Merge Table Row',
    splitTableRow: 'Split Table Row',
    deleteTableRow: 'Delete Table Row',
    addTableCol: 'Add Table Column',
    editTableCol: 'Edit Table Column',
    mergeTableCell: 'Merge Table Cell',
    splitTableCell: 'Split Table Cell',
    deleteTableCol: 'Delete Table Column'
});

MooEditable.Plugins.Table = new Class({

    initialize: function( editor ){
        this.editor = editor;
        this.editor.addEvent('change', this.findTables.bind(this));
    },
    
    findTables: function(){
        
        this.editor.iframe.getElements('table').each(function(table){
        
            if( !table.getElement('.mooeditable-table-control-cell-table') )
                this.addControls( table );
        
        }.bind(this));
    
    },
    
    addControls: function( table ){
        
        var tbody = table;
        var i = 0;
        
        if( table.getChildren('tbody') )
            tbody = table.getChildren('tbody')[0];
            
        var firstTr = tbody.getElement('tr');
        if( !firstTr  ) return;
        
        var tr = new Element('tr').inject( tbody, 'top' );
        
        var colCount = firstTr.getElements('td,th').length;
        
        for(; i<colCount; i++ ){
            new Element('td', {
                'class': 'mooeditable-table-control-cell-col',
                contentEditable: false,
                style: 'height: 12px;'
            }).inject(tr);
        }
        
        tbody.getElements('tr').each(function(tr, index){
            var td = new Element('td', {
                'class': 'mooeditable-table-control-cell-row',
                contentEditable: false,
                style: 'min-width: 12px;'
            }).inject(tr, 'top');
            
            if( index == 0 )
                td.set('class', 'mooeditable-table-control-cell-table');
        });
        
        //table.addEvent('click', this.click.bind(this));
        this.editor.addEvent('element', this.checkElement.bind(this));
        
        if( Browser.firefox ){
            //Workaround for a Firefox bug …
            table.addEvent('click', function(e){
                this.editor.checkStates( e.target );
            }.bind(this));
        }
    },
    
    clear: function(){
        if( !this.get || this.get('tag') != 'table' ) return;
        this.getElements('td,th').removeClass('mooeditable-table-control-selected');
    },
    
    click: function( e ){
        this.checkElement( e.target );
    },
    
    checkElement: function( element ){
        
        if( element.get('tag') == 'table' ){
            element = element.getElement('.mooeditable-table-control-cell-table');
        }
        
        if( element && (element.get('tag') == 'td' || element.get('tag') == 'th') ){
            
            this.clear.call(element.getParent('table'));
            
            this.lastNode = element;
            
            if( element.hasClass('mooeditable-table-control-cell-col') ){
                var node = element;
                var index = parseInt(node.cellIndex);
                if (node){
                    var nextTr = node.getParent().getNext();
                    var c;
                    
                    do {
                        c = nextTr.getChildren('td, th');
                        if( c[index] )
                            c[index].addClass('mooeditable-table-control-selected');
                    
                    } while( (nextTr = nextTr.getNext()) != null );
                }
            }    
            
            if( element.hasClass('mooeditable-table-control-cell-row') ){
                var node = element;
                node.getParent().getChildren().addClass('mooeditable-table-control-selected');
                node.getParent().getElement('td,th').removeClass('mooeditable-table-control-selected');
            }
            if( element.hasClass('mooeditable-table-control-cell-table') ){
                var node = element.getParent('table');
                
                node.getElements('td,th').addClass('mooeditable-table-control-selected');
                node.getElement('tr').getChildren().removeClass('mooeditable-table-control-selected');

                if( node ){
                    var nextTr = node.getElement('tr').getNext();
                    var c;
                    
                    do {
                        c = nextTr.getChildren('td,th');
                        if( c[0] )
                            c[0].removeClass('mooeditable-table-control-selected');
                    
                    } while( (nextTr = nextTr.getNext()) != null );
                }
            }
        } else if( this.lastNode ){
            this.clear.call( this.lastNode.getParent('table') );
        }
    },
    
    /**
    * Removes our control elements in the html, when the editor calls getContent();
    */
    removeControls: function( root ){
    
        root.getElements('table').each(function(table){

            table.getElements('.mooeditable-table-control-cell-row').each(function(td){
                td.destroy();
            });
            
            table.getElements('.mooeditable-table-control-selected').each(function(td){
                td.removeClass('mooeditable-table-control-selected');
            });
            
            table.getElements('.mooeditable-table-control-cell-table').each(function(td){
                td.getParent().destroy();
            });
            
        });

    }

});

MooEditable.UI.TableDialog = function(editor, dialog){
    
    var rowColEdit = '<tr><td>'
            + MooEditable.Locale.get('tableWidth') + '</td><td>' + ' <input type="text" class="table-w" value="" size="4"> '
            + '</td></tr><tr><td>'
            + MooEditable.Locale.get('tableClass') + '</td><td>' + ' <input type="text" class="table-c" value="" size="15"> '
            + '</td></tr><tr><td>'
            + MooEditable.Locale.get('tableAlign') + '</td><td>' + ' <select class="table-a">'
                + '<option value="">' + MooEditable.Locale.get('tableAlignNone') + '</option>'
                + '<option value="left">' + MooEditable.Locale.get('tableAlignLeft') + '</option>'
                + '<option value="center">' + MooEditable.Locale.get('tableAlignCenter') + '</option>'
                + '<option value="right">' + MooEditable.Locale.get('tableAlignRight') + '</option>'
            + '</select> '
            + '</td></tr><tr><td>'
            + MooEditable.Locale.get('tableValign') + '</td><td>'+ ' <select class="table-va">'
                + '<option value="">' + MooEditable.Locale.get('tableValignNone') + '</option>'
                + '<option value="top">' + MooEditable.Locale.get('tableValignTop') + '</option>'
                + '<option value="middle">' + MooEditable.Locale.get('tableValignMiddle') + '</option>'
                + '<option value="bottom">' + MooEditable.Locale.get('tableValignBottom') + '</option>'
            + '</select>'
            + '</td></tr>';

    var html = {
        tableadd: MooEditable.Locale.get('tableColumns') + ' <input type="text" class="table-c" value="" size="4"> '
            + MooEditable.Locale.get('tableRows') + ' <input type="text" class="table-r" value="" size="4"> ',
        tableedit: MooEditable.Locale.get('tableWidth') + ' <input type="text" class="table-w" value="" size="4"> '
            + MooEditable.Locale.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> ',
            
        tablecoledit: '<table width="100%"><tr><td width="90">'+rowColEdit+'</table>'
    };
    
    html.tablerowedit = ''
        + '<table width="100%"><tr><td width="90">'
            + html.tablecoledit
            + '<tr><td>'
            + MooEditable.Locale.get('tableType') + '</td><td>' + ' <select class="table-c-type">'
                + '<option value="th">' + MooEditable.Locale.get('tableHeader') + '</option>'
                + '<option value="td">' + MooEditable.Locale.get('tableCell') + '</option>'
            + '</select>'
            + '</td></tr>'
        + '</table>',
    
    html[dialog] += '<div class="mooeditable-dialog-actions">'
		+'<button class="dialog-button dialog-ok-button">' + MooEditable.Locale.get('ok') + '</button>'
        + '<button class="dialog-button dialog-cancel-button">' + MooEditable.Locale.get('cancel') + '</button></div>';
        
        
    var colRowEdit ={
        
        load: function( attributes ){
    
            var node = editor.lastElement;
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            var values = {};
            
            if( node.hasClass('mooeditable-table-control-cell-col') ){
                
                var index = parseInt(node.cellIndex);
                var nextTr = node.getParent();
                var c;
                
                do {
                    c = nextTr.getChildren('td,th');
                    if( c[index] && !c[index].hasClass('mooeditable-table-control-cell-col') ){
                        
                        if( Object.getLength(values) == 0 ){
                            //initial
                            Object.each(attributes, function(attr,el){
                                values[ attr ] = c[index].get( attr );
                            }.bind(this));
                            
                        } else {
                            Object.each(attributes, function(attr,el){
                                if( values[attr] != c[index].get(attr) ){
                                    values[attr] = "";
                                }
                            }.bind(this));
                        }
                    }
                } while( (nextTr = nextTr.getNext()) != null );
            } else if( node.hasClass('mooeditable-table-control-cell-row') ){
                
                var nextTd = node.getParent().getChildren()[1];
                
                do {
                    if( Object.getLength(values) == 0 ){
                        //initial
                        Object.each(attributes, function(attr,el){
                            values[ attr ] = nextTd.get( attr );
                        }.bind(this));
                        
                    } else {
                        Object.each(attributes, function(attr,el){
                            if( values[attr] != nextTd.get(attr) ){
                                values[attr] = "";
                            }
                        }.bind(this));
                    }
                } while( (nextTd = nextTd.getNext()) != null );
            
            } else {                    
                values = {
                    'width': node.get('width'),
                    'class': node.get('class'),
                    'align': node.get('align'),
                    'valign': node.get('valign')
                }
            }
            
            if( Object.getLength(values) == 0 ) return;
            
            values[ 'class' ] = values[ 'class' ].replace('mooeditable-table-control-selected', '');  
            
            Object.each(attributes, function(attr,el){
                var element = this.el.getElement('.'+el);
                
                if( !values || !values[attr] )
                    element.set('value', '');
                else
                    element.set('value', values[attr]);
            }.bind(this));
        },
        
        click: function( attributes ){

            var node = editor.lastElement;
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            var values = {};
            Object.each( attributes, function(attr,el){
            
                values[attr] = this.el.getElement('.'+el).value
            
            }.bind(this));
            
            values['class'] = 'mooeditable-table-control-selected'+(values['class']?' '+values['class']:'');

            if( node.hasClass('mooeditable-table-control-cell-col') ){
                //selected whole col
                var index = parseInt(node.cellIndex);
                if (node){
                    var nextTr = node.getParent();
                    var c;
                    
                    do {
                        c = nextTr.getChildren('td,th');
                        if( c[index] && !c[index].hasClass('mooeditable-table-control-cell-col') ){
                            c[index].set(values);
                        }
                    
                    } while( (nextTr = nextTr.getNext()) != null );
                }
            } else if( node.hasClass('mooeditable-table-control-cell-row') ){
                //selected whole row
                var nextTd = node.getParent().getChildren()[1];
                
                do {
                    nextTd.set( values );
                } while( (nextTd = nextTd.getNext()) != null );

            } else {
                //selected one cell
                node.set( values );
            }
        }
    }
        
        
        
    var action = {
        tableadd: {
            click: function(e){
                var col = this.el.getElement('.table-c').value.toInt();
                var row = this.el.getElement('.table-r').value.toInt();
                if (!(row>0 && col>0)) return;
                var div, table, tbody, ro = [];
                div = new Element('tdiv');
                table = new Element('table').set('border', 0).set('width', '100%').inject(div);
                tbody = new Element('tbody').inject(table);
                for (var r = 0; r<row; r++){
                    ro[r] = new Element('tr').inject(tbody, 'bottom');
                    for (var c=0; c<col; c++) new Element('td').set('html', '&nbsp;').inject(ro[r], 'bottom');
                }
                editor.selection.insertContent(div.get('html'));
                editor.plugins.Table.findTables();
            }
        },
        tableedit: {
            load: function(e){
                var node = editor.selection.getNode().getParent('table');
                this.el.getElement('.table-w').set('value', node.get('width'));
                this.el.getElement('.table-c').set('value', node.className);
            },
            click: function(e){
                var node = editor.selection.getNode().getParent('table');
                node.set('width', this.el.getElement('.table-w').value);
                node.className = this.el.getElement('.table-c').value;
            }
        },
        tablerowedit: {
            load: function(e){
                var node = editor.lastElement;
                if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
                if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');

                this.el.getElement('.table-c-type').set('value', node.get('tag'));
                
                colRowEdit.load.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign'});
                
            },
            click: function(e){
                var node = editor.lastElement;
                if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
                if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
                
                var tr = node.getParent();
                
                colRowEdit.click.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign'});

                var cType = this.el.getElement('.table-c-type').value;
                
                node.getParent('tr').getElements('td, th').each(function(c){
                    if( cType != c.get('tag') ){
                        
                        var n = new Element( cType );
                        ['class', 'style', 'html'].each(function(attr){
                            n.set(attr, c.get(attr));
                        });

                        n.inject( c, 'after' );
                        c.destroy();
                    }
                }, this);
                
                if( node.get('tag') != cType ){
                    editor.lastElement = tr.getChildren()[0];
                    editor.lastElement.focus();
                }
            }
        },
        tablecoledit: {
        
            load : function(e){
                colRowEdit.load.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign'});
            },
            click: function(e){
                colRowEdit.click.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign'});
            }
        }
        
                
    };
    
    return new MooEditable.UI.Dialog(html[dialog], {
        'class': 'mooeditable-table-dialog',
        onOpen: function(){
            if (action[dialog].load) action[dialog].load.apply(this);
            var input = this.el.getElement('input');
            (function(){ input.focus(); }).delay(10);
        },
        onClick: function(e){
            if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
            var button = document.id(e.target);
            if (button.hasClass('dialog-cancel-button')){
                this.close();
            } else if (button.hasClass('dialog-ok-button')){
                this.close();
                action[dialog].click.apply(this);
            }
        }
    });
};

Object.append(MooEditable.Actions, {

    tableadd:{
        title: MooEditable.Locale.get('addTable'),
        dialogs: {
            prompt: function(editor){
                return MooEditable.UI.TableDialog(editor, 'tableadd');
            }
        },
        command: function(){
            this.dialogs.tableadd.prompt.open();
        }
    },
    
    tableedit:{
        title: MooEditable.Locale.get('editTable'),
        modify: {
          tags: ['td','th'],
          withClass: 'mooeditable-table-control-cell-table'
        },
        dialogs: {
            prompt: function(editor){
                return MooEditable.UI.TableDialog(editor, 'tableedit');
            }
        },
        command: function(){
            if (this.selection.getNode().getParent('table')) this.dialogs.tableedit.prompt.open();
        }
    },
    
    tabledelete:{
        title: MooEditable.Locale.get('deleteTable'),
        modify: {
          tags: ['td','th'],
          withClass: 'mooeditable-table-control-cell-table'
        },
        command: function(){
            var t = this.lastElement.getParent('table');
            if( t ) t.destroy();
        }
    },
    
    
    tablerowedit:{
        title: MooEditable.Locale.get('editTableRow'),
        modify: {
          tags: ['td', 'th'],
          withClass: 'mooeditable-table-control-cell-row'
        },
        dialogs: {
            prompt: function(editor){
                return MooEditable.UI.TableDialog(editor, 'tablerowedit');
            }
        },
        command: function(){
            if (this.lastElement.getParent('table')) this.dialogs.tablerowedit.prompt.open();
        }
    },
    
    tablerowadd:{
        title: 'Add Row',
        modify: function( element, action ){
            return ((element.get('tag')=='td'||element.get('tag')=='th')
                &&(
                    element.hasClass('mooeditable-table-control-cell-row') ||
                    element.hasClass('mooeditable-table-control-cell-table')
                )
            );
        },
        command: function(){
            var node = this.lastElement.getParent('tr');
            if( node ){
                var clone = node.clone();
                clone.inject(node, 'after');
                clone.getElements('td,th').each(function(td,idx){
                    
                    if( idx==0 ){
                        td.set('class', 'mooeditable-table-control-cell-row');
                    } else {
                        td.set('style', '');
                        td.set('class', '');
                        td.set('html', '&nbsp;');
                    }
                    
                    td.removeClass('mooeditable-table-control-selected');
                });
            }
        }
    },
    
    
    /*tablerowsplit:{
        title: MooEditable.Locale.get('splitTableRow'),
        modify: function( element, action ){
            return ((element.get('tag')=='td'||element.get('tag')=='th')
                &&!element.hasClass('mooeditable-table-control-cell-row')
                &&!element.hasClass('mooeditable-table-control-cell-col')
                &&!element.hasClass('mooeditable-table-control-cell-table')
            );
        },
        command: function(){
            var node = this.selection.getNode();
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            if (node){
                var index = node.cellIndex;
                var row = node.getParent().rowIndex;
                if (node.getProperty('rowspan')){
                    var rows = parseInt(node.getProperty('rowspan'));
                    for (i=1; i<rows; i++){
                        node.getParent().getParent().childNodes[row+i].insertCell(index);
                    }
                    node.removeProperty('rowspan');
                }
            }
        },
        states: function(node){
            if (node.get('tag') != 'td' && node.get('tag') != 'th') return;
            if (node){
                if (node.getProperty('rowspan') && parseInt(node.getProperty('rowspan')) > 1){
                    this.el.addClass('onActive');
                }
            }
        }
    },
    */
    
    
    tablecoledit:{
        title: MooEditable.Locale.get('editTableCol'),
        modify: function( element,action ){
            return ((element.get('tag')=='td'||element.get('tag')=='th')
                &&!element.hasClass('mooeditable-table-control-cell-row')
                &&!element.hasClass('mooeditable-table-control-cell-table')
            );
        },
        dialogs: {
            prompt: function(editor){
                return MooEditable.UI.TableDialog(editor, 'tablecoledit');
            }
        },
        command: function(){
            if( this.lastElement.getParent('table') ) this.dialogs.tablecoledit.prompt.open();
        }
    },
    
    
    
    tablerowspan:{
        title: MooEditable.Locale.get('mergeTableRow'),
        modify: function( element, action ){
            return ((element.get('tag')=='td'||element.get('tag')=='th')
                &&!element.hasClass('mooeditable-table-control-cell-row')
                &&!element.hasClass('mooeditable-table-control-cell-col')
                &&!element.hasClass('mooeditable-table-control-cell-table')
            );
        },
        command: function(){
            var node = this.selection.getNode();
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            if (node){
                var index = node.cellIndex;
                var row = node.getParent().rowIndex;
                if( ! node.getParent().getNext() ) return;
                
                var tdBelow = node.getParent().getNext().getChildren()[index];
                if( tdBelow ){
                    node.set('html', node.get('html')+' '+tdBelow.get('html'));
                    node.rowSpan += tdBelow.rowSpan+1;
                    tdBelow.destroy();
                }
            }
        }
    },
    

    tablerowdelete:{
        title: MooEditable.Locale.get('deleteTableRow'),
        modify: {
          tags: ['td', 'th'],
          withClass: 'mooeditable-table-control-cell-row'
        },
        command: function(){
            var node = this.selection.getNode().getParent('tr');
            if (node) node.getParent().deleteRow(node.rowIndex);
        }
    },
    
    tablecoladd:{
        title: MooEditable.Locale.get('addTableCol'),
        modify: function( element, action ){
            return ((element.get('tag')=='td'||element.get('tag')=='th')
                &&(
                    element.hasClass('mooeditable-table-control-cell-col') ||
                    element.hasClass('mooeditable-table-control-cell-table')
                )
            );
        },
        command: function(){
            var node = this.lastElement;
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            if (node){
                var index = node.cellIndex;
                node.getParent('table').getElements('tr').each(function(tr, idx){
                    
                    new Element( node.get('tag'), {
                        html: '&nbsp;',
                        'class': idx==0?'mooeditable-table-control-cell-col':''
                    } ).inject(tr.getChildren()[index], 'after');
                    
                });
                /*
                var len = node.getParent().getParent().childNodes.length;
                for (var i=0; i<len; i++){
                    var ref = $(node.getParent().getParent().childNodes[i].childNodes[index]);
                    ref.clone().inject(ref, 'after');
                }*/
            }
        }
    },
    
    tablecolspan:{
        title: MooEditable.Locale.get('mergeTableCell'),
        modify: function( element,action ){
            return ((element.get('tag')=='td'||element.get('tag')=='th')
                &&!element.hasClass('mooeditable-table-control-cell-row')
                &&!element.hasClass('mooeditable-table-control-cell-col')
                &&!element.hasClass('mooeditable-table-control-cell-table')
            );
        },
        command: function(){
            var node = this.selection.getNode();
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            if (node){
                var nextTd = node.getNext();
                
                if( nextTd ){
                    node.set('html', node.get('html')+' '+nextTd.get('html'));
                    node.colSpan += nextTd.colSpan+1;
                    nextTd.destroy();
                }
            }
        }
    },
        
    /*tablecolsplit:{
        title: MooEditable.Locale.get('splitTableCell'),
        modify: {
          tags: ['td'],
          withClass: 'mooeditable-table-control-cell-col'
        },
        command: function(){
            var node = this.selection.getNode();
            if (node.get('tag')!='td') node = node.getParent('td');
            if (node){
                var index = node.cellIndex + 1;
                if(node.getProperty('colspan')){
                    var cols = parseInt(node.getProperty('colspan'));
                    for (i=1;i<cols;i++){
                        node.getParent().insertCell(index+i);
                    }
                    node.removeProperty('colspan');
                }
            }
        },
        states: function(node){
            if (node.get('tag')!='td') return;
            if (node){
                if (node.getProperty('colspan') && parseInt(node.getProperty('colspan')) > 1){
                    this.el.addClass('onActive');
                }
            }
        }
    },*/
    
    tablecoldelete:{
        title: MooEditable.Locale.get('deleteTableCol'),
        modify: {
          tags: ['td', 'th'],
          withClass: 'mooeditable-table-control-cell-col'
        },
        command: function(){
            var node = this.selection.getNode();
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            if( !node ){
                node = this.plugins.Table.lastNode;
            }

            var index = parseInt(node.cellIndex);
            if (node){
                var nextTr = node.getParent();
                var c;
                
                do {
                    c = nextTr.getChildren('td,th');
                    if( c[index] )
                        c[index].destroy();
                
                } while( (nextTr = nextTr.getNext()) != null );
            }
        }
    }
    
});
