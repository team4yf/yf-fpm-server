import nunjucks from 'nunjucks'
import path from 'path'

const env = nunjucks.configure('views');
export default (fpm) => {
  env.addFilter('tpl', function(str) {
    return path.join(fpm.get('LOCAL'), 'views/admin', str);
  });
}
