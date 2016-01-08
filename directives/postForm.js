app.directive('postForm', function(){
    return {
        restrict: 'E',
        scope: {
            oauthType: '='
        },
        templateUrl: '/partials/postFormNew.html',
        controller: function($scope, Posts){
            $scope.tags = [];
            $scope.posts = Posts;
             //The function that runs when the user saves a post
            $scope.savePost = function (post) {
                if (post.description && post.title && $scope.oauthType) {
                    console.log('post.tags=', $scope.tags);
                    // var tagObj = post.tags.reduce(function(o, v, i) {
                    //       o[i] = v;
                    //       return o;
                    //     }, {});
                    //Actually adding the posts to the Firebase
                    Posts.$add({
                        author: $scope.oauthType.displayName,
                        title: post.title,
                        description: post.description,
                        profileImageUrl: $scope.oauthType.profileImageURL,
                        //Setting the post votes
                        votes: 0,
                        tags: $scope.tags,
                        //Getting the current user
                        user: (!$scope.oauthType.username) ? '' : $scope.oauthType.username ,
                        //loginType: $scope.oauthType.loginType
                    });

                    //Resetting all the values
                    post.name = "";
                    post.description = "";
                    post.url = "";
                    post.title = "";
                    post.author = "";
                    $scope.tags.length = 0;   // clears array more efficient

                } else {
                    //An alert to tell the user to log in or put something in all the fields
                    alert('Sorry bro, you need all of those inputs to be filled or you need to be logged in!')
                }
            }
        }
    }
});