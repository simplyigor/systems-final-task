import urllib3
import json
import random
import string
import urllib.parse
import os
import ydb
import ydb.iam

driver_config = ydb.DriverConfig(
    endpoint=os.getenv('YDB_ENDPOINT'), 
    database=os.getenv('YDB_DATABASE'),
    credentials=ydb.iam.MetadataUrlCredentials()
)

driver = ydb.Driver(driver_config)
driver.wait(fail_fast=True, timeout=10)
pool = ydb.SessionPool(driver)

def randomword(length = 10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def insert_songs(tablename, artist, song):
    text = f"INSERT INTO {tablename} SELECT '{randomword()}' as id, '{artist}' as artist, '{song}' as song;"
    return pool.retry_operation_sync(lambda s: s.transaction().execute(
        text,
        commit_tx=True,
        settings=ydb.BaseRequestSettings().with_timeout(3).with_operation_timeout(2)
    ))

def check_all(tablename, artist, song):
    text = f"SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END AS result, COUNT(*) AS count FROM {tablename} WHERE artist = '{artist}' AND song = '{song}';"
    return pool.retry_operation_sync(lambda s: s.transaction().execute(
        text,
        commit_tx=True,
        settings=ydb.BaseRequestSettings().with_timeout(3).with_operation_timeout(2)
    ))

def select_all(tablename):
    text = f"SELECT DISTINCT artist, song FROM {tablename};"
    return pool.retry_operation_sync(lambda s: s.transaction().execute(
        text,
        commit_tx=True,
        settings=ydb.BaseRequestSettings().with_timeout(3).with_operation_timeout(2)
    ))

def delete_song_user(tablename, artist, song):
    songs = check_all(tablename, artist, song)
    if not songs[0].rows[0]["result"]:
        raise Exception("No such artist or song")
    text = f"DELETE FROM {tablename} WHERE artist = '{artist}' AND song = '{song}';"
    result = pool.retry_operation_sync(lambda s: s.transaction().execute(
        text,
        commit_tx=True,
        settings=ydb.BaseRequestSettings().with_timeout(3).with_operation_timeout(2)
    ))
  
def handler(event, context):
    if event["httpMethod"] == "GET":
        if event["path"] == "/userSongs":
            songs = select_all('module')
            decoded_songs = []
            for song in songs[0].rows:
                decoded_song = {}
                for key, value in song.items():
                    decoded_song[key] = value.decode()
                decoded_songs.append(decoded_song)
            return {
                'statusCode': 200,
                'body': decoded_songs
            }
        else:
            songName = event["params"]["songName"]
            artistName = event["params"]["artistName"]
            songs = check_all('module', artistName, songName)
            return {
                'statusCode': 200,
                'body': songs[0].rows
            }
    elif event["httpMethod"] == "POST":
        songName = event["params"]["songName"]
        artistName = event["params"]["artistName"]
        insert_songs('module', artistName, songName)
        return {
            'statusCode': 200,
            'body': 'Song saved successfully'
        }
    elif event["httpMethod"] == "DELETE":
        songName = event["params"]["songName"]
        artistName = event["params"]["artistName"]
        try:
            delete_song_user('module', artistName, songName)
            return {
                'statusCode': 200,
                'body': 'Song deleted successfully'
                }
        except Exception as e:
            return {
                'statusCode': 404,
                'body': str(e)
            }
    else:
        return {
            'statusCode': 400,
            'body': 'Something went wrong'
        }