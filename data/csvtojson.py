# -*- coding: utf-8 -*-

# This code transforms the .csv data into a json file ready to be loaded
# by the html page

import pandas as pd
import geocoder
from geojson import Feature, Point, FeatureCollection

# mapbox Key
mpkey = "pk.eyJ1IjoibG91aXNkZWNoYXJzb24iLCJhIjoiY2lsemFrYmNtMDBoOXc4bTV3M2pybzBmcSJ9.O4wshToxz8yiykD8q_IcQg"
root = '/Users/louisdecharson/Programmation/html/paris'

# ============================================================================ #
# FUNCTIONS

def get_hex(mot):
    """
    Retrieve md5 hex code of a word
    """
    m = hashlib.md5()
    m.update(mot.encode('utf8'))
    return m.hexdigest()

def get_coordinates(address):
    """
    This function return the coordinates of an adress in France
    """
    res = geocoder.mapbox(address+', FRANCE',key=mpkey,maxRows=1)
    if len(res) > 0:
        return [res[0].latlng[1],res[0].latlng[0]]
    else:
        return ['na','na']
    
def to_json(path,dest):
    """
    This function translates the pandas df into a javascript object
    called data
    """
    df = pd.read_csv(path,sep=';',encoding='utf-8')
    tmp = df.to_json(orient='records')
    json = 'var data = {"Addresses":' + tmp + '};\n'
    geojson = 'var geoJSON = ' + getGeoJSON(df) + ';'
    json += geojson
    with open(dest,'w') as f:
        f.write(json)
        
def getIcon(category):
    """
    This function return the Maki icon name
    """
    cat = category.lower()
    if cat == 'restaurant':
        icon = 'restaurant'
    elif cat[0:3] == 'caf':
        icon = 'cafe'
    elif cat == 'bar':
        icon = 'beer'
    else:
        icon = 'cafe'
    return icon

def createDesc(address):
    """
    This function return the description for Mapbox
    """
    desc =  "<div class='popup'><center><h3>"+ address['Name'] +""
    desc += '<span class="badge badge-pill ' + address['Category'].lower().split(' ')[0] + '">' + address['Category'] + '</span></h3>'
    desc += "<div class='where'>" + address['Address'] + "</div>"
    desc += "<hr/>"
    desc += "<div class='comment'>" + address['Comment_en'] + "</div>"
    desc += '</div>'
    return desc

def getGeoJSON(df):
    """ 
    This function creates a geoJSON to be used in Mapbox
    """
    df['Coord'] = df.apply(lambda row: get_coordinates(row['Address']), axis=1)
    features = []
    # Append Home to features
    home = {
        "Name":"Home",
        "Category": "Home",
        "Address": "26, rue des Trois Bornes, 75011 Paris",
        "Comment_en":"Home Sweet Home. There is no place like home."
    }
    features.append(Feature(
        geometry = Point((float(2.3724244),float(48.8672365))),
        properties = {
            "title": 'Home',
            "description": createDesc(home),
            "icon":'marker'
        }))
    # Append all the others
    for index,row in df.iterrows():
        if row['Category'] != 'Apps':
            features.append(Feature(
                geometry = Point((float(row['Coord'][0]),float(row['Coord'][1]))),
                properties = {
                    "title":row['Name'],
                    "description":createDesc(row),
                    "icon": getIcon(row['Category'].lower().split(' ')[0])
                }))
    return str(FeatureCollection(features))
# ============================================================================ #

to_json(root+'/data/data.csv',root+'/js/data.js')
