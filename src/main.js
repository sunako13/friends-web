import "mapbox-gl/dist/mapbox-gl.css"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken = "pk.eyJ1IjoibmFqaW1vdiIsImEiOiJjbWRmazhzdG0wZHVzMmlzOGdrNHFreWV6In0.ENVcoFkxKIqNeCEax2JoFg"

const button = document.querySelector( "button" )

const map = new mapboxgl.Map( {
	container: "map",
	attributionControl: false,
	logoPosition: "bottom-right",
	zoom: 9,
	center: [ 69.2753, 41.3126 ],
	hash: true,
	minZoom: 5,
	maxZoom: 18,
	projection: "mercator",
} )

const state = {
	longitude: null,
	latitude: null,
	id: null,
	tracking: false,
}

const locationInfo = {
	longitude: document.getElementById('longitude'),
	latitude: document.getElementById('latitude'),
	speed: document.getElementById('speed'),
	container: document.getElementById('location-info'),
}

map.on( "load", async () => {

	map.addSource( "me", { type: "geojson", data: null } )
	map.addLayer( {
		id: "me",
		source: "me",
		type: "circle",
		paint: {
			"circle-radius": [
				"interpolate",
				[ "linear" ],
				[ "zoom" ],
				5, 16,
				8, 14,
				11, 12,
				13, 10,
				18, 8,
			],
			"circle-color": "orange",
			"circle-stroke-color": "#ffffff",
			"circle-stroke-width": 4,
			"circle-opacity": 0.75,
		}
	} )
    map.flyTo({
        center: [longitude, latitude],
        speed: 1.5,
        zoom: 15,
      });
      
	//

	button.onclick = () => {

		if (!state.tracking) {
			
			state.tracking = true
			locationInfo.container.style.display = 'block'
			
			state.id = navigator.geolocation.watchPosition( position => {

				const { longitude, latitude, speed } = position.coords

				state.longitude = longitude
				state.latitude = latitude

				const geoJSONPoint = {
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [ longitude, latitude ],
					},
				}

				map.getSource( "me" ).setData( geoJSONPoint )
				
				locationInfo.longitude.textContent = `Lon: ${longitude.toFixed(6)}`
				locationInfo.latitude.textContent = `Lat: ${latitude.toFixed(6)}`
				
				const speedKmh = speed !== null && speed !== undefined ? (speed * 3.6).toFixed(1) : '0'
				locationInfo.speed.textContent = `Speed: ${speedKmh} km/h`

			}, error => {

				console.log( error )
				state.tracking = false
				locationInfo.container.style.display = 'none'
			}, {
				enableHighAccuracy: true,
				timeout: 10_000,
			} )
		} else {
			
			navigator.geolocation.clearWatch( state.id )
			state.tracking = false
			locationInfo.container.style.display = 'none'
		}
	}
} )