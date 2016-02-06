'use strict'

angular.module('app', ["firebase"])

.controller("storyCtrl", function($scope, $firebaseArray, $timeout, $parse) {

  let ref = new Firebase("https://twitter-streams.firebaseio.com")

  $timeout(function() {
    // send boths sides as k, v in a an object
    // pass in these as elements in an object
    $scope.nflheros      = $firebaseArray(ref.child("nfl/hero").orderByChild("count").limitToLast(5))
    $scope.nflstories    = $firebaseArray(ref.child("nfl/story").orderByChild("count").limitToLast(5))
    $scope.nfltweets     = $firebaseArray(ref.child("nfl/tweet").orderByChild("count").limitToLast(15))
  })

  // angular.forEach(results, function (value, key) {
  //   $parse(key).assign($scope, value);
  // });

})
