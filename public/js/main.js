function handleForm(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    const body = {
        requestedPath: data.get('requestedPath'),
        providedUrl: data.get('providedUrl'),
    };

    const output = document.getElementById('newUrl');
    fetch('api/shorten', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    })
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
            output.innerHTML = `<div class='list-group-item list-group-item-success'>Success! Your shortened URL is: <a href="${json.url}">${json.url}</a> (Pointing to: <a href="${json.pointingTo}">${json.pointingTo}</a>)</div>`;
        })
        .catch(err => {
            output.innerHTML = `<div class='list-group-item list-group-item-danger'>Error: ${err.message}</div>`;
        });
}
