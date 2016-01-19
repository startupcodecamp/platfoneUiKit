app.directive('tagManager', function() {
    return {
        restrict: 'E',
        scope: { myTags: '=' },
        templateUrl: 'directives/tagManager/tagManager.html',
        link: function ( scope, $element ) {
            // FIXME: this is lazy and error-prone
            // var input = angular.element( $element.children()[1] );
            var input = angular.element(window.document.querySelector('#myTagInput'))

            // This adds the new tag to the tags array
            scope.add = function() {
                if(!scope.new_value) scope.new_value = "";

                console.log('scope.new_value=', scope.new_value);
                if (scope.new_value.trim().length === 0) {
                    alert('please enter a non-empty string');
                } else {
                    scope.myTags.push({value: scope.new_value });
                }
                scope.new_value = "";
            };

            // This is the ng-click handler to remove an item
            scope.remove = function ( idx ) {
                scope.myTags.splice( idx, 1 );
            };

        }
    };
});
