document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const artist = document.getElementById('artist').value;

    const response = await fetch(`/api/lastfm/tracks?artist=${artist}`);
    const tracks = await response.json();

    if (!tracks || tracks.length === 0) {
        alert('Не удалось найти треки для данного исполнителя');
        return;
    }

    const trackNames = tracks.map(track => track.name);
    const playCounts = tracks.map(track => parseInt(track.playcount, 10));

    const ctx = document.getElementById('trackChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trackNames,
            datasets: [{
                label: `Популярные треки исполнителя ${artist}`,
                data: playCounts,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        }
    });
});
