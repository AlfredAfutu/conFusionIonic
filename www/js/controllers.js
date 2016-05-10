'use strict';

angular.module('conFusion.controllers', [])

        .controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopover, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker){

            
            //form data for the login modal
            $scope.loginData = $localStorage.getObject('userInfo', '{}'); //object to hold login data
            $scope.reservation = {}; //object to hold reservation details
            $scope.registration = {}; //object to hold registration details

            $ionicModal.fromTemplateUrl('templates/login.html', {
              scope: $scope
            }).then(function(modal){
              $scope.modal = modal;
            });

            $scope.closeLogin = function(){
              $scope.modal.hide();
            };

            $scope.login = function(){
              $scope.modal.show();
            };

            $scope.doLogin = function(){
              console.log("Doing login", $scope.loginData);
            
              //store user info
              $localStorage.storeObject('userInfo', $scope.loginData);

              $timeout(function(){
                 $scope.closeLogin();
              }, 1000);
            };

            $ionicModal.fromTemplateUrl('templates/reserve.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal){
                $scope.reservationModal = modal;
            });

            $scope.closeReserve = function(){
                $scope.reservationModal.hide();
            };

            $scope.reserve = function(){
                $scope.reservationModal.show();
            };

            $scope.doReserve = function(){
                console.log("Reservation: ", $scope.reservation);

                $timeout(function(){
                  $scope.closeReserve();
                }, 2000);

            };

            $ionicModal.fromTemplateUrl('templates/register.html', {
                scope: $scope
            }).then(function(modal){
                $scope.registrationModal = modal;
            });

            //close register modal
            $scope.closeRegister = function(){
                $scope.registrationModal.hide();
            };

            //show register modal
            $scope.register = function(){
                $scope.registrationModal.show();
            };

            //do user registration
            $scope.doRegistration = function(){
                console.log('Doing reservation', $scope.reservation);

                // Simulate a registration delay. Remove this and replace with your registration
                // code if using a registration system
                $timeout(function () {
                   $scope.closeRegister();
                }, 1000);
            };

           $ionicPlatform.ready(function(){
                //options for take picture
                var options = {
                    quality: 80,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 100,
                    targetHeight: 100,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: true,
                    correctOrientation: true
                };

                var galleryOptions = {
                    maximumImagesCount: 1,
                    width: 800,
                    height: 800,
                    quality: 80
                };
                
                //calls device camera to take picture
                $scope.takePicture = function(){
                    $cordovaCamera.getPicture(options)
                    .then(function(imageData){
                        $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
                    }, function(error){
                        //handle error here
                    });

                    $scope.registrationModal.show();
                };

                $scope.chooseFromGallery = function(){
                    $cordovaImagePicker.getPictures(galleryOptions)
                    .then(function(photos){
                        if(photos.length > 0){
                            $scope.registration.imgSrc = "data:image/jpeg;base64," + photos[0];                          
                        }
                    }, function(error){
                        //handle error
                    });
                };
                
            });



           

        })

        .controller('MenuController', ['$scope', 'menuFactory', 'dishes', 'baseURL', '$ionicListDelegate', 
            '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', 'favouriteFactory', 
            function($scope, menuFactory, dishes, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast, favouriteFactory) {
            

            $scope.baseURL = baseURL;
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showMenu = false;
            $scope.message = "Loading ...";
            $scope.dishes = dishes;
                        
            $scope.select = function(setTab) {
                $scope.tab = setTab;
                
                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                }
                else if (setTab === 3) {
                    $scope.filtText = "mains";
                }
                else if (setTab === 4) {
                    $scope.filtText = "dessert";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
    
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };

            $scope.addFavourite = function(index){
               favouriteFactory.addToFavourites(index);
               $ionicListDelegate.closeOptionButtons();

               $ionicPlatform.ready(function(){
                 $cordovaLocalNotification.schedule({
                    id: 1,
                    title: 'Added Favourite',
                    text: 'Added ' + $scope.dishes[index].name + ' to favourites'
                 }).then(function(result){

                 }, function(error){

                 });

                 $cordovaToast.show('Added ' + $scope.dishes[index].name, 'long', 'center')
                 .then(function(success){

                 }, function(error){

                 });
               });

            };
        }])

        .controller('ContactController', ['$scope', function($scope) {

            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
            
            var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];
            
            $scope.channels = channels;
            $scope.invalidChannelSelection = false;
                        
        }])

        .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {
            
            $scope.sendFeedback = function() {
                
                console.log($scope.feedback);
                
                if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                    $scope.invalidChannelSelection = true;
                    console.log('incorrect');
                }
                else {
                    $scope.invalidChannelSelection = false;
                    feedbackFactory.save($scope.feedback);
                    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
                    $scope.feedback.mychannel="";
                    $scope.feedbackForm.$setPristine();
                    console.log($scope.feedback);
                }
            };
        }])

        .controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory', 'dish', 'baseURL', 'favouriteFactory', '$ionicPopover', '$ionicModal',
         '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
            function($scope, $stateParams, menuFactory, dish, baseURL, favouriteFactory, $ionicPopover, $ionicModal,
                $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
            
            $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
                scope: $scope
            }).then(function(popover){
                $scope.popover = popover;
            });

            $scope.openPopover = function($event){
                $scope.popover.show($event);
            };

            $scope.closePopover = function(){
                $scope.popover.hide();
            };

            //Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.popover.remove();
            });
            // Execute action on hide popover
            $scope.$on('popover.hidden', function() {
            // Execute action
            });
            // Execute action on remove popover
            $scope.$on('popover.removed', function() {
            // Execute action
            });

            $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
                scope: $scope
            }).then(function(modal){
                $scope.commentModal = modal;
            });

            $scope.openCommentModal = function(){
                $scope.commentModal.show();
            };

            $scope.closeCommentModal = function(){
                $scope.commentModal.hide();
            };

            $scope.baseURL = baseURL;
            $scope.dish = {};
            $scope.showDish = false;
            $scope.message="Loading ...";
            
            $scope.dish = dish;

            $scope.addFavourite = function(index){
               favouriteFactory.addToFavourites(index);
               $scope.closePopover();

               $ionicPlatform.ready(function(){
                 $cordovaLocalNotification.schedule({
                    id: 1,
                    title: 'Added Favourite',
                    text: 'Added ' + $scope.dish.name + ' to favourites'
                 }).then(function(result){

                 }, function(error){

                 });

                 $cordovaToast.show('Added ' + $scope.dish.name, 'long', 'bottom')
                 .then(function(success){

                 }, function(error){

                 });
               });
            };

            
        }])

        .controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {
            
            $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            
            $scope.submitComment = function () {

                
                $scope.mycomment.date = new Date().toISOString();
                console.log($scope.mycomment);
                
                $scope.dish.comments.push($scope.mycomment);
        menuFactory.getDishes().update({id:$scope.dish.id},$scope.dish);
                
                $scope.commentForm.$setPristine();
                
                $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            }
        }])

        // implement the IndexController and About Controller here

        .controller('IndexController', ['$scope', 'menuFactory', 'promotionFactory', 'corporateFactory', 'dish', 'leader', 'promotion', 'baseURL', function($scope, menuFactory, promotionFactory, corporateFactory, dish, leader, promotion, baseURL) {
                               
                        $scope.baseURL = baseURL;                
                        $scope.leader = leader;
                        $scope.showDish = false;
                        $scope.message="Loading ...";
                        $scope.dish = dish;
                        $scope.promotion = promotion;
            
                    }])

        .controller('AboutController', ['$scope', 'corporateFactory', 'leaders', 'baseURL', function($scope, corporateFactory, leaders, baseURL) {
            
                    $scope.baseURL = baseURL; 
                    $scope.leaders = leaders;
                    console.log($scope.leaders);
            
                    }])

        .controller('FavouritesController', ['$scope', 'dishes', 'favourites', 'menuFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup',
            '$ionicLoading', '$timeout', 'favouriteFactory', '$ionicPlatform', '$cordovaVibration',
            function($scope, dishes, favourites, menuFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading,
                $timeout, favouriteFactory, $ionicPlatform, $cordovaVibration){
            
            $scope.baseURL = baseURL;
            $scope.shouldShowDelete = false;

           /* $ionicLoading.show({
                template: '<ion-spinner></ion-spinner> Loading...'
            });*/

            $scope.favourites = favourites;

            $scope.dishes = dishes;

            $scope.deleteFavourite = function(index){
                var confirmPopup = $ionicPopup.confirm({
                    title: "Confirm Delete",
                    template: "Are you sure you want to delete this item?"
                });

                confirmPopup.then(function(response){
                    if(response){
                        favouriteFactory.deleteFromFavourites(index);
                        $ionicPlatform.ready(function(){
                            $cordovaVibration.vibrate(100);
                        });
                    }else{
                       console.log("Do not delete");
                    }
                });

                $scope.shouldShowDelete = false;

            }


            $scope.toggleDelete = function(){
                $scope.shouldShowDelete = !$scope.shouldShowDelete;
            };


        }])

        .filter('favouriteFilter', ['$localStorage', function($localStorage){
            var getFavourites = $localStorage.getFavouritesObject("favourites", '[]')

            return function(dishes, getFavourites){
                console.log("Get favourites", getFavourites);
                var fav = [];

                for(var i = 0; i < getFavourites.length; i++){
                    for(var j = 0; j < dishes.length; j++){
                        if(dishes[j].id == getFavourites[i].id){
                            fav.push(dishes[j]);
                        }
                    }
                }
                console.log("Filtered fav", fav);
                return fav;
            };
        }])

;
