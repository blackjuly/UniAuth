define(['../../utils/constant'], function (constant) {
    /**
     * A module representing a User controller.
     * @exports controllers/User
     */
    var Controller = function ($scope, $rootScope, $state, GroupService) {

        $scope.treedata = GroupService.tree;
        //Used to record whether the current operation is moving
        $rootScope.onMove = false;
        //Used to record the move group operation's 'from' group and 'to' group
        $rootScope.moveGroup = {};
        //Used to record the move group user operation's 'user' and 'group'
        $rootScope.moveUser = {};

        $scope.opts = {
            isLeaf: function(node) {
                var isLeaf = node.type !== constant.treeNodeType.group;
                return isLeaf;
            },
            injectClasses : {
                labelUnselectable : "disabled-line-through"
            },
            isSelectable: function(node) {
                if (node.isRootGrp) {
                    // root group is unmodifiable
                    return false;
                } else {
                    return true;
                }
            },
            equality: function(node1, node2) {
                if(node1 && node2) {
                    return node1.id == node2.id && node1.type == node2.type;
                } else {
                    return false;
                }
            }
        };

        $scope.selected = $rootScope.shareGroup.selected;

        $scope.predicate = '';
        $scope.comparator = false;

        $scope.showSelected = function(node, selected) {
            if(selected) {
                $scope.selected = node;
                $rootScope.shareGroup.selected = $scope.selected;
                // if user is modifying the group, load the group's description
                if($rootScope.$state.current.name.search("group\.this\-modify || group\.this\-move") >= 0) {
                    GroupService.getGrpDetails({
                        id: $rootScope.shareGroup.selected.id
                    }, function (result) {
                        $scope.selected = result.data;
                        $rootScope.shareGroup.selected = $scope.selected;

                        //groupMove
                        if($rootScope.moveFLag){
                            $rootScope.shareGroup.from = $scope.selected;
                        }else{
                            $rootScope.shareGroup.to = $scope.selected;
                        }
                        $rootScope.moveFLag = !$rootScope.moveFLag;
                    }, function (err) {
                        console.log(err);
                    });
                }else{
                    $rootScope.shareGroup = {};
                }
            } else {
                $scope.selected = {};
                $rootScope.shareGroup.selected = {};
            }
        };

        // for delete users and delete owners
        $scope.treeOptions = {
            isLeaf: function(node) {
                var isLeaf = node.type !== constant.treeNodeType.group;
                return isLeaf;
            },
            injectClasses : {
                labelUnselectable : "disabled-line-through"
            },
            dirSelectable:false,
            isSelectable: function(node) {
                if(node.type == constant.treeNodeType.group) {
                    return false;
                } else {
                    return true;
                }
            },
            multiSelection: true
        };
        $scope.groupOptions = {
            isLeaf: function(node) {
                var isLeaf = node.type !== constant.treeNodeType.group;
                return isLeaf;
            },
            injectClasses : {
                labelUnselectable : "disabled-line-through"
            },
            dirSelectable:false,
            equality: function(node1, node2) {
                if(node1 && node2) {
                    return node1.id == node2.id && node1.type == node2.type;
                } else {
                    return false;
                }
            }
        };
        $scope.groupUserOptions = {
            isLeaf: function(node) {
                var isLeaf = node.type !== constant.treeNodeType.group;
                return isLeaf;
            },
            injectClasses : {
                labelUnselectable : "disabled-line-through"
            },
            dirSelectable:false,
            multiSelection: true
        };
        //for record the current group
        $scope.toOperateGroup = function(node,event){
            $rootScope.targetGroup = node;
            $rootScope.isTarget = true;
            if($state.includes("group.this")) {
                GroupService.getGrpDetails({
                    id: $rootScope.targetGroup.id
                }, function (result) {
                    $rootScope.targetGroup = result.data;
                }, function (err) {
                    console.log(err);
                });
            }

            event.stopPropagation();
        };
        //for record the current 'from' group and 'to' group that used to move group
        $scope.toMoveGroup = function (node,isTarget,event) {
            if(!isTarget){
                $rootScope.onMove = true;
                $rootScope.moveGroup.from = node;
            }else{
                $rootScope.onMove = false;
                $rootScope.moveGroup.to = node;
            }
            event.stopPropagation();
        };
        //for record the current 'user' and 'group' that used to move group user
        $scope.toMoveUser = function (node,isTarget,event,parent) {
            if(!isTarget){
                $rootScope.onMove = true;
                $rootScope.moveUser.user = node;
                $rootScope.moveUser.user.parent = parent;
            }else{
                $rootScope.onMove = false;
                $rootScope.moveUser.group = node;
            }
            event.stopPropagation();
        };
        $scope.selectedNodes = [];
        $scope.showSelectedNodes = function(node, selected, parent) {
            node.parent = parent;
        };

        $scope.$state = $rootScope.$state;
        $scope.$watch('$state.current.name', function(newValue, oldValue){
            var newAry = newValue.split(".");
            var oldAry = oldValue.split(".");
            if(!(oldAry[0]==newAry[0] && oldAry[1]==newAry[1])){
                $scope.selectedNodes = [];
            }
        });

        //initialize the tree component
        $rootScope.initTree = function(onlyShowGroupType, userGroupType){
            var paramsCtlLevel = {
                onlyShowGroup:onlyShowGroupType,
                userGroupType:userGroupType
            };
            GroupService.syncTree(paramsCtlLevel);
        };
        //for determine the icon button status
        $rootScope.judge = {
            isAlAddGroup:function (node) {
                return $state.current.name.indexOf('group.this')>-1;
            },
            isAlDelGroup:function (node) {
                return !node.isRootGrp && $state.current.name.indexOf('group.this')>-1;
            },
            isAlEditGroup:function (node) {
                return !node.isRootGrp && $state.current.name.indexOf('group.this')>-1;
            },
            isAlMoveGroup:function (node) {
                return !node.isRootGrp && $state.current.name.indexOf('group.this')>-1;
            },
            isAlAddGroupUser:function (node) {
                return node.type==constant.treeNodeType.group && $state.current.name.indexOf('group.user')>-1;
            },
            isAlDelGroupUser:function (node) {
                return node.type==constant.treeNodeType.memberUser && $state.current.name.indexOf('group.user')>-1;
            },
            isAlMoveGroupUser:function (node) {
                return node.type==constant.treeNodeType.memberUser && $state.current.name.indexOf('group.user')>-1;
            },
            isAlAddGroupOwner:function (node) {
                return node.type==constant.treeNodeType.group && $state.current.name.indexOf('group.owner')>-1;
            },
            isAlDelGroupOwner:function (node) {
                return node.type==constant.treeNodeType.ownerUser && $state.current.name.indexOf('group.owner')>-1;
            },
            isAlMoveGroupOwner:function (node) {
                return node.type==constant.treeNodeType.ownerUser && $state.current.name.indexOf('group.owner')>-1;
            }
        };
        //reset the tree component by '$state'
        $rootScope.reset = function (){
            //clear something
            $scope.selectedNodes = [];
            $rootScope.onMove = false;
            $rootScope.targetGroup = {};
            $rootScope.moveGroup = {};
            $rootScope.moveUser = {};

            if ($state.includes("group.this")) {
                $state.go("group.this");
                $rootScope.initTree(true);

            } else if($state.includes("group.user")){
                $state.go("group.user");
                $rootScope.initTree(false, 0);

            } else if($state.includes("group.owner")){
                $state.go("group.owner");
                $rootScope.initTree(false, 1);
            }
        };
        $rootScope.reset();
    };

    return {
        name: "GroupController",
        fn: ["$scope", "$rootScope", "$state", "GroupService", Controller]
    };
});
