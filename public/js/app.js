//Made by Henry Kaufman
var app = angular.module('platfone-lite', ['ngRoute', 'firebase']);

//The Firebase URL set as a Constant
app.constant('fbURL', 'https://platfonechat.firebaseio.com/');

//The Firebase URL set as a Constant
app.constant('fbURLPosts', 'https://platfonechat.firebaseio.com/posts/');
app.constant('fbURLUsers', 'https://platfonechat.firebaseio.com/users/');
var TOPICS_LOCATION_FIREBS = 'https://platfonechat.firebaseio.com/topics/';


app.service('MyFirebaseHelper', function(){
  // Tests to see if /users/<userId> has any data. 
  this.createTopicIfNotExists = function(topic, newPostId, extraParam) {
    
    var nodeRef = new Firebase(TOPICS_LOCATION_FIREBS);
    nodeRef.child(topic).once('value', function(snapshot) {
      var exists = (snapshot.val() !== null);
      if(!exists){
        var myParam =  { description : 'new topic is ' + topic };
        if ( extraParam ){
          myParam.posts = [];
          myParam.posts[newPostId] = extraParam;
        }

        nodeRef.child(topic).set(myParam, function(error){
          if (error) {
            console.log('error creating a new topic.  err=', error);
          }
        })
      } else {
        // insert postId into topics
        nodeRef.child(topic).child('posts').child(newPostId).push(extraParam);
      }
    });
  }
});


//Creating a factory so we can use the Firebase URL
app.factory('Posts', function ($firebase, fbURL, fbURLPosts) {
    return $firebase(new Firebase(fbURLPosts)).$asArray();
});

//Creating a factory so we can use the Firebase URL
app.factory('Users', function ($firebase, fbURL, fbURLUsers) {
    return $firebase(new Firebase(fbURLUsers)).$asArray();
});


app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase('https://platfonechat.firebaseio.com');
    return $firebaseAuth(ref);
  }
]);


//Configuring the route providers to redirect to the right location
app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MainController',
      templateUrl: 'partials/posting.html'
    })
    .when('/tag/:tagName', {
      controller: 'MainController',
      templateUrl: 'partials/posting.html'
    })
    .when('/topic/:topicName', {
      controller: 'MainController',
      templateUrl: 'partials/posting.html'
    })
    .otherwise({
      redirectTo: '/'
    })
});

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});


//The Main Controller that holds everything
app.controller('MainController', function ($scope, $firebase, Auth, $routeParams, Posts, $window) {
  // console.log('$routeParams.tagName=', $routeParams.tagName, ' $scope.defaultTag=', $scope.defaultTag);
  // MyService.sayHello();
  
  $scope.auth = Auth;
  console.log(' $scope.myUser=',  $scope.myUser);

  // Initialize myUser info 
  if (!$scope.myUser){
    $scope.myUser = {
      isAuthenticated: false,
      userName: '',
      displayName: '',
      loginType: ''
    };
  }
  
  // any time auth status updates, add the user data to scope
  $scope.auth.$onAuth(function(authData) {
    $scope.authData = authData;

    if ($scope.authData){
      $scope.oAuthDataType = authData[authData.provider];

      $scope.myUser.userName = (!$scope.oAuthDataType.username) ? '' : $scope.oAuthDataType.username;
      $scope.myUser.profileImageURL = $scope.oAuthDataType.profileImageURL;
      $scope.myUser.displayName = $scope.oAuthDataType.displayName;
      $scope.myUser.loginType = $scope.authData.provider;
      $scope.myUser.isAuthenticated = true;
    }
  });

});
