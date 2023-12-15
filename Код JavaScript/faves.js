/* Загрузка песен из базы данных + кнопка удаления */

fetch("https://d5d25uuvi8egrdfdgltk.apigw.yandexcloud.net/userSongs")
  .then(response => response.json())
  .then(data => {
    const featuredTracks = document.querySelector(".featured-tracks");
    if (data.length === 0) { // проверка на наличие песен в json
      const noSongs = document.createElement("p");
      noSongs.textContent = "There's nothing here, yet. Try liking some songs :)";
      featuredTracks.appendChild(noSongs);
    } else {
      data.forEach((song, index) => {
        const trackWrap = document.createElement("div");
        trackWrap.classList.add("track-wrap");
        const trackInfo = document.createElement("div");
        const trackName = document.createElement("a");
        trackName.classList.add("text-gradient");
        trackName.href = `https://www.last.fm/ru/music/${song.artist}/_/${song.song}`;
        trackName.id = `track-${index + 1}`;
        trackName.textContent = song.song;
        trackInfo.appendChild(trackName);
        const artistName = document.createElement("p");
        artistName.classList.add("similar-artist-name");
        artistName.id = `similar-artist-name-${index + 1}`;
        artistName.textContent = song.artist;
        trackInfo.appendChild(artistName);
        trackWrap.appendChild(trackInfo);
        const buttonWrap = document.createElement("div");
        buttonWrap.classList.add("buttons-wrap");
        const lastfmLink = document.createElement("a");
        lastfmLink.classList.add("lastfm-link");
        lastfmLink.href = `https://www.last.fm/ru/music/${song.artist}/_/${song.song}`;
        lastfmLink.id = `btn-track-${index + 1}`;
        const lastfmIcon = document.createElement("i");
        lastfmIcon.classList.add("fa-brands", "fa-square-lastfm", "fa-2xl");
        lastfmLink.appendChild(lastfmIcon);
        buttonWrap.appendChild(lastfmLink);
        trackWrap.appendChild(buttonWrap);
        featuredTracks.appendChild(trackWrap);
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fas", "fa-trash-alt");
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener("click", () => {
          const songName = encodeURIComponent(song.song);
          const artistName = encodeURIComponent(song.artist);
          fetch(`https://d5d25uuvi8egrdfdgltk.apigw.yandexcloud.net/modifySongs?songName=${songName}&artistName=${artistName}`, {
            method: "DELETE"
          })
          .then(response => {
            if (response.ok) {
              trackWrap.remove(); // удаление элемента с песней из HTNL
              if (featuredTracks.children.length === 0) { // проверка на количество песен после удаления
                const noSongs = document.createElement("p");
                noSongs.textContent = "There's nothing here, yet. Try liking some songs :)";
                featuredTracks.appendChild(noSongs);
              }
            } else {
              throw new Error("Ошибка удаления песни");
            }
          })
          .catch(error => console.log(error));
        });
        buttonWrap.appendChild(deleteButton);
      });
    }
  })
  .catch(error => console.log(error));