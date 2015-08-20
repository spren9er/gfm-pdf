var fs = require('fs');
var less = require('less');
var exec = require('child_process').exec;
var mdp = atom.packages.activePackages['markdown-preview'];

module.exports = {

  config: {
    'executablePath': {
      'title': 'Executable Path',
      'type': 'string',
      'default': '/usr/local/bin/wkhtmltopdf',
      'description': 'Path of the \'wkhtmltopdf\' executable'
    },
    'styleFontSize': {
      'title': 'Font-Size',
      'type': 'string',
      'default': '16px'
    },
    'styleWidth': {
      'title': 'Width',
      'type': 'string',
      'default': '790px'
    },
    'type': {
      'title': 'Type(s) of Output',
      'type': 'string',
      'enum': ['PDF', 'PDF+HTML', 'HTML'],
      'default': 'PDF'
    }
  },

  activate: function() {
    atom.commands.add('atom-workspace', 'gfm-pdf:convert', this.convert);
  },

  convert: function() {
    try {
      if (valid()) {
        // generate html page
        page = "<!DOCTYPE html><html><head><meta charset='utf-8'><title></title>";
        page += styles();
        page += "</head>"
        page += html();
        page += "</html>";

        // paths
        pcomps = atom.workspace.getActivePaneItem().getPath().split('.');
        pcomps.pop();
        htmlpath = pcomps.join('.') + '.html';
        pdfpath = pcomps.join('.') + '.pdf';

        // write html page
        fs.writeFileSync(htmlpath, page);

        // invoke wkhtmltopdf
        dtype = atom.config.get('gfm-pdf.type');
        if (dtype !== 'HTML') {
          wkhtmltopdf = atom.config.get('gfm-pdf.executablePath');
          var cmd = wkhtmltopdf + ' ' + htmlpath + ' ' + pdfpath;
          exec(cmd, function(error, stdout, stderr) {
            if (error === null) {
              atom.notifications.addSuccess('gfm-pdf: PDF conversion succeeded', {detail: 'PDF saved to "' + pdfpath + '"'});
            } else {
              atom.notifications.addError('gfm-pdf: ERROR', {detail: error});
            }
            if (dtype === 'PDF' && fs.existsSync(htmlpath)) fs.unlinkSync(htmlpath);
          });
        } else {
          atom.notifications.addSuccess('gfm-pdf: HTML conversion succeeded', {detail: 'HTML saved to "' + htmlpath + '"'});
        }
      }
    }
    catch(error) {
      atom.notifications.addError('gfm-pdf: ERROR', {detail: error});
      return;
    }
  }
};

function valid() {
  var path = atom.workspace.getActivePaneItem().getPath();
  if (path !== undefined) {
    file = path.split('.').pop();
    if (['md', 'markdown', 'mkdown', 'mkd', 'ron'].indexOf(file) > -1) return true;
  }
  return false;
}

function styles(){
  s = [];
  s.push(atom.themes.getActiveThemes()[0].stylesheets[0][1]); // syntax highlighting
  s.push(fs.readFileSync(__dirname + '/gfm.css', 'utf-8'));   // gfm styles

  // no repeating table headers
  ss = ".gfm-pdf thead, .gfm-pdf tfoot {";
  ss += 'display: table-row-group;';
  ss += "}";
  s.push(ss);

  // settings
  ss = ".gfm-pdf, .gfm-pdf table {";
  ss += 'font-size:' + atom.config.get('gfm-pdf.styleFontSize') + ';';
  ss += 'width:' + atom.config.get('gfm-pdf.styleWidth') + ';';
  ss += "}";
  s.push(ss);

  // user styles
  userpath = atom.styles.getUserStyleSheetPath();
  if (fs.existsSync(userpath, 'utf8')) {
    var u = fs.readFileSync(userpath, 'utf8');
    if (userpath.substr(userpath.length - 5).toLowerCase() == ".less") {
      less.render(u, function(e, css) {
        s.push(css);
      });
    }
    else {
      s.push(u);
    }
  }

  csshtml = "<style>";
  csshtml += s.join("</style><style>");
  csshtml += "</style>";
  return csshtml;
}

function html() {
  var clipboard = atom.clipboard;
  var c = clipboard.read();
  mdp.mainModule.copyHtml();
  var h = clipboard.read();
  clipboard.write(c);
  h = '<body class="gfm-pdf">' + h + '</body>';
  return h;
}
