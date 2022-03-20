const vimeoHTML = require('./Classes/vimeo-html')

module.exports = {
  default: { vimeo: vimeoHTML, html: vimeoHTML.html },
  vimeo: vimeoHTML,
  html: vimeoHTML.html,
}
