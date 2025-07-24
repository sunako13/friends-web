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
    let isDrawing = false;
let drawMode = ""; // "line" yoki "polygon"
let points = [];
let previewId = "preview-line";
let finalId = "final-draw";

// Line chizish tugmasi
document.getElementById("drawLineBtn").onclick = () => {
	drawMode = "line";
	startDrawing();
};

// Polygon chizish tugmasi
document.getElementById("drawPolygonBtn").onclick = () => {
	drawMode = "polygon";
	startDrawing();
};

// Chizishni boshlash
function startDrawing() {
	isDrawing = true;
	points = [];

	if (map.getLayer(previewId)) map.removeLayer(previewId);
	if (map.getSource(previewId)) map.removeSource(previewId);

	// Kursorni o‘zgartirish
	map.getCanvas().style.cursor = "crosshair";
}

// Xaritani bosganda nuqtalarni to‘plash
map.on("click", (e) => {
	if (!isDrawing) return;

	const { lng, lat } = e.lngLat;
	points.push([lng, lat]);
});

// Sichqoncha harakatida preview ko‘rsatish
map.on("mousemove", (e) => {
	if (!isDrawing || points.length === 0) return;

	const dynamicPoints = [...points, [e.lngLat.lng, e.lngLat.lat]];

	let geometryType = drawMode === "polygon" ? "Polygon" : "LineString";
	let coords = drawMode === "polygon" ? [[...dynamicPoints, dynamicPoints[0]]] : dynamicPoints;

	const previewFeature = {
		type: "Feature",
		geometry: {
			type: geometryType,
			coordinates: coords
		}
	};

	if (map.getSource(previewId)) {
		map.getSource(previewId).setData(previewFeature);
	} else {
		map.addSource(previewId, {
			type: "geojson",
			data: previewFeature
		});

		map.addLayer({
			id: previewId,
			type: drawMode === "polygon" ? "fill" : "line",
			source: previewId,
			paint: drawMode === "polygon" ? {
				"fill-color": "#00ffff",
				"fill-opacity": 0.4
			} : {
				"line-color": "blue",
				"line-dasharray": [2, 2],
				"line-width": 2
			}
		});
	}
});

// Enter tugmasi bosilganda yakunlash
document.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && isDrawing && points.length > 1) {
		isDrawing = false;
		map.getCanvas().style.cursor = "";

		let geometryType = drawMode === "polygon" ? "Polygon" : "LineString";
		let coords = drawMode === "polygon" ? [[...points, points[0]]] : points;

		const finalFeature = {
			type: "Feature",
			geometry: {
				type: geometryType,
				coordinates: coords
			}
		};

		const sourceId = finalId + "-" + Date.now(); // unik nom

		map.addSource(sourceId, {
			type: "geojson",
			data: finalFeature
		});

		map.addLayer({
			id: sourceId,
			type: drawMode === "polygon" ? "fill" : "line",
			source: sourceId,
			paint: drawMode === "polygon" ? {
				"fill-color": "red",
				"fill-opacity": 0.5
			} : {
				"line-color": "black",
				"line-width": 3
			}
		});

		// Preview chizig‘ini o‘chirish
		if (map.getLayer(previewId)) map.removeLayer(previewId);
		if (map.getSource(previewId)) map.removeSource(previewId);

		points = [];
	}
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

                map.flyTo({
                    center: [longitude, latitude],
                    speed: 1.5,
                    zoom: 15,
                  });
                  
				
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