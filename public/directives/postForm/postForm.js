app.directive('postForm', function(){
    return {
        restrict: 'E',
        scope: {
            userInfo: '='
        },
        templateUrl: 'directives/postForm/postForm.html',
        controller: function($scope, Posts, $routeParams){
            $scope.tags = [];
            if ($routeParams.tagName){
                $scope.tags.push({value:$routeParams.tagName});    
            } 
             //The function that runs when the user saves a post
            $scope.savePost = function (post) {
                if (post.description && post.title && $scope.userInfo.isAuthenticated) {
                 
                    Posts.$add({
                        author: $scope.userInfo.displayName,
                        title: post.title,
                        description: post.description,
                        profileImageUrl: $scope.userInfo.profileImageURL,
                        votes: 0,
                        tags: $scope.tags,
                        user: $scope.userInfo.userName,
                        timestamp: Firebase.ServerValue.TIMESTAMP
                    });

                    // Resetting all the values
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
