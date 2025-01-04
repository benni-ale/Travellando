document.getElementById('image').addEventListener('change', function () {
    const fileName = this.files[0]?.name || 'Nessun file selezionato';
    document.getElementById('fileNameDisplay').textContent = fileName;
});

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
                imgContainer.draggable = true;

                imgContainer.ondragstart = function(event) {
                    event.dataTransfer.setData('text/plain', image);
                };

                imgContainer.ondragover = function(event) {
                    event.preventDefault();
                };

                imgContainer.ondrop = function(event) {
                    event.preventDefault();
                    const draggedImage = event.dataTransfer.getData('text/plain');
                    swapImages(image, draggedImage);
                };

                const imgElement = document.createElement('img');
                imgElement.src = `/uploads/${image}`;
                imgElement.onclick = function() {
                    openModal(`/uploads/${image}`);
                };
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
    commentsSection.innerHTML = `<button id="closeComments" style="position:absolute; top:10px; right:10px;">Chiudi</button><h3>Commenti per ${image}</h3><p>Qui verranno visualizzati i commenti.</p>`;
    commentsSection.style.display = 'block';

    // Re-attach the event listener for the close button
    document.getElementById('closeComments').addEventListener('click', function () {
        commentsSection.style.display = 'none';
    });
}

function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const fullImage = document.getElementById('fullImage');
    fullImage.src = imageSrc;
    modal.style.display = 'block';

    const closeButton = document.querySelector('.close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };
}

function swapImages(image1, image2) {
    const gallery = document.getElementById('gallery');
    const containers = Array.from(gallery.getElementsByClassName('img-container'));

    const index1 = containers.findIndex(container => container.querySelector('img').src.includes(image1));
    const index2 = containers.findIndex(container => container.querySelector('img').src.includes(image2));

    if (index1 !== -1 && index2 !== -1 && index1 !== index2) {
        const container1 = containers[index1];
        const container2 = containers[index2];

        // Swap the positions of the two containers
        gallery.insertBefore(container2, container1);
        gallery.insertBefore(container1, containers[index2 + 1] || null);
    }
}

document.getElementById('closeComments').addEventListener('click', function () {
    const commentsSection = document.getElementById('commentsSection');
    commentsSection.style.display = 'none';
});

loadGallery(); 