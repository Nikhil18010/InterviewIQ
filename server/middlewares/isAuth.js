import jwt from "jsonwebtoken";
const isAuth=async(req,res,next)=>{
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization.split(" ");
            if (authHeader[0].toLowerCase() === "bearer" && authHeader[1]) {
                token = authHeader[1];
            }
        }

        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const verifyToken = jwt.verify(token, process.env.JWTSECRET);
        if (!verifyToken) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        req.userId = verifyToken.userId;
        next();
    } catch (error) {
        console.error("isAuth error:", error);
        return res.status(500).json({ message: `Authentication error: ${error.message}` });
    }
}

export default isAuth;