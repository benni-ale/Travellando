from flask import Flask, request, render_template, send_from_directory, jsonify
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024  # 1MB limit
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Simulated database for comments
comments_db = {}

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.lower().split('.')[-1] in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return 'Errore: Nessun file selezionato!'
    
    file = request.files['image']
    if file.filename == '':
        return 'Errore: Nessun file selezionato!'
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return f'File caricato: <a href="/uploads/{filename}">{filename}</a>'
    
    return 'Errore: Tipo di file non permesso!'

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads')
def get_uploads():
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        return jsonify([])
    
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    files = [f for f in files if allowed_file(f)]
    return jsonify(files)

@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({'message': f'File {filename} eliminato con successo!'}), 200
    return jsonify({'error': 'File non trovato!'}), 404

@app.route('/comments/<filename>', methods=['GET', 'POST'])
def comments(filename):
    if request.method == 'POST':
        comment = request.json.get('comment')
        if filename not in comments_db:
            comments_db[filename] = []
        comments_db[filename].append(comment)
        return jsonify({'message': 'Commento aggiunto con successo!'})
    
    return jsonify(comments_db.get(filename, []))

@app.route('/comments/<filename>/<int:comment_index>', methods=['DELETE'])
def delete_comment(filename, comment_index):
    if filename in comments_db and 0 <= comment_index < len(comments_db[filename]):
        comments_db[filename].pop(comment_index)
        return jsonify({'message': 'Commento eliminato con successo!'})
    return jsonify({'error': 'Commento non trovato!'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=3000) 