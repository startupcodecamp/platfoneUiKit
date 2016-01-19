app.directive('postListing', function(){
  return {
    restrict: 'E',
    scope: {
      filter: '='
    },
    templateUrl: 'directives/postListing/postListing.html',
    link: function($scope, Posts, $routeParams ){
     console.log('In link');
    }, 
    controller: function($scope, Posts, $routeParams){
      
      $scope.posts = [];
      
      if ($routeParams.topicName){
        var postsRef = new Firebase("https://platfonechat.firebaseio.com/posts");
        var topicRef = new Firebase("https://platfonechat.firebaseio.com/topics");
        var topicPostsRef = topicRef.child($routeParams.topicName).child("posts");
        
        topicPostsRef.on("child_added", function(snap) {
          postsRef.child(snap.key()).once("value", function(mySnap) {
            // Render the comment on the link page.
            console.log('mySnap=', mySnap.val());
            $scope.posts.push(mySnap.val());
            
            // // prevent scope digest in progress issue
            // var phase = $scope.$root.$$phase;
            // if(!(phase == '$apply') && !(phase == '$digest')) {
            $scope.$apply();
            // }
          });
        });
      } else {
        $scope.posts = Posts;
      }
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
    }
  }
});