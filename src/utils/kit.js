let parseQueryString = (url) => {
  let obj = {}
  , keyvalue = []
  , key = ''
  , value = ''
  , paraString = url.split('&');
  for(let i in paraString) {
      keyvalue = paraString[i].split('=');
      key = keyvalue[0];
      value = keyvalue[1];
      value = decodeURIComponent(value);
      obj[key] = value;
  }
  return obj;
}
export { parseQueryString }
