function PrettyUrl(title) {
  var noSpace = title.split(' ').join('-')
  var url = noSpace.replace('--', '')
  return url
}
