const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para archivos de imagen
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'), false);
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
        upload.single('image')(req, res, (err) => {
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
            
            const imageUrl = `${baseUrl}/api/uploads/images/${req.file.filename}`;

            res.json({
                success: true,
                imageUrl: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            });
        });

    } catch (error) {
        console.error('Error in upload-image API:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};
