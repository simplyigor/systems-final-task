import requests
import random
import json
import os

def handler(event, context):

    # Реализация обращения к Last.fm для получения биографии введенного исполнителя
    key = os.environ.get("MUSIC_KEY")
    artist_name = event["params"]["artistName"]
    url = f"https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist={artist_name}&api_key={key}&format=json"
    response = requests.get(url)
    artist_info = response.json().get("artist", ).get("bio", ).get("summary", )
    artists_tags = response.json().get("artist", {}).get("tags", {}).get("tag", [])

    if not artist_info:
        artist_info = "Sorry, we haven't found anything :("
        
    else:
        # Удаление всех тегов <a> и их содержимого из переменной artist_info
        while True:
            start = artist_info.find('<a')
            if start == -1:
                break
            end = artist_info.find('>', start)
            artist_info = artist_info[:start] + artist_info[end+1:]
            end_tag = artist_info.find('</a>', start)
            if end_tag != -1:
                artist_info = artist_info[:start] + artist_info[end_tag+4:]

        # Удаление незаконченных предложений из переменной artist_info
        last_dot_index = artist_info.rfind('.')
        if last_dot_index != -1:
            artist_info = artist_info[:last_dot_index+1]
        else:
            artist_info += "."
        
    # Реализация обращения к Last.fm для получения 5 случайных песен введенного исполнителя
    tracks_url = f"https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist={artist_name}&api_key={key}&format=json"
    tracks_response = requests.get(tracks_url)
    tracks_list = tracks_response.json().get("toptracks", ).get("track", [])
    random_tracks = random.sample(tracks_list, min(5, len(tracks_list)))
    tracks_names = [track.get("name") for track in random_tracks]
    
    tracks_dict = {}
    for index, track in enumerate(random_tracks):
        key = f"track{index+1}"
        tracks_dict[key] = {
            "name": track.get("name").replace("'", "`"),
            "url": track.get("url")
        }
    
    tags_dict = {}
    for index, tag in enumerate(artists_tags):
        key = f"tag{index+1}"
        tags_dict[key] = {
            "name": tag.get("name"),
            "url": tag.get("url")
        }

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({"description": artist_info, "random_tracks":  tracks_dict, "tags": tags_dict})
    }