# gfm-pdf

Convert GFM (GitHub Flavored Markdown) documents to PDF using `wkhtmltopdf`.

## Requirements

In order to use `gfm-pdf` you need to install `wkhtmltopdf` to your system. For further information look at [wkhtmltopdf.org](http://wkhtmltopdf.org).

## Plugin Installation

```sh
$ apm install gfm-pdf
```

## Settings

You configure `gfm-pdf` by editing `~/.atom/config.cson`

```coffee
'gfm-pdf':
  'executablePath': '/usr/local/bin/wkhtmltopdf'
  'type': 'PDF'
  'fontSize': '16px'
  'width': '790px'
```

You need to provide the path to your `wkhtmltopdf` binary under `executablePath` as above.  

**Note:** For further modifications you can edit your stylesheet `~/.atom/styles.less`, the corresponding wrapper class is called `gfm-pdf`, e.g.

```css
.gfm-pdf h1 {
  color: red;
}
```

## Usage

Open a markdown document and convert it to PDF using the `gfm-pdf:convert` command.
