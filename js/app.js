//global variables
var map;
var openInfoWindow = null;
var prevMarker = null;

//Google Error message when API call has an error
GoogleError = function() {
  alert('Google is currently out to lunch. There was an error occured with the Google Maps. Please try again later.');
};
//Create info window and markers. Integrate 4Square and handle marker animations
var Location = function(attributes) {
    var self = this;

    self.name = attributes.name;
    self.searchName = attributes.name.toLowerCase();  
    //build our Foursquare Endpoint
    var url = 'https://api.foursquare.com/v2/venues/search?' +
              'client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET 
              + '&ll=' + attributes.lat + ',' + attributes.long + '&query=' + attributes.name +
              '&v=20180828';
    //Pull Foursquare data via API endpoint passtrhough with attributes
    $.getJSON(url).done(function(data) {
        var venue = data.response.venues[0];
        self.venueID = venue.id;
        self.fsName = venue.name;
        self.street = venue.location.formattedAddress[0] ? venue.location.formattedAddress[0]: 'N/A';
        self.city = venue.location.formattedAddress[1] ? venue.location.formattedAddress[1]: 'N/A';
        self.category = venue.categories[0].shortName ? venue.categories[0].shortName : 'N/A';
        
      //foursquare error handling
      }).fail(function() {
        alert('We are missing one square. Please try again later as we may have found the fourth square. API ERROR');
      });
    //marker location
    self.marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(attributes.lat, attributes.long),
        name: self.name
      });
      //creates what occurs when the marker is clicked
      self.marker.addListener('click', function() {
        //cancels prev marker bounce when a new marker is selected
        var cancelAnimation = function() {
          prevMarker.setAnimation(null);
          prevMarker = null;
        };
    
        if (prevMarker) {
          cancelAnimation();
        }
        // close opened infoWindow
        if (openInfoWindow) {
          openInfoWindow.close();
        }
        //build what appears in the infoWindow box when marker is clicked
        var infoWindowContentData = [
          '<div class="info-window">',
            '<h4>',  self.fsName, '</h4>',
            '<p>', self.street, '</p>',
            '<p>', self.city, '</p>',
            '<p>','Category: ', self.category, '</p>',
            '<p>', 'Venue ID: ', self.venueID, '</p>',
          '</div>'
        ];
        var infoWindow = new google.maps.InfoWindow({ content: infoWindowContentData.join('') });
        openInfoWindow = infoWindow;
    
        infoWindow.open(map, self.marker);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        prevMarker = self.marker;
        
        google.maps.event.addListener(infoWindow, 'closeclick', cancelAnimation);
      });
    
      self.selectLocation = function() {
        google.maps.event.trigger(self.marker, 'click');
      };
    
    };
    //View Model
    var ViewModel = function() {
        var self = this;

        self.searchText = ko.observable('');
        self.locationsList = ko.observableArray();
        //Initialize Google Map
        map = new google.maps.Map(document.getElementById('mapGoogle'), {
          center: { lat: 33.848595, lng: -84.365331},
          zoom: 15,
          styles: styles,
          mapTypeControl: false
        });
        //List Build from Locations.js
        initialLocations.forEach(function(item) {
            var location = new Location(item);
            self.locationsList.push(location);
          });
          //Building Search Filter List
          self.filteredList = ko.computed(function() {
            return self.locationsList().filter(function(location) {
              var isMatched = location.searchName.indexOf(this.searchText().toLowerCase()) !== -1;
              location.marker.setVisible(isMatched);
        
              return isMatched;
            }, this);
          }, this);
        };
        
        function init() {
          ko.applyBindings(new ViewModel());
        }
    