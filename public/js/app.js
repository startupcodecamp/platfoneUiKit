//Made by Henry Kaufman
var app = angular.module('platfone-lite', ['ngRoute', 'firebase']);

//The Firebase URL set as a Constant
app.constant('fbURL', 'https://platfonechat.firebaseio.com/');

//The Firebase URL set as a Constant
app.constant('fbURLPosts', 'https://platfonechat.firebaseio.com/posts/');
app.constant('fbURLUsers', 'https://platfonechat.firebaseio.com/users/');

app.service('MyService', function(){
   this.sayHello = function(){
     console.log('hello JJ');
   };
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
   // MyService.sayHello();
    
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
      }
    });

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
        var usersRef = new Firebase('https://platfonechat.firebaseio.com/users/')
        //Doing the OAuth popup
        ref.authWithOAuthPopup(loginType, function (error, authData) {
            //If there is an error
            if (error) {
                alert('ooops, problem logging in, there was an error!');
                console.log('login error=', error);
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

                $scope.myUser.userName = (!$scope.oAuthDataType.username) ? '' : $scope.oAuthDataType.username;
                $scope.myUser.profileImageURL = $scope.oAuthDataType.profileImageURL;
                $scope.myUser.displayName = $scope.oAuthDataType.displayName;
                $scope.myUser.loginType = $scope.authData.provider;
                $scope.myUser.isAuthenticated = true;
                $scope.$apply();
                
                // Insert User OAuth info to database after logged in
                usersRef.child(authData.uid).set(
                    {
                        id: $scope.oAuthDataType.id,
                        provider: authData.provider,
                        displayName: $scope.myUser.displayName,
                        loginType: $scope.myUser.loginType,
                        detail: $scope.oAuthDataType.cachedUserProfile
                    }
                , function(error){
                    if (error) 
                        console.log('User didnot get inserted.  Error=', error);
                    else
                        console.log('User added successfully');
                });
            }
            //console.log('$scope.myUsername=', $scope.myUsername);
        });
    }
});
