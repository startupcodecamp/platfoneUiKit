app.directive('topHeader', function(){
  return {
    restrict: 'E',
    scope: {
      myUser:'=',
      auth: '='
    },
    templateUrl: 'directives/topHeader/topHeader.html',
    controller: function($scope, $window){
      $scope.addTopic = function (topic) {
        // prefer to use sweetalert
        swal({
          title: "Create a Topic",
          text: 'Write something interesting:',
          type: 'input',
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top"
        }, function(inputValue){
          console.log("You wrote", inputValue);
        });
      }
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
        else {
          $scope.loginType = loginType;
          console.log('authData=', authData);

          //Set the authData we get to a global variable that can be used
          $scope.authData = authData;
          $scope.oAuthDataType = authData[authData.provider];

          $scope.myUser.userName = (!$scope.oAuthDataType.username) ? '' : $scope.oAuthDataType.username;
          $scope.myUser.profileImageURL = $scope.oAuthDataType.profileImageURL;
          $scope.myUser.displayName = $scope.oAuthDataType.displayName;
          $scope.myUser.loginType = $scope.authData.provider;
          $scope.myUser.isAuthenticated = true;
          $scope.$apply();

          console.log('$scope.authData.[$scope.authData.provider]=',  $scope.authData[$scope.authData.provider] );

          // Insert User OAuth info to database after logged in
          usersRef.child(authData.uid).set({
                id: $scope.oAuthDataType.id,
                provider: authData.provider,
                displayName: $scope.myUser.displayName,
                loginType: $scope.myUser.loginType,
                detail: $scope.oAuthDataType.cachedUserProfile
              }, function(error){
                if (error)
                  console.log('User didnot get inserted.  Error=', error);
                else
                  console.log('User added successfully');
              });
          }
        });
      }

      $scope.logout = function (){
          $scope.myUser = null;
          delete $scope.myUser;
          $scope.auth.$unauth()
          $window.location.reload();
      }
    }
  }

});
