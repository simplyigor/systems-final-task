/* Метод №1 – Обращаемся к облачной функции для получения биографии исполнителя и его песен */

const input = document.querySelector('input');
const description = document.getElementById('description');
const tracks = document.querySelectorAll('[id^="track-"]');
const tags = document.querySelectorAll('[id^="tag-"]');
const lastFmButtons = document.querySelectorAll('[id^="btn-track-"]');

input.addEventListener('change', () => {
  const artistName = input.value;
  fetch(`https://d5d25uuvi8egrdfdgltk.apigw.yandexcloud.net/discoverArtists/${artistName}`)
    .then(response => response.json())
    .then(data => {

      /* Описание исполнителя */
      description.textContent = data.description;

      /* Описание исполнителя – Анимация */
      description.classList.add('fade-in');
      description.addEventListener('animationend', () => {
        description.classList.remove('fade-in');
      });       

      /* Песни */
      tracks.forEach((track, index) => {
        const trackData = data.random_tracks[`track${index+1}`];
        track.innerHTML = `${trackData.name} <i class="fa-solid fa-link fa-xs"></i>`;
        track.href = trackData.url;

        /* Анимация песен */
        track.classList.add('fade-in');
        track.addEventListener('animationend', () => {
          track.classList.remove('fade-in');
        });      
      });

      /* Ссылки к кнопкам Last.fm  */
      lastFmButtons.forEach((btn, index) => {
        const trackData = data.random_tracks[`track${index+1}`];
        const url = trackData.url;
        btn.href = url;
      });    
      
      /* Теги исполнителя */
      tags.forEach((tag, index) => {
        const tagData = data.tags[`tag${index+1}`];
        tag.innerHTML = tagData.name;

        /* Теги исполнителя – Анимация */
        tag.classList.add('fade-in');
        tag.addEventListener('animationend', () => {
          tag.classList.remove('fade-in');
        });
      });
      
      /* Возвращает значение input на дефолтное = пустое */
      input.value = '';      
      
    })
    .catch(error => {
      console.error(error);
      alert("Sorry, I don't know this artist. Try someone else :(");
    });
});

/* Метод №2.1 – Обращаемся к облачной функции для получения, записи и удаления данных из YDB */

const likeBtns = document.querySelectorAll('.like-btn');
let artistName = "Cigarettes After Sex";

input.addEventListener('input', (event) => {
  artistName = event.target.value;
  likeBtns.forEach(btn => btn.classList.remove('liked'));
});

likeBtns.forEach(btn => {
  btn.addEventListener('click', () => {

    const songName = btn.closest('.track-wrap').querySelector('.text-gradient').textContent.trim();
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




