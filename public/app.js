'use strict'

var app = angular.module("app", ["firebase"])

app.controller("storyCtrl", function($scope, $firebaseArray, $timeout, $parse) {

  let ref = new Firebase("https://twitter-streams.firebaseio.com")

  $timeout(function() {
    // send boths sides as k, v in a an object
    // pass in these as elements in an object
    $scope.nflstories    = $firebaseArray(ref.child("nfl/story").orderByChild("score").limitToLast(5))
    $scope.nfltweets     = $firebaseArray(ref.child("nfl/tweet").orderByChild("score").limitToLast(15))
  })

  // angular.forEach(results, function (value, key) {
  //   $parse(key).assign($scope, value);
  // });

})
