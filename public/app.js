'use strict'

var app = angular.module("app", ["firebase"])

app.controller("storyCtrl", function($scope, $firebaseArray, $timeout) {

  let ref = new Firebase("https://twitter-streams.firebaseio.com")

  $timeout(function() {
    // send boths sides as k, v in a an object
    $scope.nflheros      = $firebaseArray(ref.child("nfl/hero").orderByChild("score").limitToLast(4))
    $scope.nflstories    = $firebaseArray(ref.child("nfl/story").orderByChild("score").limitToLast(5))
    $scope.nfltweets     = $firebaseArray(ref.child("nfl/tweet").orderByChild("score").limitToLast(15))
    $scope.nflundefined  = $firebaseArray(ref.child("nfl/tweet").orderByChild("score").limitToLast(15))
  })

  // angular.forEach(results, function (value, key) {
  //   $parse(key).assign($scope, value);
  // });

})
