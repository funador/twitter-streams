'use strict'

angular.module('app', ["firebase"])

.controller("storyCtrl", function($scope, $firebaseArray, $timeout) {
  $scope.sports = ['nfl', 'nba', 'mlb', 'nhl']

  let ref = new Firebase("https://twitter-streams.firebaseio.com")

  $timeout(function() {

    $scope.nflheros      = $firebaseArray(ref.child("nfl/hero").orderByChild("count").limitToLast(6))
    $scope.nflstories    = $firebaseArray(ref.child("nfl/story").orderByChild("count").limitToLast(5))
    $scope.nfltweets     = $firebaseArray(ref.child("nfl/tweet").orderByChild("count").limitToLast(15))

    $scope.nbaheros      = $firebaseArray(ref.child("nba/hero").orderByChild("count").limitToLast(6))
    $scope.nbastories    = $firebaseArray(ref.child("nba/story").orderByChild("count").limitToLast(5))
    $scope.nbatweets     = $firebaseArray(ref.child("nba/tweet").orderByChild("count").limitToLast(15))

    $scope.activeSport = 'nfl'

    $scope.updateSport = function(sport){
      if(sport === 'nfl') {
        $scope.activeSport = 'nfl'
      }
      if(sport === 'nba') {
        $scope.activeSport = 'nba'
      }
    }
    $scope.scopeSport = function(sport){
      return
    }

    console.log($scope.activeSport)
  })


})
