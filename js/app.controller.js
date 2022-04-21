import { appService } from './app.service.js'

window.app = {
  onInit,
  onGetVidFromList,
  onChannel,
  onSearch,
}

function onInit() {
  renderPage('JavaScript')
}

function renderPage(search) {
  appService.getVidAndWiki(search).then((res) => {
    const mainVid = res.videos.splice(0, 1)[0]
    renderMainVideo(mainVid)
    renderVideosList(res.videos)

    renderWikiInfo(res.wikis)
  })
}

function renderMainVideo(video) {

  const strHtml = `
    <div class="video">
      <iframe src="${video.url}"> </iframe>
    </div>
    <div class="div-details">
      <h2 class="video-title">${video.title}</h2>
      <a class="video-publisher" href="${video.channelUrl}" target="_blank">${video.channelTitle}</a>
    </div>
  ` 
  document.querySelector('.video-player').innerHTML = strHtml    
}

function renderVideosList(videos) {
  const strHtml = videos.map(
    (video) =>
      `<article onclick="app.onGetVidFromList('${video.id}')">
        <img src="${video.img}" alt="${video.title}" />
        <div>
          <p class="video-title">
            ${video.title}
          </p>
          <p class="video-publisher" onclick="app.onChannel(event, '${video.id}')">${video.channelTitle}</p>
        </div>
      </article>`
  )

  document.querySelector('.videos-list').innerHTML = strHtml.join('')
}

function onGetVidFromList(videoId) {
  const videos = [...appService.getCurrentVideos()]
  const vidIdx = appService.getVideoIdxById(videoId)
  const mainVid = videos.splice(vidIdx, 1)[0]
  renderMainVideo(mainVid)
  renderVideosList(videos)
}

function onChannel(ev, videoId) {
  ev.stopPropagation()
  const video = appService.getVideoById(videoId)
  window.open(video.channelUrl, '_blank')
}

function renderWikiInfo(wikis) {
  const strHtml = wikis.map(
    (wiki) => `
        <article>
            <h2>🎓 <a href="${wiki.url}" target="_blank">${wiki.phrase}</a></h2>
            <p>${wiki.paragraph}</p>
        </article
    `
  )

  document.querySelector('.wikipedia').innerHTML = strHtml.join('')
}

function onSearch(ev) {
  ev.preventDefault()
  const elInput = document.querySelector('.main-section input[type="text"]')
  const search = elInput.value
  elInput.value = ''

  renderPage(search)
}
