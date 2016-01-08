app.directive('tagManager', function() {
    return {
        restrict: 'E',
        scope: { myTags: '=' },
        template:
            '<div class="tags">' +
                '<a ng-repeat="(idx, tag) in myTags" class="tag" ng-click="remove(idx)">{{tag.value}}</a>' +
            '</div>' +
            '<div class="input-group">' +
            '<input id="myTagInput" type="text" class="form-control" placeholder="Add a tag..." ng-model="new_value"></input> ' +
            '<span class="input-group-addon btn btn-success" ng-click="add()">Add</span>' +
            '</div>',
        link: function ( scope, $element ) {
            // FIXME: this is lazy and error-prone
            // var input = angular.element( $element.children()[1] );
            var input = angular.element(window.document.querySelector('#myTagInput'))

            // This adds the new tag to the tags array
            scope.add = function() {
                console.log('inputNew=', input);
                console.log('$scope.new_value=', scope.new_value);
                console.log('scope=', scope, '  scope.myTags=', scope.myTags);
                if(!scope.new_value) scope.new_value = "";

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
