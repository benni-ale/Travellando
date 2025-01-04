document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData();
    const imageFile = document.getElementById('image').files[0];
    formData.append('image', imageFile);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        loadGallery();
    })
    .catch(error => console.error('Errore:', error));
});

document.getElementById('showGallery').addEventListener('click', function () {
    loadGallery();
});

function loadGallery() {
    fetch('/uploads')
        .then(response => response.json())
        .then(images => {
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = '';
            images.forEach(image => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'img-container';

                const imgElement = document.createElement('img');
                imgElement.src = `/uploads/${image}`;
                imgContainer.appendChild(imgElement);

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                // Create delete button with icon
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Font Awesome trash icon
                deleteButton.className = 'action-button'; // Use the same class for styling
                deleteButton.onclick = function() {
                    deleteImage(image);
                };
                buttonContainer.appendChild(deleteButton);

                // Create comments button with icon
                const commentsButton = document.createElement('button');
                commentsButton.innerHTML = '<i class="fas fa-comments"></i>'; // Font Awesome comments icon
                commentsButton.className = 'action-button'; // Use a common class for styling
                commentsButton.onclick = function() {
                    showComments(image);
                };
                buttonContainer.appendChild(commentsButton);

                imgContainer.appendChild(buttonContainer);
                gallery.appendChild(imgContainer);
            });
        });
}

function deleteImage(filename) {
    fetch(`/delete/${filename}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        loadGallery(); // Reload the gallery after deletion
    })
    .catch(error => console.error('Errore:', error));
}

function showComments(image) {
    // Logic to fetch and display comments for the image
    const commentsSection = document.getElementById('commentsSection');
    commentsSection.innerHTML = `<h3>Commenti per ${image}</h3><p>Qui verranno visualizzati i commenti.</p>`;
    commentsSection.style.display = 'block';
}

loadGallery(); 