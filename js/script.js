function fill(it,ind) {
    var content = '<li class="address">';
    content += '<div class="nom">' + it.Name ;
    content += '<span class="badge badge-pill ' + it.Category.toLowerCase().split(" ")[0] + '">' + it.Category + '</span></div>';
    content += '<div class="where">' + it.Address + '</div>';
    content += '<div class="comment">' + it.Comment_en + '</div></li>';
    return content;
}
function getFilters () {
    var filters = [];
    $('.address').find('.badge').each(function(index,value) {
        filters.push($(this).text());
    });
    return new Set(filters);
}
function updateFiltersOn () {
    var filtersHTML = '';
    // Remove children of the node
    $('#filters').find('.filter').each(function(i,v){
        $(this.remove());
    });
    // Add filters
    filters_on.forEach(function(it,ind) {
        filtersHTML += '<div class="filter badge badge-pill ' + it.toLowerCase().split(" ")[0] + '"><span>' + it + '</span><span class="delete" onclick="deleteFilter(this)">x</span></div>';
    });
    $('#filters').append(filtersHTML);
}
// $('.delete').on('click',function() {
//     $(this).parent().remove();
//     filters_on.delete($(this).siblings('span').text());
//     updateListAddress();
// });
function updateListAddress() {
    $('.address').each(function(index,value) {
        if (!(filters_on.has($(this).find('.badge').text()))) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}
function deleteFilter(element) {
    element.parentElement.remove();
    filters_on.delete(element.previousSibling.textContent);
    updateListAddress();
}
function addListFilter(element) {
    filters_on.add(element.textContent);
    updateFiltersOn();
    updateListAddress();
}
// ====================================
// Add data
// ========
data.Addresses.forEach(function(it,ind) {
    $('#liste').append(fill(it,ind));
});

// Filters
// =======
var filters = getFilters(),
    filters_on = new Set(filters);
updateFiltersOn();

// Delete filter
// Add a filter
$('#addfilter').on('click',function() {
    var view_list_filters = '<ul>';
    filters.forEach(function(it,ind) {
        view_list_filters += '<li class="badge badge-pill addlistfilter ' + it.toLowerCase().split(" ")[0] + '" onclick="addListFilter(this)">' + it + '</li>';
    });
    view_list_filters += '</ul>';
    $('#addfilter').attr('data-content',view_list_filters);
});
$('[data-toggle="popover"]').popover();
$('.addlistfilter').each(function(i,v) {
    console.log($(this).text());
});

// MAP OR LIST
$('#showListe').click(function() {
    $('#map').hide();
    $('#liste').show();
});
$('#showMap').click(function() {
    $('#liste').hide();
    $('#map').show();
});

// MAP
$('#map').width($('content').width());
var hauteur_dispo = $(window).height() - $('hr').last().offset().top;
$('#map').height(hauteur_dispo*0.9);
mapboxgl.accessToken = "pk.eyJ1IjoibG91aXNkZWNoYXJzb24iLCJhIjoiY2lsemFrYmNtMDBoOXc4bTV3M2pybzBmcSJ9.O4wshToxz8yiykD8q_IcQg";
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
    center: [2.3724244,48.8672365,], // starting position [lng, lat]
    zoom: 13 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());
map.on('load',function() {
    map.addLayer({
        "id":"places",
        "type":"symbol",
        "source": {
            "type": "geojson",
            "data": geoJSON
        },
        "layout": {
            "icon-image": "{icon}-15",
            "text-field":"{title}",
            "text-offset": [0, 0.6],
            "text-anchor": "top",
            "icon-allow-overlap": true
        }
    });
});
// When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', 'places', function (e) {
    new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(e.features[0].properties.description)
        .addTo(map);
    var zoom = map.getZoom();
    // var coord =  [e.features[0].geometry.coordinates[0],e.features[0].geometry.coordinates[1]-30/zoom];
    // map.flyTo({center:coord});
});

$('#map').hide();
// data.Addresses.forEach(function(it,ind) {
//     var content = '<tr class="address"><td class="nom">'+ it.Name + '</td>';
//     content += '<td class="Adress">' + it.Address + '</td>'; 
//     content += '</tr>';
//     $('tbody').append(content);
// });
