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
                const imgElement = document.createElement('img');
                imgElement.src = `/uploads/${image}`;
                gallery.appendChild(imgElement);

                // Create delete button with icon
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Font Awesome trash icon
                deleteButton.className = 'delete-button'; // Add a class for styling
                deleteButton.onclick = function() {
                    deleteImage(image);
                };
                gallery.appendChild(deleteButton);
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

loadGallery(); 