/* Формирование секции Daily Songs – запрос к Object Storage */

document.addEventListener("DOMContentLoaded", function() {
  const url = "https://d5d25uuvi8egrdfdgltk.apigw.yandexcloud.net/dailySong";
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const tracks = data.tracks;
      const trackKeys = Object.keys(tracks);
      const selectedTracks = []; // массив для хранения уже выбранных песен
      document.querySelectorAll(".song-of-the-day").forEach(section => {
        let randomKey = trackKeys[Math.floor(Math.random() * trackKeys.length)];
        let randomTrack = tracks[randomKey];
        while (selectedTracks.includes(randomTrack)) { // проверяем, была ли уже выбрана эта песня
          randomKey = trackKeys[Math.floor(Math.random() * trackKeys.length)];
          randomTrack = tracks[randomKey];
        }
        selectedTracks.push(randomTrack); // добавляем выбранную песню в массив
        section.querySelector(".song-name").textContent = randomTrack.song;
        section.querySelector(".song-name").href = randomTrack.url;
        section.querySelector(".artist-name").textContent = randomTrack.artist;
        section.querySelector(".cover-image").src = randomTrack.image;
      });
    })
    .catch(error => console.log(error));
});

/* Формирование секции Similar Songs – выводим список похожих песен */

const submitBtn = document.getElementById("submit-button");
const artistNameInput = document.getElementById("artist-name-input");
const songNameInput = document.getElementById("song-name-input");

submitBtn.addEventListener("click", () => {
  const artistName = artistNameInput.value;
  const songName = songNameInput.value;

  fetch(`https://d5d25uuvi8egrdfdgltk.apigw.yandexcloud.net/similarSongs/${songName}/${artistName}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById("track-1").textContent = data.track1.name;
      document.getElementById("track-1").href = data.track1.url;
      document.getElementById("btn-track-1").href = data.track1.url;
      document.getElementById("similar-artist-name-1").textContent = data.track1.artist;

      document.getElementById("track-2").textContent = data.track2.name;
      document.getElementById("track-2").href = data.track2.url;
      document.getElementById("btn-track-2").href = data.track2.url;
      document.getElementById("similar-artist-name-2").textContent = data.track2.artist;

      document.getElementById("track-3").textContent = data.track3.name;
      document.getElementById("track-3").href = data.track3.url;
      document.getElementById("btn-track-3").href = data.track3.url;
      document.getElementById("similar-artist-name-3").textContent = data.track3.artist;

      document.getElementById("track-4").textContent = data.track4.name;
      document.getElementById("track-4").href = data.track4.url;
      document.getElementById("btn-track-4").href = data.track4.url;
      document.getElementById("similar-artist-name-4").textContent = data.track4.artist;

      document.getElementById("track-5").textContent = data.track5.name;
      document.getElementById("track-5").href = data.track5.url;
      document.getElementById("btn-track-5").href = data.track5.url;
      document.getElementById("similar-artist-name-5").textContent = data.track5.artist;

      artistNameInput.value = "";
      songNameInput.value = "";
    })
    .catch(error => {
      console.error(error);
      alert("Sorry, there are no similar songs to this track");
    });
});

/* Реализация записи, удаления песен в/из БД – аналогично тому, что было в artists.js (тут я изменил определение константы artistName ) */

const likeBtns = document.querySelectorAll('.like-btn');

artistNameInput.addEventListener('input', () => {
  likeBtns.forEach(btn => btn.classList.remove('liked'));
});

likeBtns.forEach(btn => {
  btn.addEventListener('click', () => {

    const songName = btn.closest('.track-wrap').querySelector('.text-gradient').textContent.trim();
    const artistName = btn.closest('.track-wrap').querySelector('.similar-artist-name').textContent.trim();
    const encodedSongName = encodeURIComponent(songName);
    const encodedArtistName = encodeURIComponent(artistName);    

    // Удаляем песни из БД
    if (btn.classList.contains('liked')) {
      fetch(`https://d5d25uuvi8egrdfdgltk.apigw.yandexcloud.net/modifySongs?songName=${encodedSongName}&artistName=${encodedArtistName}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          console.log("Song deleted successfully");
        } else {
          console.error("Error deleting song");
        }
      })
      .catch(error => {
        console.error(`Error deleting song ${error}`);
        alert("Sorry, I can't delete this song");
      });
    } else {
      // Сохраняем песни в БД 
      fetch(`https://d5d25uuvi8egrdfdgltk.apigw.yandexcloud.net/modifySongs?songName=${encodedSongName}&artistName=${encodedArtistName}`, {
        method: 'POST'
      })
      .then(response => {
        if (response.ok) {
          console.log("Song saved successfully");
        } else {
          console.error("Error saving song");
        }
      })
      .catch(error => {
        console.error("Error saving song");
        alert("Sorry, I can't save this song");
      });
    }
    // Переключаем класс "liked" на кнопке
    btn.classList.toggle('liked');
  });
}); 


  