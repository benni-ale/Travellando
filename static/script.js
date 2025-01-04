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
        showNotification(data, 'success');
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

                // Create a div for the format icon
                const formatIcon = document.createElement('div');
                formatIcon.className = 'format-icon'; // Add a class for styling
                formatIcon.innerHTML = getFileFormatIcon(image); // Get the format icon
                imgContainer.appendChild(formatIcon); // Append the icon to the container

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
                buttonContainer.style.margin = '0'; // Ensure no margin is applied

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

                // Create AI analysis button with icon
                const aiButton = document.createElement('button');
                aiButton.innerHTML = '<i class="fas fa-robot"></i>'; // Font Awesome robot icon
                aiButton.className = 'action-button'; // Use the same class for styling
                aiButton.onclick = function() {
                    fetch(`/analyze/${image}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                showNotification(data.error, 'error');
                            } else {
                                // Display the analysis result
                                const analysisResult = JSON.stringify(data, null, 2);
                                alert(`Analysis Result: ${analysisResult}`);
                            }
                        })
                        .catch(error => console.error('Error:', error));
                };
                buttonContainer.appendChild(aiButton);

                imgContainer.appendChild(buttonContainer);
                gallery.appendChild(imgContainer);
            });
        });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        });
    }, 3000);
}

function deleteImage(filename) {
    fetch(`/delete/${filename}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        showNotification(data.message || data.error, data.error ? 'error' : 'success');
        loadGallery(); // Reload the gallery after deletion
    })
    .catch(error => console.error('Errore:', error));
}

function showComments(image) {
    const commentsSection = document.getElementById('commentsSection');
    commentsSection.innerHTML = `
        <button id="closeComments" style="position:absolute; top:10px; right:10px; background:none; border:none; cursor:pointer;">
            <i class="fas fa-times" style="font-size:24px; color:#000;"></i>
        </button>
        <h3>Comments for ${image}</h3>
        <div id="commentsList"></div>
        <form id="commentForm">
            <input type="text" id="commentInput" placeholder="Add a comment" required>
            <button type="submit">Submit</button>
        </form>
    `;
    commentsSection.style.display = 'block';

    // Fetch existing comments
    fetch(`/comments/${image}`)
        .then(response => response.json())
        .then(comments => {
            const commentsList = document.getElementById('commentsList');
            commentsList.innerHTML = comments.map((comment, index) => `
                <p>
                    ${comment}
                    <button class="delete-comment" data-index="${index}">&times;</button>
                </p>
            `).join('');

            // Attach delete event listeners
            document.querySelectorAll('.delete-comment').forEach(button => {
                button.addEventListener('click', function() {
                    const commentIndex = this.getAttribute('data-index');
                    fetch(`/comments/${image}/${commentIndex}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        showComments(image); // Refresh comments
                    });
                });
            });
        });

    // Re-attach the event listener for the close button
    document.getElementById('closeComments').addEventListener('click', function () {
        commentsSection.style.display = 'none';
    });

    // Handle comment submission
    document.getElementById('commentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const comment = document.getElementById('commentInput').value;
        fetch(`/comments/${image}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            showComments(image); // Refresh comments
            document.getElementById('commentInput').value = '';
        });
    });
}

function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const fullImage = document.getElementById('fullImage');
    fullImage.src = imageSrc;
    modal.style.display = 'block';

    // Nascondi tutte le icone di formato quando si apre il modulo
    const formatIcons = document.querySelectorAll('.format-icon');
    formatIcons.forEach(icon => {
        icon.style.display = 'none'; // Nascondi le icone di formato
    });

    const closeButton = document.querySelector('.close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
        // Facoltativamente, mostra di nuovo le icone di formato quando si chiude il modulo
        formatIcons.forEach(icon => {
            icon.style.display = 'block'; // Mostra di nuovo le icone di formato
        });
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

document.getElementById('analyzeImage').addEventListener('click', function () {
    fetch(`/analyze/${image}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                // Display the analysis result
                const analysisResult = JSON.stringify(data, null, 2);
                alert(`Analysis Result: ${analysisResult}`);

                // Automatically refresh comments to include the analysis result
                showComments(image); // Refresh comments to show the new analysis comment
            }
        })
        .catch(error => console.error('Error:', error));
});

function getFileFormatIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
        case 'png':
            return '<i class="fas fa-file-image" title="PNG"></i>'; // Font Awesome image icon
        case 'jpg':
        case 'jpeg':
            return '<i class="fas fa-file-image" title="JPEG"></i>'; // Font Awesome image icon
        case 'gif':
            return '<i class="fas fa-file-image" title="GIF"></i>'; // Font Awesome image icon
        case 'pdf':
            return '<i class="fas fa-file-pdf" title="PDF"></i>'; // Font Awesome PDF icon
        // Add more cases as needed
        default:
            return '<i class="fas fa-file" title="File"></i>'; // Default file icon
    }
}

loadGallery(); 