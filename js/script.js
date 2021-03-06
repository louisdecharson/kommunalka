function fill(it,ind) {
    var content = '<li class="address">',
        categ = it.Category.toLowerCase().split(" ")[0];
    content += '<div class="nom">';
    // switch (categ) {
    // case  'restaurant':
    //     content += '<i class=" fas fa-utensils"></i>'
    //     break;
    // case 'bar':
    //     content += '<i class="fas fa-cocktail"></i>'
    //     break;
    // default:
    //     content += ''
    // }
    content +=  it.Name ;
    content += '<span class="badge badge-pill ' + categ  + '">' + it.Category + '</span>';
    if (!! it.SubCategory) {
        content += '<span class="subcategory">' + it.SubCategory + '</span>';
    }
    if (categ === 'restaurant') {
        for (var i=0;i < it.Price_Range;i++) {
            content += '<i class="fas fa-euro-sign"></i>'
        }
    }
    content += '</div>';
    if (it.Address.substring(0,4) == 'http') {
        content += '<a class="where" href="' + it.Address + '">' + it.Address + '</a>';
    } else {
        content += '<div class="where">' + it.Address + '</div>';
    }
    content += '<div class="comment">' + it.Comment_en + '</div>';
    // Hidden fields for the map
    content += '<div class="coord">' + it.Coord.join() + '</div>';
    content += '<div class="deschtml">' + it.deschtml + '</div>';
    content += '<hr class="address_sep"/>';
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
        // filtersHTML += '<div class="filter badge badge-pill ' + it.toLowerCase().split(" ")[0] + '"><span>' + it + '</span><span class="delete" onclick="deleteFilter(this)">x</span></div>';
        filtersHTML += '<div class="filter badge badge-pill ' + it.toLowerCase().split(" ")[0] + '" onclick="deleteFilter(this)"><span>' + it + '</span></div>';

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
        if (!(filters_on.has($(this).find('.nom .badge').text()))) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}
function deleteFilter(element) {
    // element.parentElement.remove();
    element.remove();
    // filters_on.delete(element.previousSibling.textContent);
    filters_on.delete(element.textContent);
    updateListAddress();
}
function addListFilter(element) {
    filters_on.add(element.textContent);
    updateFiltersOn();
    updateListAddress();
}
function sortAddress(a,b) {
    if (a.Category === b.Category) {
        if ( a.Name.toUpperCase() < b.Name.toUpperCase()) {
            return -1;
        } else {
            return 1
        }
    } else {
        if (a.Category.toUpperCase() < b.Category.toUpperCase()) {
            return 1;
        } else {
            return -1;
        }
    }
}
$('#filterHeader').on('click',function() {
    if ($('#filters').hasClass('on')) {
        $('#filters').hide();
        $('#filters').removeClass('on');
    } else {
        $('#filters').show();
        $('#filters').addClass('on');
    }
});
// ====================================
// Add data
// ========

data.Addresses.sort(sortAddress).forEach(function(it,ind) {
    $('#liste').append(fill(it,ind));
});

// Filters
// =======
var filters = getFilters(),
    filters_on = new Set(filters);
updateFiltersOn();

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

// MAP OR LIST
function showListe() {
    $('#showListe').addClass('clicked');
    $('#showMap').removeClass('clicked');
    $('#map').hide();
    $('#liste').show();
};
function showMap() {
    $('#showMap').addClass('clicked');
    $('#showListe').removeClass('clicked');
    $('#liste').hide();
    $('#map').show();
};
$('#showListe').click(function() {    
    showListe();
});
$('#showMap').click(function() {
    showMap();
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
    var coord =  [e.features[0].geometry.coordinates[0],e.features[0].geometry.coordinates[1]];
    map.flyTo({center:coord});
});
function showOnMap(elem) {
    var coord = $(elem).siblings('.coord').text().split(','),
        deschtml = $(elem).siblings('.deschtml').html();
    map.flyTo({center:coord,zoom:15});
    new mapboxgl.Popup()
        .setLngLat(coord)
        .setHTML(deschtml)
        .addTo(map);
}
// When an element is clicked in the list, display it in the list
$('.where').on('click',function() {
    showOnMap(this);
    showMap();
});
$('.comment').on('click',function() {
    showOnMap(this);
    showMap();
});
function resizeMap () {
    $('#map').show();
    map.resize();
    $('#map').hide();
}
// data.Addresses.forEach(function(it,ind) {
//     var content = '<tr class="address"><td class="nom">'+ it.Name + '</td>';
//     content += '<td class="Adress">' + it.Address + '</td>'; 
//     content += '</tr>';
//     $('tbody').append(content);
// });

// ==============================================================================
