//Made by Henry Kaufman
var app = angular.module('platfone-lite', ['ngRoute', 'firebase']);

//The Firebase URL set as a Constant
app.constant('fbURL', 'https://platfonechat.firebaseio.com/');

//The Firebase URL set as a Constant
app.constant('fbURLPosts', 'https://platfonechat.firebaseio.com/posts/');

app.service('MyService', function(){
   this.sayHello = function(){
     console.log('hello JJ');
   };
});


//Creating a factory so we can use the Firebase URL
app.factory('Posts', function ($firebase, fbURL, fbURLPosts) {
    return $firebase(new Firebase(fbURLPosts)).$asArray();
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
            templateUrl: 'posting.html'
        })
        .when('/main',{
          controller: 'MainController',
          templateUrl: 'main.html'
        })
        .when('/tag/:tagName', {
            controller: 'MainController',
            templateUrl: 'posting.html'
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
app.controller('MainController', function ($scope, $firebase, Auth, $routeParams, Posts, $window, MyService) {

   // console.log('$routeParams.tagName=', $routeParams.tagName, ' $scope.defaultTag=', $scope.defaultTag);
    
    MyService.sayHello();
    
    $scope.auth = Auth;
    console.log(' $scope.myUser=',  $scope.myUser);
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
        if ( $scope.authData.provider === 'twitter'){
            $scope.oAuthDataType = $scope.authData.twitter;
        } else {
            $scope.oAuthDataType = $scope.authData.facebook;
        }

        $scope.myUser.userName = (!$scope.oAuthDataType.username) ? '' : $scope.oAuthDataType.username;
        $scope.myUser.profileImageURL = $scope.oAuthDataType.profileImageURL;
        $scope.myUser.displayName = $scope.oAuthDataType.displayName;
        $scope.myUser.loginType = $scope.authData.provider;
        $scope.myUser.isAuthenticated = true;
        
        $scope.$watch('myUser', function(newVal, oldVal){
           // $scope.$apply();
        });
        //$scope.$digest();
      }
    });

    //Set the posts we get to a global variable that can be used
    $scope.posts = Posts;

    //Adding a vote
    $scope.addVote = function (post) {
      // if login
      if ($scope.authData) {
        //if not vote yet.
        post.votes++;
        Posts.$save(post);
      }

    }

    //Deleting a post
    $scope.deletePost = function (post) {
        //Getting the right URL
        var postForDeletion = new Firebase('https://platfonechat.firebaseio.com/' + post.$id);
        //Removing it from Firebase
        postForDeletion.remove();
    };

    $scope.addComment = function (post, comment) {
        if ($scope.authData) {
            var ref = new Firebase('https://platfonechat.firebaseio.com/' + post.$id + '/comments');
            var sync = $firebase(ref);
            $scope.comments = sync.$asArray();
            $scope.comments.$add({
                user: $scope.authData.twitter.username,
                text: comment.text
            });
        } else {
            alert('You need to be logged in before doing that!')
        }

        comment.text = "";
    };

    $scope.removeComment = function(post, comment) {
        var commentForDeletion = new Firebase('https://platfonechat.firebaseio.com/' + post.$id + '/comments/' + comment.$id);
        commentForDeletion.remove();
    };


    $scope.logout = function (){
        $scope.myUser = null;
        delete $scope.myUser;
        $scope.auth.$unauth()
        $window.location.reload();
        
    }

    //Logging the user in
    $scope.login = function (loginType) {
        //Creating a refrence URL with Firebase
        var ref = new Firebase('https://platfonechat.firebaseio.com/');

        //Doing the OAuth popup
        ref.authWithOAuthPopup(loginType, function (error, authData) {
            //If there is an error
            if (error) {
                alert('Sorry bro, there was an error.');
            }
            //If the user is logged in correctly
            else {
                $scope.loginType = loginType;
                //console.log('authData=', authData);

                //Set the authData we get to a global variable that can be used
                $scope.authData = authData;

                if ( loginType === 'twitter' ){
                    $scope.oAuthDataType = authData.twitter;
                }
                else {
                    $scope.oAuthDataType = authData.facebook;
                }

                $scope.myUser.userName = (!$scope.oAuthDataType.username) ? '' : $scope.oAuthDataType.username;
                $scope.myUser.profileImageURL = $scope.oAuthDataType.profileImageURL;
                $scope.myUser.displayName = $scope.oAuthDataType.displayName;
                $scope.myUser.loginType = $scope.authData.provider;
                $scope.myUser.isAuthenticated = true;

                console.log('$scope.authData=', $scope.authData);
                console.log('$scope.myUser=', $scope.myUser);

                $scope.$apply();
            }
            //console.log('$scope.myUsername=', $scope.myUsername);
        });
    }
});
