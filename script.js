/** handle common event in page*/ 

const _showElement = element => element.removeClass('d-none');
const _closeElement = element => element.addClass('d-none');

// get element 
const navbarContent = $('.navbar-collapse');
const searchPopup = $('.search-popup');
const searchBtn= $('.navbar-control .btn-search');

// open - close the navigation when click hamburger button
$('.navbar-toggler').click(() => {
    navbarContent.toggleClass('d-none');
    searchBtn.toggleClass('d-none');
});

// open the searching form when clicking search button
$('.btn-search').click(() => {
    _showElement(searchPopup);
});

// close the searching form when click close button or press Esc
$('.btn-close').click(() => {
    _closeElement(searchPopup);
    _closeElement(navbarContent);
    _showElement(searchBtn)
});
$(document).on('keydown', e => {
    if(e.key === "Escape") {
        _closeElement(searchPopup);
        _closeElement(navbarContent);
        _showElement(searchBtn);
    }
});


const topNews = $('.topnews');
const topnewsMain = $('.topnews-main__inner');
const topnewsRight = $('.topnews-right');
const topNewsSlider = $('.topnews-slider');

const searchNews = $('.searching-news');
const newsList = $('.news-list');
let curSearch = '';

const loading = $('.loader-wrapper');
const filter = $('.filter');


/**get data from api and render them to the element*/ 

function renderNewsHeader(element, data, main = false) {
    const cardPosts = element.children('.card__post');
    cardPosts.each((i, val) => {
        val.innerHTML = `
        <img src="${data[i].image}" alt="${data[i].title}">
        <div class="wrapper">
            <div class="card__post-content">
                ${main ? '<h2 class="card__post-title"></h2>' : '<h5 class="card__post-title"></h5>'}
                <div class="card__post-author-info">
                    <ul class="list-inline ">
                        <li class="list-inline-item">
                            By ${data[i].source.name} 
                        </li>
                        <li class="list-inline-item">
                            ${data[i].publishedAt.slice(0, 10)}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        `
        $('.card__post-title').html(`
            <a href="${data[i].source.url}" target="_blank" class="news-link">
                ${data[i].title}
            </a>
        `)
    })
}

function renderNews(element, data, slider = false) {
    const newsCollects = data.map(news => `
        <div class="card__post">
            <img src="${news.image}" alt="${news.title}">
            <div class="card__post-content">
                <h5 class="card__post-title">
                    <a href="${news.source.url}" target="_blank" class="news-link">
                        ${news.title}
                    </a>
                </h5>
                <div class="card__post-author-info">
                    <ul class="list-inline mb-0">
                        <li class="list-inline-item">
                            By ${news.source.name}
                        </li>
                        <li class="list-inline-item">
                            ${news.publishedAt.slice(0, 10)}
                        </li>
                    </ul>
                </div>
                <div class="card__post-descript">
                    ${slider ? '' : news.description}
                </div>
            </div>
        </div>
    `);

    element.html(newsCollects.join(''));

    if (slider) {
        element.slick({
            autoplay: true,
            slidesToShow: 3,
            slidesToScroll: 3,
            arrows: false,
            responsive: [
              {
                breakpoint: 767,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2
                }
              },
              {
                breakpoint: 590,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1
                }
              }
            ]
        });
    }
}

function loadNews(urlAPI, search = false) {
    search ? _closeElement(topNews) : _closeElement(searchNews);
    _closeElement(filter);
    newsList.html('');
    _showElement(loading);

    $.ajax({
        type: 'GET',
        url: urlAPI,
        success: function(data) {
            const news = data.articles;
            if (search) {
                _showElement(searchNews);
                if(news.length === 0) {
                    newsList.html('<h1 class="text-center mb-5">Does not match any result</h1>');
                } else {
                    renderNews(newsList, news);
                    _showElement(filter);
                }
            } else {
                // render top headline
                _showElement(topNews);
                let newsMain = [];
                let newsRight = [];
                let otherNews;
                [newsMain[0], newsMain[1], newsRight[0], newsRight[1], ...otherNews] = news;
                
                renderNewsHeader(topnewsMain, newsMain, true);
                renderNewsHeader(topnewsRight, newsRight);
                renderNews(topNewsSlider, otherNews, true);
            };
            _closeElement(loading);
        },
        error: function(xhr, status, error) {
            const errorMess = xhr.status + ': ' + xhr.statusText;
            _closeElement(loading);
            alert('Error - ' + errorMess);
        }
    })
}

const loadingUrl = 'https://gnews.io/api/v4/top-headlines?&token=053ed010e8ed01e6f7f6ccf95ff8ee33';
loadNews(loadingUrl);

/**searching handle*/ 
const searchInput = $('.search-input');
$('.submit-search').click(e => {
    e.preventDefault();
    _closeElement(searchPopup);
    if (searchInput.val().trim() !== '') {
        const keyword = encodeURI(searchInput.val().trim());
        curSearch = keyword
        const searchURL = `https://gnews.io/api/v4/search?q=${keyword}&token=053ed010e8ed01e6f7f6ccf95ff8ee33`;
        searchInput.val("");
        loadNews(searchURL, true);
    }
    return false;
});

const filterBtn = $('.filter-button');
const filterScope = $('.filter-scope');
const curDay = new Date();
$('.from-date').val(curDay.toISOString().slice(0, 10));
$('.to-date').val(curDay.toISOString().slice(0, 10));

filterBtn.click(() => {
    filterScope.toggleClass('d-none');
});

$('.submit-filter').click(() => {
    const fromDate = new Date($('.from-date').val()).toISOString();
    const toDate = new Date($('.to-date').val()).toISOString();
    const keyTimeFrom = fromDate.split('.')[0]+"Z";
    const keyTimeTo = toDate.split('.')[0]+"Z";
    const searchURL = `https://gnews.io/api/v4/search?q=${curSearch}&from=${keyTimeFrom}&to=${keyTimeTo}&token=053ed010e8ed01e6f7f6ccf95ff8ee33`;
    _closeElement(filterScope);
    loadNews(searchURL, true);
})


