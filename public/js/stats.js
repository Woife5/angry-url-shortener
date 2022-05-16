function getAllStats() {
    const list = document.getElementById('listOfRedirects');

    fetch('api/url')
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                return res.json().then(err => {
                    throw err;
                });
            }
        })
        .then(json => {
            json.forEach(item => {
                const tr = document.createElement('tr');
                const ms = new Date(item.lastUsed).getTime() + 86400000 * 365;
                const days = Math.floor((ms - Date.now()) / 86400000);

                tr.innerHTML = `<td>${decodeURIComponent(item.shortPath)}</td><td class="text-truncate" style="max-width:300px"><a href="${item.url}">${item.url}</a></td><td>${
                    item.uses
                }</td><td>${new Date(item.lastUsed).toLocaleDateString('de-AT')} (${days} days remaining)</td>`;
                list.appendChild(tr);
            });
        })
        .catch(err => {
            console.log(err);
        });
}

getAllStats();
