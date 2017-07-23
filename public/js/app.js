(function(win){
  var app = angular.module('app', ['ngApi'])
  .run(['$ae', function($ae){
    $ae.init({mode:'DEV',appkey:'123123',masterKey:'123123', endpoint: 'http://api.yunplus.io/api'});
  }])
  win.app = app;
})(window);

/**
 * Main
 */
(function(app){
  app.controller('MainCtrl', ['$scope', '$ae', function($scope, $ae){
    $scope.api = {
      method: '',
      args: '{}',
      result: 'TODO...',
    };
    $scope.command = {
      command: '',
      result: '',
    }
    $scope.reset = function($event){
      $event.stopPropagation();
      $scope.api = {
        method: '',
        args: '{}',
        result: 'TODO...',
      };
    };
    $scope.invoke = function($event){
      $event.stopPropagation();
      var f = new $ae.Function($scope.api.method)

      f.invoke(JSON.parse($scope.api.args))
        .then(function(data){
          $scope.api.result = JSON.stringify(data, null, 2);
        })
        .catch(function(err){
          $scope.api.result = JSON.stringify(err, null, 2);
        })
    };
    $scope.doCommand = function($event){
      $event.stopPropagation();
      var f = new $ae.Function('system.doCommand')

      f.invoke({command: $scope.command.command})
        .then(function(data){
          $scope.command.result = data;
        })
        .catch(function(err){
          $scope.command.result = err;
        })
    }
  }])
})(window.app);
  
(function(app){
  app.controller('MysqlCtrl', ['$scope', '$ae', function($scope, $ae){
    $scope.tables = [
      {
        name: 'A',
        desc: 'fpm_user',
      },
      {
        name: 'B',
        desc: 'fpm_user',
      },
      {
        name: 'C',
        desc: 'fpm_user',
      },
      {
        name: 'A',
        desc: 'fpm_user',
      },
      {
        name: 'B',
        desc: 'fpm_user',
      },
      {
        name: 'C',
        desc: 'fpm_user',
      },
    ]
  }]);
})(window.app);

