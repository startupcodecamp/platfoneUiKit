//Made by Henry Kaufman
var app = angular.module('reddit-clone', ['ngRoute', 'firebase']);

//The Firebase URL set as a Constant
app.constant('fbURL', 'https://platfonechat.firebaseio.com/');

//Creating a factory so we can use the Firebase URL
app.factory('Posts', function ($firebase, fbURL) {
    return $firebase(new Firebase(fbURL)).$asArray();
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
app.controller('MainController', function ($scope, $firebase, Auth, Posts, $window) {

    $scope.auth = Auth;

    // any time auth status updates, add the user data to scope
    $scope.auth.$onAuth(function(authData) {
      $scope.authData = authData;
      
      if ($scope.authData){
        if ( $scope.authData.provider === 'twitter'){
            $scope.oAuthDataType = $scope.authData.twitter;
        } else {
            $scope.oAuthDataType = $scope.authData.facebook;
        }
        
        $scope.myUser = {
            isAuthenticated : true  
        };
        console.log('$scope.authData=', $scope.authData);
        console.log('$scope.oAuthDataType=', $scope.oAuthDataType);
        $scope.myUsername = $scope.oAuthDataType.username;
        $scope.profileImageUrl = $scope.oAuthDataType.profileImageURL;
        $scope.displayName = $scope.oAuthDataType.displayName;
        $scope.loginType = $scope.authData.provider;
      }
    });

    
    //Set the posts we get to a global variable that can be used
    $scope.posts = Posts;
   
    console.log('$scope.posts=', $scope.posts);
    if ( !$scope.myUsername ) $scope.myUsername = '';
    
    $scope.tags = [];
    
    $scope.profileImageUrl = (!$scope.oAuthDataType) ? 'images/withoutLogin.png' : $scope.oAuthDataType.profileImageURL;
    
    console.log('$scope.profileImageUrl=', $scope.profileImageUrl);
    
    
    if (!$scope.myUser) {
        $scope.myUser = {
            isAuthenticated : false  
        };
    }    

    //The function that runs when the user saves a post
    $scope.savePost = function (post) {
        if (post.description && post.title && $scope.authData) {

            // var tagObj = post.tags.reduce(function(o, v, i) {
            //       o[i] = v;
            //       return o;
            //     }, {});
            //Actually adding the posts to the Firebase
            Posts.$add({
                author: $scope.displayName,
                title: post.title,
                description: post.description,
                //Setting the post votes
                votes: 0,
                //tags: tagObj,
                //Getting the current user
                user: $scope.myUsername,
                loginType: $scope.loginType
            });

            //Resetting all the values
            post.name = "";
            post.description = "";
            post.url = "";
            post.title = "";
            post.author = "";
            //post.tags.length = 0;   // clears array more efficient

        } else {
            //An alert to tell the user to log in or put something in all the fields
            alert('Sorry bro, you need all of those inputs to be filled or you need to be logged in!')
        }
    }

    //Adding a vote
    $scope.addVote = function (post) {
        //Increment the number
        post.votes++;
        //Save to the Firebase
        Posts.$save(post);
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
                console.log('authData=', authData);

                //Set the authData we get to a global variable that can be used
                $scope.authData = authData;
                
                if ( loginType === 'twitter' ){
                    $scope.oAuthDataType = authData.twitter;
                }
                else {
                    $scope.oAuthDataType = authData.facebook;
                }
                
                $scope.myUsername = $scope.oAuthDataType.username;
                $scope.profileImageUrl = $scope.oAuthDataType.profileImageURL;
                $scope.displayName = $scope.oAuthDataType.displayName;
                
                $scope.myUser.isAuthenticated = true;
                
                console.log('$scope.authData=', $scope.authData);
                console.log('$scope.myUser=', $scope.myUser);
                
                $scope.$apply();
            }
            //console.log('$scope.myUsername=', $scope.myUsername);
        });
    }
});