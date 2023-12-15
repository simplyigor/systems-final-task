/* Если при скроллинге navbar пересекается с основным контентом, то добавляем белый фон */

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const mainContent = document.querySelector('.main-content');
    const headerHeight = header.offsetHeight;
    const mainContentTop = mainContent.offsetTop;
    const scrollPosition = window.scrollY;

    if (scrollPosition > mainContentTop - headerHeight) {
      header.style.backgroundColor = 'white';}
     else {
      header.style.backgroundColor = "";
    }
  });