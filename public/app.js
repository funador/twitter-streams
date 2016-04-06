'use strict'

angular.module('app', ["firebase"])

.controller("storyCtrl", function($scope, $firebaseArray, $timeout) {

  var ref = new Firebase("https://twitter-streams.firebaseio.com")
  $scope.nfl      = $firebaseArray(ref.child("nfl").orderByChild("count").limitToLast(30))
  $scope.mlb      = $firebaseArray(ref.child("mlb").orderByChild("count").limitToLast(30))
  $scope.nba      = $firebaseArray(ref.child("nba").orderByChild("count").limitToLast(30))
  $scope.nhl      = $firebaseArray(ref.child("nba").orderByChild("count").limitToLast(30))

  // ref.remove()

})
