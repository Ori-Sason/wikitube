import { apiService } from './api.service.js'

export const appService = {
  getVidAndWiki,
  getCurrentVideos,
  getVideoIdxById,
  getVideoById,
}

const NUM_OF_SENTENCES = 2
let gCurrentVideos = []

function getVidAndWiki(search) {
  return Promise.all([getVideos(search), getWikiInfo(search)]).then(
    (vidsAndWiki) => {
      return {
        videos: [...vidsAndWiki[0]],
        wikis: [...vidsAndWiki[1]],
      }
    }
  )
}

function getVideos(search) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=${apiService.getYouTubeApiKey()}&q=%22${search}%22`
  return axios.get(url).then((res) => {
    gCurrentVideos = res.data.items.map((vid) => ({
      id: vid.id.videoId,
      url: `https://www.youtube.com/embed/${vid.id.videoId}`,
      img: vid.snippet.thumbnails.default.url,
      title: vid.snippet.title,
      channelId: vid.snippet.channelId,
      channelUrl: `https://www.youtube.com/channel/${vid.snippet.channelId}`,
      channelTitle: vid.snippet.channelTitle,
    }))
    return gCurrentVideos
  })
}

function getCurrentVideos() {
  return gCurrentVideos
}

function getVideoIdxById(id) {
  return gCurrentVideos.findIndex((video) => video.id === id)
}

function getVideoById(idx) {
  return gCurrentVideos.find((vid) => vid.id === idx)
}

function getWikiInfo(search) {
  function getValidSearches(phrase) {
    const url = `https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=${phrase}&limit=10&namespace=0&format=json`
    return axios.get(url).then((res) => {
      const phrases = res.data[1].slice(0, 3)
      const links = res.data[3].slice(0, 3)
      return phrases.map((phrase, idx) => ({ phrase, url: links[idx] }))
    })
  }

  function getInfo(phrase) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&exsentences=${NUM_OF_SENTENCES}&titles=${phrase}&explaintext=1&format=json`
    return axios.get(url).then((res) => {
      const result = res.data.query.pages
      const info = result[Object.keys(result)[0]]
      return info.extract
    })
  }

  return getValidSearches(search).then((wikis) => {
    const infos = wikis.map((wiki) => getInfo(wiki.phrase))
    //in the end we have these objects in an array: {phrase, url, paragraph}
    return Promise.all(infos).then((pharagraphs) => {
      wikis.forEach((wiki, idx) => (wiki.paragraph = pharagraphs[idx]))
      return Promise.resolve(wikis)
    })
  })
}
