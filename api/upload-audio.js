const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para archivos de audio
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'audio');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB límite
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten archivos de audio.'), false);
        }
    }
});

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        // Usar multer para manejar la subida del archivo
        upload.single('audio')(req, res, (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(400).json({ 
                    error: err.message || 'Error al subir el archivo' 
                });
            }

            if (!req.file) {
                return res.status(400).json({ 
                    error: 'No se proporcionó ningún archivo' 
                });
            }

            // Construir URL del archivo
            const baseUrl = process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : 'http://localhost:3000';
            
            const audioUrl = `${baseUrl}/api/uploads/audio/${req.file.filename}`;

            res.json({
                success: true,
                audioUrl: audioUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            });
        });

    } catch (error) {
        console.error('Error in upload-audio API:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};
