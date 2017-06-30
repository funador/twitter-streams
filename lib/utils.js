export function cleanText(text) {

  return text.replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, "'")
             .replace(new RegExp('&#39;', 'g'), "'").replace(new RegExp('&nbsp;', 'g'), " ")
             .replace(new RegExp('&amp;', 'g'), "&").replace(new RegExp('&quot', 'g'), "'")
}

export function makeId(url) {
  return url.match(/[^_\W]+/g)
            .join('')
            .replace(/w/g, '')
            .substring(5, 40)
}
