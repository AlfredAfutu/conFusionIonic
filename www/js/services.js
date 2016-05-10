'use strict';

angular.module('conFusion.services', ['ngResource'])
        .constant("baseURL","http://192.168.43.115:3000/")
        //.constant("baseURL", "http://localhost:3000/")
        .factory('menuFactory', ['$resource', 'baseURL', function($resource,baseURL) {       
                    
            return $resource(baseURL+"dishes/:id",null,  {'update':{method:'PUT' }});
                        
        }])

        .factory('promotionFactory', ['$resource', 'baseURL', function($resource, baseURL){

            return $resource(baseURL+"promotions/:id");
        }])

        .factory('corporateFactory', ['$resource', 'baseURL', function($resource,baseURL) {
    
    
            return $resource(baseURL+"leadership/:id");
    
        }])

        .factory('feedbackFactory', ['$resource', 'baseURL', function($resource,baseURL) {
    
    
            return $resource(baseURL+"feedback/:id");
    
        }])
        .factory('favouriteFactory', ['$resource', '$localStorage', 'baseURL', function($resource, $localStorage, baseURL){

            var favFac = {};
            var favourites = [];

            favFac.addToFavourites = function(index){
               
              for(var i = 0; i < favourites.length; i++){
                if(favourites[i].id == index){
                  return;
                }
              }
              var favourite = {id: index};
              console.log("Favourites", typeof favourites);
              favourites.push({id: index}); 
              $localStorage.storeFavouritesObject("favourites", favourite);

            };

            favFac.getAllFavourites = function(){
              //$localStorage.removeItem("favourites");
              favourites = $localStorage.getFavouritesObject("favourites", '[]');
              console.log("Get all fav", favourites);
              return favourites;
            };

            favFac.deleteFromFavourites = function(index){
               
                for(var i = 0; i < favourites.length; i++){
                  if(favourites[i].id == index){
                    favourites.splice(i, 1);
                    console.log("Updated Favourites", favourites);

                    $localStorage.deleteFavouriteFromFavouritesObject("favourites", index, '[]');
                    console.log("Updated Favourites Storage", $localStorage.getFavouritesObject("favourites", '[]'));
                  }
                }
                
            };

            
            return favFac;
        }])

        .factory('$localStorage', ['$window', function($window){
          
          return {
            removeItem: function(key){
              $window.localStorage.removeItem(key);
            },
            store: function(key, value){
              $window.localStorage[key] = value;
            },
            get: function(key, defaultValue){
              return $window.localStorage[key] || defaultValue;
            },
            storeObject: function(key, value){
              $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key, defaultValue){
              return JSON.parse($window.localStorage[key] || defaultValue);
            },
            storeFavouritesObject: function(key, value){
              var favouriteObject = value;
              var existingObject = JSON.parse($window.localStorage[key] || '[]');
              existingObject.push(favouriteObject);
              $window.localStorage[key] = JSON.stringify(existingObject);
            },
            getFavouritesObject: function(key, defaultValue){
              return JSON.parse($window.localStorage[key] || defaultValue);
            },
            deleteFavouriteFromFavouritesObject: function(key, index, defaultValue){
              var favourites = JSON.parse($window.localStorage[key] || defaultValue);

              if(favourites.length > 0){
                for(var i = 0; i < favourites.length; i++){
                  if(favourites[i].id == index){
                    favourites.splice(i, 1);
                  } 
                }
                $window.localStorage[key] = JSON.stringify(favourites);
              }
            }
          };
        }])

;
