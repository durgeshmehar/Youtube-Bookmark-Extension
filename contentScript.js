
(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (result) => {
                if (chrome.runtime.lastError) {
                    console.error('Error fetching bookmarks:', chrome.runtime.lastError);
                    resolve([]);
                } else {
                    console.log("fetch current Video :", currentVideo);
                    resolve(result[currentVideo] ? JSON.parse(result[currentVideo]) : []);
                }
            });
        });

    };

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
            };
            
        currentVideoBookmarks = await fetchBookmarks();
        console.log("new Bookmark :", newBookmark);
        console.log("current Video :", currentVideo);
        console.log("current Bookmark :", currentVideoBookmarks);

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    };

    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            const checkElementsLoaded = setInterval(() => {
                youtubeLeftControls = document.getElementsByClassName("ytp-right-controls")[0];
                youtubePlayer = document.getElementsByClassName("video-stream")[0];

                if (youtubeLeftControls && youtubePlayer) {
                    clearInterval(checkElementsLoaded);
                    youtubeLeftControls.insertBefore(bookmarkBtn, youtubeLeftControls.children[0]);
                    bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
                }
            }, 1000);
        }
    };

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      console.log("New video loaded: ", currentVideo);
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
    } else if ( type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
      response(currentVideoBookmarks);
    }
    else if( type ==='DELETE_ALL'){
        currentVideoBookmarks = [];
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
        response(currentVideoBookmarks);
    }
  });

})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substr(11, 8);
}