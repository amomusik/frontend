'use strict';

angular.module('app').controller('TeamManageProjectsController', function ($scope, $routeParams, $api, $pageTitle, $location) {
  $scope.projects = [];

  $scope.team_promise.then(function (team) {
    if (team.error) {
      $location.path('/teams');
    }

    $pageTitle.set(team.name, 'Teams');

    $scope.doTypeahead = function ($viewValue) {
      return $api.tracker_typeahead($viewValue);
    };

    $scope.claimTrackerValue = undefined;
    $scope.claimTracker = function(tracker) {
      $scope.own_project(tracker.id);
    };

    $scope.addTrackerValue = undefined;
    $scope.addTracker = function(tracker) {
      $scope.add_project(tracker.id);
    };

    $scope.add_project = function (project_search) {
      if (typeof(project_search) === "number") {
        $api.team_tracker_add(team.slug, project_search).then(function (updated_team) {
          $scope.set_team(updated_team);
          $scope.setRelatedTrackers(updated_team);
        });
        $scope.project_search = null;

      } else if (project_search && project_search.length > 0) {
        // ????
      }
    };

    $scope.remove_tracker = function (tracker) {
      // remove the tracker from array immediately
      for (var i = 0; i < $scope.usedTrackers.length; i++) {
        if ($scope.usedTrackers[i].id === tracker.id) {
          $scope.usedTrackers.splice(i, 1);
          break;
        }
      }
      // actually remove the project!
      $api.team_tracker_remove(team.slug, tracker.id).then(function (updated_team) {
        $scope.setRelatedTrackers(updated_team);
      });

      //also remove as owner if you remove tracker from used-projects
      if (tracker.owner && tracker.owner.id === team.id) {
        $scope.unclaim_tracker(tracker);
      }
    };

    $scope.own_project = function (project_search) {
      if (typeof(project_search) === "number") {
        $api.claim_tracker(project_search, team.id, "Team").then(function (updated_team) {
          $scope.setRelatedTrackers(updated_team);
        });
      } else if (project_search && project_search.length > 0) {
        // ????
      }
    };

    $scope.unclaim_tracker = function (tracker) {
      // remove the tracker from array immediately
      for (var i = 0; i < $scope.ownedTrackers.length; i++) {
        if ($scope.ownedTrackers[i].id === tracker.id) {
          $scope.ownedTrackers.splice(i, 1);
          break;
        }
      }

      tracker.owner = null;
      $api.unclaim_tracker(tracker.id, team.id, "Team").then(function (updated_team) {
        $scope.set_team(updated_team);
        $scope.setRelatedTrackers(updated_team);
      });
    };

    $scope.trackerOwner = function () {
      var compare_team = team;
      return function (input) {
        return input.owner && input.owner.id === compare_team.id ? true : false;
      };
    };

    $scope.trackerUsed = function() {
      return function(tracker) {
        return !tracker.$owned;
      };
    };

    return team;
  });
});
