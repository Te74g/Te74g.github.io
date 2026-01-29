/**
 * links.js
 * Links list generation
 * Depends on: data_links.js
 */

(function () {
    /* -------------------------------------------------------
       関連リンク一覧 (links.html) の生成
       ------------------------------------------------------- */
    const linksContainer = document.getElementById("links-list-container");
    if (linksContainer && window.linksData) {
        window.linksData.forEach(item => {
            const link = document.createElement("a");
            link.href = item.url;
            link.target = "_blank";
            link.rel = "noopener";
            link.className = "news-link reveal is-visible";

            link.innerHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; padding: 10px 0;">
                    <h3 style="margin:0 0 8px; font-weight:900; font-size:1.2rem;">${item.title} 
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-left:4px; vertical-align:middle; color:var(--muted);">
                          <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                          <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                        </svg>
                    </h3>
                    <p style="margin:0; font-size:0.9rem; color:var(--muted); line-height:1.6;">
                        ${item.desc || ""}
                    </p>
                    <div style="margin-top:8px; font-size:0.8rem; color:var(--a); word-break: break-all;">
                        ${item.url}
                    </div>
                </div>
            `;
            linksContainer.appendChild(link);
        });
    }
})();
