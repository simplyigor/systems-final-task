import requests
import json
import os

def handler(event, context):    
    key = os.environ.get("MUSIC_KEY")
    song_name = event["params"]["songName"]
    artist_name = event["params"]["artistName"]
    url = f"https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist={artist_name}&track={song_name}&api_key={key}&limit=5&format=json"
    response = requests.get(url).json()
    
    similar_tracks = {}
    for i, track in enumerate(response['similartracks']['track']):
        similar_tracks[f'track{i+1}'] = {
            'name': track['name'].replace("'", "`"),
            'artist': track['artist']['name'].replace("'", "`"),
            'url': track['url']
    }
    
    return {
        'statusCode': 200,
        'body': json.dumps(similar_tracks)
    }