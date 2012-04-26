/*
---

name: MooEditable.Table

description: Extends MooEditable to insert table with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej
- Ryan Mitchell
- MArc Schmidt <marc@kryn.org>
- Ferdi van der Werf <ferdi@slashdev.nl>

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
    tableCaption: 'Caption',
    tableSummary: 'Summary',
    tableCell: 'Cell',
    tableCellPadding: 'Cell padding',
    tableCellSpacing: 'Cell spacing',
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
    tableBorder: 'Border',
    tableNoBorder: 'No border',
    tableDoBorder: 'Border',
    addTable: 'Add Table',
    editTable: 'Edit Table',
    editTableCell: 'Edit Table Cell',
    deleteTable: 'Delete Table',
    addTableRow: 'Add Table Row',
    addTableRowAfter: 'Add Table Row after',
    addTableRowBefore: 'Add Table Row before',
    editTableRow: 'Edit Table Row',
    mergeTableRow: 'Merge Table Row',
    splitTableRow: 'Split Table Row',
    deleteTableRow: 'Delete Table Row',
    addTableCol: 'Add Table Column',
    addTableColAfter: 'Add Table Column after',
    addTableColBefore: 'Add Table Column before',
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

    var tableAlign = ''
        + '<td>' + MooEditable.Locale.get('tableAlign') + '</td>'
        + '<td>'
            + '<select class="table-a">'
                + '<option value="">' + MooEditable.Locale.get('tableAlignNone') + '</option>'
                + '<option value="left">' + MooEditable.Locale.get('tableAlignLeft') + '</option>'
                + '<option value="center">' + MooEditable.Locale.get('tableAlignCenter') + '</option>'
                + '<option value="right">' + MooEditable.Locale.get('tableAlignRight') + '</option>'
            + '</select>'
        + '</td>';
    var tableValign = ''
        + '<td>' + MooEditable.Locale.get('tableValign') + '</td>'
        + '<td>'
            + '<select class="table-va">'
                + '<option value="">' + MooEditable.Locale.get('tableValignNone') + '</option>'
                + '<option value="top">' + MooEditable.Locale.get('tableValignTop') + '</option>'
                + '<option value="middle">' + MooEditable.Locale.get('tableValignMiddle') + '</option>'
                + '<option value="bottom">' + MooEditable.Locale.get('tableValignBottom') + '</option>'
            + '</select>'
        + '</td>';

    var rowColEdit = ''
            + '<tr>'
                + '<td>' + MooEditable.Locale.get('tableWidth') + '</td>'
                + '<td><input type="text" class="table-w" value="" size="4"></td>'
            + '</tr>'
            + '<tr>'
                + '<td>' + MooEditable.Locale.get('tableClass') + '</td>'
                + '<td><input type="text" class="table-c" value="" size="15"></td>'
            + '</tr>'
            + '<tr>' + tableAlign + '</tr>'
            + '<tr>' + tableValign + '</tr>'
            + '<tr>'
                + '<td>' + MooEditable.Locale.get('tableType') + '</td>'
                + '<td>'
                    + '<select class="table-c-type">'
                        + '<option value="th">' + MooEditable.Locale.get('tableHeader') + '</option>'
                        + '<option value="td">' + MooEditable.Locale.get('tableCell') + '</option>'
                    + '</select>'
                + '</td>'
            + '</tr>';

    var html = {
        tableedit: MooEditable.Locale.get('tableWidth') + ' <input type="text" class="table-w" value="" size="4"> '
            + MooEditable.Locale.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> ',
            
        tablecoledit: '<table>'+rowColEdit+'</table>',
        tablerowedit: '<table>'+rowColEdit+'</table>',
        tablecelledit: '<table>'+rowColEdit+'</table>'
    };

    html.tableadd = ''
        + '<table>'
            + '<tr>'
                + '<td>' + MooEditable.Locale.get('tableColumns') + '</td>'
                + '<td><input type="text" class="table-c" value="2" size="4" /></td>'
                + '<td>' + MooEditable.Locale.get('tableRows') + '</td>'
                + '<td><input type="text" class="table-r" value="2" size="4" /></td>'
            + '</tr>'
            + '<tr>'
                + '<td>' + MooEditable.Locale.get('tableCellPadding') + '</td>'
                + '<td><input type="text" class="table-cp" value="" size="4" /></td>'
                + '<td>' + MooEditable.Locale.get('tableCellSpacing') + '</td>'
                + '<td><input type="text" class="table-cs" value="" size="4" /></td>'
            + '</tr>'
            + '<tr>'
                + tableAlign
                + '<td>' + MooEditable.Locale.get('tableBorder') + '</td>'
                + '<td>'
                    + '<select class="table-b">'
                        + '<option value="0" selected="selected">' + MooEditable.Locale.get('tableNoBorder') + '</option>'
                        + '<option value="1">' + MooEditable.Locale.get('tableDoBorder') + '</option>'
                    + '</select>'
                + '</td>'
            + '</tr>'
            + '<tr>'
                + '<td>' + MooEditable.Locale.get('tableCaption') + '</td>'
                + '<td colspan="3"><input type="text" class="table-cap" value="" size="30" /></td>'
            + '</tr>'
            + '<tr>'
                + '<td>' + MooEditable.Locale.get('tableSummary') + '</td>'
                + '<td colspan="3"><input type="text" class="table-sum" value="" size="30" /></td>'
            + '</tr>'
        + '</table>';

    
    html[dialog] += '<div class="mooeditable-dialog-actions">'
        + '<button class="dialog-button dialog-ok-button">' + MooEditable.Locale.get('ok') + '</button>'
        + '<button class="dialog-button dialog-cancel-button">' + MooEditable.Locale.get('cancel') + '</button></div>';
        
        
    var colRowEdit = {
        
        load: function( attributes, type ) {

            var node = editor.lastElement;
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            var values = {};

            // Get node values as initial filling of values
            Object.each(attributes, function(attr) {
                values[attr] = node.get(attr);
            });

            if(type == 'col') {
                var index = parseInt(node.cellIndex);
                var trs = node.getParent('table').getFirst('tbody').getChildren('tr');
                var cell;

                Object.each(trs, function(tr) {
                    if(typeOf(tr) != 'element') return;

                    cell = tr.getChildren('td,th')[index];
                    if(cell) {
                        Object.each(attributes, function(attr) {
                            if(values[attr] != cell.get(attr))
                                values[attr] = cell.get(attr);
                        });
                    }
                });
            } else if(type == 'row') {

                node.getParent('tr').getChildren('td,tr').each(function(cell) {
                    Object.each(attributes, function(attr) {
                        if(values[attr] != cell.get(attr))
                            values[attr] = cell.get(attr);
                    });
                });

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
        
        click: function( attributes, type ){

            var node = editor.lastElement;
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');
            
            var values = {};
            Object.each( attributes, function(attr,el){
                values[attr] = this.el.getElement('.'+el).value;
                if(values[attr] == '')
                    values[attr] = null;
            }.bind(this));

            var toAlter = [];

            if(type == 'col') {
                var index = parseInt(node.cellIndex);
                var trs = node.getParent('table').getFirst('tbody').getChildren('tr');
                var cell;

                Object.each(trs, function(tr) {
                    if(typeOf(tr) != 'element') return;

                    cell = tr.getChildren('td,th')[index];
                    if(cell) toAlter.push(cell);
                });
            } else if(type == 'row') {

                toAlter.append(node.getParent('tr').getChildren('td,th'));

            } else {

                toAlter.push(node);

            }

            if(toAlter.length > 0) {
                var changeTag = values['tag'];
                values['tag'] = null;
                toAlter.each(function(e) {
                    e.set(values);
                    if(changeTag) {
                        if(changeTag != e.get('tag')) {
                            var n = new Element(changeTag, values);
                            ['class', 'style', 'html'].each(function(attr) {
                                n.set(attr, e.get(attr));
                            });
                            n.inject(e, 'after');
                            e.destroy();
                        }
                    }

                });
            }
        }
    };
        
        
        
    var action = {
        tableadd: {
            click: function(e){
                var col = this.el.getElement('.table-c').value.toInt();
                var row = this.el.getElement('.table-r').value.toInt();
                var padding = this.el.getElement('.table-cp').value;
                var spacing = this.el.getElement('.table-cs').value;
                var align = this.el.getElement('.table-a').value;
                var caption = this.el.getElement('.table-cap').value;
                var summary = this.el.getElement('.table-sum').value;
                if (!(row>0 && col>0)) return;
                var div, table, tbody, ro = [];
                div = new Element('tdiv');
                table = new Element('table')
                    .set('border', this.el.getElement('.table-b').value.toInt())
                    //.set('width', '100%')
                    .inject(div);
                // Optionals
                if(padding != '')
                    table.set('cellpadding', padding.toInt());
                if(spacing != '')
                    table.set('cellspacing', spacing.toInt());
                if(align != '')
                    table.set('align', align);
                if(summary != '')
                    table.set('summary', summary);
                if(caption != '')
                    new Element('caption', { text: caption }).inject(table);
                // Add table body
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
        tablecelledit: {
            load: function() {

                colRowEdit.load.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign', 'table-c-type': 'tag'}, 'cell');

            },
            click: function() {

                colRowEdit.click.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign', 'table-c-type': 'tag'}, 'cell');

            }
        },
        tablerowedit: {
            load: function(){

                colRowEdit.load.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign', 'table-c-type': 'tag'}, 'row');

            },
            click: function(){

                colRowEdit.click.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign', 'table-c-type': 'tag'}, 'row');

            }
        },
        tablecoledit: {
        
            load : function(){

                colRowEdit.load.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign', 'table-c-type': 'tag'}, 'col');

            },
            click: function(){

                colRowEdit.click.call(this, {'table-w': 'width', 'table-c': 'class', 'table-a': 'align', 'table-va': 'valign', 'table-c-type': 'tag'}, 'col');

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
          tags: ['td','th']
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
          tags: ['td','th']
        },
        command: function(){
            var t = this.lastElement.getParent('table');
            if( t ) t.destroy();
        }
    },
    


    tablerowedit: {
        title: MooEditable.Locale.get('editTableRow'),
        modify: {
          tags: ['td','th']
        },
        dialogs: {
            prompt: function(editor) {
                return MooEditable.UI.TableDialog(editor, 'tablerowedit');
            }
        },
        command: function() {
            if (this.lastElement.getParent('table')) this.dialogs.tablerowedit.prompt.open();
        }
    },

    tablecoledit: {
        title: MooEditable.Locale.get('editTableCol'),
        modify: {
            tags: ['td', 'th']
        },
        dialogs: {
            prompt: function(editor) {
                return MooEditable.UI.TableDialog(editor, 'tablecoledit');
            }
        },
        command: function() {
            if( this.lastElement.getParent('table') ) this.dialogs.tablecoledit.prompt.open();
        }
    },

    tablecelledit: {
        title: MooEditable.Locale.get('editTableCell'),
        modify: {
            tags: ['td','th']
        },
        dialogs: {
            prompt: function(editor) {
                return MooEditable.UI.TableDialog(editor, 'tablecelledit');
            }
        },
        command: function() {
            if( this.lastElement.getParent('table') ) this.dialogs.tablecelledit.prompt.open();
        }
    },



    tablecoladdafter:{
        title: MooEditable.Locale.get('addTableColAfter'),
        modify: {
            tags: ['td', 'th']
        },
        command: function(){
            var node = this.lastElement;
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');

            if (node){
                var index = node.cellIndex;
                node.getParent('table').getElements('tr').each(function(tr){

                    new Element( node.get('tag'), {
                        html: '&nbsp;'
                    }).inject(tr.getChildren()[index], 'after');

                });
            }
        }
    },

    tablecoladdbefore:{
        title: MooEditable.Locale.get('addTableColBefore'),
        modify: {
            tags: ['td', 'th']
        },
        command: function(){
            var node = this.lastElement;
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');

            if (node){
                var index = node.cellIndex;
                node.getParent('table').getElements('tr').each(function(tr){

                    new Element( node.get('tag'), {
                        html: '&nbsp;'
                    } ).inject(tr.getChildren()[index], 'before');

                });
            }
        }
    },

    tablecoldelete:{
        title: MooEditable.Locale.get('deleteTableCol'),
        modify: {
            tags: ['td', 'th']
        },
        command: function(){
            var node = this.selection.getNode();
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('td');
            if( !node || (node.get('tag') != 'td' && node.get('tag') != 'th') ) node = node.getParent('th');

            if( !node ){
                node = this.plugins.Table.lastNode;
            }

            if (node){
                var index = node.cellIndex;
                node.getParent('table').getElements('tr').each(function(tr) {
                    if(tr.getChildren()[index])
                        tr.getChildren()[index].destroy();
                });
            }
        }
    },



    tablerowaddafter:{
        title: MooEditable.Locale.get('tableRowAddAfter'),
        modify: {
          tags: ['td', 'th']
        },
        command: function(){
            var node = this.lastElement.getParent('tr');
            if( node ){
                var clone = node.clone();
                clone.inject(node, 'after');
                clone.getElements('td,th').each(function(td,idx){
                    td.set('html', '&nbsp;');
                });
            }
        }
    },

    tablerowaddbefore:{
        title: MooEditable.Locale.get('tableRowAddBefore'),
        modify: {
            tags: ['td', 'th']
        },
        command: function(){
            var node = this.lastElement.getParent('tr');
            if( node ){
                var clone = node.clone();
                clone.inject(node, 'before');
                clone.getElements('td,th').each(function(td,idx){
                    td.set('html', '&nbsp;');
                });
            }
        }
    },

    tablerowdelete:{
        title: MooEditable.Locale.get('deleteTableRow'),
        modify: {
            tags: ['td', 'th']
        },
        command: function(){
            var node = this.selection.getNode().getParent('tr');
            if (node) node.getParent().deleteRow(node.rowIndex);
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
    }
        
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
    
});
