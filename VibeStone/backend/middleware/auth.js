import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('No authorization header');
            return res.status(401).json({ 
                success: false, 
                message: 'No authorization header' 
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('Invalid token format');
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format' 
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token:', token);

        try {
            const token_decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded:', token_decode);
            req.body.userId = token_decode.id;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

export default authMiddleware;