const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Configura il motore di archiviazione
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Inizializza upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limita la dimensione del file a 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// Controlla il tipo di file
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Errore: Solo immagini!');
  }
}

// Imposta la cartella statica
app.use(express.static('./public'));

// Endpoint di upload
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.send(err);
    } else {
      if (req.file == undefined) {
        res.send('Errore: Nessun file selezionato!');
      } else {
        res.send(`File caricato: <a href="/uploads/${req.file.filename}">${req.file.filename}</a>`);
      }
    }
  });
});

app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`)); 