'use strict'

angular.module("app")

  .directive('herosContainer', function() {
    return {
      templateUrl: 'heros/heros.html',
      restrict: 'EA',
      scope: {
        data: '@'
      },
      link: function(scope, el, attr){
        // scope.data = attr.data // use only if scope.watch is not working
        scope.$watch(function(){
          return scope.data
        }, function(n, o) {
          if(n && o) {
            angular.fromJson(n)
          }
        })
      }
    }
  })
