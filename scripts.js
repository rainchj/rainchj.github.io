// ========================================
// Share Page Function
// ========================================
function sharePage(event) {
    event.preventDefault();
    if (navigator.share) {
        navigator.share({
            title: '유행살이 공유자료',
            text: '주요 경제지표 현황, 부동산지표 현황 등 제공',
            url: 'http://rainchj.github.io'
        }).then(() => console.log('공유 성공!'))
            .catch(err => console.error('공유 실패:', err));
    } else {
        alert('바로가기 설치후 가능합니다.');
    }
}

// ========================================
// Common Initialization
// ========================================
document.addEventListener("DOMContentLoaded", function () {
    // Visitor Counter
    const counterEl = document.getElementById("counter");
    if (counterEl) {
        fetch("https://script.google.com/macros/s/AKfycbzqseDk9zvMLOJ7F3nZ1pGeczko5eRFmyI2Ol2bd8nRkOROMxk35CJmsIs9jm8PuyhM/exec")
            .then(res => res.text())
            .then(count => counterEl.innerText = count)
            .catch(err => console.error("Error:", err));
    }

    // Image Date Fetcher
    function displayImageDate(dateElementId, imageUrl) {
        fetch(imageUrl)
            .then(res => {
                const lastModified = res.headers.get('Last-Modified');
                const el = document.getElementById(dateElementId);
                if (el) {
                    el.textContent = lastModified
                        ? new Date(lastModified).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
                        : '-';
                }
            })
            .catch(err => {
                console.error('Error:', err);
                const el = document.getElementById(dateElementId);
                if (el) el.textContent = '-';
            });
    }

    // Image URLs mapping
    const images = {
        '경제지표일간-date': 'https://rainchj.github.io/weekly_money/주간_경제지표.jpg',
        '환율시장-date': 'https://rainchj.github.io/weekly_money/주간_환율.jpg',
        '차트분석-date': 'https://rainchj.github.io/weekly_money/주간_차트1.jpg',
        '아파트가격조사-date': 'https://rainchj.github.io/weekly_estate/주간_가격조사.jpg',
        '실거래가서울-date': 'https://rainchj.github.io/weekly_estate/실거래_서울.jpg',
        '매물서울-date': 'https://rainchj.github.io/weekly_estate/매물서울총괄.jpg',
        '매물경기-date': 'https://rainchj.github.io/weekly_estate/매물경기총괄.jpg',
        '매물인천-date': 'https://rainchj.github.io/weekly_estate/매물인천총괄.jpg',
        '매물기타-date': 'https://rainchj.github.io/weekly_estate/매물기타총괄.jpg',
        '경기순환진단-date': 'https://rainchj.github.io/monthly/경기순환진단.jpg',
        '경제지표월간-date': 'https://rainchj.github.io/monthly/주요경제지표월간.jpg',
        '총괄전국-date': 'https://rainchj.github.io/monthly/총괄전국.jpg',
        '주민등록인구-date': 'https://rainchj.github.io/monthly/주민등록인구.jpg',
        '주민등록인구2-date': 'https://rainchj.github.io/monthly/주민등록인구2.jpg',
        '전국매매시점-date': 'https://rainchj.github.io/timing/시점전국1.jpg',
        '서울매매시점-date': 'https://rainchj.github.io/timing/시점서울1.jpg',
        '경기매매시점-date': 'https://rainchj.github.io/timing/시점경기1.jpg',
        '인천매매시점-date': 'https://rainchj.github.io/timing/시점인천1.jpg'
    };

    // Display dates for all images that exist on the page
    Object.entries(images).forEach(([id, url]) => {
        if (document.getElementById(id)) {
            displayImageDate(id, url);
        }
    });

    // Latest Post Fetcher (for index.html)
    const latestPostEl = document.getElementById("latestPost");
    if (latestPostEl) {
        const GAS_URL = "https://script.google.com/macros/s/AKfycbw9tx7ZZr_-J33trw1mK1ObTbqCCCPBCcJDq2YnFRdyhtYyhUBb0KqFGwlmwI13rwErKQ/exec";
        fetch(GAS_URL + "?mode=read")
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    latestPostEl.innerHTML = "게시글이 없습니다.";
                } else {
                    const latest = data[data.length - 1];
                    const dateOnly = latest.date.split(" ")[0];
                    latestPostEl.innerHTML = `<strong>${latest.name}</strong> (${dateOnly})<br>${latest.content}`;
                }
            })
            .catch(() => latestPostEl.textContent = "게시글을 불러오는 데 실패했습니다.");
    }

    // Board functionality (for index_board.html)
    const postForm = document.getElementById("postForm");
    if (postForm) {
        initializeBoard();
    }
});

// ========================================
// Board Functionality
// ========================================
function initializeBoard() {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbw9tx7ZZr_-J33trw1mK1ObTbqCCCPBCcJDq2YnFRdyhtYyhUBb0KqFGwlmwI13rwErKQ/exec";
    let allPosts = [];
    const postsPerPage = 5;

    document.getElementById("postForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const content = document.getElementById("content").value.trim();
        if (!name || !content) return alert("작성자와 내용을 모두 입력하세요.");

        const formData = new FormData();
        formData.append("mode", "write");
        formData.append("name", name);
        formData.append("content", content);

        await fetch(GAS_URL, { method: "POST", body: formData });
        document.getElementById("postForm").reset();
        loadPosts();
    });

    async function loadPosts() {
        const res = await fetch(GAS_URL + "?mode=read");
        const data = await res.json();
        allPosts = data.reverse(); // 최신 글부터 보이게
        document.getElementById("totalCount").textContent = `총 게시글 수: ${allPosts.length}`;
        renderPage(1);
    }

    function renderPage(page) {
        const postsDiv = document.getElementById("posts");
        postsDiv.innerHTML = "";

        const start = (page - 1) * postsPerPage;
        const end = start + postsPerPage;
        const pagePosts = allPosts.slice(start, end);

        if (pagePosts.length === 0) {
            postsDiv.innerHTML = "<p>게시글이 없습니다.</p>";
            return;
        }

        pagePosts.forEach(post => {
            const div = document.createElement("div");
            div.className = "post";
            div.innerHTML = `
                <div class="meta">⏰ ${post.date} | <strong>✍️ ${post.name}</strong></div>
                <div>${post.content}</div>
            `;
            postsDiv.appendChild(div);
        });

        // 페이지네이션
        const nav = document.createElement("div");
        nav.style.textAlign = "center";
        nav.style.marginTop = "10px";

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "다음";
        if (page >= Math.ceil(allPosts.length / postsPerPage)) {
            nextBtn.disabled = true;
        } else {
            nextBtn.onclick = () => renderPage(page + 1);
        }
        nav.appendChild(nextBtn);

        const pageIndicator = document.createElement("span");
        pageIndicator.textContent = ` ${page} / ${Math.ceil(allPosts.length / postsPerPage)} `;
        nav.appendChild(pageIndicator);

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "이전";
        prevBtn.style.marginRight = "10px";
        if (page === 1) {
            prevBtn.disabled = true;
        } else {
            prevBtn.onclick = () => renderPage(page - 1);
        }
        nav.appendChild(prevBtn);

        postsDiv.appendChild(nav);
    }

    loadPosts();
}

// ========================================
// Image Zoom Modal Functionality
// ========================================
(function initImageZoomModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('imageModal')) {
        const modalHTML = `
            <div id="imageModal" class="image-modal">
                <span class="close-modal" onclick="closeImageModal()">&times;</span>
                <div class="zoom-info">
                    <div>확대/축소: 마우스 휠, +/- 버튼, 핀치줌</div>
                    <div>이동: 드래그</div>
                    <div>닫기: ESC, X 버튼</div>
                </div>
                <div class="modal-content" onclick="closeImageModal()">
                    <div class="modal-image-container" onclick="event.stopPropagation()">
                        <img class="modal-image" id="modalImage" src="" alt="확대된 이미지">
                    </div>
                </div>
                <div class="zoom-controls">
                    <button class="zoom-btn" onclick="zoomIn()">+</button>
                    <button class="zoom-btn" onclick="resetZoom()">홈</button>
                    <button class="zoom-btn" onclick="zoomOut()">-</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Modal state
    let scale = 1;
    let panning = false;
    let pointX = 0;
    let pointY = 0;
    let start = { x: 0, y: 0 };
    let initialDistance = 0;
    let initialScale = 1;
    let pinchCenterImageX = 0;
    let pinchCenterImageY = 0;

    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const imageContainer = document.querySelector('.modal-image-container');

    // Add click handlers to all zoomable images
    document.addEventListener('DOMContentLoaded', function () {
        const zoomableImages = document.querySelectorAll('img[data-zoomable]');
        zoomableImages.forEach(img => {
            img.addEventListener('click', function () {
                openImageModal(this.src);
            });
        });
    });

    // Open modal
    window.openImageModal = function (imageSrc) {
        modal.classList.add('active');
        modalImg.onload = function () {
            resetZoom();
        };
        modalImg.src = imageSrc;
    };

    // Close modal
    window.closeImageModal = function () {
        modal.classList.remove('active');
        resetZoom();
    };

    // ESC key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeImageModal();
        }
    });

    // Zoom in (viewport center based)
    window.zoomIn = function () {
        zoomAtViewportCenter(1.2);
    };

    // Zoom out (viewport center based)
    window.zoomOut = function () {
        zoomAtViewportCenter(1 / 1.2);
    };

    // Reset zoom
    window.resetZoom = function () {
        const imgWidth = modalImg.naturalWidth;
        const imgHeight = modalImg.naturalHeight;

        if (!imgWidth || !imgHeight) return;

        // Use modal dimensions to exclude scrollbars and ensure perfect centering
        const viewportWidth = modal.clientWidth;
        const viewportHeight = modal.clientHeight;

        const containerRect = imageContainer.getBoundingClientRect();

        // 1. Scale to fit window width with fixed margin (e.g. 20px total = 10px left + 10px right)
        const targetWidth = viewportWidth - 20;
        const targetHeight = viewportHeight - 20;
        scale = targetWidth / imgWidth;
        if (scale > targetHeight / imgHeight) scale = targetHeight / imgHeight;

        // Minimum scale safety
        if (scale < 0.01) scale = 0.01;

        // 2. Calculate Position
        // Center horizontally: (viewportWidth - visualWidth) / 2
        // We calculate the offset relative to the container's current position
        pointX = (viewportWidth - imgWidth * scale) / 2 - containerRect.left;

        // Center vertically
        pointY = (viewportHeight - imgHeight * scale) / 2 - containerRect.top;

        applyTransform();
    };

    // Apply transform
    function applyTransform() {
        modalImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    // Zoom at viewport center
    function zoomAtViewportCenter(factor) {
        const oldScale = scale;
        scale *= factor;
        if (scale < 0.1) scale = 0.1;
        if (scale > 5) scale = 5;

        // Get viewport center (container center)
        const rect = imageContainer.getBoundingClientRect();
        const viewportCenterX = rect.width / 2;
        const viewportCenterY = rect.height / 2;

        // Calculate the point in the image that's currently at viewport center
        const imagePointX = (viewportCenterX - pointX) / oldScale;
        const imagePointY = (viewportCenterY - pointY) / oldScale;

        // Adjust pointX and pointY so that same image point stays at viewport center
        pointX = viewportCenterX - imagePointX * scale;
        pointY = viewportCenterY - imagePointY * scale;

        applyTransform();
    }

    // Mouse wheel zoom (PC) - viewport center based
    if (imageContainer) {
        imageContainer.addEventListener('wheel', function (e) {
            e.preventDefault();

            if (e.deltaY < 0) {
                zoomAtViewportCenter(1.2);
            } else {
                zoomAtViewportCenter(1 / 1.2);
            }
        });

        // Mouse drag (PC)
        imageContainer.addEventListener('mousedown', function (e) {
            e.preventDefault();
            start = { x: e.clientX - pointX, y: e.clientY - pointY };
            panning = true;
            imageContainer.classList.add('dragging');
        });

        imageContainer.addEventListener('mousemove', function (e) {
            e.preventDefault();
            if (!panning) return;

            pointX = e.clientX - start.x;
            pointY = e.clientY - start.y;
            applyTransform();
        });

        imageContainer.addEventListener('mouseup', function (e) {
            panning = false;
            imageContainer.classList.remove('dragging');
        });

        imageContainer.addEventListener('mouseleave', function (e) {
            panning = false;
            imageContainer.classList.remove('dragging');
        });

        // Touch events (Mobile)
        let touches = [];

        imageContainer.addEventListener('touchstart', function (e) {
            touches = Array.from(e.touches);

            if (touches.length === 1) {
                // Single touch - drag
                start = {
                    x: touches[0].clientX - pointX,
                    y: touches[0].clientY - pointY
                };
                panning = true;
            } else if (touches.length === 2) {
                // Two fingers - pinch zoom
                panning = false;
                initialDistance = getDistance(touches[0], touches[1]);
                initialScale = scale;

                // Calculate the point on the image that is currently at the viewport center
                const rect = imageContainer.getBoundingClientRect();
                const viewportCenterX = rect.width / 2;
                const viewportCenterY = rect.height / 2;

                pinchCenterImageX = (viewportCenterX - pointX) / scale;
                pinchCenterImageY = (viewportCenterY - pointY) / scale;
            }
        });

        imageContainer.addEventListener('touchmove', function (e) {
            e.preventDefault();
            touches = Array.from(e.touches);

            if (touches.length === 1 && panning) {
                // Drag
                pointX = touches[0].clientX - start.x;
                pointY = touches[0].clientY - start.y;
                applyTransform();
            } else if (touches.length === 2) {
                // Pinch zoom
                const currentDistance = getDistance(touches[0], touches[1]);
                scale = initialScale * (currentDistance / initialDistance);
                if (scale < 0.1) scale = 0.1;
                if (scale > 5) scale = 5;

                // Center zoom at viewport center
                const rect = imageContainer.getBoundingClientRect();
                const viewportCenterX = rect.width / 2;
                const viewportCenterY = rect.height / 2;

                pointX = viewportCenterX - pinchCenterImageX * scale;
                pointY = viewportCenterY - pinchCenterImageY * scale;

                applyTransform();
            }
        });

        imageContainer.addEventListener('touchend', function (e) {
            touches = Array.from(e.touches);
            if (touches.length === 0) {
                panning = false;
            } else if (touches.length === 1) {
                // One finger remaining - switch to drag mode
                start = {
                    x: touches[0].clientX - pointX,
                    y: touches[0].clientY - pointY
                };
                panning = true;
            }
        });
    }

    // Calculate distance between two touch points
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
})();

// ========================================
// Service Worker Registration (PWA)
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
